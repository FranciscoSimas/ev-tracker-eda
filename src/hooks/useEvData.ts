import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSettings, ChargingSession, DEFAULT_SETTINGS, Vehicle } from "@/lib/types";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

type DbSession = {
  id: string;
  date: string;
  raw_kwh: number | string;
  adjusted_kwh: number | string;
  cost: number | string;
  losses_applied: boolean;
  battery_start: number | null;
  battery_end: number | null;
  vehicle_id: string | null;
};

type DbVehicle = {
  id: string;
  name: string;
  battery_capacity_kwh: number | string;
  consumption_per_100km: number | string | null;
  is_default: boolean;
};

function fromDb(r: DbSession): ChargingSession {
  return {
    id: r.id,
    date: r.date,
    rawKwh: Number(r.raw_kwh),
    adjustedKwh: Number(r.adjusted_kwh),
    cost: Number(r.cost),
    lossesApplied: r.losses_applied,
    batteryStart: r.battery_start ?? undefined,
    batteryEnd: r.battery_end ?? undefined,
    vehicleId: r.vehicle_id,
  };
}

function fromVehicleDb(r: DbVehicle): Vehicle {
  return {
    id: r.id,
    name: r.name,
    batteryCapacityKwh: Number(r.battery_capacity_kwh),
    consumptionPer100km:
      r.consumption_per_100km === null ? null : Number(r.consumption_per_100km),
    isDefault: r.is_default,
  };
}

export function useEvData() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [s, st, v] = await Promise.all([
      supabase.from("charging_sessions").select("*").order("date", { ascending: false }),
      supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
    ]);
    if (s.error || st.error || v.error) {
      toast.error("Erro a carregar dados");
    }
    if (s.data) setSessions(s.data.map((row) => fromDb(row as DbSession)));
    if (v.data) setVehicles(v.data.map((row) => fromVehicleDb(row as DbVehicle)));
    if (st.data) {
      setSettingsState({
        pricePerKwh: Number(st.data.price_per_kwh),
        basePricePerKwh: Number(st.data.base_price_per_kwh ?? st.data.price_per_kwh),
        vatPercent: st.data.vat_percent == null ? null : Number(st.data.vat_percent),
        lossPercent: Number(st.data.loss_percent),
        consumptionPer100km: Number(st.data.consumption_per_100km),
        darkMode: st.data.dark_mode,
        selectedVehicleId: st.data.selected_vehicle_id ?? null,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const addSession = async (s: Omit<ChargingSession, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("charging_sessions")
      .insert({
        user_id: user.id,
        date: s.date,
        raw_kwh: s.rawKwh,
        adjusted_kwh: s.adjustedKwh,
        cost: s.cost,
        losses_applied: s.lossesApplied,
        battery_start: s.batteryStart ?? null,
        battery_end: s.batteryEnd ?? null,
        vehicle_id: s.vehicleId ?? null,
      })
      .select()
      .single();
    if (error) {
      toast.error("Erro a guardar sessão");
      return;
    }
    if (data) setSessions((prev) => [fromDb(data as DbSession), ...prev]);
  };

  const removeSession = async (id: string) => {
    const { error } = await supabase.from("charging_sessions").delete().eq("id", id);
    if (error) {
      toast.error("Erro a apagar");
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAll = async () => {
    if (!user) return;
    const { error } = await supabase.from("charging_sessions").delete().eq("user_id", user.id);
    if (error) {
      toast.error("Erro a apagar histórico");
      return;
    }
    setSessions([]);
  };

  const addVehicle = async (vehicle: Omit<Vehicle, "id" | "isDefault">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        user_id: user.id,
        name: vehicle.name,
        battery_capacity_kwh: vehicle.batteryCapacityKwh,
        consumption_per_100km: vehicle.consumptionPer100km ?? null,
      })
      .select()
      .single();
    if (error) {
      toast.error("Erro a guardar veículo");
      return;
    }
    if (data) setVehicles((prev) => [fromVehicleDb(data as DbVehicle), ...prev]);
  };

  const removeVehicle = async (id: string) => {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) {
      toast.error("Erro a apagar veículo");
      return;
    }
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
    if (settings.selectedVehicleId === id) {
      await setSettings({ ...settings, selectedVehicleId: null });
    }
  };

  const setSettings = async (next: AppSettings) => {
    if (!user) return;
    const effectivePricePerKwh =
      next.vatPercent == null
        ? next.basePricePerKwh
        : next.basePricePerKwh * (1 + next.vatPercent / 100);
    const normalizedSettings: AppSettings = {
      ...next,
      pricePerKwh: effectivePricePerKwh,
    };
    setSettingsState(normalizedSettings);
    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      price_per_kwh: normalizedSettings.pricePerKwh,
      base_price_per_kwh: normalizedSettings.basePricePerKwh,
      vat_percent: normalizedSettings.vatPercent ?? null,
      loss_percent: normalizedSettings.lossPercent,
      consumption_per_100km: normalizedSettings.consumptionPer100km,
      dark_mode: normalizedSettings.darkMode,
      selected_vehicle_id: normalizedSettings.selectedVehicleId ?? null,
    });
    if (error) toast.error("Erro a guardar definições");
  };

  return {
    sessions,
    vehicles,
    settings,
    loading,
    addSession,
    removeSession,
    clearAll,
    setSettings,
    addVehicle,
    removeVehicle,
  };
}