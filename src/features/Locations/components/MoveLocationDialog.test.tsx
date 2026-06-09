import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MoveLocationDialog } from '@features/Locations/components/MoveLocationDialog';
import { LocationType, type LocationTreeNode } from '@features/Locations/types';

function node(
  id: string,
  name: string,
  children: LocationTreeNode[] = [],
  parentId: string | null = null,
): LocationTreeNode {
  return { id, name, type: LocationType.Room, parentId, children };
}

// house > [kitchen > [drawer], garage]
const drawer = node('drawer', 'Drawer', [], 'kitchen');
const kitchen = node('kitchen', 'Kitchen', [drawer], 'house');
const garage = node('garage', 'Garage', [], 'house');
const house = node('house', 'House', [kitchen, garage]);
const tree = [house];

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MoveLocationDialog open onClose={() => {}} node={kitchen} nodes={tree} />
    </QueryClientProvider>,
  );
}

describe('MoveLocationDialog', () => {
  it('disables the node itself and its descendants as move targets', () => {
    renderDialog();

    const select = screen.getByLabelText('New parent');

    // The node being moved and its subtree cannot be chosen as the new parent.
    expect(
      within(select).getByRole('option', { name: /Kitchen/ }),
    ).toBeDisabled();
    expect(
      within(select).getByRole('option', { name: /Drawer/ }),
    ).toBeDisabled();

    // Unrelated locations and the root option remain valid targets.
    expect(
      within(select).getByRole('option', { name: /House/ }),
    ).toBeEnabled();
    expect(
      within(select).getByRole('option', { name: /Garage/ }),
    ).toBeEnabled();
    expect(
      within(select).getByRole('option', { name: /Top level/ }),
    ).toBeEnabled();
  });
});
