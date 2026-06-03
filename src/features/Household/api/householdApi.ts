import { apiClient } from '@/core/api/client';
import type { AuthTokens } from '@features/Auth/types';
import type {
  CreateHouseholdRequest,
  HouseholdResponse,
  JoinHouseholdRequest,
} from '@features/Household/types';

/**
 * Typed wrappers around the `/api/households` endpoints.
 *
 * Note: creating or joining a household re-issues the token pair (the new tokens
 * carry the `householdId` claim), so those calls return `AuthTokens`.
 */
export const householdApi = {
  async getMine(): Promise<HouseholdResponse> {
    const { data } =
      await apiClient.get<HouseholdResponse>('/api/households/me');
    return data;
  },

  async create(payload: CreateHouseholdRequest): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>(
      '/api/households',
      payload,
    );
    return data;
  },

  async join(payload: JoinHouseholdRequest): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>(
      '/api/households/join',
      payload,
    );
    return data;
  },

  async regenerateCode(): Promise<HouseholdResponse> {
    const { data } = await apiClient.post<HouseholdResponse>(
      '/api/households/regenerate-code',
    );
    return data;
  },
};
