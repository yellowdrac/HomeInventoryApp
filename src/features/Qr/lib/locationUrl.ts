import { env } from '@/core/config/env';

/**
 * Path of the deep link that resolves a location by its QR slug. Kept in one
 * place so the QR encoder, the scanner and the router stay in sync.
 */
export function locationSlugPath(slug: string): string {
  return `/l/${slug}`;
}

/**
 * Full deep-link URL encoded into a location's QR code:
 * `${publicAppUrl}/l/{slug}`. Scanning it (with the native camera or the
 * in-app scanner) opens the app at that location.
 */
export function buildLocationUrl(slug: string): string {
  return `${env.publicAppUrl}${locationSlugPath(slug)}`;
}

/**
 * Extracts the location slug from a scanned QR payload. Accepts both a full
 * deep-link URL (`https://host/l/box-3`) and a bare path (`/l/box-3`), and
 * tolerates a trailing slash or query/hash. Returns `null` when the payload is
 * not a location deep link.
 */
export function extractSlugFromScan(raw: string): string | null {
  const text = raw.trim();
  if (!text) {
    return null;
  }

  // Get the pathname whether `text` is an absolute URL or a relative path.
  let pathname: string;
  try {
    pathname = new URL(text).pathname;
  } catch {
    pathname = text.split(/[?#]/)[0] ?? text;
  }

  const match = pathname.match(/\/l\/([^/?#]+)\/?$/);
  if (!match) {
    return null;
  }

  const slug = decodeURIComponent(match[1]!).trim();
  return slug.length > 0 ? slug : null;
}
