import { chromium, Browser, Page } from 'playwright';
import { BasePlatformClient } from './base';
import { AggregatorResult, RawProduct } from '../types';

export abstract class BaseScraperClient extends BasePlatformClient {
  source: AggregatorResult['source'] = 'scraper';
  protected proxyPool: string[];
  protected browser: Browser | null = null;

  constructor(proxyPool: string[]) {
    super();
    this.proxyPool = proxyPool;
  }

  protected getRandomProxy(): string | undefined {
    if (this.proxyPool.length === 0) return undefined;
    return this.proxyPool[Math.floor(Math.random() * this.proxyPool.length)];
  }

  protected async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      const proxy = this.getRandomProxy();
      this.browser = await chromium.launch({
        headless: true,
        proxy: proxy ? { server: proxy } : undefined,
      });
    }
    return this.browser;
  }

  abstract scrapePage(page: Page, query: string): Promise<RawProduct[]>;

  async fetchProducts(query: string): Promise<RawProduct[]> {
    const browser = await this.getBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });

    try {
      const page = await context.newPage();
      const products = await this.scrapePage(page, query);
      return products;
    } finally {
      await context.close();
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export class MeeshoClient extends BaseScraperClient {
  platform = 'meesho' as const;
  rateLimitConfig = { requestsPerSecond: 0.5, burst: 2 };

  async scrapePage(page: Page, query: string): Promise<RawProduct[]> {
    const url = `https://www.meesho.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    await page.waitForSelector('[data-testid="product-card"], .ProductCard', { timeout: 15000 }).catch(() => {});

    const products: any[] = await page.evaluate(`
      Array.from(document.querySelectorAll('[data-testid="product-card"], .ProductCard')).slice(0, 10).map(function(card) {
        var titleEl = card.querySelector('[data-testid="product-name"], .ProductName');
        var priceEl = card.querySelector('[data-testid="product-price"], .ProductPrice');
        var imgEl = card.querySelector('img');
        var linkEl = card.querySelector('a');
        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          price: parseFloat((priceEl ? priceEl.textContent.trim() : '0').replace(/[^0-9.]/g, '') || '0'),
          image_url: imgEl ? imgEl.src : '',
          product_url: linkEl ? linkEl.href : ''
        };
      })
    `);

    return products.map(p => ({
      title: p.title,
      description: '',
      price: p.price,
      original_price: null,
      currency: 'INR',
      image_url: p.image_url,
      image_urls: p.image_url ? [p.image_url] : [],
      product_url: p.product_url,
      model_number: null,
      upc: null,
      ean: null,
      asin: null,
      sku: null,
      merchant_name: 'Meesho',
      merchant_logo_url: 'https://www.meesho.com/logo.png',
    }));
  }
}

export class CromaClient extends BaseScraperClient {
  platform = 'croma' as const;
  rateLimitConfig = { requestsPerSecond: 0.5, burst: 2 };

  async scrapePage(page: Page, query: string): Promise<RawProduct[]> {
    const url = `https://www.croma.com/search/?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    await page.waitForSelector('.product-item, .product-card, [data-product-id]', { timeout: 15000 }).catch(() => {});

    const products: any[] = await page.evaluate(`
      Array.from(document.querySelectorAll('.product-item, .product-card, [data-product-id]')).slice(0, 10).map(function(card) {
        var titleEl = card.querySelector('.product-title, .name, h3');
        var priceEl = card.querySelector('.price, .amount, .final-price');
        var imgEl = card.querySelector('img');
        var linkEl = card.querySelector('a');
        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          price: parseFloat((priceEl ? priceEl.textContent.trim() : '0').replace(/[^0-9.]/g, '') || '0'),
          image_url: imgEl ? imgEl.src : '',
          product_url: linkEl ? linkEl.href : ''
        };
      })
    `);

    return products.map(p => ({
      title: p.title,
      description: '',
      price: p.price,
      original_price: null,
      currency: 'INR',
      image_url: p.image_url,
      image_urls: p.image_url ? [p.image_url] : [],
      product_url: p.product_url.startsWith('http') ? p.product_url : `https://www.croma.com${p.product_url}`,
      model_number: null,
      upc: null,
      ean: null,
      asin: null,
      sku: null,
      merchant_name: 'Croma',
      merchant_logo_url: 'https://www.croma.com/logo.png',
    }));
  }
}
