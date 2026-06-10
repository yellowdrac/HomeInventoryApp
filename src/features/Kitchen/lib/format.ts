/** Formatting helpers for the Kitchen / expiration views. */

/**
 * Renders the days-until-expiry count as readable relative text, e.g.
 * "Expired 3 days ago", "Expires today", "Expires tomorrow" or "In 5 days".
 */
export function formatDaysUntil(days: number): string {
  if (days < 0) {
    const ago = Math.abs(days);
    return ago === 1 ? 'Expired 1 day ago' : `Expired ${ago} days ago`;
  }
  if (days === 0) {
    return 'Expires today';
  }
  if (days === 1) {
    return 'Expires tomorrow';
  }
  return `In ${days} days`;
}
