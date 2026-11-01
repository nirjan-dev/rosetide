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

## Cloudflare Pages routing

Routes like `/app` and `/privacy` rely on Pages' built-in single-page fallback (there is no `404.html`). Do not add a `_redirects` rule pointing to `/index.html`: Pages redirects `/index.html` to `/`, which sends every route — including the installed app's `/app` start URL — to the landing page.

Check routing locally against the Pages runtime before deploying:

```bash
pnpm build
pnpm exec wrangler pages dev dist --port 8788
curl -sI http://127.0.0.1:8788/app   # expect 200, not 308
```
