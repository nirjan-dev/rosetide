import { db } from './db';

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<string>;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

function normalizeDate(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
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
    const dayDate = parseDate(dayDateStr);
    const flowIntensity = parseInt(flowStr, 10);
    
    if (!periodStart) {
      result.errors.push(`Row ${i + 1}: Invalid period_start_date`);
      continue;
    }
    
    if (dayDate && (isNaN(flowIntensity) || flowIntensity < 1 || flowIntensity > 5)) {
      result.errors.push(`Row ${i + 1}: flow_intensity must be between 1 and 5`);
      continue;
    }
    
    const periodKey = `${normalizeDate(periodStart)}-${periodEnd ? normalizeDate(periodEnd) : ''}`;
    let periodId: number | undefined = periodMap.get(periodKey);
    
    if (periodId === undefined) {
      const allPeriods = await db.periods.toArray();
      const existingPeriod = allPeriods.find(p => normalizeDate(p.startDate) === normalizeDate(periodStart));
      
      if (existingPeriod?.id !== undefined) {
        periodId = existingPeriod.id;
      } else {
        const newId = await db.periods.add({
          startDate: periodStart,
          endDate: periodEnd ?? undefined,
        });
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

      await db.periodDays.add({
        periodId: periodId,
        date: dayDate,
        flowIntensity,
      });
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