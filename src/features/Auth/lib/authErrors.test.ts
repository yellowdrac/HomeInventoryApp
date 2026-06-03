import { describe, it, expect } from 'vitest';
import { getAuthErrorMessage } from '@features/Auth/lib/authErrors';

interface FakeAxiosError {
  isAxiosError: true;
  response?: { status: number; data?: { title?: string; detail?: string } };
}

function axiosError(
  status: number,
  data?: { title?: string; detail?: string },
): FakeAxiosError {
  return {
    isAxiosError: true,
    response: data ? { status, data } : { status },
  };
}

describe('getAuthErrorMessage', () => {
  it('maps a known backend error code to its specific message', () => {
    const error = axiosError(401, { title: 'Auth.InvalidCredentials' });
    expect(getAuthErrorMessage(error)).toBe(
      'Invalid credentials. Please check your email and password.',
    );
  });

  it('maps the email-already-in-use code', () => {
    const error = axiosError(409, { title: 'Auth.EmailAlreadyInUse' });
    expect(getAuthErrorMessage(error)).toBe(
      'An account with this email already exists.',
    );
  });

  it('falls back to the backend detail for an unknown code', () => {
    const error = axiosError(400, {
      title: 'Auth.SomethingNew',
      detail: 'Password is too weak.',
    });
    expect(getAuthErrorMessage(error)).toBe('Password is too weak.');
  });

  it('falls back to a status-based message when no code or detail is present', () => {
    expect(getAuthErrorMessage(axiosError(403))).toBe(
      'You do not have permission to perform this action.',
    );
    expect(getAuthErrorMessage(axiosError(500))).toBe(
      'The server encountered an error. Please try again later.',
    );
  });

  it('reports a connectivity issue when there is no response', () => {
    expect(getAuthErrorMessage({ isAxiosError: true })).toBe(
      'Connection error. Please check your network and try again.',
    );
  });

  it('returns a generic message for non-axios errors', () => {
    expect(getAuthErrorMessage(new Error('boom'))).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
