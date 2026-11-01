import { useState, useSyncExternalStore } from 'react';
import { useAllPeriods } from '@/modules/periods/hooks/usePeriodLogs';
import {
  canShareBackupFile,
  getBackupReminderSnoozedUntil,
  getLastBackupFileDate,
  isBackupReminderDue,
  saveBackupFile,
  shareBackupFile,
  snoozeBackupReminder,
  subscribeBackupFile,
} from '@/lib/backupFile';
import { friendlyDate } from '@/utils/friendlyDate';

export function BackupReminder() {
  const periods = useAllPeriods();
  const lastBackupFile = useSyncExternalStore(subscribeBackupFile, getLastBackupFileDate);
  const snoozedUntil = useSyncExternalStore(subscribeBackupFile, getBackupReminderSnoozedUntil);
  const [error, setError] = useState('');

  const due = isBackupReminderDue(
    (periods?.length ?? 0) > 0,
    lastBackupFile ? new Date(lastBackupFile) : null,
    snoozedUntil ? new Date(snoozedUntil) : null,
    new Date(),
  );
  if (!due) return null;

  const run = (action: () => Promise<unknown>) => {
    setError('');
    action().catch((failure: unknown) => {
      setError(failure instanceof Error ? failure.message : String(failure));
    });
  };

  return (
    <div
      role="region"
      aria-label="Backup reminder"
      className="alert mb-6 flex-col items-start gap-3 bg-base-100 p-4 shadow-md sm:flex-row sm:items-center"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          💾
        </span>
        <div>
          <p className="font-semibold">
            {lastBackupFile
              ? `Your last backup file is from ${friendlyDate(new Date(lastBackupFile))}`
              : 'Save a backup file?'}
          </p>
          <p className="text-sm text-base-content/80">
            Your records only live on this device. A backup file keeps them safe if this
            browser&apos;s data is ever cleared.
          </p>
          {error ? <p className="text-sm text-error">Backup failed: {error}</p> : null}
        </div>
      </div>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <button type="button" className="btn btn-primary btn-sm min-h-11" onClick={() => run(saveBackupFile)}>
          Save backup file
        </button>
        {canShareBackupFile() ? (
          <button type="button" className="btn btn-outline btn-sm min-h-11" onClick={() => run(shareBackupFile)}>
            Send to Drive or email
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-ghost btn-sm min-h-11"
          onClick={() => snoozeBackupReminder()}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
