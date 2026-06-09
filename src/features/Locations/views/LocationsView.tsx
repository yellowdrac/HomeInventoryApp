import { useState } from 'react';
import { Alert, Button } from '@/core/components/ui';
import { PlusIcon } from '@/core/components/icons';
import type { LocationTreeNode } from '@features/Locations/types';
import { useLocationTree } from '@features/Locations/hooks/useLocationTree';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';
import { LocationTree } from '@features/Locations/components/LocationTree';
import { LocationsEmptyState } from '@features/Locations/components/LocationsEmptyState';
import { CreateLocationDialog } from '@features/Locations/components/CreateLocationDialog';
import { EditLocationDialog } from '@features/Locations/components/EditLocationDialog';
import { MoveLocationDialog } from '@features/Locations/components/MoveLocationDialog';
import { DeleteLocationDialog } from '@features/Locations/components/DeleteLocationDialog';

type DialogState =
  | { kind: 'create'; parent: LocationTreeNode | null }
  | { kind: 'edit'; node: LocationTreeNode }
  | { kind: 'move'; node: LocationTreeNode }
  | { kind: 'delete'; node: LocationTreeNode }
  | null;

/**
 * Locations page: shows the household's location tree and drives the
 * create/edit/move/delete dialogs. The app shell/header comes from the
 * protected layout.
 */
export function LocationsView() {
  const { data, isPending, isError, error } = useLocationTree();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const closeDialog = () => setDialog(null);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Locations
          </h1>
          <p className="text-sm text-slate-600">
            Organize where things live in your home.
          </p>
        </div>
        {data && data.length > 0 ? (
          <Button onClick={() => setDialog({ kind: 'create', parent: null })}>
            <PlusIcon className="size-4" />
            Add location
          </Button>
        ) : null}
      </header>

      {isPending ? <LocationsSkeleton /> : null}

      {isError ? (
        <Alert tone="error">{getLocationErrorMessage(error)}</Alert>
      ) : null}

      {data && data.length === 0 ? (
        <LocationsEmptyState
          onCreateRoot={() => setDialog({ kind: 'create', parent: null })}
        />
      ) : null}

      {data && data.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:p-3">
          <LocationTree
            nodes={data}
            selectedId={selectedId}
            onSelect={(node) => setSelectedId(node.id)}
            actions={{
              onAddChild: (node) => setDialog({ kind: 'create', parent: node }),
              onEdit: (node) => setDialog({ kind: 'edit', node }),
              onMove: (node) => setDialog({ kind: 'move', node }),
              onDelete: (node) => setDialog({ kind: 'delete', node }),
            }}
          />
        </div>
      ) : null}

      {dialog?.kind === 'create' ? (
        <CreateLocationDialog
          open
          onClose={closeDialog}
          parent={dialog.parent}
        />
      ) : null}

      {dialog?.kind === 'edit' ? (
        <EditLocationDialog open onClose={closeDialog} node={dialog.node} />
      ) : null}

      {dialog?.kind === 'move' && data ? (
        <MoveLocationDialog
          open
          onClose={closeDialog}
          node={dialog.node}
          nodes={data}
        />
      ) : null}

      {dialog?.kind === 'delete' ? (
        <DeleteLocationDialog open onClose={closeDialog} node={dialog.node} />
      ) : null}
    </section>
  );
}

/** Accessible loading placeholder for the tree. */
function LocationsSkeleton() {
  return (
    <div
      className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      role="status"
      aria-busy="true"
      aria-label="Loading locations"
    >
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          className="h-9 animate-pulse rounded-lg bg-slate-100"
          style={{ marginLeft: `${row * 1.25}rem` }}
        />
      ))}
    </div>
  );
}
