# WealthOS

WealthOS is a mobile-first React + Vite household finance dashboard with a dark premium UI, local persistence, and optional shared household sync for JR and Lisa.

## Pages

- Dashboard
- Accounts
- CashFlow
- Planner
- Settings

## Local development

```bash
npm install
npm run dev
```

## Shared household sync

WealthOS supports a Supabase-backed shared household workspace that keeps the same accounts, holdings, cash flow rows, planner goals, and contribution schedules available across multiple devices.

### Required environment variables

Create a local `.env` file or provide the same values in your GitHub Pages build environment:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

### Supabase setup

1. Create a Supabase project.
2. Enable **Email + Password** authentication.
3. Run the SQL in `supabase/schema.sql`.
4. Sign in on the first device and create the household.
5. Sign in on the second device and join the same household with the shared slug + invite code.

Additional notes are in `.github/SETUP_SUPABASE.md`.

## Deployment

The app preserves the GitHub Pages Vite base path:

```js
base: '/income-dashboard/'
```

Build and deploy with:

```bash
npm run build
npm run deploy
```

If no Git remote named `origin` is configured, the deploy script will stop with a clear error instead of pushing an incomplete Pages build.
