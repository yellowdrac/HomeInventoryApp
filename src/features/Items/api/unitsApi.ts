import { apiClient } from '@/core/api/client';
import type { UnitDto } from '@features/Items/types';

export const unitsApi = {
  async list(): Promise<UnitDto[]> {
    const { data } = await apiClient.get<UnitDto[]>('/api/units');
    return data;
  },
};
