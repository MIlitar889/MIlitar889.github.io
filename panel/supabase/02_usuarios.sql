-- =====================================================================
-- Sushi Pu'uk · 02_usuarios.sql
-- Se corre DESPUÉS de crear cada usuario en Authentication → Users.
-- Cambia los correos por los que hayas creado y repite el bloque por persona.
-- =====================================================================

-- Dueño
insert into public.perfiles (id, nombre, rol)
select id, 'Don Luis', 'dueno' from auth.users where email = 'dueno@CAMBIA-ESTO.com'
on conflict (id) do update set nombre = excluded.nombre, rol = excluded.rol, activo = true;

-- Caja
insert into public.perfiles (id, nombre, rol)
select id, 'Caja', 'caja' from auth.users where email = 'caja@CAMBIA-ESTO.com'
on conflict (id) do update set nombre = excluded.nombre, rol = excluded.rol, activo = true;

-- Cocina (la tablet del chef)
insert into public.perfiles (id, nombre, rol)
select id, 'Cocina', 'cocina' from auth.users where email = 'cocina@CAMBIA-ESTO.com'
on conflict (id) do update set nombre = excluded.nombre, rol = excluded.rol, activo = true;

-- Un mesero (repetir por cada uno, con su propio correo)
insert into public.perfiles (id, nombre, rol)
select id, 'Ana', 'mesero' from auth.users where email = 'ana@CAMBIA-ESTO.com'
on conflict (id) do update set nombre = excluded.nombre, rol = excluded.rol, activo = true;

-- Cuando alguien deja de trabajar ahí: quitarle el acceso sin borrar su historial
-- update public.perfiles set activo = false where nombre = 'Ana';
