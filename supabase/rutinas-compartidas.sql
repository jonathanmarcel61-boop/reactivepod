-- =====================================================
-- REHABPOD — BIBLIOTECA DE RUTINAS COMPARTIDAS
--
-- Cómo aplicarla: Supabase → SQL Editor → pega TODO este archivo → Run.
-- Es seguro ejecutarla más de una vez.
--
-- Qué permite:
--   · Cualquier persona con sesión puede COMPARTIR (y dejar de compartir) sus
--     propias rutinas: solo los ejercicios, nunca resultados ni datos de salud.
--   · Los PROFESIONALES (rehab_profiles.role = 'professional') pueden VER las
--     rutinas compartidas por todos. Los usuarios comunes solo ven las suyas.
--   · Cada quien modifica o borra únicamente lo que compartió.
-- =====================================================

-- 1) ¿La persona con sesión es profesional? (función con permisos del dueño para
--    no chocar con las reglas de seguridad de rehab_profiles)
create or replace function public.rehab_es_profesional()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.rehab_profiles p
    where p.user_id = auth.uid()
      and p.role = 'professional'
  );
$$;

revoke all on function public.rehab_es_profesional() from public;
grant execute on function public.rehab_es_profesional() to authenticated;

-- 2) Tabla
create table if not exists public.rehab_shared_routines (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  local_id    text not null check (char_length(local_id) between 1 and 80),
  author_name text check (author_name is null or char_length(author_name) <= 40),
  name        text not null check (char_length(name) between 1 and 60),
  minutes     integer not null check (minutes between 1 and 120),
  level       text not null check (level in ('principiante', 'intermedio', 'avanzado')),
  objectives  text[] not null default '{}',
  plan        jsonb not null check (jsonb_typeof(plan) = 'object' and octet_length(plan::text) <= 20000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (author_id, local_id)
);

create index if not exists rehab_shared_routines_recientes
  on public.rehab_shared_routines (created_at desc);

-- 3) Máximo 50 rutinas compartidas por persona y fecha de actualización
create or replace function public.rehab_shared_routines_antes()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from public.rehab_shared_routines where author_id = new.author_id) >= 50 then
      raise exception 'Máximo 50 rutinas compartidas por persona';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists rehab_shared_routines_antes on public.rehab_shared_routines;
create trigger rehab_shared_routines_antes
  before insert or update on public.rehab_shared_routines
  for each row execute function public.rehab_shared_routines_antes();

-- 4) Seguridad por filas
alter table public.rehab_shared_routines enable row level security;

drop policy if exists "leer: autor o profesional" on public.rehab_shared_routines;
create policy "leer: autor o profesional"
  on public.rehab_shared_routines for select to authenticated
  using (author_id = auth.uid() or public.rehab_es_profesional());

drop policy if exists "compartir: solo como uno mismo" on public.rehab_shared_routines;
create policy "compartir: solo como uno mismo"
  on public.rehab_shared_routines for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "actualizar: solo el autor" on public.rehab_shared_routines;
create policy "actualizar: solo el autor"
  on public.rehab_shared_routines for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "borrar: solo el autor" on public.rehab_shared_routines;
create policy "borrar: solo el autor"
  on public.rehab_shared_routines for delete to authenticated
  using (author_id = auth.uid());

grant select, insert, update, delete on public.rehab_shared_routines to authenticated;
