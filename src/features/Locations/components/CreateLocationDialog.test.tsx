import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateLocationDialog } from '@features/Locations/components/CreateLocationDialog';

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateLocationDialog open onClose={() => {}} parent={null} />
    </QueryClientProvider>,
  );
}

describe('CreateLocationDialog', () => {
  it('shows an accessible validation error when the name is empty', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('does not show validation errors before submitting', () => {
    renderDialog();
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });
});
