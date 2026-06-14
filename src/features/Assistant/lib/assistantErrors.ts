import { resolveApiErrorMessage } from '@/core/api/errors';

/**
 * Backend error codes specific to the assistant, mapped to friendly copy. The
 * usage-limit case is the one users hit most, so it gets a clear message.
 */
const CODE_MESSAGES: Record<string, string> = {
  assistant_rate_limited:
    'The assistant is busy right now. Please wait a moment and try again.',
  assistant_unavailable:
    'The assistant is temporarily unavailable. Please try again later.',
};

/** Maps an assistant error into a user-facing message. */
export function getAssistantErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, CODE_MESSAGES);
}
