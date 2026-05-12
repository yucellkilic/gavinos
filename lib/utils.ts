/**
 * Generate a simple UUID v4 fallback (no external dependency).
 */
export function v4Fallback(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format currency for display.
 */
export function formatCurrency(price: number | null): string {
  if (price === null || price === 0) return 'Market Price';
  return `$${price.toFixed(2)}`;
}

/**
 * Get today's date string in YYYY-MM-DD format (midnight-based).
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get minimum date for order scheduling (today at 00:00:00).
 */
export function getMinOrderDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
