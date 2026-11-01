import { Link, createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import type { StorageReport, StoreReport } from '@/lib/storageReport';
import { MarketingLayout } from '@/components/MarketingLayout';
import { collectRawBackup, collectStorageReport } from '@/lib/storageReport';
import { formatBytes } from '@/utils/formatBytes';

export const Route = createFileRoute('/storage-check')({
  component: StorageCheckPage,
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
});

function dateRange(store: StoreReport): string {
  if (!store.firstDate || !store.lastDate) return '';
  const first = format(store.firstDate, 'MMM d, yyyy');
  const last = format(store.lastDate, 'MMM d, yyyy');
  return first === last ? ` (${first})` : ` (${first} – ${last})`;
}

function Summary({ report }: { report: StorageReport }) {
  const tracker = report.databases.find((database) => database.name === 'periodos_db');
  const periods = tracker?.stores.find((store) => store.name === 'periods');
  const recordCount = report.databases
    .flatMap((database) => database.stores)
    .reduce((sum, store) => sum + store.count, 0);

  if (periods && periods.count > 0) {
    return (
      <p>
        <strong>
          {periods.count} period{periods.count === 1 ? ' is' : 's are'} saved in this browser
          {dateRange(periods)}.
        </strong>{' '}
        Open the tracker to see them.
      </p>
    );
  }
  if (recordCount > 0) {
    return (
      <p>
        <strong>Records were found, but the tracker isn&apos;t showing them yet.</strong> Open the
        tracker once (it tries to recover older records), then check again. If they still don&apos;t
        show, download a raw copy below and keep it safe.
      </p>
    );
  }
  return (
    <p>
      <strong>No Rosetide records are saved in this browser for {report.origin.replace('https://', '')}.</strong>{' '}
      If periods were logged here before, this browser&apos;s data for the site was cleared, for
      example by clearing browsing data or by the phone freeing up space. Rosetide has no other
      copy, so the only way back is a backup file.
    </p>
  );
}

function downloadJson(content: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function StorageCheckPage() {
  const [report, setReport] = useState<StorageReport | null>(null);
  const [downloadError, setDownloadError] = useState('');

  const check = useCallback(() => {
    setReport(null);
    void collectStorageReport().then(setReport);
  }, []);

  useEffect(check, [check]);

  const downloadRawCopy = async () => {
    setDownloadError('');
    try {
      const backup = await collectRawBackup();
      downloadJson(JSON.stringify(backup, null, 2), `rosetide-raw-copy-${format(new Date(), 'yyyy-MM-dd')}.json`);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <MarketingLayout
      title="What's saved here?"
      description="This page only reads what this browser has stored for Rosetide. It never changes or deletes anything."
    >
      {report === null ? (
        <p>Checking…</p>
      ) : (
        <>
          <Summary report={report} />

          {report.lastExport ? (
            <p>
              <strong>A backup file was saved on {format(report.lastExport, 'MMM d, yyyy')}.</strong>{' '}
              Look in your Downloads for{' '}
              <code>periodos-backup-{format(report.lastExport, 'yyyy-MM-dd')}.csv</code>, then import it
              in the tracker under Settings &amp; Backup.
            </p>
          ) : null}

          <h2>Details</h2>
          <ul>
            {report.databases.length === 0 ? <li>Saved records: none</li> : null}
            {report.databases.map((database) => (
              <li key={database.name}>
                {database.name} (version {database.version}):{' '}
                {database.stores.length === 0
                  ? 'empty'
                  : database.stores
                      .map((store) => `${store.name} ${store.count}${dateRange(store)}`)
                      .join(', ')}
              </li>
            ))}
            <li>
              Storage used:{' '}
              {report.usageBytes === null ? 'unknown' : formatBytes(report.usageBytes)}
              {report.indexedDbBytes === null ? '' : ` (database files: ${formatBytes(report.indexedDbBytes)})`}
            </li>
            <li>
              Protected from automatic cleanup:{' '}
              {report.persisted === null ? 'unknown' : report.persisted ? 'yes' : 'no'}
            </li>
            <li>
              Saved settings:{' '}
              {report.localStorageKeys.length === 0 ? 'none' : report.localStorageKeys.join(', ')}
            </li>
            {report.errors.map((error) => (
              <li key={error}>Could not read {error}</li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" className="btn btn-primary min-h-11" onClick={() => void downloadRawCopy()}>
              Download a raw copy
            </button>
            <button type="button" className="btn btn-outline min-h-11" onClick={check}>
              Check again
            </button>
            <Link to="/app" className="btn btn-ghost min-h-11">
              Open the tracker
            </Link>
          </div>
          {downloadError ? <p className="text-error">Download failed: {downloadError}</p> : null}
        </>
      )}
    </MarketingLayout>
  );
}
