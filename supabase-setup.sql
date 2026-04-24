-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- supabase.com → tu proyecto → SQL Editor → New query

-- Tabla de progreso por estudiante
create table if not exists progreso (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade,
  ramo_id    text not null,
  estado     text not null check (estado in ('pendiente', 'en_curso', 'aprobado')),
  updated_at timestamptz default now(),
  unique(user_id, ramo_id)
);

-- Seguridad: cada usuario solo puede ver y editar su propio progreso
alter table progreso enable row level security;

create policy "Ver propio progreso"
  on progreso for select
  using (auth.uid() = user_id);

create policy "Insertar propio progreso"
  on progreso for insert
  with check (auth.uid() = user_id);

create policy "Actualizar propio progreso"
  on progreso for update
  using (auth.uid() = user_id);

create policy "Eliminar propio progreso"
  on progreso for delete
  using (auth.uid() = user_id);
