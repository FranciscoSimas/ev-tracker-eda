import { Card } from "@/components/ui/card";
import { ChargingSession } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  sessions: ChargingSession[];
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function WeekdayChart({ sessions }: Props) {
  const buckets = WEEKDAYS.map((label) => ({
    label,
    cost: 0,
    kwh: 0,
    count: 0,
  }));

  for (const s of sessions) {
    const day = new Date(s.date + "T12:00:00").getDay();
    buckets[day].cost += s.cost;
    buckets[day].kwh += s.adjustedKwh;
    buckets[day].count += 1;
  }

  const data = buckets.map((b) => ({
    ...b,
    cost: +b.cost.toFixed(2),
    kwh: +b.kwh.toFixed(2),
    avg: b.count ? +(b.cost / b.count).toFixed(2) : 0,
  }));

  const hasData = data.some((d) => d.count > 0);

  return (
    <Card
      className="p-4 border-border/60 shadow-[var(--shadow-soft)]"
      style={{ background: "var(--gradient-card)" }}
    >
      <h3 className="text-xs font-medium text-muted-foreground mb-1">
        Custo médio por dia da semana
      </h3>
      <p className="text-[11px] text-muted-foreground mb-3">
        Em que dias costumas gastar mais a carregar
      </p>
      {!hasData ? (
        <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
          Sem dados ainda.
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
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
                  if (name === "avg") return [`${v.toFixed(2)} €`, "Média / sessão"];
                  if (name === "cost") return [`${v.toFixed(2)} €`, "Total"];
                  return [v, name];
                }}
                labelFormatter={(label, payload) => {
                  const count = (payload?.[0]?.payload as { count?: number } | undefined)?.count ?? 0;
                  return `${label} · ${count} sessão${count === 1 ? "" : "s"}`;
                }}
              />
              <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
