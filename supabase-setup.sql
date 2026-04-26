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

-- ─── Supabase Auth — URL Configuration ───────────────────────────────────────
-- En Supabase → Authentication → URL Configuration, configura:
--
--   Site URL:
--     https://matiascaimilla2003-cpu.github.io/Malla-Interactiva/
--
--   Redirect URLs (agrega esta entrada):
--     https://matiascaimilla2003-cpu.github.io/confirmed.html
--
-- La página confirmed.html vive en public/confirmed.html y se despliega
-- automáticamente con el sitio en GitHub Pages.
-- ─────────────────────────────────────────────────────────────────────────────
