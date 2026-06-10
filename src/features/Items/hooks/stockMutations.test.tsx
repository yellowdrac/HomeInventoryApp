import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { useMoveStock } from '@features/Items/hooks/useMoveStock';
import { useConsumeStock } from '@features/Items/hooks/useConsumeStock';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, invalidateSpy, wrapper };
}

function invalidatedKeys(spy: ReturnType<typeof vi.spyOn>): unknown[] {
  return spy.mock.calls.map((call: unknown[]) => {
    const arg = call[0] as { queryKey?: unknown[] } | undefined;
    return arg?.queryKey?.[0];
  });
}

describe('stock mutation invalidation', () => {
  it('invalidates items, location contents and movements after a move', async () => {
    mock.onPost('/api/stock-lots/l1/move').reply(200, {});
    const { invalidateSpy, wrapper } = setup();

    const { result } = renderHook(() => useMoveStock(), { wrapper });

    await result.current.mutateAsync({
      lotId: 'l1',
      itemId: 'i1',
      payload: { toLocationId: 'loc2', quantity: 1 },
    });

    await waitFor(() => {
      const keys = invalidatedKeys(invalidateSpy);
      expect(keys).toContain('items');
      expect(keys).toContain('locations');
      expect(keys).toContain('movements');
    });
  });

  it('invalidates movements after a consume', async () => {
    mock.onPost('/api/stock-lots/l1/consume').reply(200);
    const { invalidateSpy, wrapper } = setup();

    const { result } = renderHook(() => useConsumeStock(), { wrapper });

    await result.current.mutateAsync({
      lotId: 'l1',
      itemId: 'i1',
      payload: { quantity: 1, reason: null },
    });

    await waitFor(() => {
      expect(invalidatedKeys(invalidateSpy)).toContain('movements');
    });
  });
});
