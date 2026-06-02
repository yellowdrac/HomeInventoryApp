import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import type { HealthResponse } from '@features/Welcome/types';

export const healthQueryKey = ['health'] as const;

async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health');
  return data;
}

/**
 * Reads the backend health endpoint via TanStack Query.
 *
 * Used by the Welcome view to surface the connection status (loading /
 * connected + version / error).
 */
export function useHealth() {
  return useQuery({
    queryKey: healthQueryKey,
    queryFn: fetchHealth,
  });
}
