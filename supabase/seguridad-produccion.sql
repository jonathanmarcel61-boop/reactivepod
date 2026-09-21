-- REHABPOD: endurecimiento que debe ejecutarse en Supabase SQL Editor.
-- Haz primero una copia de seguridad. El script es idempotente.

begin;

-- Nadie sin sesión debe acceder directamente a datos de la aplicación.
do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'rehab_profiles',
    'rehab_professional_users',
    'rehab_routines',
    'rehab_routine_exercises',
    'rehab_assignments',
    'rehab_routine_sessions',
    'rehab_notifications',
    'rehab_shared_routines'
  ] loop
    if to_regclass('public.' || tabla) is not null then
      execute format('alter table public.%I enable row level security', tabla);
      execute format('alter table public.%I force row level security', tabla);
      execute format('revoke all on table public.%I from anon', tabla);
    end if;
  end loop;
end $$;

-- El rol, el identificador y el código de vinculación son privilegios.
-- Solo una operación administrativa (SQL Editor/service role) puede cambiarlos.
create or replace function public.rehab_proteger_privilegios_perfil()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and (
    new.user_id is distinct from old.user_id or
    new.role is distinct from old.role or
    new.user_code is distinct from old.user_code
  ) then
    raise exception 'No está permitido modificar rol, usuario o código de vinculación';
  end if;
  return new;
end;
$$;

drop trigger if exists rehab_proteger_privilegios_perfil on public.rehab_profiles;
create trigger rehab_proteger_privilegios_perfil
before update on public.rehab_profiles
for each row execute function public.rehab_proteger_privilegios_perfil();

-- Retira el UPDATE general y concede únicamente los campos editables desde la app.
revoke update on table public.rehab_profiles from authenticated;
grant update (full_name, specialty) on table public.rehab_profiles to authenticated;

-- Verificación centralizada. Las funciones/políticas deben consultar esta función.
create or replace function public.rehab_es_profesional()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.rehab_profiles p
    where p.user_id = auth.uid()
      and p.role = 'professional'
  );
$$;

revoke all on function public.rehab_es_profesional() from public, anon;
grant execute on function public.rehab_es_profesional() to authenticated;

commit;

-- AUDITORÍA: después de ejecutar, esta consulta debe mostrar rowsecurity=true
-- para todas las tablas y las políticas esperadas para cada operación.
select
  c.relname as tabla,
  c.relrowsecurity as rls_activo,
  p.policyname,
  p.cmd,
  p.roles
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p
  on p.schemaname = n.nspname and p.tablename = c.relname
where n.nspname = 'public'
  and c.relname like 'rehab_%'
order by c.relname, p.cmd;
