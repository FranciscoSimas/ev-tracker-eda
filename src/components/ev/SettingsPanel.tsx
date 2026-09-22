import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AppSettings, ChargingSession, DEFAULT_SETTINGS, Vehicle } from "@/lib/types";
import { exportCsv } from "@/lib/storage";
import { Car, Download, LogOut, Moon, Sun, Trash2 } from "lucide-react";

interface Props {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void | Promise<void>;
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, "id" | "isDefault">) => void | Promise<void>;
  removeVehicle: (id: string) => void | Promise<void>;
  sessions: ChargingSession[];
  onClearAll: () => void | Promise<void>;
  onSignOut: () => void | Promise<void>;
}

export function SettingsPanel({
  settings,
  setSettings,
  vehicles,
  addVehicle,
  removeVehicle,
  sessions,
  onClearAll,
  onSignOut,
}: Props) {
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleBattery, setVehicleBattery] = useState("");
  const [vehicleConsumption, setVehicleConsumption] = useState("");

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings({ ...settings, [key]: value });
  }

  function computeEffectivePrice(basePricePerKwh: number, vatPercent?: number | null) {
    if (vatPercent == null || Number.isNaN(vatPercent)) return basePricePerKwh;
    return basePricePerKwh * (1 + vatPercent / 100);
  }

  async function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    const battery = parseFloat(vehicleBattery);
    const consumption = parseFloat(vehicleConsumption);
    if (!vehicleName.trim() || Number.isNaN(battery) || battery <= 0) return;
    await addVehicle({
      name: vehicleName.trim(),
      batteryCapacityKwh: battery,
      consumptionPer100km: vehicleConsumption && !Number.isNaN(consumption) ? consumption : null,
    });
    setVehicleName("");
    setVehicleBattery("");
    setVehicleConsumption("");
  }

  return (
    <Card className="p-4 space-y-5 border-border/60 shadow-[var(--shadow-soft)]">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Definições
        </h2>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Taxa fixa da energia (€ / kWh)</Label>
        <Input
          type="number"
          step="0.0001"
          inputMode="decimal"
          value={settings.basePricePerKwh}
          onChange={(e) => {
            const basePricePerKwh = parseFloat(e.target.value) || 0;
            setSettings({
              ...settings,
              basePricePerKwh,
              pricePerKwh: computeEffectivePrice(basePricePerKwh, settings.vatPercent),
            });
          }}
          className="h-11 tabular-nums"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">IVA (%)</Label>
        <Input
          type="number"
          step="0.1"
          inputMode="decimal"
          value={settings.vatPercent ?? ""}
          onChange={(e) => {
            const vatPercent = e.target.value === "" ? null : parseFloat(e.target.value);
            setSettings({
              ...settings,
              vatPercent,
              pricePerKwh: computeEffectivePrice(settings.basePricePerKwh, vatPercent),
            });
          }}
          className="h-11 tabular-nums"
          placeholder="Opcional"
        />
        <p className="text-xs text-muted-foreground">
          Custo real aplicado: <span className="font-semibold text-foreground">{settings.pricePerKwh.toFixed(4)} € / kWh</span>
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Perdas de carga (%)</Label>
        <Input
          type="number"
          step="1"
          inputMode="numeric"
          value={settings.lossPercent}
          onChange={(e) => update("lossPercent", parseFloat(e.target.value) || 0)}
          className="h-11 tabular-nums"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Consumo (kWh / 100 km)</Label>
        <Input
          type="number"
          step="0.1"
          inputMode="decimal"
          value={settings.consumptionPer100km}
          onChange={(e) => update("consumptionPer100km", parseFloat(e.target.value) || 0)}
          className="h-11 tabular-nums"
        />
      </div>

      <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
        <div className="flex items-center gap-2">
          {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <Label className="text-sm font-medium">Modo escuro</Label>
        </div>
        <Switch checked={settings.darkMode} onCheckedChange={(v) => update("darkMode", v)} />
      </div>

      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Car className="h-4 w-4" />
          Veículos
        </div>
        <form onSubmit={handleAddVehicle} className="space-y-2">
          <Input
            placeholder="Nome do veículo"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            className="h-10"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="0.1"
              inputMode="decimal"
              placeholder="Bateria (kWh)"
              value={vehicleBattery}
              onChange={(e) => setVehicleBattery(e.target.value)}
              className="h-10"
            />
            <Input
              type="number"
              step="0.1"
              inputMode="decimal"
              placeholder="Consumo kWh/100km"
              value={vehicleConsumption}
              onChange={(e) => setVehicleConsumption(e.target.value)}
              className="h-10"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full h-10">
            Adicionar veículo
          </Button>
        </form>

        <div className="space-y-2">
          {vehicles.length === 0 && (
            <p className="text-xs text-muted-foreground">Ainda não tens veículos registados.</p>
          )}
          {vehicles.map((vehicle) => {
            const isSelected = settings.selectedVehicleId === vehicle.id;
            return (
              <div key={vehicle.id} className="rounded-xl border border-border/70 p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{vehicle.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {vehicle.batteryCapacityKwh.toFixed(1)} kWh
                    {vehicle.consumptionPer100km != null ? ` · ${vehicle.consumptionPer100km.toFixed(1)} kWh/100km` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-8"
                    onClick={() => update("selectedVehicleId", vehicle.id)}
                  >
                    {isSelected ? "Selecionado" : "Selecionar"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeVehicle(vehicle.id)}
                    aria-label="Apagar veículo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full h-10"
          onClick={() => exportCsv(sessions)}
          disabled={sessions.length === 0}
        >
          <Download className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
        <Button variant="outline" className="w-full h-10" onClick={() => setSettings({ ...DEFAULT_SETTINGS, selectedVehicleId: settings.selectedVehicleId })}>
          Repor predefinições
        </Button>
        <Button
          variant="destructive"
          className="w-full h-10"
          onClick={onClearAll}
          disabled={sessions.length === 0}
        >
          Apagar todas as sessões
        </Button>
        <Button variant="secondary" className="w-full h-10" onClick={onSignOut}>
          <LogOut className="h-4 w-4 mr-2" /> Terminar sessão
        </Button>
      </div>
    </Card>
  );
}
