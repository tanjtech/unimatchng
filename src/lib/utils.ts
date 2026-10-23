/**
 * Cleans Markdown code fences (e.g. ```json ... ```) from LLM output.
 */
export function cleanJsonFences(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();
  // Remove markdown code fence at start
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
  // Remove markdown code fence at end
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  return cleaned.trim();
}

/**
 * Format currency in Nigerian Naira (NGN)
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Converts string into URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
