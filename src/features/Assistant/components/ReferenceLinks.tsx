import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BoxIcon, MapPinIcon } from '@/core/components/icons';
import { referenceHref } from '@features/Assistant/lib/references';
import { ReferenceType, type ChatReference } from '@features/Assistant/types';

interface ReferenceLinksProps {
  references: ChatReference[];
}

/**
 * Renders the items/locations cited by an answer as chips that link to their
 * existing detail pages, so the user can jump straight to the source.
 */
export function ReferenceLinks({ references }: ReferenceLinksProps) {
  const { t } = useTranslation();
  if (references.length === 0) {
    return null;
  }

  return (
    <ul className="mt-3 flex flex-wrap gap-2" aria-label={t('assistant.referencedIn')}>
      {references.map((reference) => {
        const Icon =
          reference.type === ReferenceType.Location ? MapPinIcon : BoxIcon;
        return (
          <li key={`${reference.type}-${reference.id}`}>
            <Link
              to={referenceHref(reference)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <Icon className="size-3.5 text-slate-400" />
              {reference.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
