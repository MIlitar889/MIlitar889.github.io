-- =====================================================================
-- Sushi Pu'uk · Base de datos · 01_esquema.sql
-- Cómo usarlo: Supabase → SQL Editor → New query → pegar TODO → Run.
-- Se puede correr más de una vez sin romper nada.
-- =====================================================================

-- 1) Personas que pueden entrar y qué papel tienen
create table if not exists public.perfiles (
  id      uuid primary key references auth.users(id) on delete cascade,
  nombre  text not null,
  rol     text not null check (rol in ('dueno','caja','cocina','mesero')),
  activo  boolean not null default true,
  creado  timestamptz not null default now()
);

-- 2) Todos los datos del restaurante: un registro por pedido, mesa, ronda, cliente, mensaje, etc.
--    coleccion = qué es (ordenes, cuentas, comandas, clientes, chat, menu, config, canjes, finanzas)
create table if not exists public.registros (
  coleccion        text  not null,
  id               text  not null,
  datos            jsonb not null,
  actualizado      timestamptz not null default now(),
  actualizado_por  uuid  default auth.uid(),
  primary key (coleccion, id)
);
create index if not exists registros_coleccion_actualizado on public.registros (coleccion, actualizado);

-- 3) Contador de números de pedido (para que dos aparatos nunca repitan el mismo número)
create table if not exists public.contadores (
  nombre text primary key,
  valor  bigint not null
);
insert into public.contadores (nombre, valor) values ('folio', 100) on conflict (nombre) do nothing;

-- 4) Funciones de apoyo
create or replace function public.rol_actual()
returns text language sql stable security definer set search_path = public as $$
  select rol from public.perfiles where id = auth.uid() and activo
$$;

create or replace function public.nuevo_folio()
returns bigint language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  if public.rol_actual() is null then
    raise exception 'sin permiso';
  end if;
  update public.contadores set valor = valor + 1 where nombre = 'folio' returning valor into v;
  return v;
end $$;

create or replace function public.marcar_actualizado()
returns trigger language plpgsql as $$
begin
  new.actualizado := now();
  new.actualizado_por := auth.uid();
  return new;
end $$;

drop trigger if exists registros_actualizado on public.registros;
create trigger registros_actualizado
  before insert or update on public.registros
  for each row execute function public.marcar_actualizado();

-- 5) Seguridad: nadie ve ni toca nada sin iniciar sesión y tener un perfil activo
alter table public.perfiles   enable row level security;
alter table public.registros  enable row level security;
alter table public.contadores enable row level security;   -- sin políticas: solo se usa a través de nuevo_folio()

revoke all on public.contadores from anon, authenticated;
revoke execute on function public.nuevo_folio() from public, anon;
grant  execute on function public.nuevo_folio() to authenticated;
revoke execute on function public.rol_actual()  from public, anon;
grant  execute on function public.rol_actual()  to authenticated;

-- Cada quien ve su propio perfil; el dueño ve a todos
drop policy if exists perfiles_ver on public.perfiles;
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = auth.uid() or public.rol_actual() = 'dueno');

-- Leer: cualquier persona con perfil activo, salvo "finanzas" (solo dueño y caja)
drop policy if exists registros_leer on public.registros;
create policy registros_leer on public.registros for select to authenticated
  using (
    public.rol_actual() is not null
    and (coleccion <> 'finanzas' or public.rol_actual() in ('dueno','caja'))
  );

-- Escribir: dueño y caja todo; cocina y meseros solo lo operativo (nunca menú, precios ni configuración)
drop policy if exists registros_insertar on public.registros;
create policy registros_insertar on public.registros for insert to authenticated
  with check (
    public.rol_actual() in ('dueno','caja')
    or (public.rol_actual() in ('cocina','mesero')
        and coleccion in ('ordenes','comandas','cuentas','chat','clientes','canjes'))
  );

drop policy if exists registros_actualizar on public.registros;
create policy registros_actualizar on public.registros for update to authenticated
  using (
    public.rol_actual() in ('dueno','caja')
    or (public.rol_actual() in ('cocina','mesero')
        and coleccion in ('ordenes','comandas','cuentas','chat','clientes','canjes'))
  )
  with check (
    public.rol_actual() in ('dueno','caja')
    or (public.rol_actual() in ('cocina','mesero')
        and coleccion in ('ordenes','comandas','cuentas','chat','clientes','canjes'))
  );

-- Borrar: dueño y caja; el mesero solo sus mesas y rondas
drop policy if exists registros_borrar on public.registros;
create policy registros_borrar on public.registros for delete to authenticated
  using (
    public.rol_actual() in ('dueno','caja')
    or (public.rol_actual() = 'mesero' and coleccion in ('cuentas','comandas'))
  );

-- 6) Avisos en tiempo real: que cada aparato se entere al instante de los cambios
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'registros'
  ) then
    alter publication supabase_realtime add table public.registros;
  end if;
end $$;
