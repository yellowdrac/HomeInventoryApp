import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  PublicOnlyRoute,
  RequireAuth,
  RequireHousehold,
} from '@/core/auth/guards';
import { useAuthStore } from '@features/Auth/store/authStore';
import type { AuthUser } from '@features/Auth/types';

/** Renders the current location so navigation/redirects can be asserted. */
function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{location.pathname + location.search}</div>
  );
}

function renderAt(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <LocationProbe />
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>login page</div>} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/household/setup" element={<div>setup page</div>} />
            <Route element={<RequireHousehold />}>
              <Route path="/" element={<div>app home</div>} />
              <Route path="/l/:slug" element={<div>location page</div>} />
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

  it('preserves the intended destination when bouncing to login', () => {
    setSession(null);
    renderAt('/l/box-3');
    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/login?redirect=%2Fl%2Fbox-3',
    );
  });

  it('redirects to the preserved destination after login', () => {
    setSession(userWithHousehold);
    renderAt('/login?redirect=%2Fl%2Fbox-3');
    expect(screen.getByText('location page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/l/box-3');
  });

  it('ignores an external redirect target (open-redirect guard)', () => {
    setSession(userWithHousehold);
    renderAt('/login?redirect=https%3A%2F%2Fevil.com');
    expect(screen.getByText('app home')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });
});
