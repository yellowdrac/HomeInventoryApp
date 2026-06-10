import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { MoveStockDialog } from '@features/Items/components/MoveStockDialog';
import { LocationType, type LocationTreeNode } from '@features/Locations/types';
import type { StockLot } from '@features/Items/types';

const tree: LocationTreeNode[] = [
  {
    id: 'loc1',
    name: 'Pantry',
    type: LocationType.Room,
    parentId: null,
    children: [],
  },
  {
    id: 'loc2',
    name: 'Garage',
    type: LocationType.Room,
    parentId: null,
    children: [],
  },
];

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
  mock.onGet('/api/locations/tree').reply(200, tree);
});

afterEach(() => {
  mock.restore();
});

function renderDialog(props: Partial<Parameters<typeof MoveStockDialog>[0]> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MoveStockDialog open onClose={() => {}} lot={lot} {...props} />
    </QueryClientProvider>,
  );
}

function treeItemFor(name: string): HTMLElement {
  const node = screen.getByText(name).closest('[role="treeitem"]');
  if (!node) {
    throw new Error(`No treeitem for ${name}`);
  }
  return node as HTMLElement;
}

describe('MoveStockDialog', () => {
  it('caps the quantity at the amount available in the lot', () => {
    renderDialog();

    const quantity = screen.getByLabelText('Quantity') as HTMLInputElement;
    expect(quantity).toHaveAttribute('max', '3');
  });

  it('disables the current location as a destination', async () => {
    renderDialog();

    // The location tree loads asynchronously.
    expect(await screen.findByText('Garage')).toBeInTheDocument();

    expect(treeItemFor('Pantry')).toHaveAttribute('aria-disabled', 'true');
    expect(treeItemFor('Garage')).not.toHaveAttribute('aria-disabled');
  });

  it('pins the quantity to the whole lot for a unique item', () => {
    renderDialog({ isUnique: true });

    const quantity = screen.getByLabelText('Quantity') as HTMLInputElement;
    expect(quantity).toBeDisabled();
    expect(quantity.value).toBe('3');
  });
});
