
import React, { useState, useEffect, useMemo } from 'react';
import { Download, Sparkles, Trash2, FileSpreadsheet, Calculator } from 'lucide-react';
import { DayEntry } from './types';
import { 
  generateMonthDays, 
  calculateDailyStats, 
  formatMinutesToTime, 
  formatNumericDateGerman,
} from './utils/calculations';
import { getMonthlyInsights } from './services/geminiService';
import SummarySection from './components/SummarySection';
import TimesheetTable from './components/TimesheetTable';

const App: React.FC = () => {
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const saved = localStorage.getItem(`timesheet-v4-${currentYear}-${currentMonth}`);
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      setEntries(generateMonthDays(currentYear, currentMonth));
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem(`timesheet-v4-${currentYear}-${currentMonth}`, JSON.stringify(entries));
    }
  }, [entries, currentMonth, currentYear]);

  const updateEntry = (id: string, updates: Partial<DayEntry>) => {
    setEntries(prev => prev.map(e => {
      if (e.id === id) {
        const newEntry = { ...e, ...updates };
        if (updates.isUrlaub) newEntry.isKrank = newEntry.isFeiertag = newEntry.isPersonalHoliday = false;
        if (updates.isKrank) newEntry.isUrlaub = newEntry.isFeiertag = newEntry.isPersonalHoliday = false;
        if (updates.isFeiertag) newEntry.isUrlaub = newEntry.isKrank = newEntry.isPersonalHoliday = false;
        if (updates.isPersonalHoliday) newEntry.isUrlaub = newEntry.isKrank = newEntry.isFeiertag = false;
        return newEntry;
      }
      return e;
    }));
  };

  const totals = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const stats = calculateDailyStats(entry);
      return {
        worked: acc.worked + stats.worked,
        overtime: acc.overtime + stats.overtime,
        paidAbsences: acc.paidAbsences + (entry.isUrlaub || entry.isKrank || entry.isFeiertag ? 1 : 0),
        personalHolidays: acc.personalHolidays + (entry.isPersonalHoliday ? 1 : 0)
      };
    }, { worked: 0, overtime: 0, paidAbsences: 0, personalHolidays: 0 });
  }, [entries]);

  const handleGetAiInsights = async () => {
    setLoadingInsights(true);
    const result = await getMonthlyInsights(entries);
    setAiInsight(result);
    setLoadingInsights(false);
  };

  const exportToCSV = () => {
    // Definieren der Header mit leeren Spalten dazwischen für visuellen Abstand
    const headers = [
      "Datum", " ", 
      "Beginn", " ", 
      "Ende", " ", 
      "Pause", " ", 
      "Urlaub", " ", 
      "Krank", " ", 
      "Feiertag", " ", 
      "Freier Tag", " ", 
      "Notizen", " ", 
      "Arbeitszeit", " ", 
      "Überstunden"
    ];

    const rows = entries.map(e => {
      const stats = calculateDailyStats(e);
      return [
        formatNumericDateGerman(e.date), "",
        e.entryTime || "-", "",
        e.exitTime || "-", "",
        e.isPauseActive ? e.pauseMinutes : 0, "",
        e.isUrlaub ? "Ja" : "Nein", "",
        e.isKrank ? "Ja" : "Nein", "",
        e.isFeiertag ? "Ja" : "Nein", "",
        e.isPersonalHoliday ? "Ja" : "Nein", "",
        e.notes || "", "",
        formatMinutesToTime(stats.worked), "",
        formatMinutesToTime(stats.overtime)
      ];
    });

    // Erzeugen des CSV-Inhalts
    // "sep=;" sagt Excel explizit, dass das Semikolon der Trenner ist
    const csvHeader = "sep=;\n";
    const csvBody = [headers, ...rows].map(row => row.join(";")).join("\n");
    const csvContent = "\uFEFF" + csvHeader + csvBody;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Arbeitszeit_${currentYear}_${currentMonth + 1}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetMonth = () => {
    if (window.confirm('Möchten Sie wirklich alle Daten für diesen Monat löschen?')) {
      setEntries(generateMonthDays(currentYear, currentMonth));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FileSpreadsheet className="text-blue-600" size={32} />
            Arbeitszeit-Manager
          </h1>
          <p className="text-slate-500 mt-1">
            Soll: 5:50 Std/Tag (35 Std/Woche - 6 Tage)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(new Date(2024, i, 1))}
              </option>
            ))}
          </select>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm font-bold"
          >
            <Download size={18} />
            Excel-Export
          </button>
          <button 
            onClick={resetMonth}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            title="Monat zurücksetzen"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6 pb-20">
        <SummarySection 
          totalWorked={totals.worked} 
          totalOvertime={totals.overtime} 
          holidaysCount={totals.paidAbsences}
          personalHolidaysCount={totals.personalHolidays}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <TimesheetTable 
              entries={entries} 
              onUpdate={updateEntry} 
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-600" size={20} />
                KI-Analyse
              </h2>
              {aiInsight ? (
                <div className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {aiInsight}
                </div>
              ) : (
                <p className="text-slate-500 text-sm mb-6">
                  Klicken Sie auf den Button, um eine detaillierte Analyse Ihrer Arbeitszeiten zu erhalten.
                </p>
              )}
              <button 
                onClick={handleGetAiInsights}
                disabled={loadingInsights}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-4 py-3 rounded-xl transition-all font-bold"
              >
                {loadingInsights ? 'Analysiere...' : 'KI-Analyse anfordern'}
                {!loadingInsights && <Sparkles size={18} />}
              </button>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Calculator size={18} />
                Regeln
              </h3>
              <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                <li>Normaler Arbeitstag: 5:50 Std</li>
                <li>Wochenstunden (6 Tage): 35 Std</li>
                <li>Bezahlt: Urlaub, Krank, Feiertag</li>
                <li>Freier Tag: Unbezahlt (kein Minus)</li>
                <li>Pause: Wird von Arbeitszeit abgezogen</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-10 shadow-lg md:hidden">
         <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Gesamtzeit</span>
              <span className="font-bold text-blue-700">{formatMinutesToTime(totals.worked)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-slate-500">Überstunden</span>
              <span className="font-bold text-emerald-600">{formatMinutesToTime(totals.overtime)}</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
