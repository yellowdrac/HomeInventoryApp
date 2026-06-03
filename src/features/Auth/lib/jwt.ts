import type { AuthUser, JwtClaims } from '@features/Auth/types';

/**
 * Decodes the payload of a JWT without verifying its signature. Verification is
 * the backend's responsibility; the client only reads claims to project the user.
 * Returns `null` for any malformed token.
 */
export function decodeJwt(token: string): JwtClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const payload = parts[1];
  if (!payload) {
    return null;
  }

  try {
    const json = base64UrlDecode(payload);
    const claims = JSON.parse(json) as unknown;
    if (!isJwtClaims(claims)) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

/** Projects an access token into the `AuthUser` consumed by the UI. */
export function userFromAccessToken(token: string): AuthUser | null {
  const claims = decodeJwt(token);
  if (!claims) {
    return null;
  }

  return {
    id: claims.sub,
    email: claims.email,
    householdId: claims.householdId ?? null,
  };
}

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  );
  const binary = atob(padded);

  // Decode as UTF-8 so non-ASCII claim values survive the round-trip.
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isJwtClaims(value: unknown): value is JwtClaims {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.sub === 'string' && typeof record.email === 'string';
}
