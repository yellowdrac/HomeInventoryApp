/**
 * Returns the given date (defaulting to now) as a `yyyy-mm-dd` string in the
 * user's local calendar. Expiration logic is date-based, so the backend needs
 * the client's local "today" rather than a UTC instant that might fall on a
 * different day.
 */
export function localDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
