/* ---- Menú de clientes: enlace público, copiar, abrir y vista previa ---- */
// La dirección se arma sola a partir de donde está publicado el panel (…/panel/ → …/clientes/menu-clientes.html)
function urlMenuClientes() {
  const p = location.pathname, i = p.indexOf("/panel/");
  return i >= 0
    ? location.origin + p.slice(0, i) + "/clientes/menu-clientes.html"
    : new URL("../clientes/menu-clientes.html", location.href).href;
}
function vMenuCli() {
  const u = urlMenuClientes();
  return cab(
    "Menú de clientes",
    "Lo que ven los clientes al abrir el enlace. Esa página no da acceso al panel."
  )
    + `<article class="tarjeta"><h2>Enlace para tus clientes</h2>
   <p class="nota">Compártelo por WhatsApp, redes o ponlo en un QR. Los pedidos llegan directo a Pedidos y Cocina, y el menú se actualiza solo cuando cambias algo en el panel.</p>
   <input
        class="campo keep" id="mc-url" value="${u}" readonly onclick="this.select()"
        style="width:100%;margin:8px 0">
   <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button
        class="chip" data-act="mc-copiar">Copiar enlace</button>
    <button class="chip"
        data-act="mc-abrir">Abrir como cliente (pestaña nueva)</button>
    <button class="chip"
        data-act="mc-ver">${S.mcver ? "Ocultar vista previa" : "Ver vista previa aquí"}</button>
   </div></article>`
    + `<article class="tarjeta"><h2>Conexión del menú</h2>
   <p class="nota">Revisa que los cambios del panel (precios, productos, disponibilidad) lleguen al menú de clientes.</p>
   <button
        class="chip" data-act="mc-probar">Revisar conexión</button>
   <p class="nota"
        style="margin-top:8px">${S.mcest || ""}</p></article>`
    + (
      S.mcver
        ? `<article class="tarjeta"><h2>Vista previa</h2><p class="nota">Así lo ve el cliente en su teléfono. Es solo una vista: no puedes tocar el panel desde aquí.</p>
   <iframe
            src="${u}" title="Menú de clientes"
            style="width:100%;max-width:420px;height:680px;border:1px solid #D1D5DB;border-radius:14px;background:#fff"></iframe></article>`
        : ""
    );
}
