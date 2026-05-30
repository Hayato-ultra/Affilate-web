const PLACEHOLDER = 'https://placehold.co/400x400?text=No+Image';

export function optimizeImageUrl(
  url: string | null | undefined,
  width = 400,
  height = 400
): string {
  if (!url) return PLACEHOLDER;

  if (url.includes('supabase.co/storage/')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&height=${height}&resize=cover&format=webp`;
  }

  return url;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>): void {
  (e.target as HTMLImageElement).src = PLACEHOLDER;
}

export function getCurrencySymbol(code: string): string {
  const sym: Record<string, string> = { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3' };
  return sym[code] || code + ' ';
}
