import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { db } from '@/lib/db';

type DatabaseState = 'loading' | 'ready' | 'blocked';

export function DatabaseGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DatabaseState>('loading');
  const [details, setDetails] = useState('');

  useEffect(() => {
    let cancelled = false;
    db.open()
      .then(() => {
        if (!cancelled) setState('ready');
      })
      .catch((error: unknown) => {
        console.error('Failed to initialize the database:', error);
        if (!cancelled) {
          setDetails(error instanceof Error ? error.message : String(error));
          setState('blocked');
        }
      });
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
