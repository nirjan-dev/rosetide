// Kept free of Dexie imports so the read-only storage check can use them.

/** Automatic restore points live in their own database, apart from the records. */
export const RESTORE_POINTS_DB_NAME = 'rosetide_restore_points';

/** Name kept from the first export feature so existing users keep their last backup date. */
export const LAST_BACKUP_FILE_KEY = 'periodos_last_export';
