import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { SearchView } from '@features/Search/views/SearchView';
import type { SearchResultItem } from '@features/Search/types';

const oil: SearchResultItem = {
  itemId: 'i1',
  name: 'Olive oil',
  category: 'Pantry',
  trackingType: 1,
  unit: 'L',
  totalQuantity: 3,
  placements: [
    {
      locationId: 'loc3',
      locationName: 'Box 3',
      breadcrumb: [
        { id: 'h', name: 'House', type: 0, parentId: null, qrSlug: 'h' },
        { id: 'b', name: 'Bedroom', type: 1, parentId: 'h', qrSlug: 'b' },
        { id: 'c', name: 'Closet', type: 2, parentId: 'b', qrSlug: 'c' },
        { id: 'loc3', name: 'Box 3', type: 3, parentId: 'c', qrSlug: 'box3' },
      ],
      quantity: 2,
      expirationDate: '2026-12-01',
    },
  ],
};

function page(items: SearchResultItem[]) {
  return {
    items,
    page: 1,
    pageSize: 20,
    totalCount: items.length,
    totalPages: 1,
  };
}

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

/** Probe that renders the current location so navigation can be asserted. */
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderApp(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/search" element={<SearchView />} />
          <Route path="/items/:id" element={<LocationProbe />} />
          <Route path="/locations" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SearchView', () => {
  it('does not search for fewer than two characters but does once the term is long enough', async () => {
    const requested: string[] = [];
    mock.onGet('/api/search').reply((config) => {
      requested.push(config.params?.q as string);
      return [200, page([oil])];
    });

    const user = userEvent.setup();
    renderApp('/search');

    const input = screen.getByPlaceholderText(
      'Search for an item by name or barcode',
    );
    await user.type(input, 'o');

    // Below the threshold: no request even after the debounce window.
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(requested).toHaveLength(0);

    await user.type(input, 'il');
    await waitFor(() => expect(requested).toContain('oil'));
    expect(requested.every((q) => q.length >= 2)).toBe(true);
  });

  it('renders the breadcrumb, location and quantity of each result', async () => {
    mock.onGet('/api/search').reply(200, page([oil]));

    renderApp('/search?q=oil');

    const list = await screen.findByRole('list', { name: 'Search results' });
    expect(within(list).getByText('Olive oil')).toBeInTheDocument();

    // The full breadcrumb path is shown, leading with the location.
    const breadcrumb = screen.getByRole('link', {
      name: /Go to location: House › Bedroom › Closet › Box 3/,
    });
    expect(breadcrumb).toBeInTheDocument();

    // Per-placement quantity (with unit) and an expiration label are shown
    // (the date itself is locale-formatted, so only the label is asserted).
    expect(within(list).getByText('2 L')).toBeInTheDocument();
    expect(within(list).getByText(/Expires/)).toBeInTheDocument();
  });

  it('shows a no-results message', async () => {
    mock.onGet('/api/search').reply(200, page([]));

    renderApp('/search?q=zzz');

    expect(
      await screen.findByText(/No results for .*zzz/),
    ).toBeInTheDocument();
  });

  it('navigates to the item detail when a result is clicked', async () => {
    mock.onGet('/api/search').reply(200, page([oil]));
    const user = userEvent.setup();

    renderApp('/search?q=oil');

    const itemLink = await screen.findByRole('link', { name: /Olive oil/ });
    await user.click(itemLink);

    expect(screen.getByTestId('location')).toHaveTextContent('/items/i1');
  });

  it('navigates to the storing location when the breadcrumb is clicked', async () => {
    mock.onGet('/api/search').reply(200, page([oil]));
    const user = userEvent.setup();

    renderApp('/search?q=oil');

    const breadcrumb = await screen.findByRole('link', {
      name: /Go to location/,
    });
    await user.click(breadcrumb);

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/locations?location=loc3',
    );
  });
});
