/* App del dueño (celular): ventas, comparación, en vivo, avisos e historial de pedidos. Solo consulta. */
S.dn = { tab: "hoy", per: "7", est: "todos", met: "todos", mes: "todos", q: "", ver: null, lim: 60 };

const ventasDe = L => L.filter(o => o.estado !== "cancelled");
const sumT = L => L.reduce((s, o) => s + o.total, 0);
const fechaMas = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return aTexto(d);
};
const delDia = f => ventasDe(ORDENES.filter(o => o.fecha === f));
const chipDelta = (a, b, txt) => {
  if (!b) return `<span class="badge">sin datos de ${txt}</span>`;
  const d = Math.round((a - b) / b * 1000) / 10;
  return `<span class="badge ${d<0?"mal":"ok"}">${d<0?"▼":"▲"} ${Math.abs(d)}% vs ${txt}</span>`;
};
const topProductos = L => {
  const p = { };
  L.forEach(o => (o.items || []).forEach(i => {
    p[i.n] = (p[i.n] || 0) + i.q;
  }));
  return Object.entries(p).sort((a, b) => b[1] - a[1]).slice(0, 5);
};
const fechaLarga = f => aFecha(f).toLocaleDateString(
  "es-MX",
  { weekday: "long", day: "numeric", month: "long" }
);

function vDueno() {
  const c = credencial();
  if (!c) return dnSetup();
  if (!sesionActiva()) return dnLogin(c);
  const N = S.dn, ahora = new Date();
  const cuerpo = N.tab === "vivo" ? dnVivo() : N.tab === "hist" ? dnHist() : dnHoy();
  const cuenta = N.cuenta
    ? `<article class="tarjeta"><h2>Cambiar contraseña</h2><label>Contraseña actual</label><input
        class="campo keep" id="dn-pa" type="password" autocomplete="current-password"><label>Nueva contraseña (mínimo 6)</label><input
        class="campo keep" id="dn-pn" type="password" autocomplete="new-password"><label>Repite la nueva</label><input
        class="campo keep" id="dn-pn2" type="password" autocomplete="new-password"><button
        class="btn-rojo mz-btn" data-act="dn-cambiar">Guardar contraseña</button></article>`
    : "";
  return `<div class="dn"><div class="dn-top"><div class="fila" style="padding:0"><b
      style="font-size:1.3rem;flex:1">${esc(negocio())}</b><button class="chip" data-act="dn-cuenta">⚙ ${esc(c.u)}</button><button
      class="chip" data-act="dn-salir">Salir</button></div><small class="nota">Dueño · ${ahora.toLocaleDateString(
    "es-MX",
    { weekday: "long", day: "numeric", month: "long" }
  )} · actualizado ${ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</small></div>${cuenta}${cuerpo}</div>`
    + `<nav class="dn-tabs">`
    + [["hoy", "📊 Hoy"], ["vivo", "🔴 En vivo"], ["hist", "🧾 Historial"]].map(
      ([k, t]) => `<button data-act="dn-tab" data-v="${k}" ${N.tab === k
        ? 'aria-current="true"'
        : ""}>${t}</button>`
    ).join("")
    + `</nav>`;
}
// Primera vez: crear nombre y contraseña
function dnSetup() {
  return `<div class="dn"><div class="dn-top"><b style="font-size:1.4rem">${esc(negocio())}</b><small
      class="nota">App del dueño</small></div><article class="tarjeta"><h2>Crea tu acceso</h2><p
      class="nota">Elige un nombre y una contraseña para entrar a esta app desde este aparato.</p><label>Tu nombre</label><input
      class="campo keep" id="dn-user" placeholder="Ej. Don Luis" maxlength="30"
      autocomplete="username"><label>Contraseña (mínimo 6 caracteres)</label><input
      class="campo keep" id="dn-p1" type="password" autocomplete="new-password"><label>Repite la contraseña</label><input
      class="campo keep" id="dn-p2" type="password" autocomplete="new-password"><button
      class="btn-rojo mz-btn" data-act="dn-crear">Crear acceso y entrar</button><p class="nota">Esto evita que otras personas vean las ventas en este teléfono. Si la olvidas, se restablece desde Configuración, en el panel.</p></article></div>`;
}
// Inicio de sesión
function dnLogin(c) {
  const b = bloqueadoHasta();
  return `<div class="dn"><div class="dn-top"><b style="font-size:1.4rem">${esc(negocio())}</b><small
      class="nota">App del dueño</small></div><article class="tarjeta"><h2>Hola, ${esc(c.u)}</h2><p
      class="nota">Escribe tu contraseña para ver las ventas.</p>${b
    ? `<p class="badge mal">Acceso bloqueado hasta las ${new Date(b).toLocaleTimeString(
      "es-MX",
      { hour: "2-digit", minute: "2-digit" }
    )}</p>`
    : ""}<input class="campo keep" id="dn-pass" type="password" placeholder="Contraseña"
      autocomplete="current-password"><button class="btn-rojo mz-btn" data-act="dn-entrar">Entrar</button><p
      class="nota">La sesión se cierra sola tras ${MIN_SESION} minutos sin usarla.</p></article></div>`;
}

