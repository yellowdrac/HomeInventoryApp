import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { MovementsView } from '@features/Movements/views/MovementsView';
import { MovementType, type Movement } from '@features/Movements/types';

const movement: Movement = {
  id: 'm1',
  itemId: 'i1',
  itemName: 'Olive oil',
  fromLocationId: 'loc1',
  fromLocationName: 'Pantry',
  toLocationId: 'loc2',
  toLocationName: 'Garage',
  quantity: 2,
  type: MovementType.Moved,
  reason: null,
  performedByUserId: 'u1',
  performedByDisplayName: 'Alex',
  occurredAt: '2026-06-01T10:30:00Z',
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  mock.onGet('/api/locations/tree').reply(200, []);
  mock.onGet('/api/items').reply(200, {
    items: [{ id: 'i1', name: 'Olive oil', trackingType: 1 }],
    page: 1,
    pageSize: 200,
    totalCount: 1,
    totalPages: 1,
  });
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
        <MovementsView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MovementsView', () => {
  it('renders the movement history', async () => {
    mock.onGet('/api/movements').reply(200, {
      items: [movement],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
    });

    renderView();

    expect(await screen.findByText('Olive oil')).toBeInTheDocument();
    expect(screen.getByText('Pantry')).toBeInTheDocument();
    expect(screen.getByText('Garage')).toBeInTheDocument();
  });

  it('re-queries with the type filter when it changes', async () => {
    const requestedTypes: (number | undefined)[] = [];
    mock.onGet('/api/movements').reply((config) => {
      requestedTypes.push(config.params?.type as number | undefined);
      return [
        200,
        { items: [movement], page: 1, pageSize: 20, totalCount: 1, totalPages: 1 },
      ];
    });

    const user = userEvent.setup();
    renderView();

    expect(await screen.findByText('Olive oil')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Type'), String(MovementType.Consumed));

    await waitFor(() => {
      expect(requestedTypes).toContain(MovementType.Consumed);
    });
  });
});
