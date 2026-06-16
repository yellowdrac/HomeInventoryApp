import { resolveApiErrorMessage } from '@/core/api/errors';

/**
 * Backend error codes specific to the assistant, mapped to friendly copy. The
 * usage-limit case is the one users hit most, so it gets a clear message.
 */
const CODE_MESSAGES: Record<string, string> = {
  'Assistant.RateLimited': 'Rate limit API key exceeded. Please wait a moment and try again.',
  'Assistant.Unavailable': 'The assistant is temporarily unavailable. Please try again later.',
};

/** Maps an assistant error into a user-facing message. */
export function getAssistantErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, CODE_MESSAGES);
}
