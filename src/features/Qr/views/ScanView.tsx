import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
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

/** Maps a scanner error to an accessible, user-facing message. */
function scannerErrorMessage(error: IScannerError): string {
  switch (error.kind) {
    case 'permission-denied':
    case 'security':
      return 'Camera access was blocked. Allow camera permission in your browser and try again.';
    case 'no-camera':
      return 'No camera was found on this device. You can open a location from the Locations page instead.';
    case 'insecure-context':
      return 'The camera is only available over a secure (HTTPS) connection. Open the app over HTTPS to scan.';
    case 'in-use':
      return 'The camera is being used by another app. Close it and try again.';
    case 'unsupported':
      return 'This browser does not support camera scanning. Try a different browser or open a location from the Locations page.';
    default:
      return 'The camera could not be started. Please try again.';
  }
}

/**
 * Camera QR scanner (`/scan`). Reads a location QR code, extracts its slug and
 * navigates to the location's deep link. Surfaces accessible messages for
 * permission/no-camera/invalid-code situations and always offers a manual
 * fallback to the Locations page.
 */
export function ScanView() {
  const navigate = useNavigate();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [invalidCode, setInvalidCode] = useState(false);
  const [paused, setPaused] = useState(false);

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
          Scan a code
        </h1>
        <p className="text-sm text-slate-600">
          Point your camera at a location QR code to jump straight to what is
          stored there.
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
            That code is not a HomeInventory location. Try another code.
          </Alert>
        ) : null}
      </div>

      <p className="text-center text-sm text-slate-500">
        Trouble scanning?{' '}
        <Link
          to="/locations"
          className="font-semibold text-emerald-700 hover:text-emerald-600"
        >
          Browse locations
        </Link>
      </p>
    </section>
  );
}
