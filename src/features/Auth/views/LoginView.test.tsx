import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginView } from '@features/Auth/views/LoginView';
import { useAuthStore } from '@features/Auth/store/authStore';

function renderLogin() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginView', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
  });

  it('shows accessible validation errors when submitting an empty form', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    // The email input is wired to its error via aria for assistive tech.
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('does not show validation errors before submitting', () => {
    renderLogin();
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });
});
