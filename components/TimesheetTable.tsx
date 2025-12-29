
import React from 'react';
import { DayEntry } from '../types';
import { 
  getGregorianDate, 
  calculateDailyStats, 
  formatMinutesToTime,
} from '../utils/calculations';
import { Clock, MessageSquare, ShieldOff, Palmtree } from 'lucide-react';

interface TimesheetTableProps {
  entries: DayEntry[];
  onUpdate: (id: string, updates: Partial<DayEntry>) => void;
}

const TimesheetTable: React.FC<TimesheetTableProps> = ({ entries, onUpdate }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-4 text-xs font-bold text-slate-700 min-w-[150px]">Datum</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-700">Check-in/out</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-700 text-center">Pause</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-700 text-center">
                <div className="flex flex-col items-center">
                  <span>Bezahlt</span>
                  <div className="flex gap-2 mt-1 font-normal text-[9px] text-slate-500">
                    <span>Urlaub</span>
                    <span>Krank</span>
                    <span>Feiertag</span>
                  </div>
                </div>
              </th>
              <th className="px-4 py-4 text-xs font-bold text-slate-700 text-center">Freier Tag</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-700 text-right">Arbeit/Überst.</th>
              <th className="px-4 py-4 text-xs font-bold text-slate-700">Notizen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((entry) => {
              const stats = calculateDailyStats(entry);
              const dateObj = new Date(entry.date);
              const isSaturday = dateObj.getDay() === 6;
              const isSunday = dateObj.getDay() === 0;
              
              const isPaidAbsence = entry.isUrlaub || entry.isKrank || entry.isFeiertag;
              const isAnyHoliday = isPaidAbsence || entry.isPersonalHoliday;

              const handlePauseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                const minutes = parseInt(e.target.value);
                onUpdate(entry.id, { 
                  pauseMinutes: minutes,
                  isPauseActive: minutes > 0 
                });
              };

              return (
                <tr 
                  key={entry.id} 
                  className={`hover:bg-slate-50 transition-colors 
                    ${isPaidAbsence ? 'bg-orange-50/40' : ''} 
                    ${entry.isPersonalHoliday ? 'bg-indigo-50/40' : ''} 
                    ${(isSunday || isSaturday) && !isAnyHoliday ? 'bg-red-50/5' : ''}`}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 text-sm">{getGregorianDate(entry.date)}</span>
                      {isSunday && (
                        <span className="text-[10px] text-red-500 font-bold uppercase">
                          Sonntag
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {!isAnyHoliday ? (
                      <div className="flex flex-col gap-1">
                        <input 
                          type="time" 
                          value={entry.entryTime}
                          onChange={(e) => onUpdate(entry.id, { entryTime: e.target.value })}
                          className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <input 
                          type="time" 
                          value={entry.exitTime}
                          onChange={(e) => onUpdate(entry.id, { exitTime: e.target.value })}
                          className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center text-slate-300">
                        <ShieldOff size={16} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {!isAnyHoliday ? (
                      <div className="flex flex-col items-center gap-1">
                        <select
                          value={entry.isPauseActive ? entry.pauseMinutes : 0}
                          onChange={handlePauseChange}
                          className={`text-[10px] border rounded px-1 py-0.5 focus:outline-none transition-colors ${entry.isPauseActive ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500'}`}
                        >
                          <option value={0}>Ohne</option>
                          <option value={30}>30 m</option>
                          <option value={45}>45 m</option>
                          <option value={60}>1 h</option>
                        </select>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-4">
                      {/* Urlaub */}
                      <div className="flex flex-col items-center gap-1">
                        <input 
                          type="checkbox" 
                          checked={entry.isUrlaub}
                          onChange={(e) => onUpdate(entry.id, { isUrlaub: e.target.checked })}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-[9px] text-slate-400 font-bold">U</span>
                      </div>
                      {/* Krank */}
                      <div className="flex flex-col items-center gap-1">
                        <input 
                          type="checkbox" 
                          checked={entry.isKrank}
                          onChange={(e) => onUpdate(entry.id, { isKrank: e.target.checked })}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-[9px] text-slate-400 font-bold">K</span>
                      </div>
                      {/* Feiertag */}
                      <div className="flex flex-col items-center gap-1">
                        <input 
                          type="checkbox" 
                          checked={entry.isFeiertag}
                          onChange={(e) => onUpdate(entry.id, { isFeiertag: e.target.checked })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-[9px] text-slate-400 font-bold">F</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        disabled={isPaidAbsence}
                        checked={entry.isPersonalHoliday} 
                        onChange={(e) => onUpdate(entry.id, { isPersonalHoliday: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-30"></div>
                    </label>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-end gap-1.5 text-slate-700">
                        {entry.isPersonalHoliday ? (
                          <Palmtree size={14} className="text-indigo-400" />
                        ) : (
                          <Clock size={14} className="text-slate-400" />
                        )}
                        <span className={`text-sm font-bold ${entry.isPersonalHoliday ? 'text-indigo-600' : ''}`}>
                          {formatMinutesToTime(stats.worked)}
                        </span>
                      </div>
                      <div className={`text-[10px] font-bold ${stats.overtime > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {stats.overtime > 0 ? `+ ${formatMinutesToTime(stats.overtime)}` : ''}
                        {stats.overtime < 0 && !isAnyHoliday && entry.entryTime && entry.exitTime ? `-${formatMinutesToTime(Math.abs(stats.overtime))}` : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 min-w-[150px]">
                    <div className="relative flex items-center">
                      <MessageSquare className="absolute left-2 text-slate-300" size={12} />
                      <input 
                        type="text" 
                        placeholder="Notiz..."
                        value={entry.notes}
                        onChange={(e) => onUpdate(entry.id, { notes: e.target.value })}
                        className="w-full pl-7 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs focus:outline-none py-1 transition-all text-slate-600"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimesheetTable;
