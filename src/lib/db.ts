import Dexie from 'dexie';
import type {Table} from 'dexie';
import type { CycleLog } from '@/modules/cycles/types';

export class Database extends Dexie {
  cycles!: Table<CycleLog>;

  constructor() {
    super('Database');
    // Version 1: Initial schema
    this.version(1).stores({
      cycles: '++id, date, isEnded', // Primary key: id (auto-incrementing), index on date
    });

  }
}

export const db = new Database();
