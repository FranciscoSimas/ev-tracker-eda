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

type Point = {
  date: string;
  fullDate: string;
  total: number;
  totalKwh: number;
  session: number;
  kwh: number;
};

function CumulativeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-md space-y-0.5">
      <p className="font-medium text-foreground">{p.fullDate}</p>
      <p className="tabular-nums text-muted-foreground">
        Acumulado:{" "}
        <span className="text-foreground font-semibold">{p.total.toFixed(2)} €</span>
      </p>
      <p className="tabular-nums text-muted-foreground">
        kWh acumulados:{" "}
        <span className="text-foreground font-semibold">{p.totalKwh.toFixed(1)} kWh</span>
      </p>
      <p className="tabular-nums text-muted-foreground pt-0.5 border-t border-border/60 mt-1">
        Nesta sessão: {p.session.toFixed(2)} € · {p.kwh.toFixed(2)} kWh
      </p>
    </div>
  );
}

export function CumulativeChart({ sessions }: Props) {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  let runningCost = 0;
  let runningKwh = 0;
  const data: Point[] = sorted.map((s) => {
    runningCost += s.cost;
    runningKwh += s.adjustedKwh;
    const d = new Date(s.date + "T12:00:00");
    return {
      date: d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }),
      fullDate: d.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      total: +runningCost.toFixed(2),
      totalKwh: +runningKwh.toFixed(2),
      session: +s.cost.toFixed(2),
      kwh: +s.adjustedKwh.toFixed(2),
    };
  });

  const last = data[data.length - 1];

  return (
    <Card
      className="p-4 border-border/60 shadow-[var(--shadow-soft)]"
      style={{ background: "var(--gradient-card)" }}
    >
      <h3 className="text-xs font-medium text-muted-foreground mb-1">Custo acumulado</h3>
      <p className="text-[11px] text-muted-foreground mb-3">
        Total gasto ao longo do tempo
        {last
          ? ` · agora ${last.total.toFixed(2)} € · ${last.totalKwh.toFixed(1)} kWh`
          : ""}
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
              <Tooltip content={<CumulativeTooltip />} />
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
