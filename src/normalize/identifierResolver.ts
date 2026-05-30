import axios from 'axios';
import { createScopedLogger } from '../utils/logger';

const log = createScopedLogger('identifierResolver');

const API_BASE = 'https://api.easyparser.io/v1/amazon/lookup';

export interface BarcodeResult {
  upc: string | null;
  ean: string | null;
}

export async function resolveAsinToBarcode(asin: string): Promise<string | null> {
  const apiKey = process.env.EASYPARSER_API_KEY;

  if (!apiKey) {
    log.warn('EASYPARSER_API_KEY not set — skipping ASIN resolution');
    return null;
  }

  if (!/^B[A-Z0-9]{9}$/.test(asin)) {
    log.warn({ asin }, 'Invalid ASIN format');
    return null;
  }

  try {
    const { data } = await axios.get(API_BASE, {
      params: { asin, api_key: apiKey },
      timeout: 10000,
      headers: { 'Accept': 'application/json' },
    });

    const product = data?.data || data?.product || data;

    const upc = product?.upc || product?.gtin12 || null;
    const ean = product?.ean || product?.gtin13 || product?.gtin || null;

    const barcode: string | null =
      ean && /^\d{13}$/.test(ean) ? ean :
      upc && /^\d{12}$/.test(upc) ? upc :
      null;

    if (barcode) {
      log.info({ asin, barcode, type: barcode.length === 13 ? 'ean' : 'upc' }, 'ASIN resolved');
    } else {
      log.warn({ asin, upc, ean }, 'API returned no valid barcode');
    }

    return barcode;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      log.error({
        asin,
        status: err.response?.status,
        message: err.message,
      }, 'ASIN resolution HTTP error');
    } else {
      log.error({ asin, message: err.message }, 'ASIN resolution unexpected error');
    }
    return null;
  }
}

export async function enrichIdentifiersFromAsin(
  identifiers: { asin?: string | null; upc?: string | null; ean?: string | null }
): Promise<BarcodeResult> {
  const { asin, upc, ean } = identifiers;

  if (!asin || upc || ean) {
    return { upc: upc || null, ean: ean || null };
  }

  const barcode = await resolveAsinToBarcode(asin);
  if (!barcode) {
    return { upc: upc || null, ean: ean || null };
  }

  if (barcode.length === 13) {
    return { upc: upc || null, ean: barcode };
  }

  return { upc: barcode, ean: ean || null };
}
