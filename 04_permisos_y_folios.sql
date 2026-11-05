-- =====================================================================
-- Sushi Pu'uk · 04_permisos_y_folios.sql
-- Se corre en Supabase → SQL Editor → New query → pegar TODO → Run, DESPUÉS del 01 y el 02.
-- Se puede correr más de una vez sin romper nada.
-- Hace dos cosas:
--  1) Deja que cocina y meseros escriban la colección "estado" (cola de impresión,
--     bitácora y total de lealtad), que se actualiza con cada pedido.
--  2) Crea fijar_folio(): al restaurar un respaldo, evita que los pedidos nuevos
--     repitan números de pedidos viejos.
-- =====================================================================

drop policy if exists registros_insertar on public.registros;
create policy registros_insertar on public.registros for insert to authenticated
  with check (
    public.rol_actual() in ('dueno','caja')
    or (public.rol_actual() in ('cocina','mesero')
        and coleccion in ('ordenes','comandas','cuentas','chat','clientes','canjes','estado'))
  );

drop policy if exists registros_actualizar on public.registros;
create policy registros_actualizar on public.registros for update to authenticated
  using (
    public.rol_actual() in ('dueno','caja')
    or (public.rol_actual() in ('cocina','mesero')
        and coleccion in ('ordenes','comandas','cuentas','chat','clientes','canjes','estado'))
  )
  with check (
    public.rol_actual() in ('dueno','caja')
    or (public.rol_actual() in ('cocina','mesero')
        and coleccion in ('ordenes','comandas','cuentas','chat','clientes','canjes','estado'))
  );

create or replace function public.fijar_folio(n bigint)
returns bigint language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  if public.rol_actual() not in ('dueno','caja') then
    raise exception 'sin permiso';
  end if;
  update public.contadores set valor = greatest(valor, n) where nombre = 'folio' returning valor into v;
  return v;
end $$;

revoke execute on function public.fijar_folio(bigint) from public, anon;
grant  execute on function public.fijar_folio(bigint) to authenticated;
