const STOP_PHRASES = [
  'free shipping', 'free delivery', 'free returns',
  'new arrival', 'new launch', 'just launched', 'new',
  'best seller', 'top rated', 'trending',
  'limited edition', 'limited stock', 'limited time offer',
  'great deal', 'special offer', 'special price', 'discount',
  'hot', 'popular', 'exclusive',
  'guaranteed', 'certified', 'warranty',
  'emi available', 'no cost emi', 'bank offer',
];

const PACK_PATTERN = /\[pack\s*of\s*\d+\]/gi;
const PAREN_PACK = /\(pack\s*of\s*\d+\)/gi;

export function sanitizeTitle(title: string): string {
  if (!title) return '';

  let cleaned = title.trim();

  for (const phrase of STOP_PHRASES) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  }

  cleaned = cleaned.replace(PACK_PATTERN, '');
  cleaned = cleaned.replace(PAREN_PACK, '');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

const MODEL_CODE_PATTERN = /\b([A-Z0-9][A-Z0-9\-]{2,15}[A-Z0-9])\b/;

export function extractModelCode(title: string): string | null {
  const match = title.match(MODEL_CODE_PATTERN);
  return match ? match[1] : null;
}

const UPC_PATTERN = /\b(\d{12})\b/;
const EAN_PATTERN = /\b(\d{13})\b/;
const ASIN_PATTERN = /\b(B[A-Z0-9]{9})\b/;

export function extractIdentifiers(title: string, description?: string): {
  upc: string | null;
  ean: string | null;
  asin: string | null;
} {
  const text = `${title} ${description || ''}`;
  return {
    upc: (text.match(UPC_PATTERN) || [])[0] || null,
    ean: (text.match(EAN_PATTERN) || [])[0] || null,
    asin: (text.match(ASIN_PATTERN) || [])[0] || null,
  };
}

export async function enrichIdentifiers(
  identifiers: { asin?: string | null; upc?: string | null; ean?: string | null }
): Promise<{ upc: string | null; ean: string | null; asin: string | null }> {
  if (!identifiers.asin || identifiers.upc || identifiers.ean) {
    return {
      upc: identifiers.upc || null,
      ean: identifiers.ean || null,
      asin: identifiers.asin || null,
    };
  }

  try {
    const { resolveAsinToBarcode } = await import('./identifierResolver');
    const barcode = await resolveAsinToBarcode(identifiers.asin);
    if (!barcode) {
      return {
        upc: identifiers.upc || null,
        ean: identifiers.ean || null,
        asin: identifiers.asin || null,
      };
    }
    if (barcode.length === 13) {
      return { upc: identifiers.upc || null, ean: barcode, asin: identifiers.asin };
    }
    return { upc: barcode, ean: identifiers.ean || null, asin: identifiers.asin };
  } catch {
    return {
      upc: identifiers.upc || null,
      ean: identifiers.ean || null,
      asin: identifiers.asin || null,
    };
  }
}
