import { BasePlatformClient } from './base';
import { RawProduct } from '../types';

export class FlipkartClient extends BasePlatformClient {
  platform = 'flipkart' as const;
  rateLimitConfig = { requestsPerSecond: 2, burst: 10 };

  private apiKey: string;
  private affiliateId: string;

  constructor(config: { apiKey: string; affiliateId: string }) {
    super();
    this.apiKey = config.apiKey;
    this.affiliateId = config.affiliateId;
  }

  async fetchProducts(query: string): Promise<RawProduct[]> {
    if (!this.apiKey) {
      this.log.warn('Flipkart API not configured');
      return [];
    }

    const url = `https://affiliateapi.flipkart.net/affiliate/api/${this.affiliateId}.json`;
    const searchUrl = `https://affiliateapi.flipkart.net/affiliate/search/json?query=${encodeURIComponent(query)}&resultCount=10`;

    const response = await fetch(searchUrl, {
      headers: {
        'Fk-Affiliate-Id': this.affiliateId,
        'Fk-Affiliate-Token': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Flipkart API error: ${response.status}`);
    }

    const data: any = await response.json();
    const products = data?.products || [];

    return products.map((p: any) => ({
      title: p.productBaseInfo?.title || '',
      description: p.productBaseInfo?.productDescription || '',
      price: parseFloat(p.productBaseInfo?.flipkartSellingPrice?.amount || '0'),
      original_price: parseFloat(p.productBaseInfo?.flipkartMRP?.amount || '0') || null,
      currency: p.productBaseInfo?.flipkartSellingPrice?.currency || 'INR',
      image_url: p.productBaseInfo?.imageUrls?.['400x400'] || '',
      image_urls: Object.values(p.productBaseInfo?.imageUrls || {}),
      product_url: p.productBaseInfo?.productUrl || '',
      model_number: p.productBaseInfo?.modelNumber || null,
      upc: null,
      ean: null,
      asin: null,
      sku: p.productBaseInfo?.productId || null,
      merchant_name: 'Flipkart',
      merchant_logo_url: 'https://img.flipkart.com/fk-banner/flipkart-logo.png',
    }));
  }
}
