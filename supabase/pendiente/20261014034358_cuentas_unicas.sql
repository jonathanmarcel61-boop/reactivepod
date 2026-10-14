-- Retiro sin pérdida de datos: cuenta única y archivos antiguos inaccesibles.
-- Los roles profesionales existentes se convierten en cuentas normales.
update public.rehab_profiles set role='user' where role='professional';
alter table public.rehab_profiles drop constraint if exists rehab_profiles_role_check;
alter table public.rehab_profiles add constraint rehab_profiles_role_check check (role='user');
alter table public.rehab_profiles alter column role set default 'user';

-- Deshabilita APIs antiguas sin borrar cuentas, rutinas ni históricos.
revoke all on public.rehab_professional_users, public.rehab_assignments,
  public.rehab_notifications, public.rehab_shared_routines from public, anon, authenticated;
comment on table public.rehab_professional_users is 'Archivo retirado de RehabPod; sin acceso desde la aplicación.';
comment on table public.rehab_assignments is 'Archivo retirado de RehabPod; sin acceso desde la aplicación.';
comment on table public.rehab_notifications is 'Archivo retirado de RehabPod; sin acceso desde la aplicación.';
comment on table public.rehab_shared_routines is 'Archivo retirado de RehabPod; sin acceso desde la aplicación.';
do $$ declare r record; begin
  for r in select p.proname,pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'
    and p.proname in ('rehab_handle_new_user','rehab_es_profesional','rehab_connect_user_by_code',
      'rehab_unlink_relationship','rehab_make_user_code','rehab_can_assign_routine','rehab_cancel_assignment',
      'rehab_notify_assignment_changes','rehab_assignment_status_timestamps','rehab_assignments_update_guard',
      'rehab_shared_routines_antes') loop
    execute format('revoke all on function public.%I(%s) from public, anon, authenticated',r.proname,r.args);
  end loop;
  for r in select tablename,policyname from pg_policies where schemaname='public'
    and tablename in ('rehab_profiles','rehab_routines','rehab_routine_exercises','rehab_routine_sessions','rehab_training_sessions') loop
    execute format('drop policy %I on public.%I',r.policyname,r.tablename);
  end loop;
end $$;
create policy rehab_routines_owner on public.rehab_routines for all to authenticated
  using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy rehab_exercises_owner on public.rehab_routine_exercises for all to authenticated
  using (exists(select 1 from public.rehab_routines r where r.id=routine_id and r.owner_id=(select auth.uid())))
  with check (exists(select 1 from public.rehab_routines r where r.id=routine_id and r.owner_id=(select auth.uid())));
create policy rehab_sessions_owner on public.rehab_routine_sessions for all to authenticated
  using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy rehab_training_owner on public.rehab_training_sessions for all to authenticated
  using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

-- El campo role queda fijo en user por compatibilidad con los datos archivados.
alter table public.rehab_profiles enable row level security;
revoke all on public.rehab_profiles from anon, authenticated;
grant select on public.rehab_profiles to authenticated;
grant update (full_name, specialty, age, weight_kg, height_cm) on public.rehab_profiles to authenticated;
drop policy if exists rehab_profile_select_own on public.rehab_profiles;
create policy rehab_profile_select_own on public.rehab_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists rehab_profile_update_own on public.rehab_profiles;
create policy rehab_profile_update_own on public.rehab_profiles for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- El trigger necesita escribir el perfil al crear el usuario de Auth.
-- No se expone como RPC ni acepta identificadores desde el cliente.
create schema if not exists rehab_private;
revoke all on schema rehab_private from public, anon, authenticated;
create or replace function rehab_private.crear_perfil_cuenta()
returns trigger language plpgsql security definer set search_path = '' as $$
declare nombre text; uso text;
begin
  nombre := left(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), 80);
  if length(nombre) < 2 then nombre := 'Usuario RehabPod'; end if;
  uso := coalesce(new.raw_user_meta_data->>'specialty', 'other');
  if uso not in ('athlete','fitness','rehabilitation','cognitive_training','recreational','other') then uso := 'other'; end if;
  insert into public.rehab_profiles(user_id, full_name, specialty, role)
    values(new.id, nombre, uso, 'user') on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function rehab_private.crear_perfil_cuenta() from public, anon, authenticated;
drop trigger if exists rehab_on_auth_user_created on auth.users;
drop trigger if exists rehab_crear_perfil_cuenta on auth.users;
create trigger rehab_crear_perfil_cuenta after insert on auth.users
  for each row execute function rehab_private.crear_perfil_cuenta();
-- RehabPod V45: cuenta única para respaldo y recuperación de datos.
-- Idempotente: se puede ejecutar más de una vez en Supabase SQL Editor.

create table if not exists public.rehab_user_backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1 check (schema_version between 1 and 100),
  updated_at timestamptz not null default now(),
  constraint rehab_user_backups_payload_object
    check (jsonb_typeof(payload) = 'object'),
  constraint rehab_user_backups_payload_size
    check (octet_length(payload::text) <= 2000000)
);

alter table public.rehab_user_backups enable row level security;

revoke all on table public.rehab_user_backups from anon;
grant select, insert, update, delete on table public.rehab_user_backups to authenticated;

drop policy if exists "rehab_backup_select_own" on public.rehab_user_backups;
create policy "rehab_backup_select_own"
on public.rehab_user_backups for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "rehab_backup_insert_own" on public.rehab_user_backups;
create policy "rehab_backup_insert_own"
on public.rehab_user_backups for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "rehab_backup_update_own" on public.rehab_user_backups;
create policy "rehab_backup_update_own"
on public.rehab_user_backups for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "rehab_backup_delete_own" on public.rehab_user_backups;
create policy "rehab_backup_delete_own"
on public.rehab_user_backups for delete to authenticated
using ((select auth.uid()) = user_id);

comment on table public.rehab_user_backups is
  'Copia privada de los datos locales de RehabPod para recuperar un dispositivo.';
