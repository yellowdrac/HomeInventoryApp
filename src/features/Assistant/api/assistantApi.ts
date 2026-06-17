import { apiClient } from '@/core/api/client';
import type {
  AssistantChatRequest,
  ChatResponse,
  ExecuteActionRequest,
  ExecuteActionResult,
} from '@features/Assistant/types';

// LLM responses with multi-tool-call loops can take 30-60 s.
// Both endpoints get a generous timeout so a slow model response is not
// misreported as a network error.
const ASSISTANT_TIMEOUT_MS = 120_000;

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
      { timeout: ASSISTANT_TIMEOUT_MS },
    );
    return data;
  },

  async execute(payload: ExecuteActionRequest): Promise<ExecuteActionResult> {
    const { data } = await apiClient.post<ExecuteActionResult>(
      '/api/assistant/execute',
      payload,
      { timeout: ASSISTANT_TIMEOUT_MS },
    );
    return data;
  },
};
