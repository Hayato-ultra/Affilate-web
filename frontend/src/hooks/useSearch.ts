import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SearchResponse, ProductResult } from '../types';

const API_BASE = '/api';

interface UseSearchReturn {
  results: ProductResult[];
  loading: boolean;
  error: string | null;
  pagination: SearchResponse['pagination'] | null;
  search: (query: string) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<SearchResponse['pagination'] | null>(null);
  const currentQuery = useRef('');
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    currentQuery.current = query;
    if (!query.trim()) {
      setResults([]);
      setPagination(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: query, page: '1', page_size: '20' });
      const res = await fetch(`${API_BASE}/search?${params}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`Search failed: ${res.statusText}`);
      }

      const data: SearchResponse = await res.json();
      setResults(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!pagination?.has_next || loading || !currentQuery.current) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: currentQuery.current,
        page: String(pagination.page + 1),
        page_size: '20',
      });
      const res = await fetch(`${API_BASE}/search?${params}`);
      if (!res.ok) throw new Error('Load more failed');

      const data: SearchResponse = await res.json();
      setResults(prev => [...prev, ...data.data]);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination, loading]);

  const hasMore = pagination?.has_next ?? false;

  return { results, loading, error, pagination, search, loadMore, hasMore };
}
