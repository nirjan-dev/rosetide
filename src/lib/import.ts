import { db } from './db';
import { periodDaySchema, periodSchema } from '@/modules/periods/types';
import { parseLocalDateString, toLocalDateString } from '@/utils/datetime';

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<string>;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  return parseLocalDateString(dateStr);
}

function normalizeDate(date: Date): string {
  return toLocalDateString(date);
}
export async function importFromCSV(csvContent: string): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
  
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    result.errors.push('CSV file is empty or has no data rows');
    return result;
  }
  
  const header = lines[0].toLowerCase();
  const expectedHeaders = ['period_start_date', 'period_end_date', 'day_date', 'flow_intensity'];
  const hasAllHeaders = expectedHeaders.every(h => header.includes(h));
  
  if (!hasAllHeaders) {
    result.errors.push('Missing required headers. Expected: period_start_date,period_end_date,day_date,flow_intensity');
    return result;
  }
  
  const periodMap = new Map<string, number>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < 4) {
      result.errors.push(`Row ${i + 1}: Invalid number of columns`);
      continue;
    }

    const [periodStartStr, periodEndStr, dayDateStr, flowStr] = values;
    const periodStart = parseDate(periodStartStr);
    const periodEnd = periodEndStr ? parseDate(periodEndStr) : null;
    const dayDate = dayDateStr ? parseDate(dayDateStr) : null;
    const flowIntensity = flowStr ? parseInt(flowStr, 10) : NaN;

    if (!periodStart) {
      result.errors.push(`Row ${i + 1}: Invalid period_start_date`);
      continue;
    }
    if (periodEndStr && !periodEnd) {
      result.errors.push(`Row ${i + 1}: Invalid period_end_date`);
      continue;
    }
    if (periodEnd && periodEnd < periodStart) {
      result.errors.push(`Row ${i + 1}: period_end_date is before period_start_date`);
      continue;
    }
    if (dayDateStr && !dayDate) {
      result.errors.push(`Row ${i + 1}: Invalid day_date`);
      continue;
    }
    if (dayDate && (isNaN(flowIntensity) || flowIntensity < 1 || flowIntensity > 5)) {
      result.errors.push(`Row ${i + 1}: flow_intensity must be between 1 and 5`);
      continue;
    }

    const startDay = normalizeDate(periodStart);
    const periodKey = `${startDay}-${periodEnd ? normalizeDate(periodEnd) : ''}`;
    let periodId: number | undefined = periodMap.get(periodKey);

    if (periodId === undefined) {
      const allPeriods = await db.periods.toArray();
      const existingPeriod = allPeriods.find(p => normalizeDate(p.startDate) === startDay);

      if (existingPeriod?.id !== undefined) {
        periodId = existingPeriod.id;
        const existingEndDay = existingPeriod.endDate ? normalizeDate(existingPeriod.endDate) : '';
        const importedEndDay = periodEnd ? normalizeDate(periodEnd) : '';
        if (existingEndDay !== importedEndDay) {
          result.errors.push(`Row ${i + 1}: Conflicting end date for period starting ${startDay}`);
          continue;
        }
      } else {
        const validatedPeriod = periodSchema
          .omit({ id: true })
          .parse({ startDate: periodStart, endDate: periodEnd ?? undefined });
        const newId = await db.periods.add(validatedPeriod);
        periodId = newId as number;
      }
      periodMap.set(periodKey, periodId);
    }

    if (dayDate) {
      const allDays = await db.periodDays.toArray();
      const normalizedDayDate = normalizeDate(dayDate);
      const existingDay = allDays.find(d => d.periodId === periodId && normalizeDate(new Date(d.date)) === normalizedDayDate);

      if (existingDay) {
        result.skipped++;
        continue;
      }

      const validatedDay = periodDaySchema
        .omit({ id: true })
        .parse({ periodId, date: dayDate, flowIntensity });
      await db.periodDays.add(validatedDay);
      result.imported++;
    }
  }

  return result;
}

function parseCSVLine(line: string): Array<string> {
  const result: Array<string> = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}