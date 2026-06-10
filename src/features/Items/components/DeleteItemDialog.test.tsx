import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { DeleteItemDialog } from '@features/Items/components/DeleteItemDialog';
import { TrackingType, type Item } from '@features/Items/types';

const stockedItem: Item = {
  id: 'i1',
  name: 'Olive oil',
  category: null,
  barcode: null,
  trackingType: TrackingType.Quantity,
  unit: 'L',
  photoUrl: null,
  totalQuantity: 3,
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
      <DeleteItemDialog open onClose={() => {}} item={stockedItem} />
    </QueryClientProvider>,
  );
}

describe('DeleteItemDialog', () => {
  it('shows the backend error when deleting an item that still has stock', async () => {
    mock
      .onDelete('/api/items/i1')
      .reply(409, { title: 'Item.HasStock', status: 409 });

    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(
      await screen.findByText(
        'This item still has stock. Remove its stock lots before deleting it.',
      ),
    ).toBeInTheDocument();
  });
});
