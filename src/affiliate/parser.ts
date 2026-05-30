import { URL } from 'url';

const TRACKING_PARAMS = [
  'ref', 'ref_', 'tag', 'linkId', 'link_id',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'affid', 'aff_id', 'affiliate', 'affiliate_id',
  'clickid', 'click_id', 'subid', 'sub_id',
  'gclid', 'fbclid', 'msclkid',
  'ref_tag', 'ie', 'pf_rd_p', 'pf_rd_r', 'pf_rd_s', 'pf_rd_t', 'pf_rd_i',
  'sessionId', 'session_id', 'sid',
  '_encoding', 'keywords', 'rh', 's', 'qid', 'sr',
];

export interface ParsedUrl {
  cleanUrl: string;
  merchant: string;
  strippedParams: string[];
  pathSegments: string[];
}

export function parseUrl(rawUrl: string): ParsedUrl {
  try {
    const url = new URL(rawUrl);
    const merchant = url.hostname.replace('www.', '').split('.')[0];
    const strippedParams: string[] = [];

    for (const param of TRACKING_PARAMS) {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        strippedParams.push(param);
      }
    }

    return {
      cleanUrl: url.toString(),
      merchant,
      strippedParams,
      pathSegments: url.pathname.split('/').filter(Boolean),
    };
  } catch {
    return {
      cleanUrl: rawUrl,
      merchant: 'unknown',
      strippedParams: [],
      pathSegments: [],
    };
  }
}

export function injectAffiliateTag(cleanUrl: string, merchant: string, tag: string): string {
  try {
    const url = new URL(cleanUrl);

    const tagParams: Record<string, string> = {
      amazon: 'tag',
      flipkart: 'affid',
      ebay: 'affiliate_id',
    };

    const paramName = tagParams[merchant];
    if (paramName) {
      url.searchParams.set(paramName, tag);
    }

    return url.toString();
  } catch {
    return cleanUrl;
  }
}
