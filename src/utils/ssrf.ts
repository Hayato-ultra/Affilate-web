import { createScopedLogger } from '../utils/logger';
import { URL } from 'url';
import * as dns from 'dns/promises';

const log = createScopedLogger('ssrf');

const BLOCKED_PROTOCOLS = new Set(['file:', 'ftp:', 'gopher:', 'dict:', 'ldap:', 'smb:']);
const PRIVATE_RANGES = [
  { prefix: '10.', mask: null },
  { prefix: '127.', mask: null },
  { prefix: '169.254.', mask: null },
  { prefix: '0.', mask: null },
  { prefix: '192.168.', mask: null },
  { prefix: '172.', mask: '255.240.0.0' },
];

function ipInPrivateRanges(ip: string): boolean {
  for (const range of PRIVATE_RANGES) {
    if (range.mask) {
      try {
        const ipNum = ipToLong(ip);
        const maskNum = ipToLong(range.mask);
        const rangeNum = ipToLong(range.prefix + '0.0.0');
        if ((ipNum & maskNum) === (rangeNum & maskNum)) return true;
      } catch { continue; }
    } else {
      if (ip.startsWith(range.prefix)) return true;
    }
  }
  return false;
}

function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

async function resolveHostname(hostname: string): Promise<string[]> {
  try {
    const resolved = await dns.resolve4(hostname);
    return resolved || [];
  } catch {
    return [];
  }
}

export async function validateUrl(rawUrl: string): Promise<{ valid: boolean; reason?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  if (BLOCKED_PROTOCOLS.has(parsed.protocol)) {
    return { valid: false, reason: `Protocol ${parsed.protocol} is not allowed` };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: `Protocol ${parsed.protocol} is not allowed` };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (hostname === 'localhost' || hostname === 'localhost.localdomain' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '::1' || hostname === '[::1]' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { valid: false, reason: 'Internal hostnames are not allowed' };
  }

  try {
    const [resolved4, resolved6] = await Promise.allSettled([
      resolveHostname(hostname),
      dns.resolve6(hostname).catch(() => [] as string[]),
    ]);
    const allIps = [
      ...(resolved4.status === 'fulfilled' ? resolved4.value : []),
      ...(resolved6.status === 'fulfilled' ? resolved6.value : []),
    ];
    const privateIp = allIps.some(ip => ipInPrivateRanges(ip));
    if (privateIp) {
      return { valid: false, reason: 'Private IP addresses are not allowed' };
    }
  } catch {
    log.warn({ hostname }, 'Could not resolve hostname for SSRF check');
  }

  return { valid: true };
}
