import { AppSettings, ChargingSession, DEFAULT_SETTINGS } from "./types";

export function calcSession(
  rawKwh: number,
  applyLosses: boolean,
  settings: AppSettings
) {
  const factor = applyLosses ? 1 + settings.lossPercent / 100 : 1;
  const adjustedKwh = rawKwh * factor;
  const cost = adjustedKwh * settings.pricePerKwh;
  return { adjustedKwh, cost };
}

export function isSameMonth(iso: string, ref = new Date()) {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
  );
}

/** Intervalo usado só nos gráficos (não altera os cards mensais). */
export type ChartTimeRange = "month" | "3months" | "all";

function toLocalYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Sessão incluída no intervalo escolhido (datas ISO yyyy-mm-dd). */
export function sessionMatchesChartRange(
  isoDate: string,
  range: ChartTimeRange,
  ref = new Date()
): boolean {
  if (range === "all") return true;
  if (range === "month") return isSameMonth(isoDate, ref);
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const start = new Date(y, m - 2, 1);
  const end = new Date(y, m + 1, 0);
  return isoDate >= toLocalYmd(start) && isoDate <= toLocalYmd(end);
}

export function monthLabel(d: Date = new Date()) {
  return d.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
}

export function exportCsv(sessions: ChargingSession[]) {
  const header = "Date,Raw kWh,Adjusted kWh,Losses,Cost (€)\n";
  const rows = sessions
    .map(
      (s) =>
        `${s.date},${s.rawKwh.toFixed(3)},${s.adjustedKwh.toFixed(3)},${
          s.lossesApplied ? "yes" : "no"
        },${s.cost.toFixed(2)}`
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ev-charging-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export { DEFAULT_SETTINGS };