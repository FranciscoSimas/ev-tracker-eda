import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, hint, icon, accent, className }: Props) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-4 border-border/60 shadow-[var(--shadow-soft)]",
        accent && "text-primary-foreground border-transparent",
        className
      )}
      style={accent ? { background: "var(--gradient-primary)" } : { background: "var(--gradient-card)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn("text-xs font-medium uppercase tracking-wide", accent ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums truncate">
            {value}
          </p>
          {hint && (
            <p className={cn("text-xs mt-0.5", accent ? "text-primary-foreground/70" : "text-muted-foreground")}>
              {hint}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("rounded-full p-2", accent ? "bg-white/20" : "bg-primary/10 text-primary")}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}