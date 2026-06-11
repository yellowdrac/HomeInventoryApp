import { createContext, useContext } from 'react';
import type { LocationTreeNode } from '@features/Locations/types';

/** Per-node action callbacks surfaced by each tree item's menu. */
export interface LocationTreeActions {
  onAddChild: (node: LocationTreeNode) => void;
  onEdit: (node: LocationTreeNode) => void;
  onMove: (node: LocationTreeNode) => void;
  onShowQr: (node: LocationTreeNode) => void;
  onDelete: (node: LocationTreeNode) => void;
}

export interface LocationTreeContextValue {
  isExpanded: (id: string) => boolean;
  toggle: (id: string) => void;
  activeId: string | null;
  selectedId: string | null;
  /** Whether a node is non-selectable (e.g. the current location of a move). */
  isDisabled: (id: string) => boolean;
  onSelect: (node: LocationTreeNode) => void;
  registerItem: (id: string, el: HTMLLIElement | null) => void;
  onItemKeyDown: (
    event: React.KeyboardEvent<HTMLLIElement>,
    node: LocationTreeNode,
  ) => void;
  /** Per-node menu actions; `undefined` when the tree is a read-only picker. */
  actions: LocationTreeActions | undefined;
}

const LocationTreeContext = createContext<LocationTreeContextValue | null>(null);

export const LocationTreeProvider = LocationTreeContext.Provider;

/** Reads the tree context; throws if used outside `<LocationTree>`. */
export function useLocationTreeContext(): LocationTreeContextValue {
  const value = useContext(LocationTreeContext);
  if (!value) {
    throw new Error(
      'useLocationTreeContext must be used within a LocationTree',
    );
  }
  return value;
}
