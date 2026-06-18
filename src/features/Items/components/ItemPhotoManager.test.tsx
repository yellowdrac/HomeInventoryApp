import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/core/api/client';
import { ItemPhotoManager } from '@features/Items/components/ItemPhotoManager';
import { TrackingType, type Item } from '@features/Items/types';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'i1',
    name: 'Olive oil',
    category: null,
    barcode: null,
    trackingType: TrackingType.Quantity,
    unitId: null,
    unit: null,
    photoUrl: null,
    totalQuantity: 0,
    minimumQuantity: null,
    ...overrides,
  };
}

function fileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

function renderManager(item: Item) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <ItemPhotoManager item={item} />
    </QueryClientProvider>,
  );
  return { ...utils, invalidateSpy };
}

describe('ItemPhotoManager', () => {
  it('shows a placeholder and no remove action when the item has no photo', () => {
    renderManager(makeItem({ photoUrl: null }));

    expect(screen.getByText('Upload a photo')).toBeInTheDocument();
    expect(screen.queryByAltText('Item photo preview')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove photo' }),
    ).not.toBeInTheDocument();
  });

  it('uploads a selected photo and invalidates the item', async () => {
    mock
      .onPost('/api/items/i1/photo')
      .reply(200, { photoUrl: 'https://example.com/new.png' });

    const user = userEvent.setup();
    const { container, invalidateSpy } = renderManager(
      makeItem({ photoUrl: null }),
    );

    await user.upload(
      fileInput(container),
      new File(['x'], 'ok.png', { type: 'image/png' }),
    );

    await user.click(screen.getByRole('button', { name: 'Upload photo' }));

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['items'] }),
    );
    expect(mock.history.post).toHaveLength(1);
  });

  it('removes an existing photo and invalidates the item', async () => {
    mock.onDelete('/api/items/i1/photo').reply(200);

    const user = userEvent.setup();
    const { invalidateSpy } = renderManager(
      makeItem({ photoUrl: 'https://example.com/p.png' }),
    );

    // Current photo is shown with a remove action.
    expect(screen.getByAltText('Item photo preview')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove photo' }));

    // Confirm in the alert dialog.
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Remove photo' }));

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['items'] }),
    );
    expect(mock.history.delete).toHaveLength(1);
  });
});
