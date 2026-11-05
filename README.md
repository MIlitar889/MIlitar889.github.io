# Panel Sushi Pu'uk

Panel de administración y caja del restaurante: ventas, pedidos, clientes, lealtad, reportes, estadísticas, impresoras, mesas QR, promos y menú. Todas las pantallas comparten los mismos datos.

## Archivo único (para subir a internet)
`dist/sushi-puuk.html` es **todo el panel en un solo archivo**: HTML, estilos, programa y los 15 QR van dentro. Es lo único que hay que subir al hosting (no se necesitan carpetas).
- Se genera con `python tools/construir_archivo_unico.py` (o pídeme que lo regenere después de cada cambio).
- **Retraso de la cocina corregido:** un pedido nuevo llega al instante; si el navegador no manda el aviso, el panel revisa los cambios cada segundo (antes podía tardar hasta 30 s).
- Las carpetas `css/`, `js/` y `data/` siguen siendo el código fuente para editar; el archivo único se arma a partir de ellas.
- **Fotos:** en Menú, toca la foto de un producto (icono 📷) para cambiarla por una de tu equipo. Se guarda dentro del panel, sin carpetas. Si no cambias una foto, se usa la copia de internet de YoMenu.
- **Cocina:** el menú **Cocina** la abre en una ventana nueva. En la tablet, abre la dirección del archivo seguida de `#cocina` (también aparece en Configuración).

## Cómo abrirlo
1. Descomprime la carpeta completa (no muevas archivos sueltos).
2. Doble clic en `index.html`. Se abre en el navegador (Chrome o Edge). No necesita internet, salvo para ver las fotos que aún no están en `assets/fotos`.
3. Los datos se guardan en ese navegador. Descarga un respaldo desde **Configuración → Descargar respaldo** al terminar cada día.

## Qué hay en cada carpeta
```
sushi-puuk/
├─ index.html              Página única; solo estructura y lista de archivos
├─ css/                    Estilos
│  ├─ base.css             Colores (variables) y estilos generales
│  ├─ layout.css           Menú lateral y área de contenido
│  ├─ componentes.css      Encabezados, filtros, indicadores, gráficas
│  ├─ pantallas.css        Caja, editor de menú, lealtad, avisos
│  └─ responsive.css       Ajustes para celular
├─ js/
│  ├─ reportes/            Ventas: pedidos, fechas, cálculos y gráficas del reporte
│  ├─ nucleo/              datos.js (almacén y guardado), reglas.js (lealtad, ventas), ui.js (piezas), chat.js (mensajes)
│  ├─ vistas/              Una pantalla por archivo: caja, pedidos, clientes, lealtad, estadisticas,
│  │                       impresora, mesas, promos, menu, cocina, config
│  └─ app/                 navegacion.js (rutas y menú) y acciones.js (botones y arranque)
├─ data/                   Datos iniciales (editables)
│  ├─ menu-inicial.js, clientes-iniciales.js, modificadores-iniciales.js, config-inicial.js
│  └─ referencia/          Copias de lo rescatado (no las usa la app)
├─ assets/
│  ├─ qr/                  QR de las 15 mesas (mesa-1.png … mesa-15.png)
│  └─ fotos/               Fotos del menú (ver LEEME.txt)
├─ tools/descargar_fotos.py  Descarga las fotos automáticamente (opcional)
└─ docs/PENDIENTES.md      Lista de lo que falta por hacer
```

## Cómo se conectan las pantallas
Todo vive en un solo objeto `D` (`js/nucleo/datos.js`) y en la lista `ORDENES`. Cada pantalla lee de ahí y los botones escriben ahí (`js/app/acciones.js`).
Al registrar una venta (`crear()` en `js/nucleo/reglas.js`) se actualizan pedidos, clientes, lealtad, reportes, estadísticas e impresoras.

