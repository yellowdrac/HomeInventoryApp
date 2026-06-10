import { cn } from '@/core/lib/cn';
import {
  TrackingType,
  TRACKING_TYPE_LABELS,
  type TrackingType as TrackingTypeValue,
} from '@features/Items/types';

interface TrackingTypeBadgeProps {
  type: TrackingTypeValue;
  className?: string;
}

const toneByType: Record<TrackingTypeValue, string> = {
  [TrackingType.Unique]: 'bg-indigo-50 text-indigo-700',
  [TrackingType.Quantity]: 'bg-emerald-50 text-emerald-700',
};

/** Small pill that labels an item's tracking strategy. */
export function TrackingTypeBadge({ type, className }: TrackingTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        toneByType[type],
        className,
      )}
    >
      {TRACKING_TYPE_LABELS[type]}
    </span>
  );
}
