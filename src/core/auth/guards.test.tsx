import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  PublicOnlyRoute,
  RequireAuth,
  RequireHousehold,
} from '@/core/auth/guards';
import { useAuthStore } from '@features/Auth/store/authStore';
import type { AuthUser } from '@features/Auth/types';

function renderAt(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>login page</div>} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/household/setup" element={<div>setup page</div>} />
            <Route element={<RequireHousehold />}>
              <Route path="/" element={<div>app home</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function setSession(user: AuthUser | null) {
  useAuthStore.setState({
    accessToken: user ? 'access-token' : null,
    refreshToken: user ? 'refresh-token' : null,
    user,
  });
}

const userWithoutHousehold: AuthUser = {
  id: 'u1',
  email: 'a@b.com',
  householdId: null,
};

const userWithHousehold: AuthUser = {
  id: 'u1',
  email: 'a@b.com',
  householdId: 'h1',
};

describe('route guards', () => {
  beforeEach(() => {
    setSession(null);
  });

  it('redirects an unauthenticated user to the login page', () => {
    setSession(null);
    renderAt('/');
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('redirects an authenticated user without a household to setup', () => {
    setSession(userWithoutHousehold);
    renderAt('/');
    expect(screen.getByText('setup page')).toBeInTheDocument();
  });

  it('lets an authenticated user with a household reach the app', () => {
    setSession(userWithHousehold);
    renderAt('/');
    expect(screen.getByText('app home')).toBeInTheDocument();
  });

  it('keeps an authenticated user without a household on setup when visiting it directly', () => {
    setSession(userWithoutHousehold);
    renderAt('/household/setup');
    expect(screen.getByText('setup page')).toBeInTheDocument();
  });

  it('redirects an already-authenticated user away from the login page', () => {
    setSession(userWithHousehold);
    renderAt('/login');
    expect(screen.getByText('app home')).toBeInTheDocument();
  });
});
