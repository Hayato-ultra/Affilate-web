import { createScopedLogger } from './utils/logger';
import { lookupCache, writeCache } from './cache/cache';
import { AggregationOrchestrator } from './aggregators/orchestrator';
import { matchSingle, tokenOverlap } from './normalize/matcher';
import { sanitizeTitle, extractIdentifiers, enrichIdentifiers } from './normalize/sanitizer';
import { createCloakedLink, cloakedUrl } from './affiliate/cloak';
import { ProductResult, SearchQuery, PaginatedResponse } from './types';

const log = createScopedLogger('pipeline');

const orchestrator = new AggregationOrchestrator();

export async function searchProducts(query: SearchQuery): Promise<PaginatedResponse<ProductResult>> {
  const { q, page = 1, page_size = 20, sort_by = 'price_asc', merchant } = query;

  log.info({ query: q, page, page_size, sort_by, merchant }, 'Pipeline start');

  const cacheResult = await lookupCache(q, sort_by, merchant);
  let results: ProductResult[];

  if (cacheResult.hit && !cacheResult.stale) {
    log.info({ query: q, cached: true }, 'Serving from cache');
    results = cacheResult.results;

    results = results.map(r => ({
      ...r,
      metadata: { ...r.metadata, cache_hit: true, stale: false },
    }));
  } else {
    log.info({ query: q, cacheHit: cacheResult.hit, stale: cacheResult.stale }, 'Cache miss/stale, fetching');

    const rawResults = await orchestrator.search(q);

    // Enrich products that have an ASIN but no UPC/EAN via EasyParser
    await Promise.all(
      rawResults.map(async (p) => {
        const enriched = await enrichIdentifiers(p.identifiers);
        p.identifiers.upc = enriched.upc;
        p.identifiers.ean = enriched.ean;
      })
    );

    const normalizedQuery = sanitizeTitle(q);
    const queryIdentifiers = extractIdentifiers(q);
    const queryIsIdentifier = queryIdentifiers.upc || queryIdentifiers.ean || queryIdentifiers.asin;

    results = rawResults.map((product, idx) => {
      const candidateIds = {
        upc: product.identifiers.upc,
        ean: product.identifiers.ean,
        asin: product.identifiers.asin,
        sku: product.identifiers.sku,
        model_number: product.identifiers.model_number,
      };

      const match = matchSingle(
        normalizedQuery,
        undefined,
        product.title,
        undefined,
        queryIsIdentifier ? queryIdentifiers : undefined,
        candidateIds
      );

      // When query is a structured identifier (UPC/EAN/ASIN), trust the
      // merchant's search results even if the aggregator couldn't populate
      // identifiers on the product (e.g., Amazon scraping HTML omits UPC).
      // The merchant already matched the identifier internally.
      const matched = !!(
        match.matched === true ||
        (!!queryIsIdentifier && match.match_method === 'none' && !!candidateIds.asin)
      );

      const sanitized = sanitizeTitle(product.title);

      const cloakEntry = createCloakedLink(
        product.affiliate.raw_url,
        product.merchant.platform,
        product.product_id
      );

      return {
        ...product,
        normalized_title: sanitized,
        match: {
          matched,
          match_method: match.match_method,
          match_confidence: match.match_confidence,
          match_group_id: match.match_group_id || `${q}_${idx}`,
        },
        affiliate: {
          ...product.affiliate,
          cloaked_url: cloakedUrl(cloakEntry.short_code),
          merchant_tag: cloakEntry.merchant_tag,
        },
      };
    });

    const validResults = results.filter(r => r.match.matched);

    await writeCache(q, validResults, sort_by, merchant);
    results = validResults;

    results = results.map(r => ({
      ...r,
      metadata: { ...r.metadata, cache_hit: false, stale: false },
    }));
  }

  if (sort_by === 'price_asc') {
    results.sort((a, b) => a.price.current_price - b.price.current_price);
  } else if (sort_by === 'price_desc') {
    results.sort((a, b) => b.price.current_price - a.price.current_price);
  }

  const total = results.length;
  const totalPages = Math.ceil(total / page_size);
  const startIdx = (page - 1) * page_size;
  const paged = results.slice(startIdx, startIdx + page_size);

  log.info({ query: q, total, returned: paged.length }, 'Pipeline complete');

  return {
    data: paged,
    pagination: {
      page,
      page_size,
      total_items: total,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  };
}
