import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Scanner } from '@yudiel/react-qr-scanner';
import type {
  IDetectedBarcode,
  IScannerError,
} from '@yudiel/react-qr-scanner';
import { Alert } from '@/core/components/ui';
import { ScanIcon } from '@/core/components/icons';
import {
  extractSlugFromScan,
  locationSlugPath,
} from '@features/Qr/lib/locationUrl';

/**
 * Camera QR scanner (`/scan`). Reads a location QR code, extracts its slug and
 * navigates to the location's deep link. Surfaces accessible messages for
 * permission/no-camera/invalid-code situations and always offers a manual
 * fallback to the Locations page.
 */
export function ScanView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [invalidCode, setInvalidCode] = useState(false);
  const [paused, setPaused] = useState(false);

  /** Maps a scanner error to an accessible, user-facing message. */
  function scannerErrorMessage(error: IScannerError): string {
    switch (error.kind) {
      case 'permission-denied':
      case 'security':
        return t('qr.cameraPermissionDenied');
      case 'no-camera':
        return t('qr.noCamera');
      case 'insecure-context':
        return t('qr.insecureContext');
      case 'in-use':
        return t('qr.cameraInUse');
      case 'unsupported':
        return t('qr.cameraUnsupported');
      default:
        return t('qr.cameraError');
    }
  }

  const handleScan = (codes: IDetectedBarcode[]) => {
    const raw = codes[0]?.rawValue;
    if (!raw) {
      return;
    }

    const slug = extractSlugFromScan(raw);
    if (!slug) {
      setInvalidCode(true);
      return;
    }

    setInvalidCode(false);
    setPaused(true);
    navigate(locationSlugPath(slug));
  };

  const handleError = (error: IScannerError) => {
    setCameraError(scannerErrorMessage(error));
  };

  return (
    <section className="mx-auto max-w-md space-y-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <ScanIcon className="size-6 text-emerald-600" />
          {t('qr.scanTitle')}
        </h1>
        <p className="text-sm text-slate-600">
          {t('qr.scanDescription')}
        </p>
      </header>

      {cameraError ? (
        <Alert tone="error">{cameraError}</Alert>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
          <Scanner
            onScan={handleScan}
            onError={handleError}
            paused={paused}
            constraints={{ facingMode: 'environment' }}
            scanDelay={500}
          />
        </div>
      )}

      {/* Polite live region: announces an unrecognized code without stealing focus. */}
      <div aria-live="polite" className="min-h-[1.25rem]">
        {invalidCode ? (
          <Alert tone="warning">
            {t('qr.invalidCode')}
          </Alert>
        ) : null}
      </div>

      <p className="text-center text-sm text-slate-500">
        {t('qr.troubleScanning')}{' '}
        <Link
          to="/locations"
          className="font-semibold text-emerald-700 hover:text-emerald-600"
        >
          {t('qr.browseLocations')}
        </Link>
      </p>
    </section>
  );
}
