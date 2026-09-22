import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChargingSession } from "@/lib/types";
import { Trash2, Battery } from "lucide-react";

interface Props {
  sessions: ChargingSession[];
  onDelete: (id: string) => void;
}

export function SessionList({ sessions, onDelete }: Props) {
  if (sessions.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground border-dashed">
        <p className="text-sm">Sem sessões registadas ainda.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => {
        const date = new Date(s.date).toLocaleDateString("pt-PT", {
          day: "2-digit",
          month: "short",
        });
        return (
          <Card
            key={s.id}
            className="p-3 flex items-center gap-3 border-border/60 shadow-[var(--shadow-soft)]"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center">
              <span className="text-[10px] font-medium uppercase">{date.split(" ")[1]}</span>
              <span className="text-sm font-bold leading-none">{date.split(" ")[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold tabular-nums">{s.adjustedKwh.toFixed(2)} kWh</span>
                {s.lossesApplied && (
                  <span className="text-[10px] text-muted-foreground">(+perdas)</span>
                )}
              </div>
              {(s.batteryStart != null || s.batteryEnd != null) && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Battery className="h-3 w-3" />
                  {s.batteryStart ?? "–"}% → {s.batteryEnd ?? "–"}%
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-semibold tabular-nums">{s.cost.toFixed(2)} €</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(s.id)}
              aria-label="Apagar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        );
      })}
    </div>
  );
}