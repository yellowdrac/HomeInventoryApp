import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { ItemsView } from '@features/Items/views/ItemsView';
import { TrackingType, type Item } from '@features/Items/types';

function makeItem(overrides: Partial<Item>): Item {
  return {
    id: 'i1',
    name: 'Item',
    category: null,
    barcode: null,
    trackingType: TrackingType.Quantity,
    unit: null,
    photoUrl: null,
    totalQuantity: 0,
    ...overrides,
  };
}

const oil = makeItem({ id: 'i1', name: 'Olive oil', totalQuantity: 2 });
const rice = makeItem({ id: 'i2', name: 'Rice', totalQuantity: 5 });

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

function renderView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ItemsView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ItemsView', () => {
  it('renders the list of items', async () => {
    mock.onGet('/api/items').reply(200, {
      items: [oil, rice],
      page: 1,
      pageSize: 20,
      totalCount: 2,
      totalPages: 1,
    });

    renderView();

    expect(await screen.findByText('Olive oil')).toBeInTheDocument();
    expect(screen.getByText('Rice')).toBeInTheDocument();
  });

  it('debounces the text filter and queries the API with nameFilter', async () => {
    const requestedFilters: (string | undefined)[] = [];
    mock.onGet('/api/items').reply((config) => {
      const nameFilter = config.params?.nameFilter as string | undefined;
      requestedFilters.push(nameFilter);
      const items = nameFilter
        ? [oil].filter((i) =>
            i.name.toLowerCase().includes(nameFilter.toLowerCase()),
          )
        : [oil, rice];
      return [
        200,
        { items, page: 1, pageSize: 20, totalCount: items.length, totalPages: 1 },
      ];
    });

    const user = userEvent.setup();
    renderView();

    expect(await screen.findByText('Rice')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Search items by name'), 'olive');

    // The debounced query eventually fires with the typed filter and the list
    // narrows to the matching item.
    await waitFor(() => {
      expect(requestedFilters).toContain('olive');
    });

    const list = await screen.findByRole('list', { name: 'Items' });
    expect(within(list).getByText('Olive oil')).toBeInTheDocument();
    await waitFor(() => {
      expect(within(list).queryByText('Rice')).not.toBeInTheDocument();
    });
  });
});
