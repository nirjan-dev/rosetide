import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Download, HardDrive, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { downloadCSV, exportToCSV } from '@/lib/export';
import { importFromCSV } from '@/lib/import';
import { checkPersistedStorage, getLastExportDate, getStorageEstimate, setLastExportDate } from '@/lib/storage';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<string>;
}

interface StorageEstimate {
  usage: number;
  quota: number;
  percentage: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function SettingsModal() {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [storageStatus, setStorageStatus] = useState<{ persisted: boolean; isRequesting: boolean } | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<StorageEstimate | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const openModal = async () => {
    modalRef.current?.showModal();
    const status = await checkPersistedStorage();
    setStorageStatus(status);
    const estimate = await getStorageEstimate();
    setStorageEstimate(estimate);
    const last = getLastExportDate();
    setLastExport(last);
  };

  const closeModal = () => {
    setImportResult(null);
    modalRef.current?.close();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = await exportToCSV();
      const date = new Date();
      const filename = `periodos-backup-${format(date, 'yyyy-MM-dd')}.csv`;
      downloadCSV(csv, filename);
      setLastExportDate(date);
      setLastExport(date.toISOString());
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const result = await importFromCSV(text);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({ imported: 0, skipped: 0, errors: ['Failed to read file'] });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <button className="btn btn-ghost btn-sm" onClick={openModal}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Settings & Backup
      </button>

      <dialog ref={modalRef} id="settings_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Settings</h3>

          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span className="font-medium">Storage</span>
              </div>
              {storageEstimate && (
                <p className="text-sm opacity-70">
                  Using {formatBytes(storageEstimate.usage)} of {formatBytes(storageEstimate.quota)} ({storageEstimate.percentage.toFixed(1)}%)
                </p>
              )}
              {storageStatus !== null && (
                <div className={`text-sm ${storageStatus.persisted ? 'text-success' : 'text-warning'}`}>
                  {storageStatus.persisted ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Protected from automatic cleanup
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      May be cleared if device runs low on storage
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="divider"></div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="font-medium">Export Data</span>
              </div>
              <p className="text-sm opacity-70">
                Download your data as a CSV file. You can open it in spreadsheets or use it to restore your data later.
              </p>
              {lastExport && (
                <p className="text-xs opacity-60">
                  Last exported: {format(new Date(lastExport), 'MMM d, yyyy')}
                </p>
              )}
              <button
                className="btn btn-primary btn-sm"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export to CSV
                  </>
                )}
              </button>
            </div>

            <div className="divider"></div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="font-medium">Import Data</span>
              </div>
              <p className="text-sm opacity-70">
                Restore data from a CSV backup. Duplicate dates will be skipped.
              </p>
              <label className="btn btn-outline btn-sm cursor-pointer">
                {isImporting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import CSV
                  </>
                )}
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImport}
                  disabled={isImporting}
                />
              </label>

              {importResult && (
                <div className={`text-sm ${importResult.errors.length > 0 ? 'text-warning' : 'text-success'}`}>
                  {importResult.errors.length > 0 ? (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Import failed: {importResult.errors[0]}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Import completed successfully
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-action">
            <button className="btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </>
  );
}
