import { useEffect } from 'react';
import { createDailyRestorePointIfDue } from '@/lib/restorePoints';
import { protectStorageInInstalledApp } from '@/lib/storage';

/**
 * Runs while the tracker is open: protects storage in the installed app, and takes the
 * daily restore point on open and whenever the app comes back to the foreground.
 */
export function useStorageSafeguards(): void {
  useEffect(() => {
    protectStorageInInstalledApp().catch((error: unknown) => {
      console.error('Requesting protected storage failed:', error);
    });

    const takeDailyRestorePoint = () => {
      if (document.visibilityState !== 'visible') return;
      createDailyRestorePointIfDue().catch((error: unknown) => {
        console.error('Taking a restore point failed:', error);
      });
    };
    takeDailyRestorePoint();
    document.addEventListener('visibilitychange', takeDailyRestorePoint);
    return () => document.removeEventListener('visibilitychange', takeDailyRestorePoint);
  }, []);
}
