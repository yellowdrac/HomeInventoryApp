# HomeInventory — Frontend

A responsive, feature-based React web client for tracking what you own, where
it lives, and how much stock is left. The app is organised as a stack of
**phases**, each adding a self-contained slice of functionality on top of the
previous one (see [Phases](#phases-whats-built)).

## Stack

- **React 19** + **Vite** + **TypeScript** (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/vite` (mobile-first, no PWA)
- **TanStack Query** for server state (with devtools)
- **react-router v7** with `useRoutes` and per-feature route tables
- **zustand** for the auth session store
- **react-hook-form** + **zod** for typed, validated forms
- **axios** typed HTTP client (JWT bearer interceptor, same-origin dev proxy)
- **qrcode.react** (label generation) + **@yudiel/react-qr-scanner** (camera scan)
- **Vitest** + **Testing Library** for unit/component tests
- **ESLint + Prettier**

UI primitives, icons, and accessible widgets are **hand-rolled** in-house — the
project intentionally avoids component libraries (no shadcn/Radix/lucide).

## Phases — what's built

| Phase | Feature | Highlights |
| ----- | ------- | ---------- |
| **0** | Scaffold (`Welcome`) | App shell, typed HTTP client, live backend health check |
| **1** | Auth | Login/register, JWT session (zustand), route guards, return-URL redirect |
| **2** | Household & Locations | Create/join a household, nested location tree (rooms → shelves → bins) |
| **3** | Items & Stock | Item catalog, stock lots per location, create/edit item dialogs |
| **4** | Stock Movements | Move/consume/discard stock between locations, movement history |
| **5** | Global Search | Debounced household-wide item search with deep links |
| **6** | QR & Kitchen | Printable QR labels, camera scanner, `/l/:slug` deep links; kitchen view for expiring stock |
| **7** | Dashboard | Authenticated landing page: counts, quick actions, recent activity |
| **8** | Deployment | Multi-stage Docker build (Node 22 → nginx), Corepack/Yarn 4 |
| **9** | Item Photos | Upload/preview/remove item photos via presigned URLs (JPEG/PNG/WebP, 5 MB max) |

Each feature is self-contained (`api / components / hooks / lib / store / types /
views / routes.ts`) and exposes its routes, which `router.tsx` aggregates under
the appropriate auth/household guards.

## Routing & access control

Routes are layered by guard in `src/router.tsx`:

- **Public-only** (`/login`, `/register`) — authenticated users are redirected away.
- **Authenticated** (`ProtectedLayout`) — requires a session.
  - **Household setup** (`/household/setup`) — reachable without a household.
  - **Everything else** — requires an existing household (dashboard, locations,
    items, movements, search, kitchen, QR).

The QR scanner route (`/scan`) is **lazy-loaded** so the heavy barcode-detector
ponyfill stays out of the initial bundle.

## Project structure

```text
src/
  core/
    api/            # axios client + JWT interceptor + error mapping
    auth/           # guards, ProtectedLayout, AuthBootstrap, return-url
    components/     # hand-rolled icons + ui/ primitives (Button, Dialog, Select, QrCode, …)
    config/         # TanStack Query client, typed env access
    hooks/          # shared hooks (e.g. useObjectUrl for blob previews)
    layouts/        # app shell: header + responsive container
    lib/            # shared utilities
    styles/         # Tailwind entry / global css
  features/
    Welcome/        # backend health check (Phase 0)
    Auth/           # login/register, session store, guards (Phase 1)
    Household/      # household setup + management (Phase 2)
    Locations/      # nested location tree (Phase 2)
    Items/          # items, stock lots, photos (Phases 3 & 9)
    Movements/      # stock movements + history (Phase 4)
    Search/         # global item search (Phase 5)
    Qr/             # labels, scanner, slug deep links (Phase 6)
    Kitchen/        # expiring-stock overview (Phase 6)
    Dashboard/      # authenticated landing page (Phase 7)
  router.tsx        # aggregates each feature's routes with useRoutes
  main.tsx          # StrictMode + BrowserRouter + QueryClientProvider
  test/             # Vitest setup
```

## Path aliases

- `@` → `./src`
- `@features` → `./src/features`

Configured in both `vite.config.ts` and `tsconfig.app.json`.

## Getting started

> This project uses **Yarn 4** (Berry, via Corepack). If `yarn` is not on your
> PATH, prefix commands with `corepack yarn …` or run `corepack enable` once.

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Configure the environment:

   ```bash
   cp .env.example .env
   ```

   - `VITE_API_URL` — backend the Vite dev server proxies `/api` and `/health`
     to (default `http://localhost:5080`). The dev proxy keeps requests
     same-origin, so **CORS is never involved in development**.
   - `VITE_PUBLIC_APP_URL` — public base URL encoded into QR deep links
     (`${VITE_PUBLIC_APP_URL}/l/{qrSlug}`). Falls back to the current window
     origin when unset. The camera scanner requires HTTPS in production.

3. Start the dev server (http://localhost:3000):

   ```bash
   yarn dev
   ```

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `yarn dev`          | Start the dev server on port **3000**        |
| `yarn start`        | Alias of `yarn dev`                          |
| `yarn build`        | Type-check (`tsc -b`) and build for prod     |
| `yarn preview`      | Preview the production build on port 3000    |
| `yarn test`         | Run the Vitest suite once                    |
| `yarn test:watch`   | Run Vitest in watch mode                     |
| `yarn lint`         | Run ESLint                                   |
| `yarn format`       | Format `src` with Prettier                   |
| `yarn format:check` | Check formatting without writing             |

## Docker (Phase 8)

The app ships as static files served by nginx. `VITE_*` values are **build-time**
(Vite inlines them into the bundle — they are public, not secrets):

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  --build-arg VITE_PUBLIC_APP_URL=https://app.example.com \
  -t home-inventory-frontend .

docker run -p 8080:80 home-inventory-frontend
```

## Backend health check (Phase 0)

`WelcomeView` calls `GET /health` (proxied to `VITE_API_URL`) through `useHealth`
and renders a **Loading** state while in flight, **Connected (vN)** with the
backend version on success, or a **clear error** state if the backend is
unreachable.
