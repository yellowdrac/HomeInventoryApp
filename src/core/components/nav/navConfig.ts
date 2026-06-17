import type { ComponentType, SVGProps } from 'react';
import {
  BoxIcon,
  ClockIcon,
  HomeIcon,
  MapPinIcon,
  ScanIcon,
  SparklesIcon,
  UtensilsIcon,
  UsersIcon,
} from '@/core/components/icons';

export interface NavItemConfig {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
}

/** Shown in the mobile bottom tab bar and the desktop sidebar. */
export const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/items', label: 'Items', icon: BoxIcon },
  { to: '/locations', label: 'Locations', icon: MapPinIcon },
  { to: '/scan', label: 'Scan', icon: ScanIcon },
  { to: '/assistant', label: 'Assistant', icon: SparklesIcon },
];

/** Shown in the desktop sidebar and the mobile "more" menu, but NOT in the bottom tab bar. */
export const SECONDARY_NAV_ITEMS: NavItemConfig[] = [
  { to: '/movements', label: 'History', icon: ClockIcon },
  { to: '/household', label: 'Household', icon: UsersIcon },
];

/** Kitchen is tracked separately because it carries an expiration-alert badge. */
export const KITCHEN_NAV_ITEM: NavItemConfig = {
  to: '/kitchen',
  label: 'Kitchen',
  icon: UtensilsIcon,
};
