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
  /** Fallback English label (used as default if translation key not found). */
  label: string;
  /** i18next key used to look up the translated label. */
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
}

/** Shown in the mobile bottom tab bar and the desktop sidebar. */
export const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  { to: '/', label: 'Home', labelKey: 'nav.home', icon: HomeIcon, end: true },
  { to: '/items', label: 'Items', labelKey: 'nav.items', icon: BoxIcon },
  { to: '/locations', label: 'Locations', labelKey: 'nav.locations', icon: MapPinIcon },
  { to: '/scan', label: 'Scan', labelKey: 'nav.scan', icon: ScanIcon },
  { to: '/assistant', label: 'Assistant', labelKey: 'nav.assistant', icon: SparklesIcon },
];

/** Shown in the desktop sidebar and the mobile "more" menu, but NOT in the bottom tab bar. */
export const SECONDARY_NAV_ITEMS: NavItemConfig[] = [
  { to: '/movements', label: 'History', labelKey: 'nav.history', icon: ClockIcon },
  { to: '/household', label: 'Household', labelKey: 'nav.household', icon: UsersIcon },
];

/** Kitchen is tracked separately because it carries an expiration-alert badge. */
export const KITCHEN_NAV_ITEM: NavItemConfig = {
  to: '/kitchen',
  label: 'Kitchen',
  labelKey: 'nav.kitchen',
  icon: UtensilsIcon,
};
