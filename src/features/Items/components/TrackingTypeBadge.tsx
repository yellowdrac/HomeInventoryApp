import { useTranslation } from 'react-i18next';
import { cn } from '@/core/lib/cn';
import {
  TrackingType,
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

const trackingTypeI18nKey: Record<TrackingTypeValue, string> = {
  [TrackingType.Unique]: 'items.trackingTypeUnique',
  [TrackingType.Quantity]: 'items.trackingTypeQuantity',
};

/** Small pill that labels an item's tracking strategy. */
export function TrackingTypeBadge({ type, className }: TrackingTypeBadgeProps) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        toneByType[type],
        className,
      )}
    >
      {t(trackingTypeI18nKey[type])}
    </span>
  );
}
