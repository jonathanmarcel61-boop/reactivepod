-- RehabPod V47: datos opcionales del registro.
-- No intervienen en autorización ni cambian los entrenamientos actuales.

alter table public.rehab_profiles
  add column if not exists age smallint null,
  add column if not exists weight_kg numeric(5,1) null,
  add column if not exists height_cm numeric(5,1) null;

alter table public.rehab_profiles
  drop constraint if exists rehab_profiles_age_range,
  add constraint rehab_profiles_age_range check (age is null or age between 5 and 100),
  drop constraint if exists rehab_profiles_weight_range,
  add constraint rehab_profiles_weight_range check (weight_kg is null or weight_kg between 20 and 300),
  drop constraint if exists rehab_profiles_height_range,
  add constraint rehab_profiles_height_range check (height_cm is null or height_cm between 80 and 230);

grant select (age, weight_kg, height_cm) on table public.rehab_profiles to authenticated;
grant update (age, weight_kg, height_cm) on table public.rehab_profiles to authenticated;

comment on column public.rehab_profiles.age is 'Edad opcional informada por el usuario; no se usa para autorización.';
comment on column public.rehab_profiles.weight_kg is 'Peso opcional en kilogramos; no se usa para diagnóstico.';
comment on column public.rehab_profiles.height_cm is 'Altura opcional en centímetros; no se usa para diagnóstico.';
