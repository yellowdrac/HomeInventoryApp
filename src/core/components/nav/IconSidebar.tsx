import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/core/lib/cn';
import { DoorOpenIcon, HomeIcon, UtensilsIcon } from '@/core/components/icons';
import { useAuth } from '@features/Auth/hooks/useAuth';
import { useKitchenOverview } from '@features/Kitchen/hooks/useKitchenOverview';
import { GlobalSearch } from '@features/Search/components/GlobalSearch';
import {
  KITCHEN_NAV_ITEM,
  PRIMARY_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
  type NavItemConfig,
} from './navConfig';

/** Shared tooltip — appears to the right of the icon. */
function Tooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
    >
      {label}
      <span
        aria-hidden="true"
        className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"
      />
    </span>
  );
}

/** Single icon-only nav link with a right-side hover tooltip. */
function SidebarNavItem({ item }: { item: NavItemConfig }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const label = t(item.labelKey);
  return (
    <div className="group relative">
      <NavLink
        to={item.to}
        end={item.end ?? false}
        aria-label={label}
        className={({ isActive }) =>
          cn(
            'flex size-10 items-center justify-center rounded-xl transition-colors',
            isActive
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
          )
        }
      >
        <Icon className="size-[18px]" />
      </NavLink>
      <Tooltip label={label} />
    </div>
  );
}

/** Kitchen nav item — same as SidebarNavItem but with an expiration-alert badge. */
function KitchenSidebarItem() {
  const { t } = useTranslation();
  const { data } = useKitchenOverview();
  const alertCount = (data?.expiredCount ?? 0) + (data?.expiringSoonCount ?? 0);

  return (
    <div className="group relative">
      <NavLink
        to={KITCHEN_NAV_ITEM.to}
        aria-label={
          alertCount > 0
            ? t('nav.kitchenAlertsAriaLabel', { count: alertCount })
            : t('nav.kitchen')
        }
        className={({ isActive }) =>
          cn(
            'relative flex size-10 items-center justify-center rounded-xl transition-colors',
            isActive
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
          )
        }
      >
        <UtensilsIcon className="size-[18px]" />
        {alertCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 flex size-[14px] items-center justify-center rounded-full bg-red-600 text-[9px] font-bold leading-none text-white"
          >
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </NavLink>
      <Tooltip label={t('nav.kitchen')} />
    </div>
  );
}

/**
 * Fixed-height icon-only sidebar for desktop (≥ sm breakpoint). Each item
 * shows a right-side tooltip on hover. The Kitchen item carries an expiration
 * badge. Search and logout live at the bottom.
 */
export function IconSidebar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'es' : 'en';
    void i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  return (
    <aside
      aria-label={t('nav.mainNavigation')}
      className="hidden sm:flex w-14 shrink-0 sticky top-0 h-screen flex-col border-r border-slate-200 bg-white"
    >
      {/* Logo mark */}
      <div className="flex h-14 shrink-0 items-center justify-center border-b border-slate-100">
        <NavLink
          to="/"
          aria-label={t('nav.dashboard')}
          className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <HomeIcon className="size-[18px]" />
        </NavLink>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto p-2 pt-3">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.to} item={item} />
        ))}

        <span aria-hidden="true" className="my-1 w-6 border-t border-slate-100" />

        {SECONDARY_NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.to} item={item} />
        ))}
        <KitchenSidebarItem />
      </nav>

      {/* Bottom: search + lang toggle + logout */}
      <div className="flex shrink-0 flex-col items-center gap-1 border-t border-slate-100 p-2 pb-3">
        <div className="group relative">
          <GlobalSearch compact />
          <Tooltip label={t('nav.searchShortcut')} />
        </div>

        <button
          type="button"
          onClick={toggleLang}
          className="rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label={i18n.language === 'en' ? t('nav.switchToSpanish') : t('nav.switchToEnglish')}
        >
          {i18n.language === 'en' ? 'ES' : 'EN'}
        </button>

        <div className="group relative">
          <button
            type="button"
            onClick={logout}
            aria-label={t('nav.logOutAriaLabel', { email: user?.email ?? '' })}
            className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 transition-colors hover:bg-red-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {userInitial}
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <span className="flex items-center gap-1.5">
              <DoorOpenIcon className="size-3" />
              {t('nav.logOut')}
            </span>
            <span
              aria-hidden="true"
              className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"
            />
          </span>
        </div>
      </div>
    </aside>
  );
}
