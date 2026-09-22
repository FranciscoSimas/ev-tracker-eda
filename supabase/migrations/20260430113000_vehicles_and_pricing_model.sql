-- Add vehicles support and split base energy price from VAT.

CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  battery_capacity_kwh NUMERIC(10,3) NOT NULL,
  consumption_per_100km NUMERIC(10,3),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vehicles_user_idx ON public.vehicles(user_id, created_at DESC);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can insert own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete own vehicles" ON public.vehicles;

CREATE POLICY "Users can view own vehicles" ON public.vehicles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles" ON public.vehicles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles" ON public.vehicles
  FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS vehicles_updated_at ON public.vehicles;
CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS base_price_per_kwh NUMERIC(10,4),
  ADD COLUMN IF NOT EXISTS vat_percent NUMERIC(6,3),
  ADD COLUMN IF NOT EXISTS selected_vehicle_id UUID;

UPDATE public.user_settings
SET base_price_per_kwh = COALESCE(base_price_per_kwh, price_per_kwh, 0.1082);

ALTER TABLE public.user_settings
  ALTER COLUMN base_price_per_kwh SET NOT NULL;

ALTER TABLE public.user_settings
  ALTER COLUMN base_price_per_kwh SET DEFAULT 0.1082;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_settings_selected_vehicle_fkey'
  ) THEN
    ALTER TABLE public.user_settings
      ADD CONSTRAINT user_settings_selected_vehicle_fkey
      FOREIGN KEY (selected_vehicle_id)
      REFERENCES public.vehicles(id)
      ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.charging_sessions
  ADD COLUMN IF NOT EXISTS vehicle_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'charging_sessions_vehicle_fkey'
  ) THEN
    ALTER TABLE public.charging_sessions
      ADD CONSTRAINT charging_sessions_vehicle_fkey
      FOREIGN KEY (vehicle_id)
      REFERENCES public.vehicles(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS charging_sessions_vehicle_idx
  ON public.charging_sessions(user_id, vehicle_id, date DESC);
