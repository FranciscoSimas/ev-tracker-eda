export interface ChargingSession {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  rawKwh: number;
  adjustedKwh: number;
  cost: number;
  lossesApplied: boolean;
  batteryStart?: number;
  batteryEnd?: number;
  vehicleId?: string | null;
}

export interface Vehicle {
  id: string;
  name: string;
  batteryCapacityKwh: number;
  consumptionPer100km?: number | null;
  isDefault: boolean;
}

export interface AppSettings {
  basePricePerKwh: number;
  vatPercent?: number | null;
  pricePerKwh: number;
  lossPercent: number; // e.g. 10 means 10%
  consumptionPer100km: number;
  darkMode: boolean;
  selectedVehicleId?: string | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  basePricePerKwh: 0.1082,
  vatPercent: null,
  pricePerKwh: 0.1082,
  lossPercent: 10,
  consumptionPer100km: 16,
  darkMode: false,
  selectedVehicleId: null,
};