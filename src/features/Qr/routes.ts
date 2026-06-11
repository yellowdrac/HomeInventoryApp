import { createElement, lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { PrintLabelsView } from '@features/Qr/views/PrintLabelsView';
import { LocationBySlugView } from '@features/Qr/views/LocationBySlugView';

// The camera scanner pulls in the (heavy) barcode-detector ponyfill, which is
// only needed on `/scan`. Lazy-load it so it stays out of the initial bundle.
const ScanView = lazy(() =>
  import('@features/Qr/views/ScanView').then((module) => ({
    default: module.ScanView,
  })),
);

const ScanFallback = () =>
  createElement(
    'div',
    {
      className: 'h-64 animate-pulse rounded-2xl bg-slate-100',
      role: 'status',
      'aria-busy': true,
      'aria-label': 'Loading scanner',
    },
    null,
  );

/**
 * QR feature routes (require an existing household, aggregated under the
 * household guard in the central router):
 *  - `/scan`      camera scanner (lazy-loaded)
 *  - `/labels`    printable sheet of QR labels
 *  - `/l/:slug`   deep-link target a QR code resolves to
 */
export const qrRoutes: RouteObject[] = [
  {
    path: '/scan',
    element: createElement(
      Suspense,
      { fallback: createElement(ScanFallback) },
      createElement(ScanView),
    ),
  },
  { path: '/labels', element: createElement(PrintLabelsView) },
  { path: '/l/:slug', element: createElement(LocationBySlugView) },
];
