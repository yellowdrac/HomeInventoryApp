/** Formatting helpers shared across the Items views. */

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  // The backend sends a calendar date (no time); render it as-is, not shifted
  // into the local timezone.
  timeZone: 'UTC',
});

/** Formats a quantity with its optional unit, e.g. `3 L` or `2`. */
export function formatQuantity(quantity: number, unit?: string | null): string {
  return unit ? `${quantity} ${unit}` : String(quantity);
}

/** Joins a location breadcrumb (root first) into a readable path. */
export function formatLocationPath(breadcrumb: string[]): string {
  return breadcrumb.join(' / ');
}

/** Formats an ISO `yyyy-mm-dd` date for display, or returns `null` when absent. */
export function formatDate(iso: string | null): string | null {
  if (!iso) {
    return null;
  }
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  return dateFormatter.format(parsed);
}
