import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { DeleteLocationDialog } from '@features/Locations/components/DeleteLocationDialog';
import { LocationType, type LocationTreeNode } from '@features/Locations/types';

const parent: LocationTreeNode = {
  id: 'kitchen',
  name: 'Kitchen',
  type: LocationType.Room,
  parentId: null,
  children: [
    {
      id: 'drawer',
      name: 'Drawer',
      type: LocationType.Container,
      parentId: 'kitchen',
      children: [],
    },
  ],
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DeleteLocationDialog open onClose={() => {}} node={parent} />
    </QueryClientProvider>,
  );
}

describe('DeleteLocationDialog', () => {
  it('surfaces the backend error when the location has children', async () => {
    const user = userEvent.setup();
    mock
      .onDelete('/api/locations/kitchen')
      .reply(409, { title: 'Location.HasChildren' });

    renderDialog();

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(
      await screen.findByText(
        'This location has nested locations. Move or delete them first.',
      ),
    ).toBeInTheDocument();
  });
});
