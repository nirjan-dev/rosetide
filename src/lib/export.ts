import { db } from './db';

function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportToCSV(): Promise<string> {
  const periods = await db.periods.toArray();
  
  const rows: Array<string> = ['period_start_date,period_end_date,day_date,flow_intensity'];
  
  for (const period of periods) {
    if (period.id === undefined) continue;
    const periodDays = await db.periodDays.where('periodId').equals(period.id).toArray();
    
    for (const day of periodDays) {
      const row = [
        escapeCSV(formatDate(period.startDate)),
        escapeCSV(formatDate(period.endDate)),
        escapeCSV(formatDate(day.date)),
        day.flowIntensity.toString(),
      ];
      rows.push(row.join(','));
    }
    
    if (periodDays.length === 0) {
      const row = [
        escapeCSV(formatDate(period.startDate)),
        escapeCSV(formatDate(period.endDate)),
        '',
        '',
      ];
      rows.push(row.join(','));
    }
  }
  
  return rows.join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}