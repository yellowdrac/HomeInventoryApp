/**
 * Validates a post-login `redirect` target. Only same-origin, absolute in-app
 * paths are allowed so the value can never be used for an open redirect to an
 * external site (e.g. `//evil.com` or `https://evil.com`).
 */
export function sanitizeReturnUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  // Must be an absolute in-app path, and not a protocol-relative ("//host") or
  // backslash-obfuscated ("/\\host") URL.
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return null;
  }

  return value;
}
