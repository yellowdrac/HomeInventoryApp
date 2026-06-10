/** Formatting helpers for the Movements views. */

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/**
 * Formats an ISO date-time (the movement's `occurredAt`) for display in the
 * viewer's local timezone, or returns the raw value if it cannot be parsed.
 */
export function formatDateTime(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  return dateTimeFormatter.format(parsed);
}

/**
 * Converts a date input value (`yyyy-mm-dd`) into the start of that day as an
 * ISO date-time string, or `undefined` when blank. Used for the "from" filter.
 */
export function dayStartIso(date: string): string | undefined {
  const trimmed = date.trim();
  return trimmed ? `${trimmed}T00:00:00` : undefined;
}

/**
 * Converts a date input value (`yyyy-mm-dd`) into the end of that day as an ISO
 * date-time string, or `undefined` when blank. Used for the inclusive "to"
 * filter so movements logged later that same day are still matched.
 */
export function dayEndIso(date: string): string | undefined {
  const trimmed = date.trim();
  return trimmed ? `${trimmed}T23:59:59.999` : undefined;
}
