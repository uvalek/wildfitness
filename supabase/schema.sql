-- ============================================================
--  Wild Fitness — esquema de base de datos (Supabase / Postgres)
--  Aplicado al proyecto SuperCerebro. Tablas con prefijo wf_.
-- ============================================================

create table if not exists public.wf_precios_membresia (
  tipo   text primary key check (tipo in ('Semanal','Quincenal','Mensual','Anual')),
  precio numeric(10,2) not null
);

create sequence if not exists public.wf_socios_folio_seq start with 1001;

create table if not exists public.wf_socios (
  id                   uuid primary key default gen_random_uuid(),
  folio                integer not null unique default nextval('public.wf_socios_folio_seq'), -- ID de socio (4-5 dígitos)
  nombre               text not null,
  telefono             text,
  tipo_membresia       text not null references public.wf_precios_membresia(tipo),
  fecha_inicio         date not null,
  fecha_vencimiento    date not null,
  recordatorio_enviado boolean not null default false,
  created_at           timestamptz not null default now()
);

create table if not exists public.wf_productos (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  categoria  text not null check (categoria in ('Bebida','Snack','Suplemento')),
  precio     numeric(10,2) not null,
  stock      integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.wf_ventas (
  id              uuid primary key default gen_random_uuid(),
  producto_id     uuid references public.wf_productos(id) on delete set null,
  producto_nombre text not null,
  cantidad        integer not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null,
  total           numeric(10,2) not null,
  fecha           timestamptz not null default now()
);

create table if not exists public.wf_checkins (
  id                uuid primary key default gen_random_uuid(),
  socio_id          uuid references public.wf_socios(id),
  socio_nombre      text not null,
  fecha             timestamptz not null default now(),
  membresia_vigente boolean not null   -- estatus de acceso: permitido / no permitido
);

create table if not exists public.wf_ingresos_mensuales (
  offset_meses integer primary key,     -- -5 .. 0 (0 = mes en curso)
  membresias   numeric(12,2) not null default 0,
  tienda       numeric(12,2) not null default 0
);

-- Perfiles / roles de acceso al panel (owner | recepcionista)
create table if not exists public.wf_perfiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email   text,
  rol     text not null check (rol in ('owner','recepcionista')),
  created_at timestamptz not null default now()
);
alter table public.wf_perfiles enable row level security;
create policy wf_perfiles_self_select on public.wf_perfiles
  for select to authenticated using (user_id = auth.uid());

-- Rol del usuario en sesión (para usar en políticas RLS).
create or replace function public.wf_rol()
returns text language sql stable security definer set search_path = public as $$
  select rol from public.wf_perfiles where user_id = auth.uid();
$$;

create index if not exists wf_ventas_fecha_idx   on public.wf_ventas (fecha);
create index if not exists wf_checkins_fecha_idx on public.wf_checkins (fecha);
create index if not exists wf_socios_venc_idx    on public.wf_socios (fecha_vencimiento);

-- RLS. Todas las tablas requieren sesión (rol `authenticated`).
alter table public.wf_precios_membresia  enable row level security;
alter table public.wf_socios             enable row level security;
alter table public.wf_productos          enable row level security;
alter table public.wf_ventas             enable row level security;
alter table public.wf_checkins           enable row level security;
alter table public.wf_ingresos_mensuales enable row level security;

-- Acceso general para autenticados (socios, ventas, checkins, precios):
--   create policy ... for all to authenticated using (true) with check (true);
-- Productos: lectura/actualización para todos; alta y baja solo dueño:
--   select/update  -> to authenticated using (true)
--   insert/delete  -> to authenticated using (public.wf_rol() = 'owner')
-- Ingresos: solo dueño -> for all to authenticated using (public.wf_rol() = 'owner')
-- (Ver migraciones wild_fitness_rls_authenticated_only y wild_fitness_roles.)
