import { useMutation } from '@tanstack/react-query';
import { assistantApi } from '@features/Assistant/api/assistantApi';
import type {
  AssistantChatRequest,
  ChatResponse,
} from '@features/Assistant/types';

/**
 * Sends a chat turn (message + recent history) to the stateless assistant
 * endpoint and returns its answer. The conversation history itself lives in the
 * calling component; this hook only owns the in-flight request, surfacing
 * `isPending` for the typing indicator and `error` for failures.
 */
export function useAssistantChat() {
  return useMutation<ChatResponse, unknown, AssistantChatRequest>({
    mutationFn: (payload) => assistantApi.chat(payload),
  });
}
