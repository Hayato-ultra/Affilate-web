import { createScopedLogger } from '../utils/logger';
import { config } from '../utils/config';
import { AggregatorResult, ProductResult } from '../types';
import { AmazonClient } from './amazon';
import { FlipkartClient } from './flipkart';
import { EbayClient } from './ebay';
import { MeeshoClient, CromaClient } from './scraper';
import { MockClient } from './mock';
import { RateLimiter } from './base';

const log = createScopedLogger('orchestrator');

export class AggregationOrchestrator {
  private clients: {
    amazon: AmazonClient;
    flipkart: FlipkartClient;
    ebay: EbayClient;
    meesho: MeeshoClient;
    croma: CromaClient;
  };

  private mockClient = new MockClient();

  constructor() {
    this.clients = {
      amazon: new AmazonClient({
        accessKey: config.aggregators.amazon.access_key,
        secretKey: config.aggregators.amazon.secret_key,
        associateTag: config.aggregators.amazon.associate_tag,
        country: config.aggregators.amazon.country,
      }),
      flipkart: new FlipkartClient({
        apiKey: config.aggregators.flipkart.api_key,
        affiliateId: config.aggregators.flipkart.affiliate_id,
      }),
      ebay: new EbayClient({
        appId: config.aggregators.ebay.app_id,
        certId: config.aggregators.ebay.cert_id,
      }),
      meesho: new MeeshoClient(config.aggregators.meesho.proxy_pool),
      croma: new CromaClient(config.aggregators.croma.proxy_pool),
    };
  }

  async searchAll(query: string): Promise<AggregatorResult[]> {
    log.info({ query }, 'Starting parallel aggregation');

    const results = await Promise.allSettled([
      this.clients.amazon.search(query),
      this.clients.flipkart.search(query),
      this.clients.ebay.search(query),
      this.clients.meesho.search(query),
      this.clients.croma.search(query),
    ]);

    const fulfilled: AggregatorResult[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        fulfilled.push(result.value);
      } else {
        log.error({ error: result.reason?.message }, 'Aggregator failed');
      }
    }

    // If every aggregator returned empty (no API keys configured), use mock data
    const totalRealProducts = fulfilled.reduce((sum, r) => sum + r.products.length, 0);
    if (totalRealProducts === 0) {
      log.info('No real aggregator returned results — switching to mock data');
      const mockProducts = await this.mockClient.fetchProducts(query);
      fulfilled.push({
        platform: 'amazon',
        products: mockProducts,
        source: 'api',
      });
    }

    return fulfilled;
  }

  async search(query: string): Promise<ProductResult[]> {
    const allResults = await this.searchAll(query);
    const flatResults: ProductResult[] = [];

    for (const agResult of allResults) {
      for (const raw of agResult.products) {
        flatResults.push({
          product_id: `${agResult.platform}_${raw.sku || raw.asin || Math.random().toString(36).slice(2, 10)}`,
          title: raw.title,
          normalized_title: raw.title,
          description: raw.description,
          price: {
            current_price: raw.price,
            original_price: raw.original_price,
            currency_code: raw.currency,
          },
          merchant: {
            platform: agResult.platform,
            merchant_name: raw.merchant_name,
            merchant_logo_url: raw.merchant_logo_url,
          },
          images: {
            thumbnail_url: raw.image_url,
            full_url: raw.image_urls,
          },
          identifiers: {
            model_number: raw.model_number,
            upc: raw.upc,
            ean: raw.ean,
            asin: raw.asin,
            sku: raw.sku,
          },
          match: {
            matched: false,
            match_method: 'none',
            match_confidence: 0,
            match_group_id: '',
          },
          affiliate: {
            cloaked_url: '',
            raw_url: raw.product_url,
            merchant_tag: '',
          },
          metadata: {
            fetched_at: new Date().toISOString(),
            cache_hit: false,
            stale: false,
          },
        });
      }
    }

    return flatResults;
  }
}
