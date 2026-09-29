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
