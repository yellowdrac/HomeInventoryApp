import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { LocationBySlugView } from '@features/Qr/views/LocationBySlugView';
import type { LocationBySlug } from '@features/Locations/types';

const detail: LocationBySlug = {
  detail: {
    id: 'loc-1',
    name: 'Box 3',
    type: 3,
    parentId: 'closet',
    qrSlug: 'box-3',
    breadcrumb: [
      { id: 'house', name: 'House' },
      { id: 'closet', name: 'Closet' },
      { id: 'loc-1', name: 'Box 3' },
    ],
    children: [],
  },
  contents: [],
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

function renderAt(slug: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/l/${slug}`]}>
        <Routes>
          <Route path="/l/:slug" element={<LocationBySlugView />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LocationBySlugView', () => {
  it('renders the resolved location and its breadcrumb for a valid slug', async () => {
    mock.onGet('/api/locations/by-slug/box-3').reply(200, detail);
    // Contents are loaded by the reused LocationContents component.
    mock.onGet('/api/locations/loc-1/contents').reply(200, []);

    renderAt('box-3');

    expect(
      await screen.findByRole('heading', { name: 'Box 3' }),
    ).toBeInTheDocument();
    const crumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(crumb).toHaveTextContent('House');
    expect(crumb).toHaveTextContent('Closet');
  });

  it('shows a not-found state for an unresolved slug', async () => {
    mock.onGet('/api/locations/by-slug/missing').reply(404);

    renderAt('missing');

    await waitFor(() => {
      expect(screen.getByText(/could not find a location/i)).toBeInTheDocument();
    });
  });
});
