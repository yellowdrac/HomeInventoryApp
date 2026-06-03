import { create } from 'zustand';
import { userFromAccessToken } from '@features/Auth/lib/jwt';
import type { AuthTokens, AuthUser } from '@features/Auth/types';

const REFRESH_TOKEN_STORAGE_KEY = 'home-inventory.refreshToken';

/**
 * Reads the persisted refresh token. The refresh token is the only credential
 * kept in `localStorage`; the short-lived access token stays in memory.
 */
function readPersistedRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistRefreshToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Storage may be unavailable (private mode / SSR); degrade gracefully.
  }
}

interface AuthState {
  /** Access token, kept in memory only. */
  accessToken: string | null;
  /** Refresh token, mirrored to localStorage so the session survives reloads. */
  refreshToken: string | null;
  /** User projected from the access token claims. */
  user: AuthUser | null;
  /** Stores a fresh token pair and re-derives the user from the access token. */
  setSession: (tokens: AuthTokens) => void;
  /** Clears all auth state and the persisted refresh token. */
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  // Hydrated on load; the access token is then restored via a refresh call.
  refreshToken: readPersistedRefreshToken(),
  user: null,

  setSession: (tokens) => {
    persistRefreshToken(tokens.refreshToken);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userFromAccessToken(tokens.accessToken),
    });
  },

  clearSession: () => {
    persistRefreshToken(null);
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));

export { REFRESH_TOKEN_STORAGE_KEY };
