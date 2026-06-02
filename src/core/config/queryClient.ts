import { QueryClient } from '@tanstack/react-query';

/**
 * Application-wide TanStack Query client.
 *
 * Defaults are tuned for a shared-household app: data stays fresh for a short
 * window and retries are limited to avoid hammering the backend.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s before data is considered stale
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
