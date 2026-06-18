import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@/core/components/ui';
import {
  ChevronRightIcon,
  MapPinIcon,
  QrCodeIcon,
} from '@/core/components/icons';
import { LocationContents } from '@features/Locations/components/LocationContents';
import { useLocationBySlug } from '@features/Qr/hooks/useLocationBySlug';
import { LocationQrDialog } from '@features/Qr/components/LocationQrDialog';

/**
 * Deep-link target for a scanned (or typed) QR code: `/l/:slug`. Resolves the
 * slug to its location and reuses the existing contents component to show what
 * is stored there. Shows a clear "not found" state when the slug does not
 * resolve within the household.
 */
export function LocationBySlugView() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data, isPending, isError } = useLocationBySlug(slug);
  const [qrOpen, setQrOpen] = useState(false);

  if (isPending) {
    return (
      <div
        className="h-40 animate-pulse rounded-2xl bg-slate-100"
        role="status"
        aria-busy="true"
        aria-label={t('qr.resolvingLocation')}
      />
    );
  }

  if (isError || !data) {
    return (
      <section className="space-y-4">
        <Alert tone="error">
          {t('qr.locationNotFound')}
        </Alert>
        <Link
          to="/locations"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600"
        >
          {t('qr.goToLocations')}
          <ChevronRightIcon className="size-4" />
        </Link>
      </section>
    );
  }

  const { detail } = data;
  const trail = detail.breadcrumb;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        {trail.length > 1 ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
              {trail.map((node, index) => {
                const isLast = index === trail.length - 1;
                return (
                  <li key={node.id} className="flex items-center gap-1">
                    {index > 0 ? (
                      <ChevronRightIcon
                        className="size-4 text-slate-400"
                        aria-hidden="true"
                      />
                    ) : null}
                    {isLast ? (
                      <span aria-current="page" className="text-slate-700">
                        {node.name}
                      </span>
                    ) : (
                      <Link
                        to={`/locations?location=${node.id}`}
                        className="rounded hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                      >
                        {node.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <MapPinIcon className="size-6 text-emerald-600" />
            {detail.name}
          </h1>
          <Button variant="secondary" onClick={() => setQrOpen(true)}>
            <QrCodeIcon className="size-4" />
            {t('locationTree.showQr')}
          </Button>
        </div>
      </header>

      <LocationContents locationId={detail.id} locationName={detail.name} />

      {qrOpen ? (
        <LocationQrDialog
          open
          onClose={() => setQrOpen(false)}
          locationId={detail.id}
          locationName={detail.name}
        />
      ) : null}
    </section>
  );
}
