import { BasePlatformClient } from './base';
import { RawProduct } from '../types';

export class EbayClient extends BasePlatformClient {
  platform = 'ebay' as const;
  rateLimitConfig = { requestsPerSecond: 5, burst: 20 };

  private appId: string;
  private certId: string;

  constructor(config: { appId: string; certId: string }) {
    super();
    this.appId = config.appId;
    this.certId = config.certId;
  }

  async fetchProducts(query: string): Promise<RawProduct[]> {
    if (!this.appId) {
      this.log.warn('eBay API not configured');
      return [];
    }

    const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=10`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${await this.getToken()}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_IN',
      },
    });

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.status}`);
    }

    const data: any = await response.json();
    const items = data?.itemSummaries || [];

    return items.map((item: any) => ({
      title: item.title || '',
      description: item.title || '',
      price: parseFloat(item.price?.value || '0'),
      original_price: null,
      currency: item.price?.currency || 'INR',
      image_url: item.image?.imageUrl || '',
      image_urls: item.image?.imageUrl ? [item.image.imageUrl] : [],
      product_url: item.itemUrl || item.itemWebUrl || '',
      model_number: null,
      upc: null,
      ean: null,
      asin: null,
      sku: item.itemId || null,
      merchant_name: 'eBay',
      merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
    }));
  }

  private async getToken(): Promise<string> {
    const basic = Buffer.from(`${this.appId}:${this.certId}`).toString('base64');
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basic}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope/buy.browse',
    });

    if (!response.ok) {
      throw new Error(`eBay OAuth error: ${response.status}`);
    }

    const data: any = await response.json();
    return data.access_token;
  }
}
