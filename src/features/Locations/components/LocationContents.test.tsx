import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { LocationContents } from '@features/Locations/components/LocationContents';
import type { StockLot } from '@features/Items/types';

const lots: StockLot[] = [
  {
    id: 'l1',
    itemId: 'i1',
    itemName: 'Olive oil',
    locationId: 'loc1',
    locationName: 'Pantry',
    locationBreadcrumb: ['Kitchen', 'Pantry'],
    quantity: 2,
    expirationDate: null,
    acquiredDate: null,
  },
  {
    id: 'l2',
    itemId: 'i2',
    itemName: 'Rice',
    locationId: 'loc1',
    locationName: 'Pantry',
    locationBreadcrumb: ['Kitchen', 'Pantry'],
    quantity: 5,
    expirationDate: null,
    acquiredDate: null,
  },
];

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

function renderContents() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LocationContents locationId="loc1" locationName="Pantry" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LocationContents', () => {
  it('renders the stock stored at the location, linking to each item', async () => {
    mock.onGet('/api/locations/loc1/contents').reply(200, lots);

    renderContents();

    const oil = await screen.findByText('Olive oil');
    expect(oil).toBeInTheDocument();
    expect(screen.getByText('Rice')).toBeInTheDocument();

    // Each row links to its item detail page.
    expect(oil.closest('a')).toHaveAttribute('href', '/items/i1');
  });

  it('shows an empty message when nothing is stored', async () => {
    mock.onGet('/api/locations/loc1/contents').reply(200, []);

    renderContents();

    expect(
      await screen.findByText('Nothing is stored here yet.'),
    ).toBeInTheDocument();
  });
});
