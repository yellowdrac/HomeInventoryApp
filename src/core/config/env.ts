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

export const env = {
  /** Base URL for API requests. Empty string means "same origin". */
  apiUrl: readApiBaseUrl(),
} as const;
