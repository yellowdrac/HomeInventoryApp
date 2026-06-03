import { apiClient } from '@/core/api/client';
import type {
  AuthTokens,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
} from '@features/Auth/types';

/** Thin, typed wrappers around the `/api/auth` endpoints. */
export const authApi = {
  async register(payload: RegisterRequest): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>(
      '/api/auth/register',
      payload,
    );
    return data;
  },

  async login(payload: LoginRequest): Promise<AuthTokens> {
    console.log("datxa")
    const { data } = await apiClient.post<AuthTokens>(
      '/api/auth/login',
      payload,
    );
    console.log("data2")
    return data;
  },

  async refresh(payload: RefreshRequest): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>(
      '/api/auth/refresh',
      payload,
      { _skipAuthRefresh: true },
    );
    return data;
  },
};
