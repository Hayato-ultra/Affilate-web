import { createScopedLogger } from '../utils/logger';

const log = createScopedLogger('visual-search');

const SHOPPING_DOMAINS = ['amazon', 'flipkart', 'ebay', 'walmart', 'target', 'bestbuy', 'croma', 'meesho'];

export interface VisualMatch {
  domain: string;
  url: string;
  title: string;
  price: string;
  thumbnail: string;
}

export async function reverseImageSearch(imageUrl: string): Promise<VisualMatch[]> {
  const apiKey = process.env.SERPAPI_KEY || '';

  if (!apiKey) {
    log.warn('SERPAPI_KEY not configured — visual search unavailable');
    log.info('Set SERPAPI_KEY in .env to enable Google Lens reverse image search');
    return [];
  }

  try {
    const searchUrl = `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}`;
    const response = await fetch(searchUrl, { signal: AbortSignal.timeout(15000) });
    const data: any = await response.json();

    const matches: VisualMatch[] = [];
    const visualMatches = data?.visual_matches || [];

    for (const match of visualMatches.slice(0, 10)) {
      const domain = extractDomain(match.link || match.source || '');
      if (!domain || !SHOPPING_DOMAINS.some(d => domain.includes(d))) continue;

      matches.push({
        domain,
        url: match.link,
        title: match.title || 'Unknown',
        price: match.price || match.extracted_price || '',
        thumbnail: match.thumbnail || '',
      });
    }

    log.info({ imageUrl: imageUrl.slice(0, 60), matches: matches.length }, 'Visual search complete');
    return matches;
  } catch (err: any) {
    log.error({ imageUrl: imageUrl.slice(0, 60), error: err.message }, 'Visual search failed');
    return [];
  }
}

export async function searchByImageOnPlatforms(
  imageUrl: string,
  excludePlatform?: string
): Promise<VisualMatch[]> {
  const allMatches = await reverseImageSearch(imageUrl);
  return allMatches.filter(m => m.domain !== excludePlatform);
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}
