import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeTitle, extractModelCode, extractIdentifiers } from '../src/normalize/sanitizer';
import { tokenOverlap, fuzzySimilarity, matchSingle } from '../src/normalize/matcher';
import { resolveAsinToBarcode, enrichIdentifiersFromAsin } from '../src/normalize/identifierResolver';

vi.mock('axios', () => {
  const mockAxios = {
    get: vi.fn(),
    isAxiosError: (err: any) => err?.isAxiosError === true,
  };
  return { default: mockAxios };
});

import axios from 'axios';

describe('Sanitizer', () => {
  it('strips "Free Shipping"', () => {
    expect(sanitizeTitle('Samsung Galaxy S24 Free Shipping')).toBe('Samsung Galaxy S24');
  });

  it('strips "New Arrival"', () => {
    expect(sanitizeTitle('New Arrival iPhone 15 Pro')).toBe('iPhone 15 Pro');
  });

  it('strips pack-of-X patterns', () => {
    expect(sanitizeTitle('Wireless Mouse [Pack of 2]')).toBe('Wireless Mouse');
    expect(sanitizeTitle('USB Cable (pack of 5)')).toBe('USB Cable');
  });

  it('strips multiple stop phrases', () => {
    expect(sanitizeTitle('Free Shipping New Arrival Best Seller Laptop')).toBe('Laptop');
  });

  it('preserves core product name', () => {
    expect(sanitizeTitle('  Sony  WH-1000XM5  ')).toBe('Sony WH-1000XM5');
  });
});

describe('Model Code Extractor', () => {
  it('extracts model code from title', () => {
    expect(extractModelCode('Samsung Galaxy S24 SM-S921B')).toBe('SM-S921B');
  });

  it('returns null for no model code', () => {
    expect(extractModelCode('Generic Phone')).toBeNull();
  });
});

describe('Identifier Extraction', () => {
  it('extracts ASIN', () => {
    const result = extractIdentifiers('Product B0ABCDEFGH', '');
    expect(result.asin).toBe('B0ABCDEFGH');
  });

  it('extracts UPC (12 digits)', () => {
    const result = extractIdentifiers('Product 123456789012', '');
    expect(result.upc).toBe('123456789012');
  });
});

describe('Matcher', () => {
  describe('tokenOverlap', () => {
    it('returns 1 for identical titles', () => {
      expect(tokenOverlap('iPhone 15 Pro', 'iPhone 15 Pro')).toBe(1);
    });

    it('returns 0 for completely different titles', () => {
      expect(tokenOverlap('iPhone 15 Pro', 'Banana Organic Fruit')).toBe(0);
    });

    it('returns partial overlap for similar titles', () => {
      const overlap = tokenOverlap('Samsung Galaxy S24', 'Samsung Galaxy S24 Ultra');
      expect(overlap).toBeGreaterThan(0.5);
      expect(overlap).toBeLessThan(1);
    });
  });

  describe('matchSingle', () => {
    it('matches exact model code', () => {
      const result = matchSingle('Samsung SM-S921B', '', 'Samsung Galaxy S24 SM-S921B');
      expect(result.matched).toBe(true);
      expect(result.match_method).toBe('exact_code');
      expect(result.match_confidence).toBe(1);
    });

    it('rejects low similarity (phone vs case)', () => {
      const result = matchSingle('iPhone 15 Pro Max 256GB', '', 'iPhone 15 Silicone Case');
      expect(result.matched).toBe(false);
    });

    it('matches similar products with fuzzy tokens', () => {
      const result = matchSingle(
        'Sony WH-1000XM5 Wireless Headphones',
        '',
        'Sony WH-1000XM5 Noise Cancelling Headphones'
      );
      expect(result.matched).toBe(true);
      expect(['exact_code', 'fuzzy_tokens']).toContain(result.match_method);
      expect(result.match_confidence).toBeGreaterThanOrEqual(0.6);
    });
  });
});

describe('ASIN to Barcode Resolver', () => {
  const mockAxios = vi.mocked(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EASYPARSER_API_KEY = 'test-key-123';
  });

  it('resolves ASIN to EAN (13 digits) successfully', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { success: true, data: { ean: '8901234567890', upc: null } },
    });

    const result = await resolveAsinToBarcode('B0ABCDEFGH');

    expect(result).toBe('8901234567890');
    expect(mockAxios.get).toHaveBeenCalledWith(
      'https://api.easyparser.io/v1/amazon/lookup',
      expect.objectContaining({
        params: expect.objectContaining({ asin: 'B0ABCDEFGH', api_key: 'test-key-123' }),
      })
    );
  });

  it('resolves ASIN to UPC (12 digits) successfully', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { success: true, data: { upc: '123456789012', ean: null } },
    });

    const result = await resolveAsinToBarcode('B0XYZ98765');

    expect(result).toBe('123456789012');
  });

  it('prefers EAN over UPC when both are returned', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { success: true, data: { upc: '123456789012', ean: '8901234567890' } },
    });

    const result = await resolveAsinToBarcode('B0BOTH1234');

    expect(result).toBe('8901234567890');
  });

  it('returns null on API failure without throwing', async () => {
    mockAxios.get.mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Request failed',
      response: { status: 403 },
    });

    const result = await resolveAsinToBarcode('B0ERROR404');

    expect(result).toBeNull();
  });

  it('returns null when EASYPARSER_API_KEY is not set', async () => {
    delete process.env.EASYPARSER_API_KEY;

    const result = await resolveAsinToBarcode('B0NOKEY123');

    expect(result).toBeNull();
    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('returns null for invalid ASIN format', async () => {
    const result = await resolveAsinToBarcode('INVALID');

    expect(result).toBeNull();
    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('enrichIdentifiersFromAsin skips API call when UPC already present', async () => {
    const result = await enrichIdentifiersFromAsin({
      asin: 'B0SKIPUPC',
      upc: '123456789012',
      ean: null,
    });

    expect(result).toEqual({ upc: '123456789012', ean: null });
    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('enrichIdentifiersFromAsin resolves barcode when UPC/EAN missing', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: { success: true, data: { ean: '8901234567890', upc: null } },
    });

    const result = await enrichIdentifiersFromAsin({
      asin: 'B0ENRICHE0',
      upc: null,
      ean: null,
    });

    expect(result).toEqual({ upc: null, ean: '8901234567890' });
  });

  it('enrichIdentifiersFromAsin returns originals on API failure', async () => {
    mockAxios.get.mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Timeout',
      response: { status: 504 },
    });

    const result = await enrichIdentifiersFromAsin({
      asin: 'B0FAILURE0',
      upc: null,
      ean: null,
    });

    expect(result).toEqual({ upc: null, ean: null });
  });
});
