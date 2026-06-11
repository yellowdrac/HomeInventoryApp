import { cn } from '@/core/lib/cn';
import { LocationQr } from '@features/Qr/components/LocationQr';

interface LocationLabelProps {
  name: string;
  /** Breadcrumb path (root → location), already joined with ` / `. */
  breadcrumb: string;
  slug: string;
  qrSize?: number;
  className?: string;
}

/**
 * A single printable QR label: the code plus the location's name and breadcrumb
 * path. Reused both on the printable labels sheet and inside the QR dialog so
 * what the user previews is exactly what prints.
 */
export function LocationLabel({
  name,
  breadcrumb,
  slug,
  qrSize = 140,
  className,
}: LocationLabelProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center',
        className,
      )}
    >
      <LocationQr slug={slug} name={name} size={qrSize} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        {breadcrumb ? (
          <p className="mt-0.5 break-words text-xs text-slate-500">
            {breadcrumb}
          </p>
        ) : null}
      </div>
    </div>
  );
}
