import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { AppSettings, ChargingSession, Vehicle } from "@/lib/types";
import { calcSession } from "@/lib/storage";
import { toast } from "sonner";

interface Props {
  settings: AppSettings;
  selectedVehicle?: Vehicle | null;
  onAdd: (s: Omit<ChargingSession, "id">) => void | Promise<void>;
  onSubmitted?: () => void;
}

export function SessionForm({ settings, selectedVehicle, onAdd, onSubmitted }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [kwh, setKwh] = useState("");
  const [batStart, setBatStart] = useState("");
  const [batEnd, setBatEnd] = useState("");
  const [losses, setLosses] = useState(true);

  const rawKwh = parseFloat(kwh) || 0;
  const preview = calcSession(rawKwh, losses, settings);
  const startPct = parseFloat(batStart);
  const endPct = parseFloat(batEnd);

  const estimatedFromBattery = useMemo(() => {
    if (!selectedVehicle?.batteryCapacityKwh) return null;
    if (Number.isNaN(startPct) || Number.isNaN(endPct)) return null;
    const deltaPct = endPct - startPct;
    if (deltaPct <= 0) return null;
    const estimated = selectedVehicle.batteryCapacityKwh * (deltaPct / 100);
    return estimated > 0 ? estimated : null;
  }, [selectedVehicle?.batteryCapacityKwh, startPct, endPct]);

  useEffect(() => {
    if (estimatedFromBattery == null) return;
    setKwh(estimatedFromBattery.toFixed(2));
  }, [estimatedFromBattery]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawKwh || rawKwh <= 0) {
      toast.error("Insira os kWh carregados");
      return;
    }
    const session: Omit<ChargingSession, "id"> = {
      date,
      rawKwh,
      adjustedKwh: preview.adjustedKwh,
      cost: preview.cost,
      lossesApplied: losses,
      batteryStart: batStart ? parseFloat(batStart) : undefined,
      batteryEnd: batEnd ? parseFloat(batEnd) : undefined,
      vehicleId: settings.selectedVehicleId ?? null,
    };
    await onAdd(session);
    toast.success(`Sessão registada · ${preview.cost.toFixed(2)} €`);
    setKwh("");
    setBatStart("");
    setBatEnd("");
    setDate(today);
    onSubmitted?.();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-xs">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kwh" className="text-xs">kWh carregados</Label>
            <Input
              id="kwh"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              value={kwh}
              onChange={(e) => setKwh(e.target.value)}
              className="h-12 text-lg font-semibold tabular-nums"
            />
            {estimatedFromBattery != null && (
              <p className="text-[11px] text-muted-foreground">
                Estimativa automática: {estimatedFromBattery.toFixed(2)} kWh
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="bs" className="text-xs text-muted-foreground">Bateria início % (opc.)</Label>
            <Input id="bs" type="number" min="0" max="100" inputMode="numeric"
              value={batStart} onChange={(e) => setBatStart(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="be" className="text-xs text-muted-foreground">Bateria fim % (opc.)</Label>
            <Input id="be" type="number" min="0" max="100" inputMode="numeric"
              value={batEnd} onChange={(e) => setBatEnd(e.target.value)} className="h-11" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
          <div>
            <Label htmlFor="losses" className="text-sm font-medium">Perdas de carga ({settings.lossPercent}%)</Label>
            <p className="text-xs text-muted-foreground">Aplica fator ao kWh real</p>
          </div>
          <Switch id="losses" checked={losses} onCheckedChange={setLosses} />
        </div>

        {rawKwh > 0 && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {preview.adjustedKwh.toFixed(2)} kWh × {settings.pricePerKwh.toFixed(4)} €
            </div>
            <div className="text-lg font-semibold text-primary tabular-nums">
              {preview.cost.toFixed(2)} €
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base font-semibold shadow-[var(--shadow-glow)]">
          <Plus className="h-5 w-5 mr-1" /> Registar sessão
        </Button>
      </form>
  );
}