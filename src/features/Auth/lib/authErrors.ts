import { resolveApiErrorMessage } from '@/core/api/errors';

/**
 * Friendly messages keyed by the backend error code (ProblemDetails `title`).
 * Mapping by code is more reliable than mapping by HTTP status, since several
 * distinct errors can share the same status (e.g. 401).
 */
const MESSAGE_BY_CODE: Record<string, string> = {
  'Auth.InvalidCredentials':
    'Invalid credentials. Please check your email and password.',
  'Auth.EmailAlreadyInUse': 'An account with this email already exists.',
  'Auth.InvalidRefreshToken': 'Your session has expired. Please sign in again.',
  'Auth.RegistrationFailed':
    'We could not complete your registration. Please review your details.',
};

/** Maps an authentication error into a specific, user-facing message. */
export function getAuthErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, MESSAGE_BY_CODE);
}
