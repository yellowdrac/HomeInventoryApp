import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@/core/components/ui';
import { PrinterIcon } from '@/core/components/icons';
import { useLocationTree } from '@features/Locations/hooks/useLocationTree';
import { findNode, findPath } from '@features/Locations/lib/locationTree';
import { getLocationErrorMessage } from '@features/Locations/lib/locationErrors';
import { LocationTree } from '@features/Locations/components/LocationTree';
import type { LocationTreeNode } from '@features/Locations/types';
import { usePrintableLocations } from '@features/Qr/hooks/usePrintableLocations';
import { LocationLabel } from '@features/Qr/components/LocationLabel';

/**
 * Printable sheet of QR labels (`/labels`). Optionally scopes to a subtree
 * (reusing the location tree) and lets the user exclude individual labels
 * before printing. The print stylesheet hides everything except the grid.
 */
export function PrintLabelsView() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialScope = searchParams.get('location');

  const tree = useLocationTree();
  const [scopeId, setScopeId] = useState<string | null>(initialScope);
  const { data, isPending, isError, error } = usePrintableLocations(scopeId);

  // Labels the user has unchecked; reset whenever the resolved set changes.
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  useEffect(() => {
    setExcluded(new Set());
  }, [data]);

  const scopeName =
    scopeId && tree.data
      ? (findNode(tree.data, scopeId)?.name ?? null)
      : null;

  const expandedScopePath = useMemo(() => {
    if (!scopeId || !tree.data) {
      return undefined;
    }
    return findPath(tree.data, scopeId).map((node) => node.id);
  }, [scopeId, tree.data]);

  const includedCount =
    data?.filter((loc) => !excluded.has(loc.id)).length ?? 0;

  const toggle = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectScope = (node: LocationTreeNode) => setScopeId(node.id);

  return (
    <section className="space-y-6">
      <header className="print-hidden flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('qr.printLabels')}
          </h1>
          <p className="text-sm text-slate-600">
            {scopeName
              ? t('qr.labelsForScope', { name: scopeName })
              : t('qr.labelsForAll')}
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          disabled={includedCount === 0}
        >
          <PrinterIcon className="size-4" />
          {includedCount > 0 ? t('qr.printCount', { count: includedCount }) : t('qr.print')}
        </Button>
      </header>

      <div className="print-hidden grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">{t('qr.scope')}</h2>
            {scopeId ? (
              <button
                type="button"
                onClick={() => setScopeId(null)}
                className="rounded text-xs font-medium text-emerald-700 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                {t('qr.allLocations')}
              </button>
            ) : (
              <span className="text-xs text-slate-400">{t('qr.allLocations')}</span>
            )}
          </div>
          {tree.data && tree.data.length > 0 ? (
            <LocationTree
              nodes={tree.data}
              selectedId={scopeId}
              onSelect={handleSelectScope}
              defaultExpandedIds={expandedScopePath}
              ariaLabel={t('locationTree.chooseLocation')}
            />
          ) : (
            <p className="px-1 py-4 text-sm text-slate-500">
              {t('locationsEmpty.title')}
            </p>
          )}
        </div>

        <div className="lg:col-span-3">
          <p className="text-sm text-slate-600">
            {t('qr.uncheckHint')}
          </p>
        </div>
      </div>

      {isPending ? (
        <div
          className="h-40 animate-pulse rounded-2xl bg-slate-100"
          role="status"
          aria-busy="true"
          aria-label={t('qr.loadingLabels')}
        />
      ) : null}

      {isError ? (
        <Alert tone="error">{getLocationErrorMessage(error)}</Alert>
      ) : null}

      {data && data.length === 0 ? (
        <Alert tone="info">{t('qr.noLocationsToPrint')}</Alert>
      ) : null}

      {data && data.length > 0 ? (
        <div
          data-print-root
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {data.map((loc) => {
            const isExcluded = excluded.has(loc.id);
            return (
              <div
                key={loc.id}
                className={isExcluded ? 'print-hidden opacity-40' : ''}
              >
                <label className="print-hidden mb-1 flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={!isExcluded}
                    onChange={() => toggle(loc.id)}
                    className="size-4 rounded border-slate-300 text-emerald-600 focus-visible:ring-emerald-600"
                  />
                  {t('qr.include')}
                </label>
                <LocationLabel
                  name={loc.name}
                  breadcrumb={loc.breadcrumb}
                  slug={loc.qrSlug}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