/* ---- Pestaña "Hoy" ---- */
function dnHoy() {
  const hoy = hoyT(),
    V = delDia(hoy),
    tot = sumT(V),
    ayer = sumT(delDia(fechaMas(-1))),
    sp = sumT(delDia(fechaMas(-7)));
  const serie = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      etiqueta: d.toLocaleDateString("es-MX", { weekday: "short" }).replace(".", ""),
      valor: Math.round(sumT(delDia(aTexto(d))))
    };
  });
  const sem = ventasDe(ORDENES.filter(o => o.fecha >= fechaMas(-6) && o.fecha <= hoy));
  const mes = { };
  V.forEach(o => {
    const k = o.mesero ? "Mesero " + o.mesero : "Caja";
    mes[k] = mes[k] || { n: 0, t: 0 };
    mes[k].n++;
    mes[k].t += o.total;
  });
  const m = contar(V, "metodo", true);
  return `<article class="tarjeta dn-hero"><p class="nota" style="margin:0">Ventas de hoy</p><p
      class="dn-grande">${moneda.format(tot)}</p><div>${chipDelta(tot, ayer, "ayer")}${chipDelta(
    tot,
    sp,
    "el mismo día de la semana pasada"
  )}</div>`
    + `<div class="dn-mini"><span><b>${V.length}</b><br>pedidos</span><span><b>${moneda.format(V.length ? tot / V.length : 0)}</b><br>ticket promedio</span><span><b>${new Set(
      V.map(o => o.cliente).filter(c => c && c !== "mostrador")
    ).size}</b><br>clientes</span></div></article>`
    + `<article class="tarjeta grafica"><h2>Cómo se pagó hoy</h2>${donut(
      Object.entries(m).map(
        ([k, v]) => [
          (METODOS[k] || { nombre: k }).nombre,
          v,
          (METODOS[k] || { color: "#999" }).color
        ]
      ),
      moneda.format.bind(moneda)
    )}</article>`
    + `<article class="tarjeta grafica"><h2>Últimos 7 días</h2>${cols(serie)}<p class="nota">Ventas por día (pesos).</p></article>`
    + `<article class="tarjeta"><h2>Lo más vendido</h2><p class="nota" style="margin:0 0 6px">Hoy</p>${barrasH(topProductos(V))}<p
        class="nota" style="margin:12px 0 6px">Últimos 7 días</p>${barrasH(topProductos(sem))}</article>`
    + `<article class="tarjeta"><h2>Resumen del día por mesero</h2>`
    + (
      Object.keys(mes).length
        ? Object.entries(mes).map(
          ([k, v]) => `<div class="dn-fila"><b style="flex:1">${esc(k)}</b><span>${v.n} pedidos</span><b>${moneda.format(v.t)}</b></div>`
        ).join("")
        : vacio("Sin ventas hoy")
    )
    + `</article>`;
}

