import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { GlobalSearch } from '@features/Search/components/GlobalSearch';
import type { SearchResultItem } from '@features/Search/types';

const oil: SearchResultItem = {
  itemId: 'i1',
  name: 'Olive oil',
  category: null,
  trackingType: 1,
  unit: 'L',
  totalQuantity: 3,
  placements: [
    {
      locationId: 'loc3',
      locationName: 'Box 3',
      breadcrumb: [
        { id: 'h', name: 'House', type: 0, parentId: null, qrSlug: 'h' },
        { id: 'loc3', name: 'Box 3', type: 3, parentId: 'h', qrSlug: 'box3' },
      ],
      quantity: 2,
      expirationDate: null,
    },
  ],
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  mock.onGet('/api/search').reply(200, {
    items: [oil],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
  });
});

afterEach(() => {
  mock.restore();
});

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <GlobalSearch />
        <Routes>
          <Route path="/" element={<LocationProbe />} />
          <Route path="/items/:id" element={<LocationProbe />} />
          <Route path="/search" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('GlobalSearch', () => {
  it('opens an accessible combobox and shows quick matches with their location', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /Search/ }));

    const combobox = screen.getByRole('combobox', { name: 'Search inventory' });
    await user.type(combobox, 'oil');

    const option = await screen.findByRole('option', { name: /Olive oil/ });
    expect(option).toHaveTextContent('House › Box 3');
  });

  it('navigates to the item detail when a quick match is chosen', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /Search/ }));
    await user.type(
      screen.getByRole('combobox', { name: 'Search inventory' }),
      'oil',
    );

    const option = await screen.findByRole('option', { name: /Olive oil/ });
    await user.click(option);

    expect(screen.getByTestId('location')).toHaveTextContent('/items/i1');
  });

  it('opens the full search page from the "search everywhere" option', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /Search/ }));
    await user.type(
      screen.getByRole('combobox', { name: 'Search inventory' }),
      'oil',
    );

    const everywhere = await screen.findByRole('option', {
      name: /Search everywhere/,
    });
    await user.click(everywhere);

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/search?q=oil',
      ),
    );
  });
});
