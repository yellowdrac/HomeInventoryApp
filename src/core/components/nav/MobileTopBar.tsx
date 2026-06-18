import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DoorOpenIcon, MoreVerticalIcon } from '@/core/components/icons';
import { DropdownMenu } from '@/core/components/ui/DropdownMenu';
import { useAuth } from '@features/Auth/hooks/useAuth';
import { useKitchenOverview } from '@features/Kitchen/hooks/useKitchenOverview';
import { GlobalSearch } from '@features/Search/components/GlobalSearch';
import { KITCHEN_NAV_ITEM, SECONDARY_NAV_ITEMS } from './navConfig';

/**
 * Sticky top bar for mobile (hidden on ≥ sm). Shows the app name, a compact
 * search trigger, and a "more" menu for the secondary nav items (History,
 * Household, Kitchen) and logout.
 */
export function MobileTopBar() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const { data: kitchenData } = useKitchenOverview();
  const kitchenAlerts =
    (kitchenData?.expiredCount ?? 0) + (kitchenData?.expiringSoonCount ?? 0);
  const navigate = useNavigate();

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'es' : 'en';
    void i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  const moreItems = [
    ...SECONDARY_NAV_ITEMS.map((item) => ({
      label: t(item.labelKey),
      icon: <item.icon className="size-4" />,
      onSelect: () => { navigate(item.to); },
    })),
    {
      label:
        kitchenAlerts > 0
          ? t('nav.kitchenWithAlerts', { count: kitchenAlerts })
          : t('nav.kitchen'),
      icon: <KITCHEN_NAV_ITEM.icon className="size-4" />,
      onSelect: () => { navigate(KITCHEN_NAV_ITEM.to); },
    },
    {
      label: t('nav.logOut'),
      icon: <DoorOpenIcon className="size-4" />,
      onSelect: logout,
      tone: 'danger' as const,
    },
  ];

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:hidden">
      <span className="text-[15px] font-semibold tracking-tight text-slate-900">
        {t('common.appName')}
      </span>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={toggleLang}
          className="rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label={i18n.language === 'en' ? t('nav.switchToSpanish') : t('nav.switchToEnglish')}
        >
          {i18n.language === 'en' ? 'ES' : 'EN'}
        </button>
        <GlobalSearch compact />
        <DropdownMenu
          triggerLabel={t('nav.moreOptions')}
          trigger={<MoreVerticalIcon className="size-4" />}
          items={moreItems}
        />
      </div>
    </header>
  );
}