/* ---- Pestaña "En vivo": mesas abiertas, cocina y avisos ---- */
function dnVivo() {
  const hoy = hoyT(),
    A = D.cuentas.filter(c => c.abierta),
    T = ticketsCocina(),
    n = e => T.filter(t => e.includes(t.estado)).length;
  const canc = [
    ...ORDENES.filter(o => o.fecha === hoy && o.estado === "cancelled").map(
      o => (
        {
          h: o.hora || "",
          t: "Pedido #" + o.id,
          s: (o.items || []).map(i => i.q + "× " + i.n).join(", "),
          m: o.motivo,
          p: o.por || "Caja"
        }
      )
    ),
    ...D.comandas.filter(c => c.fecha === hoy && c.estado === "cancelled").map(
      c => (
        {
          h: c.hora,
          t: `Mesa ${c.mesa} · ronda ${c.ronda}`,
          s: c.items.map(i => i.q + "× " + i.n).join(", "),
          m: c.motivo || "El mesero quitó todo lo de la ronda",
          p: c.por || "Mesero " + c.mesero
        }
      )
    )
  ].sort((a, b) => b.h.localeCompare(a.h));
  return `<article class="tarjeta"><h2>🍽 Mesas abiertas (${A.length})</h2>` + (
    A.length
      ? A.map(
        c => `<div class="dn-fila"><div style="flex:1"><b>Mesa ${c.mesa}</b> · ${esc(c.nombre)}<br><small
            class="nota" style="margin:0">${esc(c.mesero)} · desde ${c.hora}${c.pideCuenta
          ? ` · <b style="color:var(--rojo)">🧾 pidió la cuenta</b>`
          : ""}</small></div><b>${moneda.format(totalCuenta(c))}</b></div>`
      ).join("") + `<p class="nota">Aún sin cobrar: no cuentan en las ventas hasta que la caja las cobra.</p>`
      : vacio("No hay mesas abiertas")
  ) + `</article>` + `<article class="tarjeta"><h2>👨‍🍳 Cocina ahora</h2><div class="dn-mini"><span><b>${n(["pending"])}</b><br>nuevos</span><span><b>${n(["confirmed", "preparing"])}</b><br>preparando</span><span><b>${n(["ready"])}</b><br>listos</span></div>` + (T.length ? T.map(t => {
    const m = minDesde(t);
    return `<div class="dn-fila"><span style="flex:1"><b>${esc(t.tit)}</b> ${esc(t.sub)}${t.ronda > 1
      ? ` <span class="badge">Ronda ${t.ronda}</span>`
      : ""}</span><span class="badge ${m >= 20 ? "mal" : m >= 10 ? "" : "ok"}">${m} min</span><span
        class="badge">${esc(RLBL[t.estado] || ESTADOS[t.estado])}</span></div>`;
  }).join("") : vacio("La cocina está al día")) + `</article>` + `<article class="tarjeta"><h2>🚫 Cancelaciones de hoy (${canc.length})</h2>` + (
    canc.length
      ? canc.map(
        c => `<div class="dn-fila" style="align-items:flex-start"><div style="flex:1"><b>${esc(c.t)}</b> <small
            class="nota" style="margin:0">${esc(c.h)} · ${esc(c.p)}</small><br>${esc(c.s)}<br><span
            style="color:var(--rojo)">Motivo: ${esc(c.m || "sin motivo")}</span></div></div>`
      ).join("")
      : vacio("Sin cancelaciones hoy")
  ) + `</article>`;
}

