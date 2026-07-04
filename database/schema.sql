-- ============================================================
-- VIRTUS | OBRAS — Schema de base de datos (Supabase / Postgres)
-- Ejecutar completo en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Extensión para UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. CLIENTES
-- ------------------------------------------------------------
create table clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rut text,
  telefono text,
  correo text,
  direccion text,
  comuna text,
  contacto_preferido text default 'whatsapp' check (contacto_preferido in ('llamada','whatsapp','correo')),
  notas text,
  creado_en timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. SERVICIOS (catálogo, editable desde el admin)
-- ------------------------------------------------------------
create table servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text unique not null,
  descripcion text,
  icono text default 'wrench',
  orden int default 0,
  activo boolean default true
);

insert into servicios (nombre, slug, descripcion, icono, orden) values
  ('Gasfitería', 'gasfiteria', 'Instalación y reparación de redes de agua, calefont, grifería y artefactos sanitarios.', 'droplets', 1),
  ('Mueblería a medida', 'muebleria', 'Diseño y fabricación de muebles de cocina y closets a medida, en madera y melamina.', 'hammer', 2),
  ('Puertas y ventanas', 'puertas-ventanas', 'Reparación, ajuste e instalación de puertas, ventanas y sistemas de cierre.', 'door-open', 3),
  ('Asesoría técnica', 'asesoria-tecnica', 'Evaluación e inspección técnica de obra por ingeniero en construcción certificado SEC.', 'clipboard-check', 4);

-- ------------------------------------------------------------
-- 3. PRESUPUESTOS (OT / cotizaciones)
-- ------------------------------------------------------------
create sequence if not exists presupuesto_folio_seq start 1;

create table presupuestos (
  id uuid primary key default gen_random_uuid(),
  folio text unique not null default ('P-' || lpad(nextval('presupuesto_folio_seq')::text, 4, '0')),
  cliente_id uuid references clientes(id) on delete cascade,
  tipo_trabajo text[] default '{}',
  es_emergencia boolean default false,
  estado text default 'presupuesto' check (estado in ('cliente','presupuesto','servicio','cierre')),
  descripcion text,
  items jsonb default '[]', -- [{descripcion, cantidad, precio_unitario}]
  subtotal numeric default 0,
  descuento numeric default 0,
  total numeric default 0,
  validez_dias int default 15,
  enviado_por_correo boolean default false,
  enviado_en timestamptz,
  aprobado boolean default false,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

create index idx_presupuestos_cliente on presupuestos(cliente_id);

-- ------------------------------------------------------------
-- 4. PROYECTOS (trabajo ejecutado, ligado a un presupuesto)
-- ------------------------------------------------------------
create table proyectos (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid references presupuestos(id) on delete set null,
  cliente_id uuid references clientes(id) on delete cascade,
  titulo text not null,
  categoria text, -- referencia a servicios.slug
  descripcion text,
  destacado boolean default false, -- se muestra en el carrusel público
  fecha_inicio date,
  fecha_termino date,
  creado_en timestamptz default now()
);

-- ------------------------------------------------------------
-- 5. FOTOS DE PROYECTO (máx. 10 por proyecto, validado en el admin)
-- ------------------------------------------------------------
create table proyecto_fotos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid references proyectos(id) on delete cascade,
  url text not null,
  descripcion text,
  orden int default 0,
  creado_en timestamptz default now()
);

-- ------------------------------------------------------------
-- 6. INSTALACIONES CON MANTENCIÓN (ej: calefont instalado)
-- ------------------------------------------------------------
create table mantenciones (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  proyecto_id uuid references proyectos(id) on delete set null,
  equipo text not null, -- ej: "Calefont Junkers 5L"
  fecha_instalacion date not null default current_date,
  frecuencia_meses int not null default 12,
  proxima_fecha date generated always as ((fecha_instalacion + (frecuencia_meses * interval '1 month'))::date) stored,
  notificado boolean default false,
  notificado_en timestamptz,
  activo boolean default true,
  creado_en timestamptz default now()
);

create index idx_mantenciones_proxima on mantenciones(proxima_fecha) where activo = true and notificado = false;

