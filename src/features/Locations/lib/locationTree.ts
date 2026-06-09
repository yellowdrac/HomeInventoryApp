import type { LocationTreeNode } from '@features/Locations/types';

/** A tree node paired with its 1-based depth, in display order. */
export interface FlatLocationNode {
  node: LocationTreeNode;
  level: number;
}

/**
 * Flattens the tree into display order, including every node regardless of
 * expansion. Used to build the "move" target selector.
 */
export function flattenTree(
  nodes: LocationTreeNode[],
  level = 1,
): FlatLocationNode[] {
  return nodes.flatMap((node) => [
    { node, level },
    ...flattenTree(node.children, level + 1),
  ]);
}

/**
 * Flattens only the currently visible nodes: a node's children are included
 * only when the node's id is in `expandedIds`. Used for keyboard navigation.
 */
export function flattenVisible(
  nodes: LocationTreeNode[],
  expandedIds: ReadonlySet<string>,
  level = 1,
): FlatLocationNode[] {
  return nodes.flatMap((node) => {
    const self: FlatLocationNode = { node, level };
    if (node.children.length > 0 && expandedIds.has(node.id)) {
      return [self, ...flattenVisible(node.children, expandedIds, level + 1)];
    }
    return [self];
  });
}

/** Finds a node by id anywhere in the tree. */
export function findNode(
  nodes: LocationTreeNode[],
  id: string,
): LocationTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = findNode(node.children, id);
    if (found) {
      return found;
    }
  }
  return undefined;
}

/**
 * Collects the ids of a node and all of its descendants. These are the invalid
 * "move" targets: a location cannot become a child of itself or its subtree.
 */
export function collectSubtreeIds(node: LocationTreeNode): Set<string> {
  const ids = new Set<string>([node.id]);
  for (const child of node.children) {
    for (const id of collectSubtreeIds(child)) {
      ids.add(id);
    }
  }
  return ids;
}
