import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { KitchenView } from '@features/Kitchen/views/KitchenView';
import { ExpirationStatus, type ExpiringLot } from '@features/Kitchen/types';

function lot(overrides: Partial<ExpiringLot>): ExpiringLot {
  return {
    stockLotId: 'l',
    itemId: 'i',
    itemName: 'Item',
    locationId: 'loc1',
    locationName: 'Fridge',
    breadcrumb: [
      { id: 'h', name: 'House', type: 0, parentId: null, qrSlug: 'h' },
      { id: 'loc1', name: 'Fridge', type: 3, parentId: 'h', qrSlug: 'fr' },
    ],
    quantity: 1,
    expirationDate: '2026-06-01',
    daysUntilExpiry: 0,
    status: ExpirationStatus.Ok,
    ...overrides,
  };
}

// Returned in FEFO order (earliest expiry first), as the backend sorts them.
const milk = lot({
  stockLotId: 'l1',
  itemId: 'i1',
  itemName: 'Milk',
  expirationDate: '2026-06-01',
  daysUntilExpiry: -3,
  status: ExpirationStatus.Expired,
});
const eggs = lot({
  stockLotId: 'l2',
  itemId: 'i2',
  itemName: 'Eggs',
  expirationDate: '2026-06-09',
  daysUntilExpiry: 2,
  status: ExpirationStatus.ExpiringSoon,
});
const rice = lot({
  stockLotId: 'l3',
  itemId: 'i3',
  itemName: 'Rice',
  locationId: 'loc2',
  locationName: 'Pantry',
  expirationDate: '2026-12-01',
  daysUntilExpiry: 170,
  status: ExpirationStatus.Ok,
});

const overview = {
  expiredCount: 2,
  expiringSoonCount: 3,
  perishableLotCount: 6,
  soonestExpiration: '2026-06-01',
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  mock.onGet('/api/kitchen/overview').reply(200, overview);
  mock.onGet('/api/locations/tree').reply(200, []);
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
        <KitchenView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('KitchenView', () => {
  it('renders the summary counts', async () => {
    // Empty list so the only "Expired"/counts on screen are the summary cards.
    mock.onGet('/api/expirations').reply(200, []);

    renderView();

    const expiredCard = (await screen.findByText('Expired')).closest('div')!;
    expect(within(expiredCard).getByText('2')).toBeInTheDocument();

    const soonCard = screen.getByText(/Expiring soon/).closest('div')!;
    expect(within(soonCard).getByText('3')).toBeInTheDocument();
  });

  it('lists perishable lots earliest-expiry first', async () => {
    mock.onGet('/api/expirations').reply(200, [milk, eggs, rice]);

    renderView();

    const list = await screen.findByRole('list', { name: 'Perishable stock' });
    const rows = within(list).getAllByRole('listitem');
    const names = rows.map(
      (row) => within(row).getAllByRole('link')[0]?.textContent,
    );
    expect(names).toEqual(['Milk', 'Eggs', 'Rice']);
  });

  it('shows the correct status badge for each lot', async () => {
    mock.onGet('/api/expirations').reply(200, [milk, eggs, rice]);

    renderView();

    const list = await screen.findByRole('list', { name: 'Perishable stock' });
    const [milkRow, eggsRow, riceRow] = within(list).getAllByRole('listitem');

    expect(within(milkRow!).getByText('Expired')).toBeInTheDocument();
    expect(within(eggsRow!).getByText('Expiring soon')).toBeInTheDocument();
    expect(within(riceRow!).getByText('Ok')).toBeInTheDocument();
  });

  it('shows an empty message when nothing is expiring', async () => {
    mock.onGet('/api/expirations').reply(200, []);

    renderView();

    expect(
      await screen.findByText('Nothing expiring soon.'),
    ).toBeInTheDocument();
  });

  it('re-queries with the chosen "within days" window', async () => {
    const requestedDays: (number | undefined)[] = [];
    mock.onGet('/api/expirations').reply((config) => {
      requestedDays.push(config.params?.withinDays as number | undefined);
      return [200, [milk, eggs, rice]];
    });

    const user = userEvent.setup();
    renderView();

    await screen.findByRole('list', { name: 'Perishable stock' });
    await user.selectOptions(screen.getByLabelText('Expiring within'), '30');

    await waitFor(() => expect(requestedDays).toContain(30));
  });

  it('re-queries scoped to a location when one is picked', async () => {
    const requestedLocations: (string | undefined)[] = [];
    mock.onGet('/api/expirations').reply((config) => {
      requestedLocations.push(config.params?.locationId as string | undefined);
      return [200, [milk, eggs, rice]];
    });
    mock.onGet('/api/locations/tree').reply(200, [
      { id: 'loc9', name: 'Pantry', type: 1, parentId: null, children: [] },
    ]);

    const user = userEvent.setup();
    renderView();

    await screen.findByRole('list', { name: 'Perishable stock' });
    await user.click(await screen.findByText('Pantry'));

    await waitFor(() => expect(requestedLocations).toContain('loc9'));
  });
});
