-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- supabase.com → tu proyecto → SQL Editor → New query

-- ─── Tabla de progreso por estudiante ────────────────────────────────────────
create table if not exists progreso (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade,
  ramo_id    text not null,
  estado     text not null check (estado in (
    'pendiente', 'en_curso', 'aprobado', 'reprobado', 'convalidado', 'inscrito'
  )),
  updated_at timestamptz default now(),
  unique(user_id, ramo_id)
);

-- Si ya tienes la tabla con el check antiguo, actualízalo así:
-- alter table progreso drop constraint if exists progreso_estado_check;
-- alter table progreso add constraint progreso_estado_check check (
--   estado in ('pendiente','en_curso','aprobado','reprobado','convalidado','inscrito')
-- );

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

-- ─── Tabla de perfil (onboarding) ────────────────────────────────────────────
create table if not exists perfil (
  user_id    uuid primary key references auth.users on delete cascade,
  sem_actual int not null check (sem_actual between 1 and 10),
  cohorte    int not null check (cohorte between 2010 and 2099),
  es_primero boolean not null default false,
  created_at timestamptz default now()
);

-- Seguridad: cada usuario solo puede leer y editar su propio perfil
alter table perfil enable row level security;

create policy "Ver propio perfil"
  on perfil for select
  using (auth.uid() = user_id);

create policy "Insertar propio perfil"
  on perfil for insert
  with check (auth.uid() = user_id);

create policy "Actualizar propio perfil"
  on perfil for update
  using (auth.uid() = user_id);

-- Agregar columna nombre si la tabla ya existe:
alter table perfil add column if not exists nombre text;

-- Agregar columna paralelo a ramo_info si la tabla ya existe:
alter table ramo_info add column if not exists paralelo text;

-- ─── Tabla de info editable por ramo ─────────────────────────────────────────
create table if not exists ramo_info (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade,
  ramo_id       text not null,
  profesor      text,
  horario_texto text,
  sala          text,
  notas_extra   text,
  updated_at    timestamptz default now(),
  unique(user_id, ramo_id)
);

alter table ramo_info enable row level security;

create policy "Ver propia ramo_info"
  on ramo_info for select
  using (auth.uid() = user_id);

create policy "Insertar propia ramo_info"
  on ramo_info for insert
  with check (auth.uid() = user_id);

create policy "Actualizar propia ramo_info"
  on ramo_info for update
  using (auth.uid() = user_id);

create policy "Eliminar propia ramo_info"
  on ramo_info for delete
  using (auth.uid() = user_id);

-- ─── Tabla de horario semanal ─────────────────────────────────────────────────
create table if not exists horario (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade,
  ramo_id       text not null,
  dia           text not null check (dia in ('Lun','Mar','Mié','Jue','Vie','Sáb')),
  bloque_inicio int  not null check (bloque_inicio between 1 and 20),
  bloque_fin    int  not null check (bloque_fin    between 1 and 20),
  sala          text
);

-- Si la tabla horario ya existe, agregar la columna sala:
alter table horario add column if not exists sala text;

alter table horario enable row level security;

create policy "Ver propio horario"
  on horario for select
  using (auth.uid() = user_id);

create policy "Insertar propio horario"
  on horario for insert
  with check (auth.uid() = user_id);

create policy "Eliminar propio horario"
  on horario for delete
  using (auth.uid() = user_id);

-- ─── Períodos académicos ─────────────────────────────────────────────────────
-- Agregar columna periodo a horario (default '2026-1' para registros existentes):
alter table horario add column if not exists periodo text default '2026-1';

-- ─── Tabla de historial por semestre ─────────────────────────────────────────
create table if not exists historial_semestre (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade,
  periodo      text not null,
  ramo_id      text not null,
  estado_final text,
  nota_final   numeric,
  created_at   timestamptz default now(),
  unique(user_id, periodo, ramo_id)
);

alter table historial_semestre enable row level security;

create policy "Ver propio historial"
  on historial_semestre for select
  using (auth.uid() = user_id);

create policy "Insertar propio historial"
  on historial_semestre for insert
  with check (auth.uid() = user_id);

create policy "Actualizar propio historial"
  on historial_semestre for update
  using (auth.uid() = user_id);

create policy "Eliminar propio historial"
  on historial_semestre for delete
  using (auth.uid() = user_id);

