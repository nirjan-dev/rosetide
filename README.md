# Rosetide

A simple period tracker that stays in your browser.

Live app: https://rosetide.net

## What it is

- Log period starts/ends and past periods.
- See simple next-period and fertile-window estimates.
- Review history in calendar or list form.
- Works without an account or cloud sync.

## Privacy and data model

- Period records live in browser IndexedDB (`periodos_db`) on the same origin.
- No account, sync backend, or automatic cloud backup.
- Clearing browser data or switching browsers/devices starts empty.
- CSV export/import is the manual backup path.
- Browser storage can be evicted under low-storage pressure; settings can request persisted storage where supported.
- Estimates are calendar math only, not medical advice, contraception, or pregnancy planning.

## Run it

```bash
pnpm install
pnpm dev
```

App: http://localhost:3000

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

E2E tests intentionally delete local IndexedDB databases and only target `http://localhost:3000`.
