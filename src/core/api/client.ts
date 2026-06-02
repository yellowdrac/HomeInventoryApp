import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/core/config/env';

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
 * Auth token interceptor — PLACEHOLDER for Phase 1.
 *
 * Once authentication lands, retrieve the access token from wherever it is
 * stored (e.g. an auth store / secure cookie) and attach it here. Until then
 * this is a no-op so the wiring is already in place.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // TODO(Phase 1): const token = getAuthToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
);