-- ─── Tabla de comentarios de ramos ──────────────────────────────────────────
create table if not exists comentarios (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade,
  ramo_id    text not null,
  texto      text not null,
  estado     text default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
  created_at timestamptz default now()
);

alter table comentarios enable row level security;

-- Usuarios normales ven solo aprobados O sus propios pendientes
create policy "Ver comentarios aprobados"
  on comentarios for select
  using (
    estado = 'aprobado'
    or auth.uid() = user_id
  );

create policy "Insertar propio comentario"
  on comentarios for insert
  with check (auth.uid() = user_id);

-- Admin puede leer TODOS (pendientes, aprobados, rechazados)
-- auth.jwt() ->> 'email' es el método oficial de Supabase — no usa subqueries
create policy "Admin ve todos los comentarios"
  on comentarios for select
  using (auth.jwt() ->> 'email' = 'matias.caimilla@usm.cl');

-- Admin puede cambiar el estado (aprobar/rechazar)
create policy "Admin modera comentarios"
  on comentarios for update
  using (auth.jwt() ->> 'email' = 'matias.caimilla@usm.cl');

-- Admin puede eliminar cualquier comentario
create policy "Admin elimina comentarios"
  on comentarios for delete
  using (auth.jwt() ->> 'email' = 'matias.caimilla@usm.cl');

-- ─── Tabla de calificaciones de profesores ───────────────────────────────────
create table if not exists calificaciones_prof (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade,
  ramo_id    text not null,
  profesor   text not null,
  estrellas  int check (estrellas between 1 and 5),
  created_at timestamptz default now(),
  unique(user_id, ramo_id)
);

alter table calificaciones_prof enable row level security;

-- Todos los usuarios autenticados pueden ver calificaciones (para calcular promedio)
create policy "Ver calificaciones"
  on calificaciones_prof for select
  using (auth.role() = 'authenticated');

create policy "Insertar propia calificación"
  on calificaciones_prof for insert
  with check (auth.uid() = user_id);

create policy "Actualizar propia calificación"
  on calificaciones_prof for update
  using (auth.uid() = user_id);

-- ─── PARCHE — ejecutar en Supabase → SQL Editor ──────────────────────────────
-- Copia y pega este bloque completo si el Admin no ve comentarios pendientes.
-- Elimina las policies anteriores (incluyendo las rotas con subquery a auth.users)
-- y las recrea usando auth.jwt() ->> 'email', que es el método oficial de Supabase.

-- drop policy if exists "Ver comentarios aprobados"       on comentarios;
-- drop policy if exists "Admin ve todos los comentarios"  on comentarios;
-- drop policy if exists "Admin modera comentarios"        on comentarios;
-- drop policy if exists "Admin elimina comentarios"       on comentarios;
-- drop policy if exists "Ver comentarios"                 on comentarios;
--
-- create policy "Ver comentarios aprobados"
--   on comentarios for select
--   using (estado = 'aprobado' or auth.uid() = user_id);
--
-- create policy "Admin ve todos los comentarios"
--   on comentarios for select
--   using (auth.jwt() ->> 'email' = 'matias.caimilla@usm.cl');
--
-- create policy "Insertar propio comentario"
--   on comentarios for insert
--   with check (auth.uid() = user_id);
--
-- create policy "Admin modera comentarios"
--   on comentarios for update
--   using (auth.jwt() ->> 'email' = 'matias.caimilla@usm.cl');
--
-- create policy "Admin elimina comentarios"
--   on comentarios for delete
--   using (auth.jwt() ->> 'email' = 'matias.caimilla@usm.cl');
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Supabase Auth — URL Configuration ───────────────────────────────────────
-- En Supabase → Authentication → URL Configuration, configura:
--
--   Site URL:
--     https://matiascaimilla2003-cpu.github.io
--
--   Redirect URLs (agrega ambas entradas):
--     https://matiascaimilla2003-cpu.github.io/Malla-Interactiva/
--     https://matiascaimilla2003-cpu.github.io/confirmed.html
--
-- Supabase agrega automáticamente #access_token=...&type=signup al Redirect URL.
-- El hash es procesado por el SDK de Supabase JS en el cliente (no causa 404).
-- La app detecta type=signup en el hash y muestra la pantalla de Bienvenida.
-- ─────────────────────────────────────────────────────────────────────────────
