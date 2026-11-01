import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { db } from '@/lib/db';
import { importEarliestRecords, rescueLegacyCurrentDatabase } from '@/lib/legacyRescue';

type DatabaseState = 'loading' | 'ready' | 'blocked' | 'rescueFailed';

export function DatabaseGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DatabaseState>('loading');
  const [details, setDetails] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fail = (next: DatabaseState) => (error: unknown) => {
      console.error('Failed to initialize the database:', error);
      if (!cancelled) {
        setDetails(error instanceof Error ? error.message : String(error));
        setState(next);
      }
    };

    // Older records must be moved before Dexie opens: opening first would delete them.
    rescueLegacyCurrentDatabase().then(
      () =>
        db
          .open()
          .then(() =>
            importEarliestRecords().catch((error: unknown) => {
              // Non-fatal: the earliest records stay untouched and are retried next time.
              console.error('Importing earliest records failed:', error);
            }),
          )
          .then(() => {
            if (!cancelled) setState('ready');
          })
          .catch(fail('blocked')),
      fail('rescueFailed'),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (state === 'rescueFailed') {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">We found records from an older version</h1>
        <p className="mt-3 opacity-80">
          Rosetide couldn&apos;t move them to the current format, so it stopped before changing
          anything. Your older records are still saved in this browser.
        </p>
        <p className="mt-2 text-sm opacity-70">
          Close other Rosetide tabs and reload this page. If it keeps happening, don&apos;t clear
          this site&apos;s data; the records can still be recovered.
        </p>
        {details ? <p className="mt-3 text-xs opacity-60">Details: {details}</p> : null}
      </div>
    );
  }

  if (state === 'blocked') {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Tracker storage is unavailable</h1>
        <p className="mt-3 opacity-80">
          Rosetide stores records in this browser, and the browser blocked local storage. Your saved
          records may be unavailable in private browsing or with strict tracking protection.
        </p>
        <p className="mt-2 text-sm opacity-70">
          Try a normal browser window, allow site storage, restore a CSV backup, or use a different
          browser.
        </p>
        {details ? <p className="mt-3 text-xs opacity-60">Details: {details}</p> : null}
      </div>
    );
  }

  return <>{children}</>;
}
