import { FullLayout } from '@/core/layouts/FullLayout';
import { Button } from '@/core/components/ui';
import { env } from '@/core/config/env';
import { useHealth } from '@features/Welcome/hooks/useHealth';

/**
 * Phase 0 landing view. Renders the app shell and the live backend connection
 * status (loading / connected + version / clear error).
 */
export function WelcomeView() {
  const { data, isPending, isError, error, refetch, isFetching } = useHealth();

  return (
    <FullLayout>
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome to HomeInventory
          </h1>
          <p className="max-w-prose text-slate-600">
            Shared household inventory. This is the Phase&nbsp;0 scaffold: the
            app shell and a live check against the backend health endpoint.
          </p>
        </div>

        <ConnectionStatus
          isPending={isPending}
          isError={isError}
          error={error}
          version={data?.version}
          status={data?.status}
        />

        <div className="flex items-center gap-3">
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Checking…' : 'Re-check connection'}
          </Button>
          <span className="text-sm text-slate-500">
            API: <code className="font-mono">{env.apiUrl}</code>
          </span>
        </div>
      </section>
    </FullLayout>
  );
}

interface ConnectionStatusProps {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  version: string | undefined;
  status: string | undefined;
}

function ConnectionStatus({
  isPending,
  isError,
  error,
  version,
  status,
}: ConnectionStatusProps) {
  if (isPending) {
    return (
      <StatusCard tone="neutral" title="Connecting…">
        Reaching the backend health endpoint.
      </StatusCard>
    );
  }

  if (isError) {
    return (
      <StatusCard tone="error" title="Connection error">
        Could not reach the backend. Make sure it is running and that{' '}
        <code className="font-mono">VITE_API_URL</code> is correct.
        <p className="mt-2 font-mono text-xs break-words opacity-80">
          {getErrorMessage(error)}
        </p>
      </StatusCard>
    );
  }

  return (
    <StatusCard tone="success" title="Connected">
      Backend is reachable
      {version ? (
        <>
          {' '}
          (version <span className="font-semibold">v{version}</span>)
        </>
      ) : (
        <> (status: {status ?? 'ok'})</>
      )}
      .
    </StatusCard>
  );
}

type StatusTone = 'neutral' | 'success' | 'error';

const toneClasses: Record<StatusTone, string> = {
  neutral: 'border-slate-200 bg-white text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

function StatusCard({
  tone,
  title,
  children,
}: {
  tone: StatusTone;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <p className="font-semibold">{title}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}
