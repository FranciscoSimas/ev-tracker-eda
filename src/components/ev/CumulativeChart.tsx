import { Card } from "@/components/ui/card";
import { ChargingSession } from "@/lib/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  sessions: ChargingSession[];
}

export function CumulativeChart({ sessions }: Props) {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;
  const data = sorted.map((s) => {
    running += s.cost;
    const d = new Date(s.date + "T12:00:00");
    return {
      date: d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }),
      fullDate: d.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      total: +running.toFixed(2),
      session: +s.cost.toFixed(2),
      kwh: +s.adjustedKwh.toFixed(2),
    };
  });

  return (
    <Card
      className="p-4 border-border/60 shadow-[var(--shadow-soft)]"
      style={{ background: "var(--gradient-card)" }}
    >
      <h3 className="text-xs font-medium text-muted-foreground mb-1">Custo acumulado</h3>
      <p className="text-[11px] text-muted-foreground mb-3">
        Total gasto ao longo do tempo
        {data.length ? ` · agora ${data[data.length - 1].total.toFixed(2)} €` : ""}
      </p>
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
          Sem dados ainda.
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-cumul" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number, name: string) => {
                  if (name === "total") return [`${v.toFixed(2)} €`, "Acumulado"];
                  return [v, name];
                }}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload as
                    | { fullDate?: string; session?: number; kwh?: number }
                    | undefined;
                  if (!p) return "";
                  return `${p.fullDate} · sessão ${p.session?.toFixed(2)} € · ${p.kwh?.toFixed(1)} kWh`;
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#grad-cumul)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
