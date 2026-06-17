import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { AddStockDialog } from '@features/Items/components/AddStockDialog';
import { TrackingType, type Item } from '@features/Items/types';

const uniqueItem: Item = {
  id: 'i1',
  name: 'Passport',
  category: null,
  barcode: null,
  trackingType: TrackingType.Unique,
  unit: null,
  photoUrl: null,
  totalQuantity: 0,
  minimumQuantity: null,
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  // The location picker loads the tree on mount.
  mock.onGet('/api/locations/tree').reply(200, []);
});

afterEach(() => {
  mock.restore();
});

function renderDialog(item: Item) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AddStockDialog open onClose={() => {}} item={item} />
    </QueryClientProvider>,
  );
}

describe('AddStockDialog', () => {
  it('pins the quantity to 1 and disables it for a unique item', () => {
    renderDialog(uniqueItem);

    const quantity = screen.getByLabelText('Quantity') as HTMLInputElement;
    expect(quantity).toBeDisabled();
    expect(quantity.value).toBe('1');
    expect(
      screen.getByText('Unique items always have a quantity of 1.'),
    ).toBeInTheDocument();
  });
});
