-- =====================================================================
-- Sushi Pu'uk · 05_pedidos_de_clientes.sql
-- Permite que el menú para clientes (el de los QR) mande pedidos directo al panel y que el
-- cliente los siga, SIN iniciar sesión. Correr en SQL Editor → New query → pegar TODO → Run,
-- después del 01 y del 04. Se puede correr más de una vez.
-- Seguridad: la página pública solo puede llamar a estas dos funciones; no puede leer ni escribir
-- tablas. Los precios se recalculan aquí con el menú real (el cliente no puede cambiarlos),
-- y hay límites por teléfono y globales contra pedidos falsos.
-- =====================================================================

create or replace function public.crear_pedido_cliente(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_nombre text := left(btrim(coalesce(p->>'nombre','')), 60);
  v_tel    text := regexp_replace(coalesce(p->>'tel',''), '\D', '', 'g');
  v_tipo   text := coalesce(p->>'tipo','recoger');
  v_mesa   text := left(regexp_replace(coalesce(p->>'mesa',''), '\D', '', 'g'), 2);
  v_dir    text := left(btrim(coalesce(p->>'dir','')), 140);
  v_nota   text := left(btrim(coalesce(p->>'nota','')), 140);
  v_menu jsonb; v_mods jsonb; cat jsonb; prod jsonb; it jsonb; g jsonb; o jsonb; opc jsonb;
  v_items jsonb := '[]'::jsonb;
  v_total numeric := 0; v_extra numeric; v_q int; nom text; opn text; hallada boolean;
  v_folio bigint; v_cid text; v_orden jsonb;
  v_ts bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  v_fecha text := to_char(now() at time zone 'America/Merida', 'YYYY-MM-DD');
  v_hora  text := to_char(now() at time zone 'America/Merida', 'HH24:MI');
begin
  if v_nombre = '' then raise exception 'Escribe tu nombre.'; end if;
  if length(v_tel) < 10 or length(v_tel) > 13 then raise exception 'Escribe tu teléfono de 10 dígitos.'; end if;
  if v_tipo not in ('recoger','domicilio','mesa') then raise exception 'Tipo de pedido no válido.'; end if;
  if v_tipo = 'domicilio' and v_dir = '' then raise exception 'Escribe la dirección de entrega.'; end if;
  if v_tipo = 'mesa' and v_mesa = '' then raise exception 'Falta el número de mesa.'; end if;
  if jsonb_typeof(p->'items') is distinct from 'array' or jsonb_array_length(p->'items') not between 1 and 40 then
    raise exception 'El pedido está vacío o es demasiado grande.';
  end if;

  -- límites contra pedidos falsos
  if (select count(*) from registros where coleccion='ordenes' and datos->>'origen'='cliente'
        and regexp_replace(coalesce(datos->>'tel',''),'\D','','g') = v_tel and datos->>'estado'='pending') >= 2 then
    raise exception 'Ya tienes pedidos esperando confirmación. Espera a que el restaurante los atienda.';
  end if;
  if (select count(*) from registros where coleccion='ordenes' and datos->>'origen'='cliente'
        and regexp_replace(coalesce(datos->>'tel',''),'\D','','g') = v_tel
        and coalesce((datos->>'ts')::bigint,0) > v_ts - 3600000) >= 6 then
    raise exception 'Demasiados pedidos seguidos con este teléfono. Escríbenos por WhatsApp.';
  end if;
  if (select count(*) from registros where coleccion='ordenes' and datos->>'origen'='cliente'
        and coalesce((datos->>'ts')::bigint,0) > v_ts - 600000) >= 40 then
    raise exception 'Estamos recibiendo muchos pedidos. Inténtalo en unos minutos.';
  end if;

  select datos->'cats' into v_menu from registros where coleccion='menu' and id='principal';
  select datos->'mods' into v_mods from registros where coleccion='config' and id='principal';
  if v_menu is null then raise exception 'El menú todavía no está disponible.'; end if;
  v_mods := coalesce(v_mods, '[]'::jsonb);

  for it in select x.v from jsonb_array_elements(p->'items') as x(v) loop
    nom := it->>'n';
    v_q := coalesce((it->>'q')::int, 0);
    if v_q < 1 or v_q > 20 then raise exception 'Cantidad no válida.'; end if;
    prod := null;
    for cat in select x.v from jsonb_array_elements(v_menu) as x(v) loop
      select y.v into prod from jsonb_array_elements(coalesce(cat->'p','[]'::jsonb)) as y(v)
        where y.v->>'n' = nom and coalesce((y.v->>'on')::boolean,false) and coalesce((y.v->>'c')::numeric,0) > 0 limit 1;
      exit when prod is not null;
    end loop;
    if prod is null then raise exception 'Un producto ya no está disponible: %. Recarga el menú.', nom; end if;

    v_extra := 0;
    opc := coalesce(it->'opc', '[]'::jsonb);
    if jsonb_typeof(opc) <> 'array' or jsonb_array_length(opc) > 10 then opc := '[]'::jsonb; end if;
    for opn in select jsonb_array_elements_text(opc) loop
      hallada := false;
      for g in select x.v from jsonb_array_elements(v_mods) as x(v)
               where x.v->>'n' in (select jsonb_array_elements_text(coalesce(prod->'m','[]'::jsonb))) loop
        for o in select y.v from jsonb_array_elements(coalesce(g->'o','[]'::jsonb)) as y(v) loop
          if (case when jsonb_typeof(o) = 'string' then o #>> '{}' else o->>'n' end) = opn then
            hallada := true;
            v_extra := v_extra + case when jsonb_typeof(o) = 'string' then 0 else coalesce((o->>'p')::numeric, 0) end;
            exit;
          end if;
        end loop;
        exit when hallada;
      end loop;
      if not hallada then raise exception 'Una opción de "%" ya no está disponible. Recarga el menú.', nom; end if;
    end loop;

    v_items := v_items || jsonb_build_object('n', nom, 'c', (prod->>'c')::numeric + v_extra, 'q', v_q,
                 'nota', left(btrim(coalesce(it->>'nota','')), 140), 'opc', opc);
    v_total := v_total + ((prod->>'c')::numeric + v_extra) * v_q;
  end loop;
  if v_total < 1 or v_total > 5000 then raise exception 'El total del pedido no es válido.'; end if;

  select id into v_cid from registros where coleccion='clientes'
    and regexp_replace(coalesce(datos->>'t',''),'\D','','g') = v_tel limit 1;
  v_cid := coalesce(v_cid, 'mostrador');

  update contadores set valor = valor + 1 where nombre = 'folio' returning valor into v_folio;

  v_orden := jsonb_build_object(
    'id', v_folio, 'fecha', v_fecha, 'hora', v_hora, 'ts', v_ts, 'items', v_items, 'total', v_total,
    'metodo', 'efectivo', 'tipo', v_tipo, 'mesa', case when v_tipo='mesa' then v_mesa else '' end,
    'estado', 'pending', 'cliente', v_cid, 'origen', 'cliente', 'nombreCliente', v_nombre, 'tel', v_tel, 'tiempoEst', 30,
    'nota', case when v_tipo='domicilio' then 'Entrega a: ' || v_dir || ' · ' else '' end
            || case when v_nota <> '' then v_nota || ' · ' else '' end || 'Pago por definir');
  insert into registros (coleccion, id, datos) values ('ordenes', v_folio::text, v_orden);
  insert into registros (coleccion, id, datos) values ('chat', v_ts::text, jsonb_build_object(
    'id', v_ts, 'f', v_hora, 'de', 'Cliente', 'sis', true,
    't', '📱 Nuevo pedido #' || v_folio || case when v_tipo='mesa' then ' (Mesa ' || v_mesa || ')' else '' end || ' de ' || v_nombre))
    on conflict (coleccion, id) do nothing;
  return jsonb_build_object('id', v_folio, 'ts', v_ts);
end $$;

-- Seguimiento: solo devuelve el pedido si el teléfono coincide
create or replace function public.ver_pedido_cliente(p_id bigint, p_tel text)
returns jsonb language sql stable security definer set search_path = public as $$
  select datos from registros
   where coleccion = 'ordenes' and id = p_id::text
     and length(regexp_replace(coalesce(p_tel,''),'\D','','g')) >= 10
     and regexp_replace(coalesce(datos->>'tel',''),'\D','','g') = regexp_replace(coalesce(p_tel,''),'\D','','g')
$$;

revoke execute on function public.crear_pedido_cliente(jsonb) from public;
revoke execute on function public.ver_pedido_cliente(bigint, text) from public;
grant  execute on function public.crear_pedido_cliente(jsonb) to anon, authenticated;
grant  execute on function public.ver_pedido_cliente(bigint, text) to anon, authenticated;