-- ------------------------------------------------------------
-- 7. MENSAJES DE CONTACTO (formulario público)
-- ------------------------------------------------------------
create table mensajes_contacto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  correo text,
  servicio_interes text,
  mensaje text,
  origen text default 'formulario', -- 'formulario' | 'asistente_ia'
  leido boolean default false,
  creado_en timestamptz default now()
);

-- ------------------------------------------------------------
-- 8. CONFIGURACIÓN DEL SITIO (editable desde el admin)
-- ------------------------------------------------------------
create table config_sitio (
  id int primary key default 1,
  whatsapp_numero text default '56900000000',
  whatsapp_mensaje_defecto text default 'Hola, quiero cotizar un servicio con Virtus Obras',
  hero_titulo text default 'Soluciones integrales en obras',
  hero_subtitulo text default 'Gasfitería, mueblería a medida, puertas y ventanas, y asesoría técnica con respaldo de ingeniería certificada.',
  correo_notificaciones text,
  onesignal_player_id_ingeniero text, -- se completa cuando el ingeniero acepta push en su navegador/app
  constraint single_row check (id = 1)
);

insert into config_sitio (id) values (1);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table clientes enable row level security;
alter table servicios enable row level security;
alter table presupuestos enable row level security;
alter table proyectos enable row level security;
alter table proyecto_fotos enable row level security;
alter table mantenciones enable row level security;
alter table mensajes_contacto enable row level security;
alter table config_sitio enable row level security;

-- Lectura pública: solo lo necesario para la landing
create policy "servicios publicos" on servicios for select using (activo = true);
create policy "proyectos destacados publicos" on proyectos for select using (destacado = true);
create policy "fotos de proyectos destacados" on proyecto_fotos for select using (
  exists (select 1 from proyectos p where p.id = proyecto_fotos.proyecto_id and p.destacado = true)
);
create policy "config publica lectura" on config_sitio for select using (true);

-- Escritura pública: solo el formulario de contacto (insert-only)
create policy "cualquiera puede escribir un mensaje" on mensajes_contacto for insert with check (true);

-- Todo lo demás: solo usuarios autenticados (el ingeniero/admin)
create policy "admin lee clientes" on clientes for select using (auth.role() = 'authenticated');
create policy "admin escribe clientes" on clientes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin gestiona servicios" on servicios for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin lee presupuestos" on presupuestos for select using (auth.role() = 'authenticated');
create policy "admin escribe presupuestos" on presupuestos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin gestiona proyectos" on proyectos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin gestiona fotos" on proyecto_fotos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin gestiona mantenciones" on mantenciones for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin lee mensajes" on mensajes_contacto for select using (auth.role() = 'authenticated');
create policy "admin actualiza mensajes" on mensajes_contacto for update using (auth.role() = 'authenticated');
create policy "admin edita config" on config_sitio for update using (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- STORAGE: bucket para fotos de proyectos y logo
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('proyecto-fotos', 'proyecto-fotos', true)
  on conflict (id) do nothing;

create policy "fotos publicas de lectura" on storage.objects for select using (bucket_id = 'proyecto-fotos');
create policy "admin sube fotos" on storage.objects for insert with check (bucket_id = 'proyecto-fotos' and auth.role() = 'authenticated');
create policy "admin borra fotos" on storage.objects for delete using (bucket_id = 'proyecto-fotos' and auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- FUNCIÓN: recalcular total del presupuesto según items (jsonb)
-- Trigger opcional — el frontend también calcula, esto es respaldo.
-- ------------------------------------------------------------
create or replace function recalcular_total_presupuesto()
returns trigger as $$
declare
  suma numeric := 0;
  item jsonb;
begin
  for item in select * from jsonb_array_elements(new.items)
  loop
    suma := suma + (coalesce((item->>'cantidad')::numeric,0) * coalesce((item->>'precio_unitario')::numeric,0));
  end loop;
  new.subtotal := suma;
  new.total := suma - coalesce(new.descuento,0);
  new.actualizado_en := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_recalcular_total
  before insert or update on presupuestos
  for each row execute function recalcular_total_presupuesto();
