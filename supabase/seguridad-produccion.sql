-- Cuenta única: cada persona accede solo a su perfil y a su respaldo.
begin;
alter table public.rehab_profiles enable row level security;
alter table public.rehab_user_backups enable row level security;
revoke all on public.rehab_profiles, public.rehab_user_backups from anon;
revoke update on public.rehab_profiles from authenticated;
grant update (full_name, specialty, age, weight_kg, height_cm) on public.rehab_profiles to authenticated;
commit;
