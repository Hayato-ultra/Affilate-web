import { useState, useEffect, useCallback } from 'react';

const WISHLIST_KEY = 'lumina_wishlist';

function getStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>(getStoredIds);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback((productId: string) => {
    setIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  const clear = useCallback(() => setIds([]), []);

  return { wishlistIds: ids, toggle, has, clear };
}
