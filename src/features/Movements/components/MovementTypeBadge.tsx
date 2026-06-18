import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/core/lib/cn';
import {
  MinusIcon,
  MoveIcon,
  PlusIcon,
  SlidersIcon,
  TrashIcon,
} from '@/core/components/icons';
import {
  MovementType,
  type MovementType as MovementTypeValue,
} from '@features/Movements/types';

interface MovementTypeBadgeProps {
  type: MovementTypeValue;
  className?: string;
}

const iconByType: Record<MovementTypeValue, ReactNode> = {
  [MovementType.Created]: <PlusIcon className="size-3.5" />,
  [MovementType.Moved]: <MoveIcon className="size-3.5" />,
  [MovementType.Consumed]: <MinusIcon className="size-3.5" />,
  [MovementType.Adjusted]: <SlidersIcon className="size-3.5" />,
  [MovementType.Discarded]: <TrashIcon className="size-3.5" />,
};

// Tone pairs both a color and an icon with each type, so the badge never
// relies on color alone to convey meaning (text label + icon are always shown).
const toneByType: Record<MovementTypeValue, string> = {
  [MovementType.Created]: 'bg-emerald-50 text-emerald-700',
  [MovementType.Moved]: 'bg-indigo-50 text-indigo-700',
  [MovementType.Consumed]: 'bg-amber-50 text-amber-700',
  [MovementType.Adjusted]: 'bg-slate-100 text-slate-700',
  [MovementType.Discarded]: 'bg-red-50 text-red-700',
};

const movementTypeI18nKey: Record<MovementTypeValue, string> = {
  [MovementType.Created]: 'movements.typeCreated',
  [MovementType.Moved]: 'movements.typeMoved',
  [MovementType.Consumed]: 'movements.typeConsumed',
  [MovementType.Adjusted]: 'movements.typeAdjusted',
  [MovementType.Discarded]: 'movements.typeDiscarded',
};

/** Pill labelling a movement's type with both an icon and its text label. */
export function MovementTypeBadge({ type, className }: MovementTypeBadgeProps) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        toneByType[type],
        className,
      )}
    >
      <span aria-hidden="true">{iconByType[type]}</span>
      {t(movementTypeI18nKey[type])}
    </span>
  );
}
