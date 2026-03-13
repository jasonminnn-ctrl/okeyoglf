
-- Add access_mode column to feature_overrides for 3-state visibility (enabled/locked/hidden)
ALTER TABLE public.feature_overrides
  ADD COLUMN IF NOT EXISTS access_mode text NOT NULL DEFAULT 'enabled';

-- Add INSERT, UPDATE, DELETE policies for feature_overrides via service_role
-- (Edge Function will use service_role key, so no client-side write needed)