## Panel: novedades
- **Pedidos:** tarjetas con hora, cliente, tipo, sucursal, total y estado; al abrirlas, línea de tiempo (Pend., Conf., Prep., Listo, OK), teléfono, detalle con opciones, pago, **tiempo estimado editable** (lo ve el cliente), **acciones rápidas** (Confirmar, Preparando, Listo, Completar, Cancelar con motivo) y **Reimprimir comanda**. Filtros con contador.
- **Menú:** agregar platillos con un formulario (nombre, categoría, precio, descripción, foto, Promo), editar todo, mover de categoría, marcar Promo o Destacado, y **grupos de opciones con precios extra** (obligatorios o no). Las opciones se eligen en Nueva venta, en meseros y en el menú de clientes, y salen en cocina y comandas.
- **Recompensas:** nombre, tipo, sellos requeridos, límite de canjes por cliente, descripción visible, imagen, resetear sellos al canjear, activa. El canje respeta límite y reinicio.
- **Clientes:** cada socio tiene un **código** (PUUK-XXXXXXXX); se busca por código y en Nueva venta se puede escribir o **escanear** para elegirlo.
- **Configuración:** sucursal, lema, WhatsApp, dirección, horario, Google Maps, Facebook, Instagram y TikTok (los usa el menú de clientes).

## Pantalla de cocina (tablet)
- Se abre desde el menú **Cocina** o directo con `index.html#cocina`. Oculta el menú lateral y usa botones grandes.
- Tres columnas: **Nuevos → Preparando → Listos**. Botones: Empezar, Listo, Entregado y ↩ para regresar un paso.
- **Estaciones:** el chef puede elegir "Sushi 1" o "Comedor 1" y solo ve los productos de las categorías asignadas a esa impresora (se asignan en Impresora).
- Cada pedido muestra los minutos de espera: amarillo desde 10 min, rojo y parpadeando desde 20 min. Las notas del cliente salen resaltadas.
- Toca **Sonido** una vez para activar el aviso cuando entra un pedido nuevo (el navegador lo exige). Se refresca solo cada 30 segundos.
- Al marcar **Entregado** se registra la entrega y se suman los sellos de lealtad, igual que desde Pedidos.
- **Notas por producto:** en Nueva venta cada producto del ticket tiene su campo de nota libre (ej. "con alga", "empanizado"). La cocina la ve **junto al nombre del producto**, resaltada. Si el mismo producto lleva notas distintas, se separa en líneas distintas. También hay una nota general del pedido.
- **Cancelar un pedido:** el botón **✖ Cancelar** de cada tarjeta pide el motivo (obligatorio), cancela el pedido y avisa a la caja con un mensaje en el chat. En Pedidos se ve "Cancelado por Cocina: motivo". Un pedido cancelado no cuenta como venta ni da sellos.
- **Chat general:** botón **💬 Chat** en la cocina y sección **Chat** en el panel. **💬 Avisar** en una tarjeta abre el chat con "Pedido #N:" ya escrito. Hay una insignia roja con los mensajes sin leer y un aviso al llegar uno nuevo.
- **Límite actual:** la tablet solo ve los pedidos de su propio navegador. Si la caja y la cocina usan el mismo navegador en pestañas distintas, se sincronizan solas. Entre dispositivos distintos hace falta la base de datos central.

## Panel de meseros (celular)
- Se abre desde el menú **Meseros** (ventana nueva) o con `sushi-puuk.html#meseros` en el celular. La primera vez pide el nombre del mesero.
- **Abrir mesa:** número de mesa (solo las libres) y nombre de la mesa (ej. "Familia López"). Después elige productos por categoría o con el buscador y puede poner una nota en cada uno.
- **Por enviar / Enviado a cocina:** lo que se agrega queda "por enviar" hasta que el mesero toca **Enviar a cocina**. Cada envío es una **ronda** que lleva **solo lo nuevo**. Si piden 1 más de lo mismo, la ronda 2 trae únicamente ese 1; lo de la ronda 1 no se vuelve a mandar.
- **En cocina** la ronda 2 sale marcada "➕ AGREGADO · RONDA 2: preparar SOLO lo de abajo", con una línea gris que recuerda lo que ya se envió antes.
- **Si el cliente se arrepiente:** lo que aún no se envía se borra sin más. Lo ya enviado se quita con **Quitar**: si la cocina todavía no lo empieza, desaparece sin molestar; si ya lo estaba preparando, pide confirmación y le avisa al chef por el chat (en cocina queda tachado como CANCELADO).
- Cuando la cocina marca **Listo**, el mesero ve "¡Listo para llevar!" (con aviso y sonido) y confirma con **Ya lo llevé a la mesa**.
- **Pedir la cuenta** avisa a la caja. En **Pedidos → Mesas abiertas** la caja elige el método de pago (y el cliente, si es socio) y toca **Cobrar**. Eso crea **un solo pedido** con todo lo consumido, que entra a Reportes, Estadísticas, Clientes y Lealtad, y libera la mesa.
- **Comanda impresa:** el botón 🖨 de cada ronda imprime una hoja de 80 mm por estación, con mesa, nombre, mesero, hora y "AGREGADO · solo lo nuevo" en las rondas siguientes. Usa el cuadro de impresión del navegador; el envío directo a las impresoras de red sigue pendiente del Bridge.

