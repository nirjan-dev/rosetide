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
- Restore points (`src/lib/restorePoints.ts`) are automatic copies in a separate IndexedDB (`rosetide_restore_points`): one per day when records changed (last 7 kept) and one before each import, period deletion or restore (last 3 kept). Restore replaces all records after saving a copy of the current ones. They share the browser's storage, so they undo mistakes but don't survive cleared site data.
- A backup file (CSV, `src/lib/backupFile.ts`) is the copy that leaves the browser: download it, or send it through the share sheet (Drive, email) where supported. The last save date is stored under `periodos_last_export` and shown on the tracker; a reminder appears when there are records and no backup file in 30 days ("Not now" snoozes it for 7). A website can't write files outside the browser on its own, so this step needs a tap.
- Browser storage can be evicted under low-storage pressure. The installed app requests persisted storage on every launch; in a tab, Settings can request it.
- "Delete all my data" removes records, restore points, the earliest-build database and backup/reminder dates.
- Estimates are calendar math only, not medical advice, contraception, or pregnancy planning.

### Older versions and old addresses

- Builds from Oct 16 – Nov 8, 2025 stored records in other shapes (a `Database` IndexedDB, then a `cycles` store). Before storage opens, `src/lib/legacyRescue.ts` moves those records into the current schema and keeps the originals as a backup. Opening the current schema without that step makes Dexie delete the old `cycles` store and `cycleId` index; the rescue also rebuilds periods from daily logs left behind by that.
- Never bump or change the Dexie schema without an explicit `version(n + 1)` upgrade: Dexie deletes stores and indexes that a same-version schema no longer declares.
- The app was served from `periodos.nirjan.net` and `periodos.pages.dev` before `rosetide.net` (first certificate Dec 2, 2025, after the Nov 9 schema switch, so rosetide.net only ever held current-format records). Browser storage is per address, so records saved on an old address can only be exported from there. Keep those addresses serving the app; never redirect them to rosetide.net.
- `/storage-check` is a read-only page listing every database, record count and date range this browser holds for the current address, with a raw JSON download. It never opens Dexie or creates a database; use it to support someone whose records are missing.

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
