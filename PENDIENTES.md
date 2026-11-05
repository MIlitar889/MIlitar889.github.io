# Pendientes

## Para el negocio
- [ ] Cambiar las fotos de los productos desde Menú (icono 📷) o guardarlas en `assets/fotos/`
- [ ] Poner precio a los 24 productos marcados "Falta precio" y activarlos en el menú (no urgente: el menú físico y las fotos ya los tiene el negocio)
- [ ] Confirmar dirección y teléfono correctos (el sitio y YoMenu dicen cosas distintas)
- [ ] Revisar el precio de Sopa Miso ($270, igual que los yakisoba)
- [ ] Respaldar clientes y reportes con los botones Exportar del admin anterior
- [ ] Averiguar en qué computadora está el programa Bridge de impresión
- [ ] Conseguir las fotos de los demás productos (están en yomenu.com.mx/sushi-puuk)
- [ ] Descargar un respaldo desde Configuración al terminar cada día

## Cocina
- [ ] Probar la pantalla de cocina en la tablet real (tamaño de letra, botones, sonido)
- [ ] Probar notas, cancelación con motivo y chat entre la caja y la tablet de la cocina
- [ ] Decidir cómo compartirá pedidos la tablet con la caja (hoy solo si comparten navegador; después, base de datos)

## Meseros
- [ ] Probar el panel de meseros en celulares reales con 2 o 3 mesas a la vez
- [ ] Confirmar cómo usan hoy las "notas de impresora" para ajustar el formato de la comanda
- [ ] Decidir si el mesero también debe poder cobrar (hoy solo pide la cuenta y cobra la caja)
- [ ] Pasar una mesa a otra / unir cuentas / dividir cuenta

## App del dueño
- [ ] Probar el inicio de sesión en el teléfono del dueño; las demás pantallas (caja, cocina, meseros) siguen sin contraseña hasta la base de datos con usuarios y roles
- [ ] Que el dueño la pruebe y diga qué quiere ver primero y qué le sobra
- [ ] (Al final) Apartado "Dinero en caja": fondo inicial, gastos, retiros, conteo real y diferencias
- [ ] (Después de la base de datos) Instalarla como app en su teléfono; confirmar si usa Android o iPhone
- [ ] Los 52 pedidos del sistema anterior solo existen como totales por cliente; no se pueden mostrar uno por uno

## Menú para clientes
- [ ] Decidir dónde se publicará `menu-clientes.html` y regenerar los QR de las mesas hacia esa dirección (`...?n=NÚMERO`)
- [ ] Confirmar el WhatsApp del negocio (el sitio viejo usa 997 973 4867; YoMenu muestra (997) 972 1720)
- [ ] Pedidos directos desde el teléfono del cliente a la cocina: necesitan la base de datos central (hoy van por WhatsApp)
- [ ] Definir cómo se elige el método de pago de un pedido de cliente (hoy queda "pago por definir" y se registra como efectivo)
- [ ] Volver a generar el menú para clientes cada vez que cambien precios o disponibilidad

## Base de datos (en curso)
- [ ] Crear cuenta y proyecto en Supabase con el correo del restaurante (ver docs/GUIA_BASE_DE_DATOS.md)
- [ ] Correr supabase/01_esquema.sql y supabase/02_usuarios.sql; crear usuarios por rol
- [ ] Enviar la Project URL y la llave anon (nunca la service_role)
- [ ] Lista de los errores encontrados en las pruebas (se corrigen primero)
- [ ] Decidir plan: Free para probar, Pro para operar (no se pausa, respaldos diarios)
- [ ] Primera prueba real con caja + celular + tablet a la vez

## Menú para clientes (fase 2: con la base de datos)
- [ ] Menú del cliente conectado a la base de datos: pedidos, cuentas del Club y seguimiento en vivo desde cualquier teléfono (hoy solo funcionan junto al panel)
- [ ] Funciones seguras en la base de datos para clientes sin sesión (crear cuenta, entrar con código, crear pedido con precios recalculados en el servidor, consultar un pedido con su teléfono), con límite de pedidos por teléfono
- [ ] Que el menú publicado se actualice solo, sin volver a generar el archivo
- [ ] Verificar el teléfono del cliente (SMS) o aceptar el código como única llave
- [ ] Mapa incrustado en Sucursales (hoy solo enlace a Google Maps)
- [ ] Ver un pedido de cliente con el método de pago por definir: elegirlo al entregar

## Para construir
- [ ] Menú público propio (sin YoMenu)
- [ ] Base de datos central y inicio de sesión (varios usuarios a la vez)
- [ ] Que los pedidos de la página pública entren al panel
- [ ] Impresión real de comandas y notificaciones push reales
- [ ] Elegir opciones de modificadores al vender; reordenar categorías arrastrando
