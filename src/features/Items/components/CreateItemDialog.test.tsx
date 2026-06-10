import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateItemDialog } from '@features/Items/components/CreateItemDialog';

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateItemDialog open onClose={() => {}} />
    </QueryClientProvider>,
  );
}

describe('CreateItemDialog', () => {
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

  it('shows the unit field only for quantity-tracked items', async () => {
    const user = userEvent.setup();
    renderDialog();

    // Defaults to Quantity, so the unit field is present.
    expect(screen.getByLabelText('Unit')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Tracking type'), 'Unique');

    expect(screen.queryByLabelText('Unit')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Tracking type'), 'Quantity');

    expect(screen.getByLabelText('Unit')).toBeInTheDocument();
  });
});
