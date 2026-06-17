import { useNavigate } from 'react-router';
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
  const { logout } = useAuth();
  const { data: kitchenData } = useKitchenOverview();
  const kitchenAlerts =
    (kitchenData?.expiredCount ?? 0) + (kitchenData?.expiringSoonCount ?? 0);
  const navigate = useNavigate();

  const moreItems = [
    ...SECONDARY_NAV_ITEMS.map((item) => ({
      label: item.label,
      icon: <item.icon className="size-4" />,
      onSelect: () => { navigate(item.to); },
    })),
    {
      label:
        kitchenAlerts > 0
          ? `Kitchen (${kitchenAlerts} alerts)`
          : KITCHEN_NAV_ITEM.label,
      icon: <KITCHEN_NAV_ITEM.icon className="size-4" />,
      onSelect: () => { navigate(KITCHEN_NAV_ITEM.to); },
    },
    {
      label: 'Log out',
      icon: <DoorOpenIcon className="size-4" />,
      onSelect: logout,
      tone: 'danger' as const,
    },
  ];

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:hidden">
      <span className="text-[15px] font-semibold tracking-tight text-slate-900">
        HomeInventory
      </span>

      <div className="flex items-center gap-0.5">
        <GlobalSearch compact />
        <DropdownMenu
          triggerLabel="More navigation options"
          trigger={<MoreVerticalIcon className="size-4" />}
          items={moreItems}
        />
      </div>
    </header>
  );
}
