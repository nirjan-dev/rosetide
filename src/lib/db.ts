import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Cycle, PeriodDay } from '@/modules/cycles/types';

export class Database extends Dexie {
  cycles!: Table<Cycle>;
  periodDays!: Table<PeriodDay>;

  constructor() {
    super('periodos_db');

    this.version(1).stores({
      cycles: '++id, startDate, endDate', // Stores one record per period cycle
      periodDays: '++id, cycleId, date',   // Stores daily logs associated with a cycle
    });
  }
}

export const db = new Database();
