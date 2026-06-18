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
  /**
   * True while the app is attempting a silent session restore on startup (i.e.
   * we have a persisted refresh token but no access token yet). Guards wait for
   * this to settle before deciding to redirect to login.
   */
  isInitializing: boolean;
  /** Stores a fresh token pair and re-derives the user from the access token. */
  setSession: (tokens: AuthTokens) => void;
  /** Clears all auth state and the persisted refresh token. */
  clearSession: () => void;
  /** Marks the silent-restore attempt as finished (success or failure). */
  setInitialized: () => void;
}

const storedRefreshToken = readPersistedRefreshToken();

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: storedRefreshToken,
  user: null,
  // If we have a stored refresh token we need to restore the session before
  // rendering auth-gated routes; start in the "initializing" state.
  isInitializing: storedRefreshToken !== null,

  setSession: (tokens) => {
    persistRefreshToken(tokens.refreshToken);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userFromAccessToken(tokens.accessToken),
      isInitializing: false,
    });
  },

  clearSession: () => {
    persistRefreshToken(null);
    set({ accessToken: null, refreshToken: null, user: null, isInitializing: false });
  },

  setInitialized: () => set({ isInitializing: false }),
}));

export { REFRESH_TOKEN_STORAGE_KEY };
