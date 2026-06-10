import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { useDiscardExpired } from '@features/Kitchen/hooks/useDiscardExpired';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

function invalidatedKeys(spy: ReturnType<typeof vi.spyOn>): unknown[] {
  return spy.mock.calls.map((call: unknown[]) => {
    const arg = call[0] as { queryKey?: unknown[] } | undefined;
    return arg?.queryKey?.[0];
  });
}

describe('useDiscardExpired', () => {
  it('invalidates inventory, history and kitchen queries after discarding', async () => {
    mock.onPost('/api/expirations/discard-expired').reply(200, 4);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDiscardExpired(), { wrapper });

    const discarded = await result.current.mutateAsync({});
    expect(discarded).toBe(4);

    await waitFor(() => {
      const keys = invalidatedKeys(invalidateSpy);
      expect(keys).toContain('items');
      expect(keys).toContain('locations');
      expect(keys).toContain('movements');
      expect(keys).toContain('expirations');
      expect(keys).toContain('kitchen');
    });
  });
});
