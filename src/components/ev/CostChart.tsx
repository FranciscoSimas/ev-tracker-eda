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
  metric: "cost" | "kwh";
  title: string;
}

type Point = {
  date: string;
  fullDate: string;
  cost: number;
  kwh: number;
};

function SessionTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div
      className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-md space-y-0.5"
    >
      <p className="font-medium text-foreground">{p.fullDate}</p>
      <p className="tabular-nums text-muted-foreground">
        Custo: <span className="text-foreground font-semibold">{p.cost.toFixed(2)} €</span>
      </p>
      <p className="tabular-nums text-muted-foreground">
        Energia: <span className="text-foreground font-semibold">{p.kwh.toFixed(2)} kWh</span>
      </p>
    </div>
  );
}

export function CostChart({ sessions, metric, title }: Props) {
  const data: Point[] = [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => {
      const d = new Date(s.date + "T12:00:00");
      return {
        date: d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }),
        fullDate: d.toLocaleDateString("pt-PT", {
          weekday: "short",
          day: "2-digit",
          month: "long",
        }),
        cost: +s.cost.toFixed(2),
        kwh: +s.adjustedKwh.toFixed(2),
      };
    });

  return (
    <Card
      className="p-4 border-border/60 shadow-[var(--shadow-soft)]"
      style={{ background: "var(--gradient-card)" }}
    >
      <h3 className="text-xs font-medium text-muted-foreground mb-3">{title}</h3>
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
          Sem dados neste período.
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={metric === "cost" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={metric === "cost" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                    stopOpacity={0}
                  />
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
              <Tooltip content={<SessionTooltip />} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={metric === "cost" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                strokeWidth={2}
                fill={`url(#grad-${metric})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
