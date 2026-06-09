import { useId, useMemo, useState } from 'react';
import { Alert, Button, Dialog, Label, Select } from '@/core/components/ui';
import { useMoveLocation } from '@features/Locations/hooks/useMoveLocation';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';
import {
  flattenTree,
  collectSubtreeIds,
} from '@features/Locations/lib/locationTree';
import type { LocationTreeNode } from '@features/Locations/types';

const ROOT_VALUE = '__root__';

interface MoveLocationDialogProps {
  open: boolean;
  onClose: () => void;
  node: LocationTreeNode;
  nodes: LocationTreeNode[];
}

/**
 * Dialog to move a location under a new parent. The node itself and its
 * descendants are disabled as targets (mirroring the backend rule); the server
 * remains the source of truth.
 */
export function MoveLocationDialog({
  open,
  onClose,
  node,
  nodes,
}: MoveLocationDialogProps) {
  const moveLocation = useMoveLocation();
  const selectId = useId();
  const [target, setTarget] = useState<string>(node.parentId ?? ROOT_VALUE);

  const blockedIds = useMemo(() => collectSubtreeIds(node), [node]);
  const options = useMemo(() => flattenTree(nodes), [nodes]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const newParentId = target === ROOT_VALUE ? null : target;
    moveLocation.mutate(
      { id: node.id, payload: { newParentId } },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Move "${node.name}"`}
      description="Choose where this location should live in the tree."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {moveLocation.isError ? (
          <Alert tone="error">
            {getLocationErrorMessage(moveLocation.error)}
          </Alert>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor={selectId}>New parent</Label>
          <Select
            id={selectId}
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          >
            <option value={ROOT_VALUE}>Top level (no parent)</option>
            {options.map(({ node: option, level }) => (
              <option
                key={option.id}
                value={option.id}
                disabled={blockedIds.has(option.id)}
              >
                {`${' '.repeat((level - 1) * 2)}${option.name}`}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={moveLocation.isPending}>
            {moveLocation.isPending ? 'Moving...' : 'Move'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
