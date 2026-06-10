import { describe, it, expect } from 'vitest';
import {
  flattenTree,
  flattenVisible,
  findNode,
  findPath,
  collectSubtreeIds,
} from '@features/Locations/lib/locationTree';
import { LocationType, type LocationTreeNode } from '@features/Locations/types';

function node(
  id: string,
  children: LocationTreeNode[] = [],
  parentId: string | null = null,
): LocationTreeNode {
  return { id, name: id, type: LocationType.Room, parentId, children };
}

// house > [kitchen > [drawer], garage]
const tree: LocationTreeNode[] = [
  node('house', [
    node('kitchen', [node('drawer', [], 'kitchen')], 'house'),
    node('garage', [], 'house'),
  ]),
];

describe('flattenTree', () => {
  it('returns every node with its 1-based level', () => {
    const flat = flattenTree(tree);
    expect(flat.map((f) => [f.node.id, f.level])).toEqual([
      ['house', 1],
      ['kitchen', 2],
      ['drawer', 3],
      ['garage', 2],
    ]);
  });
});

describe('flattenVisible', () => {
  it('hides children of collapsed nodes', () => {
    const visible = flattenVisible(tree, new Set(['house']));
    expect(visible.map((f) => f.node.id)).toEqual([
      'house',
      'kitchen',
      'garage',
    ]);
  });

  it('reveals descendants only along expanded ancestors', () => {
    const visible = flattenVisible(tree, new Set(['house', 'kitchen']));
    expect(visible.map((f) => f.node.id)).toEqual([
      'house',
      'kitchen',
      'drawer',
      'garage',
    ]);
  });
});

describe('findNode', () => {
  it('finds a deeply nested node', () => {
    expect(findNode(tree, 'drawer')?.id).toBe('drawer');
  });

  it('returns undefined for an unknown id', () => {
    expect(findNode(tree, 'missing')).toBeUndefined();
  });
});

describe('findPath', () => {
  it('returns the chain from the root down to the node, inclusive', () => {
    expect(findPath(tree, 'drawer').map((n) => n.id)).toEqual([
      'house',
      'kitchen',
      'drawer',
    ]);
  });

  it('returns an empty array for an unknown id', () => {
    expect(findPath(tree, 'missing')).toEqual([]);
  });
});

describe('collectSubtreeIds', () => {
  it('includes the node itself and all descendants', () => {
    const kitchen = findNode(tree, 'kitchen')!;
    expect([...collectSubtreeIds(kitchen)].sort()).toEqual(['drawer', 'kitchen']);
  });
});
