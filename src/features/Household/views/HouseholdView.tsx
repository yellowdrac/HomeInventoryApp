import { Link } from 'react-router';
import { Button, Alert } from '@/core/components/ui';
import { BellIcon } from '@/core/components/icons';
import { getHouseholdErrorMessage } from '@features/Household/lib/householdErrors';
import { useMyHousehold } from '@features/Household/hooks/useMyHousehold';
import { useRegenerateCode } from '@features/Household/hooks/useRegenerateCode';

/**
 * Shows the current household. Owners can regenerate the join code, which
 * invalidates the previous one.
 */
export function HouseholdView() {
  const { data, isPending, isError, error } = useMyHousehold();
  const regenerate = useRegenerateCode();

  if (isPending) {
    return (
      <section className="mx-auto max-w-lg" aria-busy="true">
        <p className="text-slate-600">Loading your household...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-lg">
        <Alert tone="error">{getHouseholdErrorMessage(error)}</Alert>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
        <p className="text-sm text-slate-600">
          {data.isOwner ? 'You own this household.' : 'You are a member.'}
        </p>
      </div>

      <Link
        to="/notifications"
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <BellIcon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-medium text-slate-900">Notification settings</p>
          <p className="text-sm text-slate-500">
            Email and push alerts for expiring items
          </p>
        </div>
      </Link>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-700">Join code</p>
          <p className="font-mono text-2xl tracking-widest text-slate-900">
            {data.joinCode}
          </p>
          <p className="text-xs text-slate-500">
            Share this code so others can join your household.
          </p>
        </div>

        {regenerate.isError ? (
          <Alert tone="error">{getHouseholdErrorMessage(regenerate.error)}</Alert>
        ) : null}

        {data.isOwner ? (
          <Button
            variant="secondary"
            onClick={() => regenerate.mutate()}
            isLoading={regenerate.isPending}
          >
            {regenerate.isPending ? 'Regenerating...' : 'Regenerate code'}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
