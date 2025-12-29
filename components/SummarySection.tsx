
import React from 'react';
import { Clock, TrendingUp, CalendarCheck, Coffee } from 'lucide-react';
import { formatMinutesToTime } from '../utils/calculations';

interface SummarySectionProps {
  totalWorked: number;
  totalOvertime: number;
  holidaysCount: number;
  personalHolidaysCount: number;
}

const SummarySection: React.FC<SummarySectionProps> = ({ 
  totalWorked, 
  totalOvertime, 
  holidaysCount,
  personalHolidaysCount 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Gesamte Arbeitszeit</p>
            <p className="text-2xl font-bold text-slate-800">{formatMinutesToTime(totalWorked)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Überstunden Gesamt</p>
            <p className="text-2xl font-bold text-emerald-700">{formatMinutesToTime(totalOvertime)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Bezahlte Abwesenheit</p>
            <p className="text-2xl font-bold text-orange-700">{holidaysCount} Tage</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Coffee size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Freie Tage</p>
            <p className="text-2xl font-bold text-indigo-700">{personalHolidaysCount} Tage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
