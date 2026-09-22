import { Card } from "@/components/ui/card";
import { ChargingSession } from "@/lib/types";
import { monthlyTotals } from "@/lib/storage";
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
  metric?: "cost" | "kwh";
  title?: string;
}

export function MonthBarChart({
  sessions,
  metric = "cost",
  title = "Custo por mês (€)",
}: Props) {
  const data = monthlyTotals(sessions, 12);

  return (
    <Card
      className="p-4 border-border/60 shadow-[var(--shadow-soft)]"
      style={{ background: "var(--gradient-card)" }}
    >
      <h3 className="text-xs font-medium text-muted-foreground mb-3">{title}</h3>
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
          Sem dados ainda.
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="shortLabel"
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
                formatter={(v: number) => [
                  metric === "cost" ? `${v.toFixed(2)} €` : `${v.toFixed(1)} kWh`,
                  metric === "cost" ? "Custo" : "kWh",
                ]}
                labelFormatter={(_, payload) =>
                  (payload?.[0]?.payload as { label?: string } | undefined)?.label ?? ""
                }
              />
              <Bar
                dataKey={metric}
                fill={metric === "cost" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
