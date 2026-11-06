/* ---- Pedidos ---- */
const PASOS = [
  ["pending", "Pend."],
  ["confirmed", "Conf."],
  ["preparing", "Prep."],
  ["ready", "Listo"],
  ["delivered", "OK"]
];
const ESTADOS_C = {
  pending: "Pend.",
  confirmed: "Conf.",
  preparing: "Prep.",
  ready: "Listo",
  delivered: "OK",
  cancelled: "Cancelado"
};
const nombreDe = o => o.nombreCliente || nomCli(o.cliente);
const telDe = o => o.tel || (cli(o.cliente) || { }).t || "";
const horaLarga = o => new Date(o.ts || 0).toLocaleTimeString(
  "es-MX",
  { hour: "2-digit", minute: "2-digit" }
);

function pedCard(o) {
  const ab = String(S.pedAb) === String(o.id),
    est = o.estado,
    cerrado = ["delivered", "cancelled"].includes(est),
    i = PASOS.findIndex(p => p[0] === est);
  const cab = `<button class="pcab" data-act="ped-abrir" data-id="${o.id}" aria-expanded="${ab}"><span
      class="ph">${horaLarga(o)}</span><span class="pic">🛍</span><span class="pn"><b>${esc(nombreDe(o).toUpperCase())}</b><br><span
      class="ptag">${esc(tipoT(o))}</span> <small class="nota" style="margin:0">${esc(negocio())} ${esc(D.neg.sucursal || "")}</small>${o.origen === "cliente"
    ? ` <span class="badge ok">📱 Cliente</span>`
    : ""}</span><span class="pt"><b>${moneda.format(o.total)}</b><br><span class="badge ${est === "delivered"
    ? "ok"
    : est === "cancelled"
    ? "mal"
    : ""}">${ESTADOS_C[est]}</span></span><span>${ab ? "⌃" : "⌄"}</span></button>`;
  if (!ab) return `<article class="tarjeta pcard">${cab}</article>`;
  const linea = est === "cancelled"
    ? `<p class="badge mal">Cancelado${o.por ? " por " + esc(o.por) : ""}${o.motivo
      ? ": " + esc(o.motivo)
      : ""}</p>`
    : `<div class="plinea">${PASOS.map(
      ([k, t], x) => `<div class="paso ${x < i ? "hecho" : x === i ? "actual" : ""}"><span
          class="dot">${x <= i ? "✓" : x + 1}</span><small>${t}</small></div>`
    ).join("")}</div>`;
  const acc = cerrado
    ? ""
    : `<label>TIEMPO ESTIMADO DE ENTREGA (MINUTOS)</label><input class="campo" type="number" min="1"
        max="240" id="te-${o.id}" data-te="${o.id}" value="${o.tiempoEst || 30}"
        style="max-width:200px"><p class="nota" style="margin:10px 0 4px">ACCIONES RÁPIDAS</p><div
        class="periodo__botones">${[
      ["confirmed", "Confirmar"],
      ["preparing", "Preparando"],
      ["ready", "Listo"],
      ["delivered", "Completar"],
      ["cancelled", "Cancelar"]
    ].map(
      ([e, t]) => `<button class="chip pq pq--${e}" data-act="ped-set" data-id="${o.id}" data-e="${e}"
          aria-pressed="${est === e}">${t}</button>`
    ).join("")}</div>`;
  return `<article class="tarjeta pcard abierta">${cab}<div class="pdet">${linea}`
    + (
      telDe(o)
        ? `<div class="pinfo"><span class="pic">📞</span><div><small class="nota" style="margin:0">TELÉFONO</small><br><b>${esc(telDe(o))}</b></div></div>`
        : ""
    )
    + `<p class="nota" style="margin:10px 0 4px">DETALLE DEL PEDIDO</p><div class="pitems">${(o.items || []).map(
      x => `<div class="fila" style="padding:8px 0"><span style="flex:1"><b>${x.q}x ${esc(x.n)}</b>${notaItem(x)
        ? `<br><small class="nota" style="margin:0">${esc(notaItem(x))}</small>`
        : ""}</span><b style="color:var(--rojo)">${moneda.format(x.c * x.q)}</b></div>`
    ).join("")}</div>`
    + (o.nota ? `<p class="nota">Nota: ${esc(o.nota)}</p>` : "")
    + `<div class="pgrid"><div><small class="nota" style="margin:0">PAGO</small><br><b>${esc(
      (METODOS[o.metodo] || { nombre: o.metodo }).nombre
    )}</b></div><div><small class="nota" style="margin:0">SUCURSAL</small><br><b>${esc(negocio())} ${esc(D.neg.sucursal || "")}</b></div><div><small
        class="nota" style="margin:0">TIEMPO EST.</small><br><b>${o.tiempoEst || 30} min</b></div></div>`
    + acc
    + `<button class="chip pimp" data-act="ped-imp" data-id="${o.id}">🖨 Reimprimir comanda</button></div></article>`;
}
function vPedidos() {
  const L = ORDENES.filter(o => o.fecha === hoyT()).sort((a, b) => (b.ts || b.id) - (a.ts || a.id)),
    g = k => L.filter(o => GRUPO[o.estado] === k);
  const vis = L.filter(o => S.ped === "todos" || GRUPO[o.estado] === S.ped),
    ventas = L.filter(o => o.estado !== "cancelled").reduce((s, o) => s + o.total, 0);
  const fl = [
    ["todos", "Todos", L.length],
    ["pendientes", "Pendientes", g("pendientes").length],
    ["proceso", "En Proceso", g("proceso").length],
    ["completados", "Completados", g("completados").length],
    ["cancelados", "Cancelados", g("cancelados").length]
  ];
  return cab(
    "Operación del día",
    new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" }),
    `<a class="boton-exportar" href="#caja">+ Nueva venta</a>`
  )
    + kpi(
      [
        [
          "Total pedidos",
          L.length,
          "var(--rojo)",
          `${L.filter(o => o.tipo === "domicilio").length} a domicilio · ${L.filter(o => o.tipo === "mesa").length} en mesa`
        ],
        ["En proceso", g("proceso").length + g("pendientes").length, "var(--dorado)"],
        ["Completados", g("completados").length, "var(--verde)"],
        ["Ventas", moneda.format(ventas), "var(--negro)"]
      ]
    )
    + `<div class="periodo__botones" style="margin-bottom:16px">${fl.map(
      ([k, t, n]) => `<button class="chip" data-act="ped-f" data-v="${k}" aria-pressed="${S.ped === k}">${t} <span
          class="badge">${n}</span></button>`
    ).join("")}</div>`
    + (
      vis.length
        ? `<div class="lista">${vis.map(pedCard).join("")}</div>`
        : `<div class="tarjeta">${vacio("Sin pedidos hoy")}</div>`
    )
    + mesasAbiertasHTML()
    + `<article class="tarjeta" style="margin-top:20px"><h2>Actividad reciente</h2>`
    + (
      D.act.length
        ? D.act.slice(0, 8).map(
          a => `<p class="nota" style="margin:4px 0"><b>${a.f}</b> — ${esc(a.t)}</p>`
        ).join("")
        : vacio("Aún no hay actividad")
    )
    + `</article>`;
}
// Mesas abiertas por los meseros: aquí la caja las cobra (se convierten en UN pedido con todo lo consumido)
function mesasAbiertasHTML() {
  const A = D.cuentas.filter(c => c.abierta);
  return `<article class="tarjeta" style="margin-top:20px"><h2>🍽 Mesas abiertas (${A.length})</h2>`
    + (
      A.length
        ? A.map(
          c => `<div class="fila" style="padding:8px 0;border-top:1px solid var(--borde)"><b>Mesa ${c.mesa}</b><span>${esc(c.nombre)}</span><span
              class="nota" style="margin:0">${esc(c.mesero)}</span>${rondasBadges(c)}${c.pideCuenta
            ? `<span class="badge mal">🧾 Pide la cuenta</span>`
            : ""}<b style="margin-left:auto">${moneda.format(totalCuenta(c))}</b><select
              class="campo keep" id="cb-m-${c.id}" style="width:auto;margin:0">${Object.entries(METODOS).map(
            ([k, v]) => `<option value="${k}">${v.nombre}</option>`
          ).join("")}</select><input class="campo keep" id="cb-c-${c.id}" list="dl-cli2"
              placeholder="Cliente (opcional)" style="width:190px;margin:0"><button
              class="btn-verde" data-act="mz-cobrar" data-id="${c.id}">Cobrar</button></div>`
        ).join("") + `<datalist id="dl-cli2">${D.clientes.map(
          x => `<option value="${esc(x.n)} · ${esc(x.t||x.e||"sin dato")}">`
        ).join("")}</datalist>`
        : vacio("No hay mesas abiertas")
    )
    + `</article>`;
}
