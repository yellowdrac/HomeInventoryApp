import { Link } from 'react-router';
import {
  PlusIcon,
  ScanIcon,
  SearchIcon,
  UtensilsIcon,
} from '@/core/components/icons';
import { cn } from '@/core/lib/cn';

interface QuickAction {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  tone: string;
}

/** Shortcuts to the most common tasks; each links to an existing route. */
const QUICK_ACTIONS: QuickAction[] = [
  {
    to: '/search',
    label: 'Search',
    description: 'Find an item across the home',
    icon: <SearchIcon className="size-5" />,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    to: '/scan',
    label: 'Scan',
    description: 'Open a location by QR code',
    icon: <ScanIcon className="size-5" />,
    tone: 'bg-sky-50 text-sky-700',
  },
  {
    to: '/items',
    label: 'Add item',
    description: 'Register something new',
    icon: <PlusIcon className="size-5" />,
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    to: '/kitchen',
    label: 'Kitchen',
    description: 'Review perishables',
    icon: <UtensilsIcon className="size-5" />,
    tone: 'bg-amber-50 text-amber-700',
  },
];

/** Grid of shortcut cards that navigate to the app's primary destinations. */
export function QuickActions() {
  return (
    <nav aria-label="Quick actions">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <li key={action.to}>
            <Link
              to={action.to}
              className="flex h-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-xl',
                  action.tone,
                )}
                aria-hidden="true"
              >
                {action.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">
                  {action.label}
                </span>
                <span className="block truncate text-sm text-slate-600">
                  {action.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
