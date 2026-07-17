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

create index if not exists wf_ventas_fecha_idx   on public.wf_ventas (fecha);
create index if not exists wf_checkins_fecha_idx on public.wf_checkins (fecha);
create index if not exists wf_socios_venc_idx    on public.wf_socios (fecha_vencimiento);

-- RLS: permisivo para el demo (panel admin sin login). En producción se
-- reemplazan estas políticas por reglas basadas en auth.uid() / roles.
alter table public.wf_precios_membresia  enable row level security;
alter table public.wf_socios             enable row level security;
alter table public.wf_productos          enable row level security;
alter table public.wf_ventas             enable row level security;
alter table public.wf_checkins           enable row level security;
alter table public.wf_ingresos_mensuales enable row level security;

-- (una política "for all to anon, authenticated using(true) with check(true)"
--  por tabla — ver do-block en la migración wild_fitness_schema)
