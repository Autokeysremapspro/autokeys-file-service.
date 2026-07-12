-- =========================================================
-- AK CLOUD — Onboarding de plan al primer acceso (v23)
-- Marca si el distribuidor ya pasó por la ventana de "elige tu plan"
-- la primera vez que entra al dashboard.
-- =========================================================

alter table public.akcloud_distribuidores add column if not exists onboarding_completado boolean default false;

notify pgrst, 'reload schema';
