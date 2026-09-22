import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AppSettings, ChargingSession, Vehicle } from "@/lib/types";
import { Fuel, Zap } from "lucide-react";

interface Props {
  settings: AppSettings;
  selectedVehicle: Vehicle | null;
  sessions: ChargingSession[];
}

type EvMode = "mine" | "custom";
type KmMode = "sessions" | "custom";

const STORAGE_KEY = "ev-fuel-compare";

type Saved = {
  evMode: EvMode;
  customEvPrice: string;
  customEvConsumption: string;
  fuelPrice: string;
  fuelConsumption: string;
  kmMode: KmMode;
  customKm: string;
};

const DEFAULTS: Saved = {
  evMode: "mine",
  customEvPrice: "",
  customEvConsumption: "",
  fuelPrice: "1.65",
  fuelConsumption: "6.5",
  kmMode: "sessions",
  customKm: "",
};

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function FuelCompare({ settings, selectedVehicle, sessions }: Props) {
  const [saved, setSaved] = useState<Saved>(() =>
    typeof window === "undefined" ? DEFAULTS : loadSaved()
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  function patch(partial: Partial<Saved>) {
    setSaved((prev) => ({ ...prev, ...partial }));
  }

  const minePrice = settings.pricePerKwh;
  const mineConsumption =
    selectedVehicle?.consumptionPer100km ?? settings.consumptionPer100km;

  const evPrice =
    saved.evMode === "mine"
      ? minePrice
      : parseFloat(saved.customEvPrice) || minePrice;
  const evConsumption =
    saved.evMode === "mine"
      ? mineConsumption
      : parseFloat(saved.customEvConsumption) || mineConsumption;

  const fuelPrice = parseFloat(saved.fuelPrice) || 0;
  const fuelConsumption = parseFloat(saved.fuelConsumption) || 0;

  const evPer100 = evPrice * evConsumption;
  const fuelPer100 = fuelPrice * fuelConsumption;
  const savePer100 = fuelPer100 - evPer100;

  const sessionKwh = useMemo(
    () => sessions.reduce((a, s) => a + s.adjustedKwh, 0),
    [sessions]
  );
  const sessionCost = useMemo(
    () => sessions.reduce((a, s) => a + s.cost, 0),
    [sessions]
  );

  const estimatedKm =
    evConsumption > 0 ? (sessionKwh / evConsumption) * 100 : 0;

  const km =
    saved.kmMode === "sessions"
      ? estimatedKm
      : parseFloat(saved.customKm) || 0;

  const evTotal = (evPer100 / 100) * km;
  const fuelTotal = (fuelPer100 / 100) * km;
  const saveTotal = fuelTotal - evTotal;

  return (
    <Card
      className="p-4 space-y-4 border-border/60 shadow-[var(--shadow-soft)]"
      style={{ background: "var(--gradient-card)" }}
    >
      <div>
        <h3 className="text-sm font-semibold">EV vs combustão</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Compara o custo por 100 km e a poupança no período
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/70 p-3 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Zap className="h-3.5 w-3.5 text-primary" />
            EV
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={saved.evMode === "mine" ? "default" : "outline"}
              className="h-7 text-[11px] flex-1 px-1"
              onClick={() => patch({ evMode: "mine" })}
            >
              Meus dados
            </Button>
            <Button
              type="button"
              size="sm"
              variant={saved.evMode === "custom" ? "default" : "outline"}
              className="h-7 text-[11px] flex-1 px-1"
              onClick={() =>
                patch({
                  evMode: "custom",
                  customEvPrice: saved.customEvPrice || String(minePrice),
                  customEvConsumption:
                    saved.customEvConsumption || String(mineConsumption),
                })
              }
            >
              Custom
            </Button>
          </div>
          {saved.evMode === "mine" ? (
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="text-foreground font-medium tabular-nums">
                  {minePrice.toFixed(4)} €
                </span>{" "}
                / kWh
              </p>
              <p>
                <span className="text-foreground font-medium tabular-nums">
                  {mineConsumption.toFixed(1)}
                </span>{" "}
                kWh / 100 km
                {selectedVehicle ? ` · ${selectedVehicle.name}` : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">€ / kWh</Label>
                <Input
                  type="number"
                  step="0.0001"
                  inputMode="decimal"
                  value={saved.customEvPrice}
                  onChange={(e) => patch({ customEvPrice: e.target.value })}
                  className="h-9 tabular-nums"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">kWh / 100 km</Label>
                <Input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={saved.customEvConsumption}
                  onChange={(e) => patch({ customEvConsumption: e.target.value })}
                  className="h-9 tabular-nums"
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/70 p-3 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Fuel className="h-3.5 w-3.5" />
            Combustão
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">€ / L</Label>
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={saved.fuelPrice}
                onChange={(e) => patch({ fuelPrice: e.target.value })}
                className="h-9 tabular-nums"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">L / 100 km</Label>
              <Input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={saved.fuelConsumption}
                onChange={(e) => patch({ fuelConsumption: e.target.value })}
                className="h-9 tabular-nums"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">EV / 100 km</p>
          <p className="text-lg font-semibold tabular-nums mt-0.5">{evPer100.toFixed(2)} €</p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Comb. / 100 km</p>
          <p className="text-lg font-semibold tabular-nums mt-0.5">{fuelPer100.toFixed(2)} €</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Poupas</p>
          <p
            className={`text-lg font-semibold tabular-nums mt-0.5 ${
              savePer100 >= 0 ? "text-primary" : "text-destructive"
            }`}
          >
            {savePer100 >= 0 ? "+" : ""}
            {savePer100.toFixed(2)} €
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-border/60 pt-3">
        <p className="text-xs font-medium">Poupança no período</p>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={saved.kmMode === "sessions" ? "default" : "outline"}
            className="h-8 text-[11px] flex-1"
            onClick={() => patch({ kmMode: "sessions" })}
          >
            Dos carregamentos
          </Button>
          <Button
            type="button"
            size="sm"
            variant={saved.kmMode === "custom" ? "default" : "outline"}
            className="h-8 text-[11px] flex-1"
            onClick={() => patch({ kmMode: "custom" })}
          >
            Km custom
          </Button>
        </div>

        {saved.kmMode === "sessions" ? (
          <p className="text-xs text-muted-foreground">
            {sessionKwh.toFixed(1)} kWh carregados ≈{" "}
            <span className="text-foreground font-medium tabular-nums">
              {estimatedKm.toFixed(0)} km
            </span>
            {sessions.length === 0 && " (ainda sem sessões filtradas)"}
          </p>
        ) : (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Quilómetros</Label>
            <Input
              type="number"
              step="1"
              inputMode="numeric"
              value={saved.customKm}
              onChange={(e) => patch({ customKm: e.target.value })}
              className="h-9 tabular-nums"
              placeholder="ex. 1000"
            />
          </div>
        )}

        {km > 0 && (
          <div className="rounded-xl border border-border/60 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Custo EV</span>
              <span className="font-semibold tabular-nums">
                {saved.kmMode === "sessions" && sessionCost > 0
                  ? `${sessionCost.toFixed(2)} €`
                  : `${evTotal.toFixed(2)} €`}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Custo combustão</span>
              <span className="font-semibold tabular-nums">{fuelTotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between gap-2 border-t border-border/50 pt-1.5">
              <span className="font-medium">Poupança</span>
              <span
                className={`font-semibold tabular-nums ${
                  (saved.kmMode === "sessions" && sessionCost > 0
                    ? fuelTotal - sessionCost
                    : saveTotal) >= 0
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {(
                  saved.kmMode === "sessions" && sessionCost > 0
                    ? fuelTotal - sessionCost
                    : saveTotal
                ).toFixed(2)}{" "}
                €
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
