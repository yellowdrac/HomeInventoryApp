# HomeInventory — Frontend (Phase 0)

Foundations for the HomeInventory web client: a responsive, feature-based React
app. **Phase 0 is scaffold only** — app shell, typed HTTP client, and a live
backend health check. No business features yet.

## Stack

- **React 19** + **Vite** + **TypeScript** (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/vite` (mobile-first, no PWA)
- **TanStack Query** for server state
- **react-router v7** with `useRoutes`
- **axios** typed HTTP client (auth-token interceptor placeholder for Phase 1)
- **ESLint + Prettier**

## Project structure

```text
src/
  core/
    api/            # axios client (baseURL = VITE_API_URL) + token interceptor placeholder
    components/ui/  # minimal reusable primitives (Button, …)
    config/         # TanStack Query client, typed env access
    layouts/        # FullLayout: header + responsive container
    styles/         # Tailwind entry / global css
  features/
    Welcome/        # self-contained feature
      views/        # WelcomeView (app shell + health status)
      hooks/        # useHealth (typed GET /health via TanStack Query)
      types.ts
      routes.ts
  router.tsx        # aggregates each feature's routes with useRoutes
  main.tsx          # StrictMode + BrowserRouter + QueryClientProvider
```

Each feature is self-contained (`components / hooks / types / views / routes.ts`)
and exposes its routes, which `router.tsx` aggregates.

## Path aliases

- `@` → `./src`
- `@features` → `./src/features`

Configured in both `vite.config.ts` and `tsconfig.app.json`.

## Getting started

> This project uses **Yarn** (Berry, via Corepack). If `yarn` is not on your
> PATH, prefix commands with `corepack yarn …` or run `corepack enable` once.

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Configure the environment (point it at your backend):

   ```bash
   cp .env.example .env
   # VITE_API_URL=http://localhost:5080
   ```

3. Start the dev server (http://localhost:3000):

   ```bash
   yarn dev
   ```

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `yarn dev`         | Start the dev server on port **3000**        |
| `yarn start`       | Alias of `yarn dev`                          |
| `yarn build`       | Type-check (`tsc -b`) and build for prod     |
| `yarn preview`     | Preview the production build on port 3000    |
| `yarn lint`        | Run ESLint                                   |
| `yarn format`      | Format `src` with Prettier                   |

## Backend health check

`WelcomeView` calls `GET ${VITE_API_URL}/health` through `useHealth` and renders:

- **Loading** while the request is in flight,
- **Connected (vN)** with the version returned by the backend,
- a **clear error** state if the backend is unreachable.
