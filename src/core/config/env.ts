/**
 * Centralized, typed access to the environment variables consumed by the app.
 *
 * Reading `import.meta.env` in a single place keeps the rest of the codebase
 * decoupled from Vite specifics and makes it trivial to validate configuration
 * at startup.
 */

function readApiBaseUrl(): string {
  // In development, requests go through the Vite dev proxy (see vite.config.ts):
  // the app calls same-origin paths like `/api/...` and `/health`, which avoids
  // CORS entirely. An empty base URL keeps every request relative.
  if (import.meta.env.DEV) {
    return '';
  }

  // In production, a same-origin reverse proxy is assumed by default. Set
  // VITE_API_URL only when the API is served from a different origin.
  const value = import.meta.env.VITE_API_URL?.trim();
  return value ? value.replace(/\/+$/, '') : '';
}

function readPublicAppUrl(): string {
  // Base of the deep links encoded into location QR codes. Configurable so the
  // production build can point QR codes at the real public origin.
  const value = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  if (value) {
    return value.replace(/\/+$/, '');
  }
  // Fall back to the current origin so QR codes still resolve when the variable
  // is not set (e.g. local dev without an `.env`).
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export const env = {
  /** Base URL for API requests. Empty string means "same origin". */
  apiUrl: readApiBaseUrl(),
  /** Public base URL used to build the QR deep links (`/l/{slug}`). */
  publicAppUrl: readPublicAppUrl(),
} as const;
