import { isAxiosError } from 'axios';

/** RFC 7807 problem details shape returned by the backend on failures. */
interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
}

const NETWORK_MESSAGE =
  'Connection error. Please check your network and try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

/** Generic fallbacks by HTTP status, shared across features. */
const MESSAGE_BY_STATUS: Record<number, string> = {
  400: 'Some of the information provided is invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This request conflicts with existing data.',
  429: 'Too many attempts. Please wait a moment and try again.',
  500: 'The server encountered an error. Please try again later.',
};

/**
 * Resolves an error into a user-facing message. Resolution order:
 *  1. a feature-specific message for the backend error code (ProblemDetails `title`),
 *  2. the backend-provided `detail`,
 *  3. a generic message for the HTTP status,
 *  4. a generic fallback.
 *
 * Network failures (no response) are reported as connectivity issues.
 *
 * Pass `codeMessages` to map well-known backend error codes to friendly,
 * feature-specific copy.
 */
export function resolveApiErrorMessage(
  error: unknown,
  codeMessages: Record<string, string> = {},
): string {
  if (isAxiosError<ProblemDetails>(error)) {
    if (!error.response) {
      return NETWORK_MESSAGE;
    }

    const problem = error.response.data;

    const code = problem?.title;
    const mappedByCode = code ? codeMessages[code] : undefined;
    if (mappedByCode) {
      return mappedByCode;
    }

    if (problem?.detail) {
      return problem.detail;
    }

    const mappedByStatus = MESSAGE_BY_STATUS[error.response.status];
    if (mappedByStatus) {
      return mappedByStatus;
    }
  }

  return GENERIC_MESSAGE;
}

/**
 * Convenience resolver with no feature-specific code mapping. Useful for generic
 * surfaces that just need a readable message.
 */
export function getApiErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error);
}
