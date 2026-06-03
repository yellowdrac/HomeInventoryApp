import { describe, it, expect } from 'vitest';
import { decodeJwt, userFromAccessToken } from '@features/Auth/lib/jwt';

function base64Url(value: string): string {
  return btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('decodeJwt', () => {
  it('decodes the claims of a well-formed token', () => {
    const token = makeJwt({ sub: 'user-1', email: 'a@b.com' });
    expect(decodeJwt(token)).toMatchObject({ sub: 'user-1', email: 'a@b.com' });
  });

  it('returns null for a token without three segments', () => {
    expect(decodeJwt('not.a-token')).toBeNull();
  });

  it('returns null when required claims are missing', () => {
    const token = makeJwt({ foo: 'bar' });
    expect(decodeJwt(token)).toBeNull();
  });
});

describe('userFromAccessToken', () => {
  it('maps claims into an AuthUser without a household', () => {
    const token = makeJwt({ sub: 'user-1', email: 'a@b.com' });
    expect(userFromAccessToken(token)).toEqual({
      id: 'user-1',
      email: 'a@b.com',
      householdId: null,
    });
  });

  it('includes the householdId claim when present', () => {
    const token = makeJwt({
      sub: 'user-1',
      email: 'a@b.com',
      householdId: 'house-9',
    });
    expect(userFromAccessToken(token)).toEqual({
      id: 'user-1',
      email: 'a@b.com',
      householdId: 'house-9',
    });
  });

  it('returns null for a malformed token', () => {
    expect(userFromAccessToken('garbage')).toBeNull();
  });
});