## App del dueño (celular)
- Se abre desde el menú **Dueño** (ventana nueva) o con `sushi-puuk.html#dueno` en el celular. Es solo de consulta (no captura nada). Tiene tres pestañas abajo:
  - **📊 Hoy:** ventas del día, comparación contra ayer y contra el mismo día de la semana pasada, pedidos, ticket promedio, cómo se pagó, ventas de los últimos 7 días, lo más vendido (hoy y 7 días) y resumen por mesero.
  - **🔴 En vivo:** mesas abiertas con su total (aún sin cobrar), lo que está haciendo la cocina y cuánto lleva cada pedido, y las **cancelaciones del día con quién y por qué**.
  - **🧾 Historial:** todos los pedidos agrupados por día, con filtros (hoy, 7 días, 30 días, todo; entregados, cancelados, en curso; método de pago; mesero) y buscador (mesa, cliente, producto, nota, número). Al tocar un pedido se ve el detalle: productos con notas, mesero, pago, rondas de la mesa, productos quitados y motivo de cancelación. El botón **⬇ Excel** exporta lo que se ve en pantalla.
- **Inicio de sesión:** la primera vez pide crear un nombre y una contraseña (mínimo 6 caracteres). Después pide la contraseña cada vez. Bloquea 5 minutos tras 5 intentos fallidos, cierra la sesión sola a los 30 minutos sin usarla, y permite cambiar la contraseña (⚙ junto al nombre) o salir. La contraseña se guarda como huella (SHA-256), nunca en texto. **Es un bloqueo básico por aparato, no seguridad de servidor**: si se olvida, se restablece desde Configuración → Acceso del dueño, y cualquiera con acceso al panel puede hacerlo. La protección real llegará con la base de datos.
- Las ventas **no cuentan** los pedidos cancelados ni las mesas que la caja todavía no cobra.
- **El apartado "Dinero en caja" queda pendiente y va al final** (fondo inicial, gastos, retiros y conteo real).
- Para instalarla como app en el teléfono hay que publicarla en internet (https) y, para que vea lo que pasa en la tienda, conectar la base de datos central. Un APK solo se generaría al final, si hace falta.

## Menú para clientes (archivo aparte)
Es un archivo **independiente** (`menu-clientes.html`, ~50 KB), con diseño propio para el celular y sin datos internos. Su código fuente está en `cliente/menu-clientes.template.html`.

