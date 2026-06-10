import { useCallback, useMemo, useRef, useState } from 'react';
import type { LocationTreeNode } from '@features/Locations/types';
import { flattenVisible } from '@features/Locations/lib/locationTree';
import {
  LocationTreeProvider,
  type LocationTreeActions,
} from '@features/Locations/components/LocationTreeContext';
import { LocationTreeItem } from '@features/Locations/components/LocationTreeItem';

interface LocationTreeProps {
  nodes: LocationTreeNode[];
  /** Per-node menu actions; omit to render a read-only selection tree. */
  actions?: LocationTreeActions;
  selectedId: string | null;
  onSelect: (node: LocationTreeNode) => void;
  /** Ids that cannot be selected (rendered as disabled). */
  disabledIds?: Set<string> | undefined;
  /** Ids to expand on mount in addition to the roots (e.g. a deep-linked path). */
  defaultExpandedIds?: Iterable<string> | undefined;
  /** Accessible label for the tree container. */
  ariaLabel?: string;
}

/**
 * Accessible location tree following the WAI-ARIA tree pattern: a `role="tree"`
 * container of `role="treeitem"` nodes (with `role="group"` subtrees), roving
 * tabindex, and arrow-key navigation (Up/Down move, Right expand/descend, Left
 * collapse/ascend, Home/End jump, Enter/Space select).
 */
export function LocationTree({
  nodes,
  actions,
  selectedId,
  onSelect,
  disabledIds,
  defaultExpandedIds,
  ariaLabel = 'Locations',
}: LocationTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set(
      nodes.filter((n) => n.children.length > 0).map((n) => n.id),
    );
    if (defaultExpandedIds) {
      for (const id of defaultExpandedIds) {
        initial.add(id);
      }
    }
    return initial;
  });
  const [activeId, setActiveId] = useState<string | null>(
    () => selectedId ?? nodes[0]?.id ?? null,
  );
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds],
  );

  const isDisabled = useCallback(
    (id: string) => disabledIds?.has(id) ?? false,
    [disabledIds],
  );

  const setExpanded = useCallback((id: string, value: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const registerItem = useCallback((id: string, el: HTMLLIElement | null) => {
    if (el) {
      itemRefs.current.set(id, el);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  const focusItem = useCallback((id: string) => {
    setActiveId(id);
    itemRefs.current.get(id)?.focus();
  }, []);

  const onItemKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLLIElement>, node: LocationTreeNode) => {
      const visible = flattenVisible(nodes, expandedIds);
      const index = visible.findIndex((v) => v.node.id === node.id);
      const hasChildren = node.children.length > 0;
      const expanded = hasChildren && expandedIds.has(node.id);

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const next = visible[index + 1];
          if (next) {
            focusItem(next.node.id);
          }
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prev = visible[index - 1];
          if (prev) {
            focusItem(prev.node.id);
          }
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          if (hasChildren && !expanded) {
            setExpanded(node.id, true);
          } else if (expanded) {
            const next = visible[index + 1];
            if (next) {
              focusItem(next.node.id);
            }
          }
          break;
        }
        case 'ArrowLeft': {
          event.preventDefault();
          if (expanded) {
            setExpanded(node.id, false);
          } else if (node.parentId) {
            focusItem(node.parentId);
          }
          break;
        }
        case 'Home': {
          event.preventDefault();
          const first = visible[0];
          if (first) {
            focusItem(first.node.id);
          }
          break;
        }
        case 'End': {
          event.preventDefault();
          const last = visible[visible.length - 1];
          if (last) {
            focusItem(last.node.id);
          }
          break;
        }
        case 'Enter':
        case ' ': {
          if (
            (event.target as HTMLElement).getAttribute('role') === 'treeitem' &&
            !isDisabled(node.id)
          ) {
            event.preventDefault();
            onSelect(node);
          }
          break;
        }
        default:
          break;
      }
    },
    [nodes, expandedIds, focusItem, setExpanded, onSelect, isDisabled],
  );

  const contextValue = useMemo(
    () => ({
      isExpanded,
      toggle,
      activeId,
      selectedId,
      isDisabled,
      onSelect,
      registerItem,
      onItemKeyDown,
      actions,
    }),
    [
      isExpanded,
      toggle,
      activeId,
      selectedId,
      isDisabled,
      onSelect,
      registerItem,
      onItemKeyDown,
      actions,
    ],
  );

  return (
    <LocationTreeProvider value={contextValue}>
      <ul role="tree" aria-label={ariaLabel} className="space-y-0.5">
        {nodes.map((node) => (
          <LocationTreeItem key={node.id} node={node} level={1} />
        ))}
      </ul>
    </LocationTreeProvider>
  );
}
