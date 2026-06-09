import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationTree } from '@features/Locations/components/LocationTree';
import { LocationType, type LocationTreeNode } from '@features/Locations/types';

const noopActions = {
  onAddChild: () => {},
  onEdit: () => {},
  onMove: () => {},
  onDelete: () => {},
};

function node(
  id: string,
  name: string,
  children: LocationTreeNode[] = [],
  parentId: string | null = null,
): LocationTreeNode {
  return { id, name, type: LocationType.Room, parentId, children };
}

// house > [kitchen]
const tree: LocationTreeNode[] = [
  node('house', 'House', [node('kitchen', 'Kitchen', [], 'house')]),
];

function renderTree() {
  return render(
    <LocationTree
      nodes={tree}
      selectedId={null}
      onSelect={() => {}}
      actions={noopActions}
    />,
  );
}

describe('LocationTree', () => {
  function itemAtLevel(level: string): HTMLElement {
    const item = screen
      .getAllByRole('treeitem')
      .find((el) => el.getAttribute('aria-level') === level);
    if (!item) {
      throw new Error(`No treeitem at aria-level ${level}`);
    }
    return item;
  }

  it('renders an accessible tree with nested treeitems and aria-level', () => {
    renderTree();

    expect(screen.getByRole('tree', { name: 'Locations' })).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();

    const house = itemAtLevel('1');
    expect(house).toHaveAttribute('aria-expanded', 'true');

    const kitchen = itemAtLevel('2');
    expect(within(kitchen).getByText('Kitchen')).toBeInTheDocument();
  });

  it('collapses and expands a node when its disclosure is toggled', async () => {
    const user = userEvent.setup();
    renderTree();

    // Roots start expanded, so the nested node is visible.
    expect(screen.getByText('Kitchen')).toBeInTheDocument();

    const house = itemAtLevel('1');
    await user.click(within(house).getByRole('button', { name: 'Collapse' }));

    expect(screen.queryByText('Kitchen')).not.toBeInTheDocument();
    expect(house).toHaveAttribute('aria-expanded', 'false');

    await user.click(within(house).getByRole('button', { name: 'Expand' }));
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });
});
