import * as cheerio from 'cheerio';
import { BasePlatformClient, withRetry } from './base';
import { RawProduct } from '../types';
import { fetchWithScrapingApi } from '../api/scraping-api';
import { scrapeUrl } from '../api/scrape';

export class AmazonClient extends BasePlatformClient {
  platform = 'amazon' as const;
  rateLimitConfig = { requestsPerSecond: 1, burst: 5 };

  private accessKey: string;
  private secretKey: string;
  private associateTag: string;
  private country: string;

  constructor(config: { accessKey: string; secretKey: string; associateTag: string; country: string }) {
    super();
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.associateTag = config.associateTag;
    this.country = config.country;
  }

  async fetchProducts(query: string): Promise<RawProduct[]> {
    const useScrapingApi = process.env.SCRAPING_API_PROVIDER && process.env.SCRAPING_API_KEY;
    if (useScrapingApi) {
      return this.fetchViaScrapingApi(query);
    }

    if (this.accessKey && this.secretKey) {
      return this.fetchViaPaApi(query);
    }

    this.log.warn('Amazon: no API key or scraping provider configured, returning empty');
    return [];
  }

  private async fetchViaScrapingApi(query: string): Promise<RawProduct[]> {
    const tld = this.country === 'IN' ? 'in' : 'com';
    const searchUrl = `https://www.amazon.${tld}/s?k=${encodeURIComponent(query)}`;

    try {
      const html = await fetchWithScrapingApi(searchUrl);
      return this.parseSearchHtml(html, query, tld);
    } catch (err: any) {
      this.log.error({ error: err.message }, 'Amazon scraping API failed, falling back to PA-API');
      if (this.accessKey && this.secretKey) return this.fetchViaPaApi(query);
      return [];
    }
  }

  private async parseSearchHtml(html: string, query: string, tld: string): Promise<RawProduct[]> {
    const $ = cheerio.load(html);
    const products: RawProduct[] = [];

    // Try modern Amazon layout first: [data-asin] on search result divs
    $('div[data-asin]').each((_, el) => {
      if (products.length >= 10) return false;

      const $el = $(el);
      const asin = $el.attr('data-asin') || '';
      if (!asin || asin === '') return;

      const title = $el.find('h2, h3').first().text().trim() || '';
      if (!title) return;

      const priceText = $el.find('.a-price-whole, .a-offscreen, span.a-price span').first().text().trim();
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

      const img = $el.find('img').first();
      const image_url = img.attr('src') || img.attr('data-src') || '';

      const currency = this.country === 'IN' ? 'INR' : 'USD';

      products.push({
        title,
        description: '',
        price: isNaN(price) ? 0 : price,
        original_price: null,
        currency,
        image_url,
        image_urls: [],
        product_url: `https://www.amazon.${tld}/dp/${asin}`,
        model_number: null,
        upc: null,
        ean: null,
        asin,
        sku: null,
        merchant_name: 'Amazon',
        merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      });
    });

    if (products.length > 0) return products;

    // Fallback: extract ASINs from /dp/ links and scrape individual pages
    const asins: string[] = [];
    $('a[href*="/dp/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const m = href.match(/\/dp\/([A-Z0-9]{10})(?:[/?#]|$)/);
      if (m && !asins.includes(m[1])) asins.push(m[1]);
    });

    if (asins.length === 0) return [];

    return await this.fetchTopProductPages(asins.slice(0, 5), tld);
  }

  private async fetchTopProductPages(asins: string[], tld: string): Promise<RawProduct[]> {
    const results: RawProduct[] = [];

    for (const asin of asins) {
      try {
        const productUrl = `https://www.amazon.${tld}/dp/${asin}`;
        const scraped = await scrapeUrl(productUrl);
        results.push({
          title: scraped.title,
          description: scraped.description,
          price: scraped.price_current || 0,
          original_price: scraped.price_original,
          currency: scraped.currency_code,
          image_url: scraped.thumbnail_url,
          image_urls: [],
          product_url: productUrl,
          model_number: scraped.model_number || null,
          upc: scraped.upc || null,
          ean: scraped.ean || null,
          asin: scraped.asin || asin,
          sku: scraped.sku || null,
          merchant_name: 'Amazon',
          merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        });
      } catch {
        continue;
      }
    }

    return results;
  }

  private async fetchViaPaApi(query: string): Promise<RawProduct[]> {
    const host = `webservices.amazon.${this.country === 'IN' ? 'in' : 'com'}`;
    const payload = {
      PartnerType: 'Associates',
      PartnerTag: this.associateTag,
      Keywords: query,
      Resources: [
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ExternalIds',
        'Offers.Listings.Price',
        'Images.Primary.Large',
        'Images.Variants.Large',
      ],
      ItemCount: 10,
    };

    const response = await fetch(`https://${host}/paapi5/searchitems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Amazon PA-API error: ${response.status} ${await response.text()}`);
    }

    const data: any = await response.json();
    const items = data?.SearchResult?.Items || [];

    return items.map((item: any) => ({
      title: item.ItemInfo?.Title?.DisplayValue || '',
      description: (item.ItemInfo?.Features?.DisplayValues || []).join(' '),
      price: parseFloat(item.Offers?.Listings?.[0]?.Price?.Amount || '0'),
      original_price: null,
      currency: item.Offers?.Listings?.[0]?.Price?.Currency || 'INR',
      image_url: item.Images?.Primary?.Large?.URL || '',
      image_urls: (item.Images?.Variants || []).map((v: any) => v.Large?.URL).filter(Boolean),
      product_url: `https://www.amazon.${this.country === 'IN' ? 'in' : 'com'}/dp/${item.ASIN}`,
      model_number: item.ItemInfo?.ExternalIds?.DisplayValues?.find((v: string) => v.startsWith('MPN'))?.replace('MPN:', '') || null,
      upc: item.ItemInfo?.ExternalIds?.DisplayValues?.find((v: string) => v.startsWith('UPC'))?.replace('UPC:', '') || null,
      ean: item.ItemInfo?.ExternalIds?.DisplayValues?.find((v: string) => v.startsWith('EAN'))?.replace('EAN:', '') || null,
      asin: item.ASIN || null,
      sku: null,
      merchant_name: 'Amazon',
      merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    }));
  }
}
