import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '@features/Auth/schemas';

describe('loginSchema', () => {
  it('accepts a valid email and non-empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    email: 'user@example.com',
    displayName: 'Alex Doe',
    password: 'supersecret',
  };

  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a short password (< 8 chars)', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty display name', () => {
    const result = registerSchema.safeParse({ ...valid, displayName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a display name longer than 100 chars', () => {
    const result = registerSchema.safeParse({
      ...valid,
      displayName: 'a'.repeat(101),
    });
    expect(result.success).toBe(false);
  });
});
