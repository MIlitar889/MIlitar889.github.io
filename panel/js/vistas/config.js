/* ---- Configuración + respaldo ---- */
function vConfig() {
  const N = D.neg,
    inp = (id, l, v) => `<label>${l}</label><input class="campo keep" id="${id}" value="${esc(v)}">`;
  return cab(
    "Configuración",
    "Datos del negocio y respaldo",
    `<button class="btn-rojo" data-act="neg-save">Guardar</button>`
  )
    + `<article class="tarjeta" style="margin-bottom:16px"><h2>Negocio</h2>${inp("n-n", "Nombre", N.n)}${inp("n-suc", "Sucursal", N.sucursal || "")}${inp("n-lema", "Lema", N.lema || "")}${inp("n-tel", "WhatsApp / teléfono", N.tel)}${inp("n-dir", "Dirección", N.dir)}${inp("n-hor", "Horario", N.hor)}${inp(
      "n-maps",
      "Enlace de Google Maps",
      N.maps || ""
    )}${inp("n-fb", "Facebook", N.fb || "")}${inp("n-ig", "Instagram", N.ig || "")}${inp("n-tt", "TikTok", N.tt || "")}</article>`
    + `<article class="tarjeta" style="margin-bottom:16px"><h2>Pantallas para otros aparatos</h2><p
        class="nota">Dirección de la pantalla de cocina (para la tablet del chef):</p><p><code>${esc(location.href.split("#")[0])}#cocina</code></p><a
        class="chip" href="#cocina" target="puuk-cocina">Abrir cocina en ventana nueva</a><p
        class="nota" style="margin-top:14px">Dirección para los celulares de los meseros:</p><p><code>${esc(location.href.split("#")[0])}#meseros</code></p><a
        class="chip" href="#meseros" target="puuk-meseros">Abrir meseros en ventana nueva</a><p
        class="nota" style="margin-top:14px">Dirección de la app del dueño (celular):</p><p><code>${esc(location.href.split("#")[0])}#dueno</code></p><a
        class="chip" href="#dueno" target="puuk-dueno">Abrir app del dueño en ventana nueva</a><p
        class="nota">Todos los aparatos comparten los mismos datos por internet; cada persona entra con su correo y contraseña.</p></article><article
        class="tarjeta"><h2>Respaldo de datos</h2><p class="nota">Todo se guarda en la base de datos (Supabase). Aun así, descarga un respaldo de vez en cuando y guárdalo en el Drive del negocio. El respaldo contiene teléfonos y correos de clientes: no lo compartas públicamente.</p><div
        class="periodo__botones"><button class="boton-exportar" data-act="bk-dl">Descargar respaldo</button><label
        class="chip" style="margin:0;cursor:pointer">Restaurar respaldo<input type="file" id="bk-up"
        accept=".json" hidden></label></div></article>`;
}