/* ---- Pestaña "Historial" ---- */
function filtraHist() {
  const N = S.dn, base = new Date();
  base.setHours(0, 0, 0, 0);
  let L = ORDENES.slice();
  if (N.per !== "todo") {
    const lim = new Date(base);
    lim.setDate(lim.getDate() - (+N.per - 1));
    L = L.filter(o => aFecha(o.fecha) >= lim);
  }
  if (N.est === "entregados") L = L.filter(o => o.estado === "delivered");
  else if (N.est === "cancelados") L = L.filter(o => o.estado === "cancelled");
  else if (N.est === "curso") L = L.filter(o => !["delivered", "cancelled"].includes(o.estado));
  if (N.met !== "todos") L = L.filter(o => o.metodo === N.met);
  if (N.mes !== "todos") L = L.filter(o => (o.mesero || "Caja") === N.mes);
  const q = N.q.trim().toLowerCase();
  if (q) L = L.filter(
    o => (
      "#"
        + o.id
        + " "
        + tipoT(o)
        + " "
        + (o.nombreMesa || "")
        + " "
        + nomCli(o.cliente)
        + " "
        + (o.items || []).map(i => i.n + " " + notaItem(i)).join(" ")
    ).toLowerCase().includes(q)
  );
  return L.sort(
    (a, b) => (b.fecha + (b.hora || "")).localeCompare(a.fecha + (a.hora || "")) || b.id - a.id
  );
}
function dnDetalle(o) {
  const R = o.cuenta ? D.comandas.filter(c => c.cuenta === o.cuenta) : [],
    cu = o.cuenta ? cuenta(o.cuenta) : null;
  return `<div class="dn-det">`
    + (o.items || []).map(
      i => `<div>${i.q}× ${esc(i.n)}${notaItem(i)
        ? ` <span class="badge">${esc(notaItem(i))}</span>`
        : ""}</div>`
    ).join("")
    + (o.nota ? `<div class="nota">Nota: ${esc(o.nota)}</div>` : "")
    + `<div class="nota">${esc((METODOS[o.metodo] || { nombre: o.metodo }).nombre)} · ${o.mesero
      ? "Mesero " + esc(o.mesero)
      : "Caja"} · ${esc(nomCli(o.cliente))}${o.premio ? " · ganó " + esc(fmtU(o.premio)) : ""}</div>`
    + (
      R.length
        ? `<div style="margin-top:6px"><b>Rondas</b>` + R.map(
          c => `<div class="nota" style="margin:2px 0">Ronda ${c.ronda} · ${c.hora} · ${RLBL[c.estado]}: ${c.items.map(
            i => (i.cancelado ? "✖ " : "") + i.q + "× " + esc(i.n)
          ).join(", ")}</div>`
        ).join("") + `</div>`
        : ""
    )
    + (
      cu && cu.items.some(i => i.est === "cancelado")
        ? `<div class="nota" style="color:var(--rojo)">Quitados de la cuenta: ${cu.items.filter(i => i.est === "cancelado").map(i => i.q + "× " + esc(i.n)).join(", ")}</div>`
        : ""
    )
    + (
      o.estado === "cancelled"
        ? `<div style="color:var(--rojo);font-weight:700">Cancelado por ${esc(o.por || "Caja")}${o.motivo
          ? ": " + esc(o.motivo)
          : ""}</div>`
        : ""
    )
    + `</div>`;
}
function dnHist() {
  const N = S.dn,
    L = filtraHist(),
    V = ventasDe(L),
    meseros = [...new Set(ORDENES.map(o => o.mesero || "Caja"))];
  let dia = "", html = "";
  L.slice(0, N.lim).forEach(o => {
    if (o.fecha !== dia) {
      dia = o.fecha;
      const dd = L.filter(x => x.fecha === dia);
      html += `<div class="dn-dia"><b>${fechaLarga(dia)}</b><span>${moneda.format(sumT(ventasDe(dd)))} · ${dd.length} pedidos</span></div>`;
    }
    const abierto = String(N.ver) === String(o.id);
    html += `<button class="dn-fila dn-ped" data-act="dn-ver" data-id="${o.id}"><span
        style="flex:1;text-align:left"><b>#${o.id}</b> ${esc(o.hora || "")} · ${esc(tipoT(o))}${o.nombreMesa
      ? " · " + esc(o.nombreMesa)
      : ""}<br><small class="nota" style="margin:0">${esc(nomCli(o.cliente))}</small></span><span
        style="text-align:right"><b>${moneda.format(o.total)}</b><br><span class="badge ${o.estado === "delivered"
      ? "ok"
      : o.estado === "cancelled"
      ? "mal"
      : ""}">${ESTADOS[o.estado]}</span></span></button>`
      + (abierto ? dnDetalle(o) : "");
  });
  return `<article class="tarjeta"><div class="periodo__botones" style="margin-bottom:10px">${[
    ["1", "Hoy"],
    ["7", "7 días"],
    ["30", "30 días"],
    ["todo", "Todo"]
  ].map(
    ([k, t]) => `<button class="chip" data-act="dn-per" data-v="${k}" aria-pressed="${N.per === k}">${t}</button>`
  ).join("")}</div>`
    + `<div class="periodo__botones" style="margin-bottom:10px">${[
      ["todos", "Todos"],
      ["entregados", "Entregados"],
      ["cancelados", "Cancelados"],
      ["curso", "En curso"]
    ].map(
      ([k, t]) => `<button class="chip" data-act="dn-est" data-v="${k}" aria-pressed="${N.est === k}">${t}</button>`
    ).join("")}</div>`
    + `<div style="display:flex;gap:8px"><select class="campo" id="dn-met" style="margin:0"><option
        value="todos">Todos los pagos</option>${Object.entries(METODOS).map(
      ([k, v]) => `<option value="${k}" ${N.met===k?"selected":""}>${v.nombre}</option>`
    ).join("")}</select><select class="campo" id="dn-mes" style="margin:0"><option value="todos">Todo el personal</option>${meseros.map(
      x => `<option ${N.mes===x?"selected":""}>${esc(x)}</option>`
    ).join("")}</select></div>`
    + `<input class="campo" id="dn-q" placeholder="Buscar: mesa, cliente, producto, nota, #…"
        value="${esc(N.q)}" style="margin:10px 0 0"></article>`
    + `<div class="fila" style="padding:4px 4px"><b>${L.length} pedidos · ${moneda.format(sumT(V))}</b><span
        class="nota" style="margin:0">(sin contar cancelados)</span><button class="chip"
        style="margin-left:auto" data-act="dn-csv">⬇ Excel</button></div>`
    + `<article class="tarjeta" style="padding:8px 14px">${html
      || vacio("No hay pedidos con estos filtros")}`
    + (
      L.length > N.lim
        ? `<button class="chip" style="margin:10px 0" data-act="dn-mas">Ver más (${L.length - N.lim})</button>`
        : ""
    )
    + `</article>`;
}
