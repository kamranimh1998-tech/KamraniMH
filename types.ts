
export interface DayEntry {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  entryTime: string; // HH:mm
  exitTime: string; // HH:mm
  isUrlaub: boolean;
  isKrank: boolean;
  isFeiertag: boolean;
  isPersonalHoliday: boolean;
  pauseMinutes: number; // 30, 45, 60
  isPauseActive: boolean;
  notes: string;
}

export interface WeeklySummary {
  totalMinutes: number;
  requiredMinutes: number;
  overtimeMinutes: number;
}

export interface MonthlyStats {
  totalWorkedMinutes: number;
  totalOvertimeMinutes: number;
  holidayCount: number;
}
