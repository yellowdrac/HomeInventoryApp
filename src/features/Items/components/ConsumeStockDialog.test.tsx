import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { ConsumeStockDialog } from '@features/Items/components/ConsumeStockDialog';
import type { StockLot } from '@features/Items/types';

const lot: StockLot = {
  id: 'l1',
  itemId: 'i1',
  itemName: 'Olive oil',
  locationId: 'loc1',
  locationName: 'Pantry',
  locationBreadcrumb: ['Pantry'],
  quantity: 3,
  expirationDate: null,
  acquiredDate: null,
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ConsumeStockDialog open onClose={() => {}} lot={lot} />
    </QueryClientProvider>,
  );
}

describe('ConsumeStockDialog', () => {
  it('rejects a quantity greater than the amount available and does not call the API', async () => {
    const consumed = mock.onPost('/api/stock-lots/l1/consume').reply(200);
    const user = userEvent.setup();

    renderDialog();

    const quantity = screen.getByLabelText('Quantity');
    await user.clear(quantity);
    await user.type(quantity, '5');
    await user.click(screen.getByRole('button', { name: 'Consume' }));

    expect(
      await screen.findByText('Only 3 available in this lot'),
    ).toBeInTheDocument();
    expect(consumed.history.post).toHaveLength(0);
  });

  it('submits a valid quantity to the consume endpoint', async () => {
    const consumed = mock.onPost('/api/stock-lots/l1/consume').reply(200);
    const user = userEvent.setup();

    renderDialog();

    const quantity = screen.getByLabelText('Quantity');
    await user.clear(quantity);
    await user.type(quantity, '2');
    await user.click(screen.getByRole('button', { name: 'Consume' }));

    await waitFor(() => expect(consumed.history.post).toHaveLength(1));
    expect(JSON.parse(consumed.history.post[0]!.data)).toMatchObject({
      quantity: 2,
    });
  });
});
