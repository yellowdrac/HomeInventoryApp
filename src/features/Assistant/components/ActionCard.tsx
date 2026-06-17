import { useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangleIcon,
  BoxIcon,
  CheckCircleIcon,
  MapPinIcon,
  XIcon,
} from '@/core/components/icons';
import { Button } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';
import { referenceHref } from '@features/Assistant/lib/references';
import { useExecuteAssistantAction } from '@features/Assistant/hooks/useExecuteAssistantAction';
import {
  ReferenceType,
  type ProposedAction,
  type ExecutedEntityRef,
} from '@features/Assistant/types';

interface ActionCardProps {
  actions: ProposedAction[];
}

type CardState = 'pending' | 'loading' | 'success' | 'error' | 'cancelled';

/**
 * Shows a batch of proposed AI actions (possibly multi-step) as a confirmation card.
 * Confirm executes all actions at once; Cancel discards without executing anything.
 */
export function ActionCard({ actions }: ActionCardProps) {
  const [state, setState] = useState<CardState>('pending');
  const [createdEntities, setCreatedEntities] = useState<ExecutedEntityRef[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const execute = useExecuteAssistantAction();

  function handleConfirm() {
    setState('loading');
    execute.mutate(
      { actions },
      {
        onSuccess: (result) => {
          setCreatedEntities(result.createdEntities);
          setState('success');
        },
        onError: (err) => {
          const msg =
            err instanceof Error
              ? err.message
              : 'The action could not be executed. Please try again.';
          setErrorMessage(msg);
          setState('error');
        },
      },
    );
  }

  function handleCancel() {
    setState('cancelled');
  }

  if (state === 'cancelled') {
    return null;
  }

  const hasDuplicateWarning = actions.some((a) => a.hasDuplicateWarning);

  return (
    <div
      role="region"
      aria-label="Proposed action — confirmation required"
      className={cn(
        'mt-3 rounded-xl border p-4',
        state === 'success'
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-amber-200 bg-amber-50',
      )}
    >
      {/* Steps */}
      <ul className="mb-3 space-y-1.5" aria-label="Steps to be executed">
        {actions.map((action, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-semibold text-amber-800"
            >
              {i + 1}
            </span>
            <span>
              {action.summary}
              {action.missingEntities.length > 0 && (
                <span className="ml-1 text-slate-500">
                  (will also create:{' '}
                  {action.missingEntities.map((e) => e.name).join(', ')})
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* Duplicate warning */}
      {hasDuplicateWarning && state === 'pending' && (
        <div
          role="alert"
          className="mb-3 flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-800"
        >
          <AlertTriangleIcon className="size-4 shrink-0" aria-hidden="true" />
          <span>
            An item or location with this name already exists. Confirm only if you
            want to create a separate one.
          </span>
        </div>
      )}

      {/* Error */}
      {state === 'error' && errorMessage && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {/* Success: links to created entities */}
      {state === 'success' && (
        <div className="mb-3">
          <p className="mb-2 text-sm font-medium text-emerald-700">Created:</p>
          <ul className="flex flex-wrap gap-2" aria-label="Created entities">
            {createdEntities.map((entity) => {
              const Icon =
                entity.kind === ReferenceType.Location ? MapPinIcon : BoxIcon;
              const href = referenceHref({
                type: entity.kind,
                id: entity.id,
                name: entity.name,
              });
              return (
                <li key={entity.id}>
                  <Link
                    to={href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {entity.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Confirm / Cancel buttons */}
      {(state === 'pending' || state === 'error') && (
        <div className="flex gap-2">
          <Button
            onClick={handleConfirm}
            isLoading={execute.isPending}
            aria-label="Confirm proposed action"
            className="px-3 py-1.5 text-xs"
          >
            <CheckCircleIcon className="size-3.5" aria-hidden="true" />
            Confirm
          </Button>
          <Button
            variant="ghost"
            onClick={handleCancel}
            aria-label="Cancel proposed action"
            className="px-3 py-1.5 text-xs"
          >
            <XIcon className="size-3.5" aria-hidden="true" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
