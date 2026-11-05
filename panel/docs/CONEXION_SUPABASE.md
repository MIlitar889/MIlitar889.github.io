# Conexión con Supabase

- `js/nucleo/config-nube.js`: URL del proyecto y llave *publishable* (públicas). Nunca poner aquí la `service_role`.
- `js/nucleo/nube.js`: inicio de sesión, guardado (solo lo que cambió) y tiempo real. Si el tiempo real falla, revisa cambios cada 5 s.
- Cada pantalla se limita por rol en `js/app/navegacion.js`; la seguridad real son las reglas RLS de `supabase/01_esquema.sql` y `04_permisos_y_folios.sql`.
- Los números de pedido los da la base (`nuevo_folio()`); si no hay internet, el pedido no se registra y avisa.
- Después de cambiar código: `python tools/construir_archivo_unico.py` para regenerar `dist/sushi-puuk.html`.
- Orden de SQL: 01 → crear usuarios en Authentication → 02 → 04.
