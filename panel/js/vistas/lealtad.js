/* ---- Lealtad ---- */
function vLealtad() {
  const T = [
    ["anal", "Analíticas"],
    ["cli", "Clientes"],
    ["rec", "Recompensas"],
    ["conf", "Configuración"],
    ["edit", "Editor"]
  ],
    P = D.prog;
  const f = { anal: lAnal, cli: lCli, rec: lRec, conf: lConf, edit: lEdit }[S.lt]();
  return `<div class="cab-lealtad"><h1>⭐ ${esc(P.nombre)}</h1><p>Programa de Fidelización</p></div>`
    + chips(T, "lt-t", S.lt)
    + f;
}
function lAnal() {
  const M = D.clientes.filter(c => c.m),
    lim = aTexto(new Date(Date.now() - 30 * 864e5)),
    act = M.filter(c => !c.ult || c.ult >= lim).length;
  const serie = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 864e5), f = aTexto(d);
    return {
      etiqueta: etiquetaDia(d),
      valor: ORDENES.filter(o => o.fecha === f && o.premio != null).length
    };
  });
  const niv = NIV.map(([n, c], i) => [n, M.filter(x => nivel(x)[0] === n).length, c]);
  return `<h2 class="sub">Dashboard de lealtad</h2>`
    + kpi(
      [
        ["Clientes totales", M.length, "var(--verde)"],
        ["Clientes activos", act, "#22C55E"],
        ["Total emitido", fmtU(D.emit), "#F4D03F"],
        ["Recompensas canjeadas", D.canjes.length, "#F97316"],
        [
          "Promedio por cliente",
          M.length ? (M.reduce((s, c) => s + c.bal, 0) / M.length).toFixed(1) : "0.0",
          "#8B5CF6"
        ],
        ["Clientes inactivos", M.length - act, "var(--negro)"]
      ]
    )
    + `<div class="graficas"><article class="tarjeta grafica"><h2>Actividad (últimos 30 días)</h2>${cols(serie)}</article><article
        class="tarjeta grafica"><h2>Distribución por nivel</h2>${donut(niv)}</article></div><article
        class="tarjeta"><h2>Clientes por sucursal favorita</h2>${barrasH([["Ticul", M.length]])}</article>`;
}
function lCli() {
  const q = S.lq.toLowerCase(),
    M = D.clientes.filter(c => c.m && (c.n + c.e + c.t + (c.code || "")).toLowerCase().includes(q)),
    sel = cli(S.lc);
  const rs = sel
    ? D.recomp.map(
      (r, i) => !r.activa
        ? ""
        : `<button class="chip" data-act="l-canje" data-r="${i}" ${puedeCanjear(sel, r)
          ? ""
          : "disabled"}>Canjear: ${esc(r.n)} (${fmtU(r.costo)})</button>`
    ).join("")
    : "";
  return `<div class="encabezado"><h2 class="sub">Clientes del programa</h2><span><span
      class="badge ok">${D.clientes.filter(c => c.m).length} clientes</span> <small>● Tiempo real</small></span></div><div
      class="dos"><div><input class="campo" id="q-lc"
      placeholder="Buscar por nombre, email o teléfono…" value="${esc(S.lq)}"><div class="lista">`
    + M.map(
      c => `<button class="tarjeta fila fila--btn" data-act="l-sel" data-id="${esc(c.id)}"><span
          class="avatar">${esc(c.n[0].toUpperCase())}</span><span><b>${esc(c.n)}</b><br><small>${esc(c.e || c.t)}</small></span><span
          style="margin-left:auto">${fmtU(c.bal)} 🍣</span></button>`
    ).join("")
    + `</div></div><aside class="tarjeta">`
    + (
      sel
        ? `<h2>${esc(sel.n)}</h2><p><span class="badge" style="background:${nivel(sel)[1]};color:#fff">${nivel(sel)[0]}</span> ${sel.vis} visitas</p><p
            class="nota">${esc(sel.e)} ${esc(sel.t)}</p><p class="nota">Código: <b>${esc(sel.code || "—")}</b></p><p
            style="font-size:1.6rem;font-weight:800">${fmtU(sel.bal)}</p><div class="prog"
            style="background:#eee"><i style="width:${Math.min(100, sel.bal / D.prog.meta * 100)}%"></i></div><p
            class="nota">Meta de tarjeta: ${D.prog.meta}</p><div class="cuenta"><button class="chip"
            data-act="l-sumar" data-id="${esc(sel.id)}">+ Sumar ${D.prog.tipo === "sellos"
          ? D.prog.porVisita + " sello"
          : "1"} manual</button>${rs}</div>${D.recomp.length
          ? ""
          : `<p class="nota">Crea recompensas en la pestaña Recompensas.</p>`}<h2>Canjes</h2>` + (
          D.canjes.filter(x => x.c === sel.id).map(x => `<p class="nota">${x.f} · ${esc(x.r)}</p>`).join("")
            || `<p class="nota">Sin canjes</p>`
        )
        : vacio("Selecciona un cliente para ver su perfil")
    )
    + `</aside></div>`;
}
const TIPOS_R = [
  ["producto", "🎁 Producto gratis"],
  ["desc_pct", "％ Descuento (%)"],
  ["desc_mxn", "$ Descuento en pesos"],
  ["sorpresa", "✨ Sorpresa"]
];
const tipoR = k => (TIPOS_R.find(t => t[0] === k) || TIPOS_R[0])[1];
function lRec() {
  const e = D.recomp.find(r => r.id === S.re), img = S.rimg || (e && e.img) || "";
  const form = S.rf
    ? `<article class="tarjeta" style="margin-bottom:16px"><div class="fila" style="padding:0"><h2
        style="margin:0;flex:1">${e ? "Editar recompensa" : "Nueva recompensa"}</h2><button
        class="ico" data-act="rec-cerrar" aria-label="Cerrar">✕</button></div>` + `<div class="dos"
        style="grid-template-columns:1fr 1fr;gap:12px"><div><label>Nombre</label><input
        class="campo keep" id="r-n" placeholder="Ej: Wrap gratis" value="${esc(e ? e.n : "")}"></div><div><label>Tipo</label><select
        class="campo keep" id="r-tipo">${TIPOS_R.map(
      ([k, t]) => `<option value="${k}" ${e&&e.tipo===k?"selected":""}>${t}</option>`
    ).join("")}</select></div>` + `<div><label>Sellos requeridos</label><input class="campo keep"
        id="r-c" type="number" min="1" value="${e ? e.costo : D.prog.meta}"></div><div><label>Límite de canjes por cliente (0 = ilimitado)</label><input
        class="campo keep" id="r-lim" type="number" min="0" value="${e ? e.limite : 0}"></div></div>` + `<label>Descripción visible al cliente</label><input
        class="campo keep" id="r-desc" placeholder="Descripción visible al cliente" value="${esc(e ? e.desc : "")}">` + `<label>Imagen para barra de sellos</label><div
        class="fila" style="padding:0">${img
      ? `<img src="${esc(img)}" style="width:48px;height:48px;border-radius:10px;object-fit:cover"
          alt="">`
      : ""}<label class="btn-verde" style="margin:0;cursor:pointer">⬆ Seleccionar imagen<input
        type="file" accept="image/*" hidden data-rimg="1"></label></div>` + `<div class="fila"
        style="padding:10px 0"><label style="margin:0"><input type="checkbox" class="keep"
        id="r-reset" ${!e || e.reset ? "checked" : ""}> Resetear sellos al canjear</label><label
        style="margin:0"><input type="checkbox" class="keep" id="r-act" ${!e || e.activa
      ? "checked"
      : ""}> Activa</label></div><button class="btn-verde" data-act="rec-guardar">💾 Guardar</button></article>`
    : "";
  return `<div class="encabezado"><h2 class="sub">Recompensas</h2><button class="btn-verde"
      data-act="rec-nueva">＋ Nueva recompensa</button></div>${form}`
    + (
      D.recomp.length
        ? `<div class="lista">` + D.recomp.map(
          r => `<div class="tarjeta fila">${r.img
            ? `<img src="${esc(r.img)}"
                style="width:44px;height:44px;border-radius:10px;object-fit:cover" alt="">`
            : `<span class="pic">🎁</span>`}<div style="flex:1"><b>${esc(r.n)}</b> <span
              class="badge">${tipoR(r.tipo)}</span><br><small class="nota" style="margin:0">${fmtU(r.costo)}${r.limite
            ? ` · máx. ${r.limite} por cliente`
            : ""}${r.reset ? " · reinicia los sellos" : ""} · ${D.canjes.filter(c => c.r === r.n).length} canjes</small>${r.desc
            ? `<br><small>${esc(r.desc)}</small>`
            : ""}</div><span class="badge ${r.activa ? "ok" : "mal"}">${r.activa
            ? "Activa"
            : "Pausada"}</span><button class="chip" data-act="rec-edit" data-id="${r.id}">Editar</button><button
              class="chip" data-act="rec-act" data-id="${r.id}">${r.activa ? "Pausar" : "Activar"}</button><button
              class="chip" data-act="rec-del" data-id="${r.id}">Eliminar</button></div>`
        ).join("") + `</div>`
        : `<div class="tarjeta">${vacio("Aún no hay recompensas configuradas")}</div>`
    );
}
function lConf() {
  const P = D.prog,
    T = [
      [
        "sellos",
        "🔥 Sellos",
        "Tarjeta de sellos clásica. Ideal para frecuencia de visitas (1 sello por compra)."
      ],
      ["monedero", "👛 Monedero", "Cashback: un % de cada compra regresa como saldo redimible."],
      ["puntos", "✨ Puntos", "Gana puntos por cada $1 y canjéalos por recompensas."]
    ];
  const inp = (id, l, v, t = "number") => `<div><label>${l}</label><input class="campo keep" id="${id}"
      type="${t}" step="any" value="${esc(v)}"></div>`;
  return `<div class="encabezado"><div><h2 class="sub" style="margin:0">Configuración del programa</h2><p
      class="nota">Define cómo tus clientes ganan y canjean recompensas</p></div><button
      class="btn-rojo" data-act="k-save">Guardar cambios</button></div>`
    + `<article class="tarjeta" style="margin-bottom:16px"><h2>Tipo de programa</h2><div
        class="tipos">`
    + T.map(
      ([k, t, d]) => `<button class="tipo" data-act="k-tipo" data-v="${k}" aria-pressed="${P.tipo === k}"><b>${t}</b><p
          class="nota">${d}</p></button>`
    ).join("")
    + `</div></article>`
    + `<article class="tarjeta" style="margin-bottom:16px"><h2>Identidad del programa</h2>${inp(
      "k-nom",
      "Nombre del programa",
      P.nombre,
      "text"
    )}<label>Mensaje de bienvenida</label><textarea class="campo keep" id="k-bien" rows="2">${esc(P.bienv)}</textarea></article>`
    + `<article class="tarjeta"><h2>Reglas de acumulación (${P.tipo[0].toUpperCase()
      + P.tipo.slice(1)})</h2><div class="indicadores" style="margin:0">`
    + (
      P.tipo === "sellos"
        ? inp("k-pv", "Sellos por visita", P.porVisita)
        : P.tipo === "puntos"
        ? inp("k-ppd", "Puntos por cada $1", P.ppd)
        : inp("k-pct", "% de cashback", P.pct)
    )
    + inp("k-min", "Compra mínima ($) — 0 = cualquier monto", P.minimo)
    + inp("k-meta", "Meta de la tarjeta", P.meta)
    + inp("k-plata", "Nivel Plata desde (visitas)", P.plata)
    + inp("k-oro", "Nivel Oro desde (visitas)", P.oro)
    + `</div></article>`;
}
function prev() {
  const d = D.dis,
    P = D.prog,
    c = cli(S.pc) || D.clientes.find(x => x.m) || { n: "Cliente", bal: 0, vis: 0 },
    nv = nivel(c),
    meta = P.meta,
    falta = Math.max(0, meta - c.bal);
  const ic = d.iconoImg ? `<img src="${esc(d.iconoImg)}" alt="">` : esc(d.icono);
  const cuerpo = P.tipo === "sellos"
    ? `<div class="sellos">${Array.from(
      { length: meta },
      (_, i) => `<div class="sello ${i<c.bal?"on":""}">${i<c.bal?ic:i+1}</div>`
    ).join("")}</div>`
    : `<p style="font-size:2rem;font-weight:800;text-align:center;margin:14px 0">${fmtU(c.bal)}</p>`;
  return `<div class="tel"><p style="font-size:.7rem;margin:0">Hola,</p><p
      style="font-weight:800;font-size:1.2rem;margin:0 0 10px;font-family:${esc(d.fuente)}">${esc(c.n.toUpperCase())}</p><div
      class="tarj" style="--f:${d.bg ? `url(${esc(d.bg)})` : d.fondo};--a:${d.acento};--t:${d.texto};font-family:${esc(d.fuente)}"><div
      class="fila" style="padding:0;flex-wrap:nowrap"><img class="logo" src="${esc(d.logo)}" alt=""><div
      style="flex:1"><b>${esc(d.titulo)}</b><p style="font-size:.6rem;margin:0;color:${d.acento}">${esc(d.lema.toUpperCase())}</p></div><span
      class="badge" style="background:${nv[1]};color:#fff">${nv[0]}</span></div><p
      style="text-align:center;font-weight:800;letter-spacing:.1em;margin:14px 0 0">TUS ${P.tipo === "sellos"
    ? "SELLOS"
    : P.tipo === "puntos"
    ? "PUNTOS"
    : "SALDO"}</p><p style="text-align:center;font-size:.65rem;margin:0">${P.tipo === "sellos"
    ? `Faltan ${falta} sellos para tu recompensa`
    : esc(P.bienv)}</p>${cuerpo}<div class="prog"><i style="width:${Math.min(100, c.bal / meta * 100)}%"></i></div><p
      style="text-align:right;font-size:.7rem;margin:4px 0 0">${Math.min(c.bal, meta)}/${meta} 🎁</p></div></div>`;
}
function lEdit() {
  const d = D.dis,
    ICO = [["⭐", "Estrella"], ["🔥", "Flama"], ["❤️", "Corazón"], ["🍔", "Burger"], ["🍣", "Sushi"]];
  const f = (id, l, t = "text") => `<label>${l}</label><input class="campo" type="${t}" data-d="${id}"
      value="${esc(d[id])}">`;
  return `<div class="encabezado"><div><h2 class="sub" style="margin:0">Editor visual</h2><p
      class="nota">Personaliza cómo ven tus clientes su tarjeta de lealtad.</p></div><button
      class="btn-rojo" data-act="dis-save">Guardar diseño</button></div>
  <article class="tarjeta"
      style="margin-bottom:16px">Programa actual: <b style="color:var(--rojo)">${D.prog.tipo[0].toUpperCase()
    + D.prog.tipo.slice(1)}</b> <span class="nota">(cámbialo en Configuración)</span></article>
  <div
      class="dos" style="grid-template-columns:1fr 340px"><div>
  <details class="tarjeta acord"><summary>Logo de la tarjeta</summary>${f("logo", "URL del logo")}</details>
  <details
      class="tarjeta acord"><summary>Texto y tipografía</summary>${f("titulo", "Título")}${f("lema", "Frase")}<label>Fuente</label><select
      class="campo" data-d="fuente">${[
    "Georgia, serif",
    "system-ui, sans-serif",
    "'Courier New', monospace",
    "'Trebuchet MS', sans-serif"
  ].map(x => `<option ${d.fuente===x?"selected":""}>${x}</option>`).join("")}</select></details>
  <details
      class="tarjeta acord"><summary>Imagen de fondo</summary>${f("bg", "URL de imagen (opcional)")}</details>
  <details
      class="tarjeta acord"><summary>Colores</summary>${f("fondo", "Fondo", "color")}${f("acento", "Acento", "color")}${f("texto", "Texto", "color")}</details>
  <details
      class="tarjeta acord" open><summary>Ícono de sello</summary><div class="periodo__botones">${ICO.map(
    ([e, n]) => `<button class="chip" data-act="dis-ico" data-v="${e}" aria-pressed="${d.icono === e
      && !d.iconoImg}">${e} ${n}</button>`
  ).join("")}</div>${f("icono", "Emoji propio")}${f("iconoImg", "O URL de imagen")}</details></div>
  <div><p><b>👁 Vista previa en vivo</b></p><select
      class="campo" id="pc-sel">${D.clientes.filter(c => c.m).map(
    c => `<option value="${esc(c.id)}" ${S.pc===c.id?"selected":""}>${esc(c.n)}</option>`
  ).join("")}</select><div id="preview">${prev()}</div></div></div>`;
}
