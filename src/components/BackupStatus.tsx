import { useLiveQuery } from 'dexie-react-hooks';
import { useSyncExternalStore } from 'react';
import { getLastBackupFileDate, subscribeBackupFile } from '@/lib/backupFile';
import { restorePointDb } from '@/lib/restorePoints';
import { friendlyDate } from '@/utils/friendlyDate';

export function BackupStatus() {
  const lastBackupFile = useSyncExternalStore(subscribeBackupFile, getLastBackupFileDate);
  const latestRestorePoint = useLiveQuery(() => restorePointDb.restorePoints.orderBy('createdAt').last());

  return (
    <p role="status" aria-label="Backup status" className="text-center text-sm text-base-content/80">
      Last backup file:{' '}
      <span className={lastBackupFile ? 'font-semibold' : 'font-semibold text-error'}>
        {lastBackupFile ? friendlyDate(new Date(lastBackupFile)) : 'never'}
      </span>
      <br />
      Last restore point:{' '}
      <span className="font-semibold">
        {latestRestorePoint ? friendlyDate(latestRestorePoint.createdAt) : 'none yet'}
      </span>
    </p>
  );
}
