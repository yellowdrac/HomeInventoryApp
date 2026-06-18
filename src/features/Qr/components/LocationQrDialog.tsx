import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Dialog } from '@/core/components/ui';
import { PrinterIcon } from '@/core/components/icons';
import { useLocation } from '@features/Locations/hooks/useLocation';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';
import { LocationLabel } from '@features/Qr/components/LocationLabel';

interface LocationQrDialogProps {
  open: boolean;
  onClose: () => void;
  locationId: string;
  locationName: string;
}

/**
 * Shows a location's QR code with its name and breadcrumb, plus a button to
 * print just the label. Resolves the slug/breadcrumb through the existing
 * location detail query so the dialog stays in sync with the rest of the app.
 */
export function LocationQrDialog({
  open,
  onClose,
  locationId,
  locationName,
}: LocationQrDialogProps) {
  const { t } = useTranslation();
  const { data, isPending, isError, error } = useLocation(locationId);
  const breadcrumb = data
    ? data.breadcrumb.map((node) => node.name).join(' / ')
    : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('qr.qrCodeFor', { name: locationName })}
      description={t('qr.qrDescription')}
    >
      {isPending ? (
        <div
          className="h-56 animate-pulse rounded-xl bg-slate-100"
          role="status"
          aria-busy="true"
          aria-label={t('qr.loadingQr')}
        />
      ) : null}

      {isError ? (
        <Alert tone="error">{getLocationErrorMessage(error)}</Alert>
      ) : null}

      {data ? (
        <div className="space-y-4">
          <div data-print-root className="flex justify-center">
            <LocationLabel
              name={data.name}
              breadcrumb={breadcrumb}
              slug={data.qrSlug}
              qrSize={180}
            />
          </div>

          <div className="print-hidden flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => window.print()}>
              <PrinterIcon className="size-4" />
              {t('qr.printLabel')}
            </Button>
            <Link
              to={`/labels?location=${encodeURIComponent(locationId)}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              {t('qr.printBranch')}
            </Link>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
