import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Download, Moon, Sun } from "lucide-react";
import { AppSettings, ChargingSession, DEFAULT_SETTINGS } from "@/lib/types";
import { exportCsv } from "@/lib/storage";

interface Props {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void | Promise<void>;
  sessions: ChargingSession[];
  onClearAll: () => void | Promise<void>;
}

export function SettingsSheet({ settings, setSettings, sessions, onClearAll }: Props) {
  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings({ ...settings, [key]: value });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Definições">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Definições</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs">Preço real por kWh (€)</Label>
            <Input
              type="number" step="0.0001" inputMode="decimal"
              value={settings.pricePerKwh}
              onChange={(e) => update("pricePerKwh", parseFloat(e.target.value) || 0)}
              className="h-12 text-lg tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              Base EDA Vazio: 0,1082 € · IVA misto (4% + 16%) ≈ 0,118 €
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Perdas de carga (%)</Label>
            <Input
              type="number" step="1" inputMode="numeric"
              value={settings.lossPercent}
              onChange={(e) => update("lossPercent", parseFloat(e.target.value) || 0)}
              className="h-12 tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Consumo (kWh / 100 km)</Label>
            <Input
              type="number" step="0.1" inputMode="decimal"
              value={settings.consumptionPer100km}
              onChange={(e) => update("consumptionPer100km", parseFloat(e.target.value) || 0)}
              className="h-12 tabular-nums"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
            <div className="flex items-center gap-2">
              {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Label className="text-sm font-medium">Modo escuro</Label>
            </div>
            <Switch checked={settings.darkMode} onCheckedChange={(v) => update("darkMode", v)} />
          </div>

          <div className="pt-4 border-t space-y-2">
            <Button variant="outline" className="w-full h-11" onClick={() => exportCsv(sessions)} disabled={sessions.length === 0}>
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
            <Button variant="outline" className="w-full h-11" onClick={() => setSettings(DEFAULT_SETTINGS)}>
              Repor predefinições
            </Button>
            <Button variant="destructive" className="w-full h-11" onClick={onClearAll} disabled={sessions.length === 0}>
              Apagar todas as sessões
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}