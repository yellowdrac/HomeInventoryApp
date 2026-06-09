import { useEffect, useRef } from 'react';
import { cn } from '@/core/lib/cn';
import {
  ChevronRightIcon,
  MoreVerticalIcon,
  PlusIcon,
  PencilIcon,
  MoveIcon,
  TrashIcon,
} from '@/core/components/icons';
import { DropdownMenu, type DropdownMenuItem } from '@/core/components/ui';
import {
  LOCATION_TYPE_LABELS,
  type LocationTreeNode,
} from '@features/Locations/types';
import { LocationTypeIcon } from '@features/Locations/components/LocationTypeIcon';
import { useLocationTreeContext } from '@features/Locations/components/LocationTreeContext';

interface LocationTreeItemProps {
  node: LocationTreeNode;
  /** 1-based depth, exposed via `aria-level`. */
  level: number;
}

/**
 * A single `role="treeitem"` row. Recurses into a `role="group"` for children
 * when expanded. Focus/selection/keyboard handling is driven by the tree
 * context (roving tabindex); this component only renders and reports DOM refs.
 */
export function LocationTreeItem({ node, level }: LocationTreeItemProps) {
  const {
    isExpanded,
    toggle,
    activeId,
    selectedId,
    onSelect,
    registerItem,
    onItemKeyDown,
    actions,
  } = useLocationTreeContext();

  const itemRef = useRef<HTMLLIElement>(null);
  const hasChildren = node.children.length > 0;
  const expanded = hasChildren && isExpanded(node.id);
  const isActive = activeId === node.id;
  const isSelected = selectedId === node.id;

  useEffect(() => {
    registerItem(node.id, itemRef.current);
    return () => registerItem(node.id, null);
  }, [node.id, registerItem]);

  const menuItems: DropdownMenuItem[] = [
    {
      label: 'Add child',
      icon: <PlusIcon className="size-4" />,
      onSelect: () => actions.onAddChild(node),
    },
    {
      label: 'Edit',
      icon: <PencilIcon className="size-4" />,
      onSelect: () => actions.onEdit(node),
    },
    {
      label: 'Move',
      icon: <MoveIcon className="size-4" />,
      onSelect: () => actions.onMove(node),
    },
    {
      label: 'Delete',
      icon: <TrashIcon className="size-4" />,
      tone: 'danger',
      onSelect: () => actions.onDelete(node),
    },
  ];

  return (
    <li
      ref={itemRef}
      role="treeitem"
      aria-level={level}
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={isSelected}
      tabIndex={isActive ? 0 : -1}
      onKeyDown={(event) => onItemKeyDown(event, node)}
      className="group/item outline-none"
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
          onSelect(node);
        }}
        style={{ paddingLeft: `${(level - 1) * 1.25 + 0.5}rem` }}
        className={cn(
          'flex items-center gap-1.5 rounded-lg py-1.5 pr-1.5 transition-colors',
          'cursor-pointer group-focus-visible/item:ring-2 group-focus-visible/item:ring-emerald-600',
          isSelected ? 'bg-emerald-50' : 'hover:bg-slate-100',
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={(event) => {
              event.stopPropagation();
              toggle(node.id);
            }}
            className="flex size-6 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700"
          >
            <ChevronRightIcon
              className={cn(
                'size-4 transition-transform',
                expanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span className="size-6 shrink-0" aria-hidden="true" />
        )}

        <LocationTypeIcon
          type={node.type}
          className="size-4 shrink-0 text-slate-400"
        />

        <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
          {node.name}
        </span>

        <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 sm:inline">
          {LOCATION_TYPE_LABELS[node.type]}
        </span>

        <span onClick={(event) => event.stopPropagation()}>
          <DropdownMenu
            triggerLabel={`Actions for ${node.name}`}
            trigger={<MoreVerticalIcon className="size-5" />}
            items={menuItems}
          />
        </span>
      </div>

      {expanded ? (
        <ul role="group" className="space-y-0.5">
          {node.children.map((child) => (
            <LocationTreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
