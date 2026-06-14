import { apiClient } from '@/core/api/client';
import type {
  AssistantChatRequest,
  ChatResponse,
} from '@features/Assistant/types';

/**
 * Typed wrapper around the `/api/assistant` endpoints. Scoped to the caller's
 * household on the backend via the `householdId` token claim. The endpoint is
 * stateless; the recent history travels in the request body.
 */
export const assistantApi = {
  async chat(payload: AssistantChatRequest): Promise<ChatResponse> {
    const { data } = await apiClient.post<ChatResponse>(
      '/api/assistant/chat',
      payload,
    );
    return data;
  },
};
