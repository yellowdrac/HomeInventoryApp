/**
 * Request/response DTOs for the authentication flows. These mirror the backend
 * contract under `/api/auth` (see backend AuthEndpoints / AuthenticationResponse).
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

/**
 * Token pair returned by `/register`, `/login`, `/refresh` and by the household
 * create/join endpoints (which re-issue tokens carrying the new `householdId`).
 */
export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
}

/**
 * Authenticated user projection derived from the access token claims. The backend
 * does not expose a `/me` endpoint, so this is decoded from the JWT.
 */
export interface AuthUser {
  id: string;
  email: string;
  householdId: string | null;
}

/** Raw JWT payload claims emitted by the backend `TokenService`. */
export interface JwtClaims {
  sub: string;
  email: string;
  householdId?: string;
  exp?: number;
}
