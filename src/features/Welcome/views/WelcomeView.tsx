import { useTranslation } from 'react-i18next';
import { Button } from '@/core/components/ui';
import { env } from '@/core/config/env';
import { useHealth } from '@features/Welcome/hooks/useHealth';

/**
 * Landing view for the authenticated area. Renders the live backend connection
 * status (loading / connected + version / clear error). The app shell/header is
 * provided by the protected layout.
 */
export function WelcomeView() {
  const { t } = useTranslation();
  const { data, isPending, isError, error, refetch, isFetching } = useHealth();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('welcome.title')}
        </h1>
        <p className="max-w-prose text-slate-600">
          {t('welcome.description')}
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
          {isFetching ? t('welcome.checking') : t('welcome.recheck')}
        </Button>
        <span className="text-sm text-slate-500">
          API:{' '}
          <code className="font-mono">
            {env.apiUrl || 'same origin (dev proxy)'}
          </code>
        </span>
      </div>
    </section>
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
  const { t } = useTranslation();

  if (isPending) {
    return (
      <StatusCard tone="neutral" title={t('welcome.connecting')}>
        {t('welcome.connectingDescription')}
      </StatusCard>
    );
  }

  if (isError) {
    return (
      <StatusCard tone="error" title={t('welcome.connectionError')}>
        {t('welcome.connectionErrorDescription')}
        <p className="mt-2 font-mono text-xs break-words opacity-80">
          {getErrorMessage(error)}
        </p>
      </StatusCard>
    );
  }

  return (
    <StatusCard tone="success" title={t('welcome.connected')}>
      {t('welcome.backendReachable')}
      {version ? (
        <>
          {' '}
          ({t('welcome.version')} <span className="font-semibold">v{version}</span>)
        </>
      ) : (
        <> ({t('welcome.statusLabel')}: {status ?? 'ok'})</>
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