**Pantallas** (barra inferior: Inicio · menú · Lealtad · Sucursales)
- **Inicio:** platillo destacado en grande, ORDENA AHORA, SEGUIR MI PEDIDO, buscador, pestañas (Todos, Promos y cada categoría) y lista con fotos.
- **Menú:** cuadrícula con fotos, precio y botón +; ORDENA AHORA y **DESCARGAR MENÚ** (abre la impresión / guardar como PDF).
- **Hoja del platillo:** foto, descripción, **opciones** (Normal / Empanizado… con su extra de precio), nota libre, cantidad.
- **Pedido:** **nombre y teléfono de 10 dígitos obligatorios**, tipo (recoger, domicilio o la mesa del QR `?n=4`), dirección si es domicilio, y la opción de **crear cuenta y unirse al Club**.
- **Lealtad:** el Club con lo que se gana y las recompensas; formulario para crear cuenta o entrar con teléfono + código; la **tarjeta** (sellos, nivel Bronce/Plata/Oro, **código de barras Code 128** con su código PUUK-XXXXXXXX), próxima recompensa (con "Sorpresa" bloqueada), sellos, total histórico y sus pedidos. La tarjeta usa los colores, textos, ícono y fondo del **Editor** de Lealtad del panel, y las reglas y recompensas de Configuración y Recompensas: todo es modificable.
- **Sucursales:** dirección, teléfono, Cómo llegar (Google Maps) y WhatsApp. No lleva mapa incrustado para no depender de otro servicio.
- **Seguimiento (Mi Pedido):** estado en vivo (Recibido, Confirmado, Preparando, Listo, Entregado), línea de 5 pasos, tiempo estimado que fija la caja, código del pedido, Soporte por WhatsApp, Compartir, sonido opcional, su pedido con opciones y total.

**Cómo se conecta con el panel**
- En **Menú → 📱 Menú para clientes** el panel genera el archivo con el menú actual (solo platillos con precio y disponibles, sus opciones, fotos, club y datos del negocio). **Cada vez que cambien el menú hay que generarlo y subirlo de nuevo**, salvo que se abra junto al panel.
- **Abierto junto al panel** (mismo navegador y mismo sitio, por ejemplo una tablet del restaurante): usa los datos **en vivo**. Los cambios de menú aparecen al instante, los pedidos llegan a cocina ("📱 Cliente" en Pedidos), la cuenta del Club se crea en Clientes, y el seguimiento se actualiza solo (cada 2 s).
- **Abierto en el teléfono del cliente** (sin conexión al panel): se ve el menú publicado, pero el pedido se manda por **WhatsApp** y el registro al Club y el seguimiento en vivo quedan desactivados. Para que funcionen desde cualquier teléfono hace falta la base de datos central.
- Un teléfono que ya es socio **no revela su código** al volver a registrarse.

## Revisión de consistencia (qué se corrigió y conectó)
- Las ventas, cocina, meseros, dueño y comandas leen el mismo almacén; **antes de cada acción** se toman los cambios que otra ventana haya guardado, para no pisarlos.
- Renombrar o borrar una categoría en Menú actualiza las impresoras (antes los productos caían en "Sin impresora").
- "Clientes únicos" ya no cuenta el mostrador como un cliente.
- Los CSV (clientes, reportes, historial) escapan comas y comillas; antes un nombre con coma descomponía las columnas.
- La cocina calcula los minutos con fecha y hora reales y sigue mostrando un pedido de la noche pasada la medianoche; ignora pedidos de más de 18 horas.
- El nombre del negocio (Configuración) llega al menú lateral, al título de cada ventana (Cocina, Meseros, Dueño, Panel) y a las comandas impresas.
- Pedidos → Mesas abiertas muestra el estado de las rondas de cada mesa; Impresora → Cola permite **reimprimir** una comanda; "Cerrar sesión" del panel cierra las sesiones de mesero y dueño en ese aparato.

## Cambios comunes
- **Cambiar precios o productos del menú:** desde la pantalla Menú. Para cambiar el menú de arranque, edita `data/menu-inicial.js`.
- **Cambiar colores:** `css/base.css` (variables al inicio).
- **Agregar una pantalla:** crea `js/vistas/nueva.js` con una función `vNueva()`, agrégala a `VISTAS` y `NAV` en `js/app/navegacion.js`, crea su sección en `index.html` (`<section id="v-nueva" data-vista hidden>`) y su `<script>` antes de `navegacion.js`.
- **Orden de carga:** los `<script>` de `index.html` van en orden; cada archivo usa lo definido por los anteriores.

## Importante
- Los datos solo existen en el navegador y la computadora donde se usa. Para varias personas a la vez hace falta una base de datos central.
- No imprime, no envía notificaciones y no cobra: esas partes son simuladas.
- Contiene teléfonos y correos de clientes: no lo publiques ni lo compartas.
