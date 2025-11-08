import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Period, PeriodDay } from '@/modules/periods/types';

export class Database extends Dexie {
  periods!: Table<Period>;
  periodDays!: Table<PeriodDay>;

  constructor() {
    super('periodos_db');

    this.version(1).stores({
      periods: '++id, startDate, endDate', // Stores one record per period
      periodDays: '++id, periodId, date',   // Stores daily logs associated with a period
    });
  }
}

export const db = new Database();
