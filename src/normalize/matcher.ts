import stringSimilarity from 'string-similarity';
import { getDb } from '../db/connection';
import { createScopedLogger } from '../utils/logger';
import { sanitizeTitle, extractModelCode, extractIdentifiers } from './sanitizer';
import { nanoid } from 'nanoid';

const log = createScopedLogger('matcher');

const MIN_TOKEN_OVERLAP = 0.6;
const EXACT_MATCH_CONFIDENCE = 1.0;

export interface Identifiers {
  upc?: string | null;
  ean?: string | null;
  asin?: string | null;
  sku?: string | null;
  model_number?: string | null;
}

export interface MatchResult {
  matched: boolean;
  match_method: 'exact_code' | 'exact_upc' | 'exact_ean' | 'exact_asin' | 'exact_sku' | 'exact_model' | 'fuzzy_tokens' | 'none';
  match_confidence: number;
  match_group_id: string | null;
}

export function tokenize(title: string): Set<string> {
  return new Set(
    sanitizeTitle(title)
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 2)
  );
}

export function tokenOverlap(a: string, b: string): number {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = new Set([...tokensA].filter(t => tokensB.has(t)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}

export function fuzzySimilarity(a: string, b: string): number {
  return stringSimilarity.compareTwoStrings(
    sanitizeTitle(a).toLowerCase(),
    sanitizeTitle(b).toLowerCase()
  );
}

function checkIdentifierMatch(sourceIds: Identifiers, candidateIds: Identifiers): MatchResult | null {
  const checks: Array<{ field: keyof Identifiers; method: MatchResult['match_method'] }> = [
    { field: 'upc', method: 'exact_upc' },
    { field: 'ean', method: 'exact_ean' },
    { field: 'asin', method: 'exact_asin' },
    { field: 'sku', method: 'exact_sku' },
    { field: 'model_number', method: 'exact_model' },
  ];

  for (const { field, method } of checks) {
    const sv = sourceIds[field];
    const cv = candidateIds[field];
    if (sv && cv && String(sv).trim().toUpperCase() === String(cv).trim().toUpperCase()) {
      return {
        matched: true,
        match_method: method,
        match_confidence: EXACT_MATCH_CONFIDENCE,
        match_group_id: generateMatchGroup(),
      };
    }
  }

  return null;
}

export function matchSingle(
  sourceTitle: string,
  sourceDescription: string | undefined,
  candidateTitle: string,
  candidateDescription?: string,
  sourceIdentifiers?: Identifiers,
  candidateIdentifiers?: Identifiers
): MatchResult {
  const sourceSanitized = sanitizeTitle(sourceTitle);
  const candidateSanitized = sanitizeTitle(candidateTitle);

  const sourceIds = sourceIdentifiers || extractIdentifiers(sourceSanitized, sourceDescription);
  const candidateIds = candidateIdentifiers || extractIdentifiers(candidateSanitized, candidateDescription);

  // Priority 1: Structured identifiers (UPC/EAN/ASIN/SKU/model) — 100% match
  const identMatch = checkIdentifierMatch(sourceIds, candidateIds);
  if (identMatch) return identMatch;

  // Priority 2: Model code extracted from title
  const sourceModel = extractModelCode(sourceSanitized);
  const candidateModel = extractModelCode(candidateSanitized);
  if (sourceModel && candidateModel && sourceModel === candidateModel) {
    return {
      matched: true,
      match_method: 'exact_code',
      match_confidence: EXACT_MATCH_CONFIDENCE,
      match_group_id: generateMatchGroup(),
    };
  }

  // Priority 3: Containment — all source tokens appear within candidate text
  const sourceTokens = sourceSanitized.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const candidateLower = candidateSanitized.toLowerCase();
  if (sourceTokens.length > 0 && sourceTokens.every(t => candidateLower.includes(t))) {
    const confidence = Math.min(0.5, sourceTokens.length / 5);
    return {
      matched: true,
      match_method: 'fuzzy_tokens',
      match_confidence: confidence,
      match_group_id: generateMatchGroup(),
    };
  }

  // Priority 4: Token overlap
  const overlap = tokenOverlap(sourceSanitized, candidateSanitized);
  if (overlap >= MIN_TOKEN_OVERLAP) {
    return {
      matched: true,
      match_method: 'fuzzy_tokens',
      match_confidence: overlap,
      match_group_id: generateMatchGroup(),
    };
  }

  // Priority 5: String similarity
  const sim = fuzzySimilarity(sourceSanitized, candidateSanitized);
  if (sim >= MIN_TOKEN_OVERLAP) {
    return {
      matched: true,
      match_method: 'fuzzy_tokens',
      match_confidence: sim,
      match_group_id: generateMatchGroup(),
    };
  }

  return {
    matched: false,
    match_method: 'none',
    match_confidence: 0,
    match_group_id: null,
  };
}

function generateMatchGroup(): string {
  return nanoid(12);
}

export function persistMatch(
  matchGroupId: string,
  productId: string,
  matchMethod: string,
  confidence: number
): void {
  const db = getDb();
  db.prepare(`
    INSERT OR IGNORE INTO product_matches (match_group_id, product_id, match_method, match_confidence)
    VALUES (?, ?, ?, ?)
  `).run(matchGroupId, productId, matchMethod, confidence);
  log.debug({ matchGroupId, productId, confidence }, 'Match persisted');
}
