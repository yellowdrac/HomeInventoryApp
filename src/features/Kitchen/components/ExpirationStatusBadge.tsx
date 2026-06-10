import type { ReactNode } from 'react';
import { cn } from '@/core/lib/cn';
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@/core/components/icons';
import {
  ExpirationStatus,
  EXPIRATION_STATUS_LABELS,
  type ExpirationStatus as ExpirationStatusValue,
} from '@features/Kitchen/types';

interface ExpirationStatusBadgeProps {
  status: ExpirationStatusValue;
  className?: string;
}

const iconByStatus: Record<ExpirationStatusValue, ReactNode> = {
  [ExpirationStatus.Expired]: <AlertTriangleIcon className="size-3.5" />,
  [ExpirationStatus.ExpiringSoon]: <ClockIcon className="size-3.5" />,
  [ExpirationStatus.Ok]: <CheckCircleIcon className="size-3.5" />,
};

// Each status pairs a color with an icon and a text label, so meaning is never
// conveyed by color alone.
const toneByStatus: Record<ExpirationStatusValue, string> = {
  [ExpirationStatus.Expired]: 'bg-red-50 text-red-700',
  [ExpirationStatus.ExpiringSoon]: 'bg-amber-50 text-amber-700',
  [ExpirationStatus.Ok]: 'bg-emerald-50 text-emerald-700',
};

/** Pill labelling a lot's expiry status with both an icon and its text label. */
export function ExpirationStatusBadge({
  status,
  className,
}: ExpirationStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        toneByStatus[status],
        className,
      )}
    >
      <span aria-hidden="true">{iconByStatus[status]}</span>
      {EXPIRATION_STATUS_LABELS[status]}
    </span>
  );
}
