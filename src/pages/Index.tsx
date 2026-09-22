import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSameMonth, monthLabel, sessionMatchesChartRange, type ChartTimeRange } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { useEvData } from "@/hooks/useEvData";
import { SessionForm } from "@/components/ev/SessionForm";
import { SessionList } from "@/components/ev/SessionList";
import { StatCard } from "@/components/ev/StatCard";
import { CostChart } from "@/components/ev/CostChart";
import { SettingsPanel } from "@/components/ev/SettingsPanel";
import { Zap, Euro, BatteryCharging, Route, Plus, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Tab = "dashboard" | "history" | "settings";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { sessions, vehicles, settings, addSession, removeSession, clearAll, setSettings, addVehicle, removeVehicle } = useEvData();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [chartTimeRange, setChartTimeRange] = useState<ChartTimeRange>("month");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  const sorted = useMemo(
    () => [...sessions].sort((a, b) => b.date.localeCompare(a.date)),
    [sessions]
  );

  const monthSessions = useMemo(
    () => sessions.filter((s) => isSameMonth(s.date)),
    [sessions]
  );

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === settings.selectedVehicleId) ?? null,
    [vehicles, settings.selectedVehicleId]
  );

  const filteredMonthSessions = useMemo(() => {
    if (!settings.selectedVehicleId) return monthSessions;
    return monthSessions.filter((session) => session.vehicleId === settings.selectedVehicleId);
  }, [monthSessions, settings.selectedVehicleId]);

  /** Sessões para gráficos: mesmo filtro de veículo que o dashboard, mas intervalo de datas escolhido. */
  const chartSessions = useMemo(() => {
    const byVehicle = settings.selectedVehicleId
      ? sessions.filter((s) => s.vehicleId === settings.selectedVehicleId)
      : sessions;
    return byVehicle.filter((s) => sessionMatchesChartRange(s.date, chartTimeRange));
  }, [sessions, settings.selectedVehicleId, chartTimeRange]);

  const totalCost = filteredMonthSessions.reduce((a, s) => a + s.cost, 0);
  const totalKwh = filteredMonthSessions.reduce((a, s) => a + s.adjustedKwh, 0);
  const totalRawKwh = filteredMonthSessions.reduce((a, s) => a + s.rawKwh, 0);
  const totalLostKwh = filteredMonthSessions.reduce((a, s) => a + (s.adjustedKwh - s.rawKwh), 0);
  const avgPerSession = filteredMonthSessions.length ? totalCost / filteredMonthSessions.length : 0;
  const consumptionPer100km = selectedVehicle?.consumptionPer100km ?? settings.consumptionPer100km;
  const costPer100km = consumptionPer100km * settings.pricePerKwh;

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">A carregar…</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-auto pb-20">
        <main className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-4">
          <section className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">EV Charger</h1>
              <p className="text-sm text-muted-foreground">{monthLabel()}</p>
            </div>
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full gap-1.5 h-9 px-4">
                  <Plus className="h-4 w-4" /> Charge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Registar sessão</DialogTitle>
                </DialogHeader>
                <SessionForm
                  settings={settings}
                  selectedVehicle={selectedVehicle}
                  onAdd={addSession}
                  onSubmitted={() => setAddModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </section>

          {activeTab === "dashboard" && (
            <>
              <section className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Veículo selecionado</p>
                <Select
                  value={settings.selectedVehicleId ?? "all"}
                  onValueChange={(value) =>
                    setSettings({ ...settings, selectedVehicleId: value === "all" ? null : value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecionar veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os veículos</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Monthly Cost"
                  value={`€${totalCost.toFixed(2)}`}
                  hint={`${filteredMonthSessions.length} sessão${filteredMonthSessions.length === 1 ? "" : "s"}`}
                  icon={<Euro className="h-4 w-4" />}
                  accent
                />
                <Card className="p-4 border-border/60 shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-card)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Monthly kWh
                      </p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums truncate">
                        {totalKwh.toFixed(1)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Real {totalRawKwh.toFixed(1)} · Perdas {totalLostKwh.toFixed(1)}
                      </p>
                    </div>
                    <div className="rounded-full p-2 bg-primary/10 text-primary">
                      <Zap className="h-4 w-4" />
                    </div>
                  </div>
                </Card>
                <StatCard
                  label="Avg / Session"
                  value={`€${avgPerSession.toFixed(2)}`}
                  icon={<BatteryCharging className="h-4 w-4" />}
                />
                <StatCard
                  label="Cost / 100km"
                  value={`€${costPer100km.toFixed(2)}`}
                  hint={`${consumptionPer100km} kWh/100km`}
                  icon={<Route className="h-4 w-4" />}
                />
              </section>

              <section className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Gráficos · período</p>
                <Select
                  value={chartTimeRange}
                  onValueChange={(value) => setChartTimeRange(value as ChartTimeRange)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mês atual</SelectItem>
                    <SelectItem value="3months">Últimos 3 meses</SelectItem>
                    <SelectItem value="all">Total</SelectItem>
                  </SelectContent>
                </Select>
              </section>

              <CostChart sessions={chartSessions} metric="cost" title="Cost over time (€)" />
              <CostChart sessions={chartSessions} metric="kwh" title="Energy over time (kWh)" />
            </>
          )}

          {activeTab === "history" && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Histórico
                </h2>
                <span className="text-xs text-muted-foreground">{sessions.length} total</span>
              </div>
              <SessionList sessions={sorted} onDelete={removeSession} />
            </section>
          )}

          {activeTab === "settings" && (
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
              vehicles={vehicles}
              addVehicle={addVehicle}
              removeVehicle={removeVehicle}
              sessions={sessions}
              onClearAll={clearAll}
              onSignOut={signOut}
            />
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === "dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="h-5 w-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === "history" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-5 w-5" />
            <span className="text-[10px] font-medium">History</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === "settings" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
