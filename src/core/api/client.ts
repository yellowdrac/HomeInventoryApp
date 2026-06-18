import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/core/config/env';
import { useAuthStore } from '@features/Auth/store/authStore';
import type { AuthTokens } from '@features/Auth/types';

/**
 * Extra per-request flags used by the auth interceptors.
 *  - `_retry`: set once a request has already been replayed after a refresh,
 *    so a second 401 does not loop.
 *  - `_skipAuthRefresh`: set on the refresh call itself so a 401 there does not
 *    trigger another refresh.
 */
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

const REFRESH_ENDPOINT = '/api/auth/refresh';

/**
 * Shared, typed HTTP client for the HomeInventory backend.
 *
 * `baseURL` comes from VITE_API_URL so every feature can issue relative
 * requests (e.g. `apiClient.get('/health')`).
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: attaches the in-memory access token as a Bearer header.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

// Coalesces concurrent 401s into a single in-flight refresh request.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const { data } = await apiClient.post<AuthTokens>(
    REFRESH_ENDPOINT,
    { refreshToken },
    { _skipAuthRefresh: true },
  );

  useAuthStore.getState().setSession(data);
  return data.accessToken;
}

/**
 * Triggers a token refresh and coalesces concurrent callers into a single in-flight
 * request. Both the proactive scheduler (useTokenRefresh) and the reactive 401
 * interceptor call this so they can never double-consume the same refresh token.
 * Returns the new access token.
 */
export async function performRefresh(): Promise<string> {
  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

/**
 * Response interceptor: on a 401, transparently refresh the access token and
 * replay the original request once. If the refresh fails, the session is
 * cleared (logout) and the error propagates.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !original ||
      original._retry ||
      original._skipAuthRefresh ||
      !useAuthStore.getState().refreshToken 
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newAccessToken = await performRefresh();
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return await apiClient(original);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    }
  },
);
