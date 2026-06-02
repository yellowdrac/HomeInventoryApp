/**
 * Centralized, typed access to the environment variables consumed by the app.
 *
 * Reading `import.meta.env` in a single place keeps the rest of the codebase
 * decoupled from Vite specifics and makes it trivial to validate configuration
 * at startup.
 */

const DEFAULT_API_URL = 'http://localhost:5080';

function readApiUrl(): string {
  const value = import.meta.env.VITE_API_URL?.trim();

  if (!value) {
    // Fail loud in development, fall back gracefully so the app still boots.
    console.warn(
      `[env] VITE_API_URL is not set. Falling back to "${DEFAULT_API_URL}". ` +
        'Create a .env file from .env.example to configure it.',
    );
    return DEFAULT_API_URL;
  }

  return value.replace(/\/+$/, ''); // strip trailing slashes for safe joins
}

export const env = {
  apiUrl: readApiUrl(),
} as const;
