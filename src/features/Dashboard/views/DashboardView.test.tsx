import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { DashboardView } from '@features/Dashboard/views/DashboardView';

const overview = {
  expiredCount: 2,
  expiringSoonCount: 4,
  perishableLotCount: 6,
  soonestExpiration: '2026-06-15',
};

// One root with two children → three locations in total.
const locationTree = [
  {
    id: 'r1',
    name: 'Kitchen',
    type: 1,
    parentId: null,
    children: [
      { id: 'c1', name: 'Fridge', type: 3, parentId: 'r1', children: [] },
      { id: 'c2', name: 'Pantry', type: 3, parentId: 'r1', children: [] },
    ],
  },
];

const itemsPage = {
  items: [],
  page: 1,
  pageSize: 1,
  totalCount: 12,
  totalPages: 12,
};

const emptyMovements = {
  items: [],
  page: 1,
  pageSize: 5,
  totalCount: 0,
  totalPages: 0,
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  mock.onGet('/api/items').reply(200, itemsPage);
  mock.onGet('/api/locations/tree').reply(200, locationTree);
  mock.onGet('/api/kitchen/overview').reply(200, overview);
  mock.onGet('/api/movements').reply(200, emptyMovements);
});

afterEach(() => {
  mock.restore();
});

function newClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderView() {
  return render(
    <QueryClientProvider client={newClient()}>
      <MemoryRouter>
        <DashboardView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('DashboardView', () => {
  it('renders the summary cards with their counts', async () => {
    renderView();

    const itemsCard = (await screen.findByText('Items')).closest('div')!;
    expect(within(itemsCard).getByText('12')).toBeInTheDocument();

    const locationsCard = screen.getByText('Locations').closest('div')!;
    expect(within(locationsCard).getByText('3')).toBeInTheDocument();

    const soonCard = screen.getByText(/Expiring soon/).closest('div')!;
    expect(within(soonCard).getByText('4')).toBeInTheDocument();

    const expiredCard = screen.getByText('Expired').closest('div')!;
    expect(within(expiredCard).getByText('2')).toBeInTheDocument();
  });

  it('points each quick action at its route', async () => {
    renderView();

    expect(await screen.findByRole('link', { name: /Search/ })).toHaveAttribute(
      'href',
      '/search',
    );
    expect(screen.getByRole('link', { name: /Scan/ })).toHaveAttribute(
      'href',
      '/scan',
    );
    expect(screen.getByRole('link', { name: /Add item/ })).toHaveAttribute(
      'href',
      '/items',
    );
    expect(screen.getByRole('link', { name: /Kitchen/ })).toHaveAttribute(
      'href',
      '/kitchen',
    );
  });

  it('navigates to the chosen quick action destination', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={newClient()}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/search" element={<div>Search page</div>} />
            <Route path="/kitchen" element={<div>Kitchen page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.click(await screen.findByRole('link', { name: /Search/ }));

    expect(await screen.findByText('Search page')).toBeInTheDocument();
  });
});
