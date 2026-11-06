-- =====================================================================
-- Sushi Pu'uk · 06_menu_en_vivo.sql
-- Hace que el menú de clientes lea el menú REAL desde la base: si desactivas un producto,
-- cambias un precio o una foto en el panel, se ve en el menú de clientes en segundos,
-- sin generar ni subir el menú otra vez. Correr en SQL Editor → New query → pegar TODO → Run.
-- Solo comparte lo que ya es público en el menú: productos, opciones, datos del negocio,
-- descuentos y programa de lealtad. NO comparte impresoras, pedidos ni clientes.
-- =====================================================================

create or replace function public.menu_version()
returns text language sql stable security definer set search_path = public as $$
  select greatest(
    (select actualizado from registros where coleccion = 'menu'   and id = 'principal'),
    (select actualizado from registros where coleccion = 'config' and id = 'principal')
  )::text
$$;

create or replace function public.menu_publico()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'v',      public.menu_version(),
    'menu',   (select datos->'cats' from registros where coleccion = 'menu' and id = 'principal'),
    'mods',   c.datos->'mods',
    'neg',    c.datos->'neg',
    'prog',   c.datos->'prog',
    'dis',    c.datos->'dis',
    'recomp', c.datos->'recomp'
  )
  from registros c where c.coleccion = 'config' and c.id = 'principal'
$$;

revoke execute on function public.menu_version() from public;
revoke execute on function public.menu_publico() from public;
grant  execute on function public.menu_version() to anon, authenticated;
grant  execute on function public.menu_publico() to anon, authenticated;
