
import { GoogleGenAI } from "@google/genai";
import { DayEntry } from "../types";
import { formatMinutesToTime, calculateDailyStats } from "../utils/calculations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMonthlyInsights = async (entries: DayEntry[]) => {
  const summary = entries.map(e => {
    const stats = calculateDailyStats(e);
    let status = 'Arbeitstag';
    if (e.isUrlaub) status = 'Urlaub';
    else if (e.isKrank) status = 'Krank';
    else if (e.isFeiertag) status = 'Gesetzlicher Feiertag';
    else if (e.isPersonalHoliday) status = 'Freier Tag (unbezahlt)';
    
    const pauseInfo = e.isPauseActive ? ` (Pause: ${e.pauseMinutes} Min.)` : '';
    
    return `${e.date}: ${status}${pauseInfo} - Arbeitszeit: ${formatMinutesToTime(stats.worked)} - Überstunden: ${formatMinutesToTime(stats.overtime)}`;
  }).join('\n');

  const prompt = `
    Hier sind die Arbeitszeitdaten für einen Monat. 
    Bitte erstelle eine kurze, freundliche Analyse auf Deutsch.
    Gehe auf Stärken, die Summe der Überstunden und Tipps für besseres Zeitmanagement ein.
    Die tägliche Sollarbeitszeit beträgt 5 Stunden und 50 Minuten (35 Stunden in 6 Tagen).
    Kategorien für bezahlte Abwesenheit sind: Urlaub, Krank und Gesetzliche Feiertage.
    Es gibt auch unbezahlte "Freie Tage" und tägliche Pausen.
    
    Daten:
    ${summary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Du bist ein intelligenter HR- und Zeitmanagement-Assistent, der dem Nutzer hilft, seine Arbeitszeitdaten zu analysieren."
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Leider ist derzeit keine KI-Analyse möglich.";
  }
};
