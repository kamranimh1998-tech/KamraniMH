
import { DayEntry } from '../types';

export const DAILY_REQUIRED_MINUTES = 350; // 5 hours and 50 minutes
export const WEEKLY_REQUIRED_MINUTES = 2100; // 35 hours

export const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const formatMinutesToTime = (totalMinutes: number): string => {
  const isNegative = totalMinutes < 0;
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return `${isNegative ? '-' : ''}${hours}:${minutes.toString().padStart(2, '0')}`;
};

export const calculateDailyStats = (entry: DayEntry) => {
  const isPaidAbsence = entry.isUrlaub || entry.isKrank || entry.isFeiertag;

  if (isPaidAbsence) {
    return {
      worked: DAILY_REQUIRED_MINUTES,
      overtime: 0,
    };
  }

  if (entry.isPersonalHoliday) {
    return {
      worked: 0,
      overtime: 0,
    };
  }

  if (!entry.entryTime || !entry.exitTime) {
    return { worked: 0, overtime: 0 };
  }

  const start = timeToMinutes(entry.entryTime);
  const end = timeToMinutes(entry.exitTime);
  
  // Basic calculation
  let worked = Math.max(0, end - start);

  // Subtract pause if active
  if (entry.isPauseActive && entry.pauseMinutes > 0) {
    worked = Math.max(0, worked - entry.pauseMinutes);
  }

  let overtime = worked - DAILY_REQUIRED_MINUTES;

  return { worked, overtime };
};

export const getGregorianDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatNumericDateGerman = (dateStr: string) => {
  const date = new Date(dateStr);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
};

export const generateMonthDays = (year: number, month: number): DayEntry[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const entries: DayEntry[] = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    const yearStr = year.toString();
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = i.toString().padStart(2, '0');
    const dateString = `${yearStr}-${monthStr}-${dayStr}`;
    
    entries.push({
      id: crypto.randomUUID(),
      date: dateString,
      entryTime: '',
      exitTime: '',
      isUrlaub: false,
      isKrank: false,
      isFeiertag: false,
      isPersonalHoliday: false,
      pauseMinutes: 0,
      isPauseActive: false,
      notes: ''
    });
  }
  return entries;
};
