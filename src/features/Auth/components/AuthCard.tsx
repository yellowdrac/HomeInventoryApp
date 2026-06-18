import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  PackageIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@/core/components/icons';

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  /** Secondary action shown below the form (e.g. link to the other auth view). */
  footer?: ReactNode;
}

/**
 * Reference photo of an organized home interior, layered under the brand
 * gradient so foreground text always meets contrast (and the gradient alone
 * still looks right if the remote image fails to load).
 */
const BRAND_BACKDROP =
  'linear-gradient(160deg, rgba(15,23,42,0.55) 0%, rgba(6,78,59,0.78) 55%, rgba(15,23,42,0.94) 100%), ' +
  "url('https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1400&q=80')";

const FEATURE_ICONS = [PackageIcon, UsersIcon, ShieldCheckIcon] as const;
const FEATURE_KEYS = [
  { titleKey: 'auth.featureTrack', bodyKey: 'auth.featureTrackBody' },
  { titleKey: 'auth.featureShared', bodyKey: 'auth.featureSharedBody' },
  { titleKey: 'auth.featurePrivate', bodyKey: 'auth.featurePrivateBody' },
] as const;

/** Compact logo lockup reused on the brand panel and the mobile header. */
function Logo({ tone }: { tone: 'light' | 'dark' }) {
  const { t } = useTranslation();
  const text = tone === 'light' ? 'text-white' : 'text-slate-900';
  const badge =
    tone === 'light'
      ? 'bg-white/15 text-white ring-1 ring-inset ring-white/25'
      : 'bg-emerald-600 text-white';
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex size-9 items-center justify-center rounded-xl ${badge}`}
      >
        <HomeIcon className="size-5" />
      </span>
      <span className={`text-lg font-bold tracking-tight ${text}`}>
        {t('common.appName')}
      </span>
    </div>
  );
}

/**
 * Split-screen shell for the authentication views. The left brand panel (shown
 * from `lg` up) carries the reference imagery and value props; the right side
 * hosts the form. On mobile it collapses to a single centered column with a
 * compact logo header.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  const { t } = useTranslation();

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{
          backgroundImage: BRAND_BACKDROP,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Logo tone="light" />

        <div className="max-w-md">
          <h2 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-white">
            {t('auth.tagline')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-emerald-50/80">
            {t('auth.taglineBody')}
          </p>

          <ul className="mt-10 space-y-5">
            {FEATURE_KEYS.map(({ titleKey, bodyKey }, index) => {
              const FeatureIcon = FEATURE_ICONS[index];
              return (
                <li key={titleKey} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-inset ring-white/15 backdrop-blur-sm">
                    {FeatureIcon ? <FeatureIcon className="size-5" /> : null}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{t(titleKey)}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-emerald-50/70">
                      {t(bodyKey)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-sm text-emerald-50/60">
          &copy; {new Date().getFullYear()} {t('common.appName')}
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <Logo tone="dark" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-sm text-slate-600">{description}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>

          {footer ? (
            <div className="text-center text-sm text-slate-600">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
