# WealthOS

WealthOS is a React + Vite personal finance dashboard scaffold styled with Tailwind CSS.

## Pages

- Dashboard
- Accounts
- CashFlow
- Planner

## Getting Started

```bash
npm install
npm run dev
```

## Features

- Dashboard summary cards for total assets, portfolio income, and contribution tracking
- Wealth chart placeholder panel
- Accounts workspace for adding accounts, adding holdings, and editing holdings
- Additional CashFlow and Planner sections for future expansion

## Architecture Guardrails

This repository is intentionally constrained to one runtime path so future work extends the existing architecture rather than cloning it.

### Canonical architecture (must stay singular)

- **App entry path**: `src/main.jsx` is the only entry point and only `createRoot(...)` path.
- **App shell**: `src/App.jsx` is the only shell composition layer (`Sidebar`, `main`, `BottomNav`).
- **Shared state/data model**:
  - `src/hooks/usePersistentAppData.js` is the canonical shared app state hook.
  - `src/data/appData.js` defines the canonical normalized data shape and normalization rules.
- **Persistence path**:
  - `src/data/appStore.js` is the only persistence adapter/repository module.
  - localStorage (`wealthos.app-data.v1`) is the only approved durable client persistence path.
- **Build/deploy path**:
  - Build: `npm run build` -> `scripts/build.mjs` -> deterministic static output in `dist/`.
  - Deploy prep: `npm run deploy` -> `scripts/deploy.mjs` guidance for GitHub-hostable deployment.

### Extend, don't replace

Future contributors should extend these files/modules instead of replacing or duplicating them:

- Extend page/component behavior under `src/components/`.
- Extend shell behavior in `src/App.jsx` (do not add an alternate shell/root layout).
- Extend shared model normalization in `src/data/appData.js` (do not bypass normalized shape).
- Extend persistence behavior in `src/data/appStore.js` (do not add a second store/sync stack).

### Forbidden duplicate patterns

The following categories are forbidden unless a full repository migration is approved and old paths are removed in the same change:

- Duplicate app entries (extra `createRoot` usage / secondary `main.*`).
- Duplicate shells/routers (parallel app shell trees).
- Duplicate shared stores or state systems (Redux/Zustand/Context clones in parallel with existing hook/repository).
- Duplicate persistence/sync pipelines (second local cache, second sync adapter, or alternate storage authority).
- Local-only deploy/runtime assumptions that bypass `scripts/build.mjs` and `scripts/deploy.mjs`.

## Contributor Safety Notes

- Extend existing modules instead of cloning them.
- Do not replace the app shell (`src/App.jsx`) or main entry (`src/main.jsx`).
- Do not introduce a second store/state system.
- Do not introduce a second sync system.
- Do not add new CDN/runtime dependencies unless replacing an existing approved dependency.
- Do not bypass the normalized shared data model in `src/data/appData.js`.

## Lightweight Guardrail Checks

Run:

```bash
npm run check
```

This executes `scripts/guardrails.mjs`, which checks:

- merge conflict markers
- duplicate app entry attempts
- duplicate/obvious store and persistence patterns
- JSON validity for key config/manifest files
- normalized data model baseline invariants
