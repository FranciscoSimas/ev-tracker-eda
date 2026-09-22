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

export function CostChart({ sessions, metric, title }: Props) {
  const data = [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({
      date: new Date(s.date).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
      }),
      cost: +s.cost.toFixed(2),
      kwh: +s.adjustedKwh.toFixed(2),
    }));

  return (
    <Card
      className="p-4 border-border/60 shadow-[var(--shadow-soft)]"
      style={{ background: "var(--gradient-card)" }}
    >
      <h3 className="text-xs font-medium text-muted-foreground mb-3">{title}</h3>
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
          Sem dados para este mês.
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
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v: number, name) => [
                name === "cost" ? `${v.toFixed(2)} €` : `${v.toFixed(2)} kWh`,
                name === "cost" ? "Custo" : "kWh",
              ]}
            />
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