import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { useAuthStore } from '@features/Auth/store/authStore';
import type { AuthTokens } from '@features/Auth/types';

const newTokens: AuthTokens = {
  accessToken: 'new-access-token',
  accessTokenExpiresAtUtc: '2999-01-01T00:00:00Z',
  refreshToken: 'new-refresh-token',
  refreshTokenExpiresAtUtc: '2999-01-01T00:00:00Z',
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  useAuthStore.setState({
    accessToken: 'old-access-token',
    refreshToken: 'old-refresh-token',
    user: { id: 'u1', email: 'a@b.com', householdId: 'h1' },
  });
});

afterEach(() => {
  mock.restore();
});

describe('apiClient auth interceptor', () => {
  it('attaches the access token as a Bearer header', async () => {
    let seenAuth: string | undefined;
    mock.onGet('/protected').reply((config) => {
      seenAuth = config.headers?.Authorization as string | undefined;
      return [200, { ok: true }];
    });

    await apiClient.get('/protected');

    expect(seenAuth).toBe('Bearer old-access-token');
  });

  it('refreshes the token on a 401 and retries the request once', async () => {
    const authHeaders: (string | undefined)[] = [];
    mock.onGet('/protected').reply((config) => {
      authHeaders.push(config.headers?.Authorization as string | undefined);
      // First attempt is unauthorized; the replayed attempt succeeds.
      return authHeaders.length === 1 ? [401] : [200, { ok: true }];
    });
    mock.onPost('/api/auth/refresh').reply(200, newTokens);

    const response = await apiClient.get('/protected');

    expect(response.data).toEqual({ ok: true });
    // The retry carried the refreshed access token.
    expect(authHeaders[1]).toBe('Bearer new-access-token');
    // The store now holds the refreshed session.
    expect(useAuthStore.getState().accessToken).toBe('new-access-token');
    expect(
      mock.history.post.filter((r) => r.url === '/api/auth/refresh'),
    ).toHaveLength(1);
  });

  it('logs out when the refresh attempt fails', async () => {
    mock.onGet('/protected').reply(401);
    mock.onPost('/api/auth/refresh').reply(401);

    await expect(apiClient.get('/protected')).rejects.toBeDefined();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });
});
