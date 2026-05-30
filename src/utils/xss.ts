export function sanitizeString(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*on\w+\s*=[^>]*>/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<\/embed>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onclick\s*=/gi, '')
    .replace(/onmouseover\s*=/gi, '');
}

export function sanitizeObject<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T {
  const sanitized = { ...obj };
  for (const field of fields) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeHtml(sanitized[field]) as any;
    }
  }
  return sanitized;
}
