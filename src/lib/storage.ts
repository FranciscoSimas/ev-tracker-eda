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
  const d = new Date(iso + "T12:00:00");
  return (
    d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
  );
}

export function monthKeyFromDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthKeyFromIso(iso: string) {
  return iso.slice(0, 7);
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function shiftMonth(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function monthLabel(d: Date = new Date()) {
  return d.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
}

export function monthLabelFromKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  return monthLabel(new Date(y, m - 1, 1));
}

export type MonthGroup = {
  key: string;
  label: string;
  sessions: ChargingSession[];
  totalCost: number;
  totalKwh: number;
};

export function groupSessionsByMonth(sessions: ChargingSession[]): MonthGroup[] {
  const map = new Map<string, ChargingSession[]>();
  for (const s of sessions) {
    const key = monthKeyFromIso(s.date);
    const list = map.get(key);
    if (list) list.push(s);
    else map.set(key, [s]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, list]) => {
      const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
      return {
        key,
        label: monthLabelFromKey(key),
        sessions: sorted,
        totalCost: sorted.reduce((a, s) => a + s.cost, 0),
        totalKwh: sorted.reduce((a, s) => a + s.adjustedKwh, 0),
      };
    });
}

export type MonthlyTotal = {
  key: string;
  label: string;
  shortLabel: string;
  cost: number;
  kwh: number;
  count: number;
};

export function monthlyTotals(
  sessions: ChargingSession[],
  limitMonths = 12
): MonthlyTotal[] {
  const groups = groupSessionsByMonth(sessions);
  return groups.slice(0, limitMonths).reverse().map((g) => {
    const [y, m] = g.key.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    return {
      key: g.key,
      label: g.label,
      shortLabel: d.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" }),
      cost: +g.totalCost.toFixed(2),
      kwh: +g.totalKwh.toFixed(2),
      count: g.sessions.length,
    };
  });
}

export { DEFAULT_SETTINGS };
