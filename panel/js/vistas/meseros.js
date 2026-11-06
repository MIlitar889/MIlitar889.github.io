/* Panel de meseros (para el celular): abrir mesa, pedir por rondas, quitar o agregar, pedir la cuenta */
S.m = { vista: "home", id: null, cat: 0, q: "", pick: false };

function vMeseros() {
  const nom = nombreMesero();
  if (!nom) return `<div class="mz"><div class="mz-top"><h1 style="font-size:1.5rem;margin:0">🍽 Meseros</h1></div><div
      class="tarjeta"><h2>¿Cómo te llamas?</h2><input class="campo keep" id="mz-nombre"
      placeholder="Tu nombre" maxlength="30" autocomplete="off"><button class="btn-rojo mz-btn"
      data-act="mz-entrar">Entrar</button></div></div>`;
  const M = S.m, c = cuenta(M.id), sl = sinLeer();
  const top = `<div class="mz-top"><div><b style="font-size:1.2rem">🍽 ${esc(nom)}</b><br><small
      class="nota">${new Date().toLocaleDateString(
    "es-MX",
    { weekday: "long", day: "numeric", month: "long" }
  )}</small></div><div><button class="chip" data-act="co-chat">💬 Chat${!S.kchat && sl
    ? ` (${sl})`
    : ""}</button> <button class="chip" data-act="mz-salir">Salir</button></div></div>`;
  const chat = S.kchat
    ? `<div class="tarjeta" style="margin-bottom:12px">${chatHTML(30,S.pre)}</div>`
    : "";
  S.pre = "";
  const cuerpo = M.vista === "mesa" && c && c.abierta
    ? mzMesa(c)
    : M.vista === "nueva"
    ? mzNueva()
    : mzHome();
  return `<div class="mz">${top}${chat}${cuerpo}</div>`;
}
function mzHome() {
  const A = D.cuentas.filter(c => c.abierta), yo = nombreMesero();
  return `<button class="btn-rojo mz-btn" data-act="mz-nueva">＋ Nueva mesa</button><h2
      style="margin:16px 0 8px">Mesas abiertas (${A.length})</h2>` + (A.map(c => {
    const R = D.comandas.filter(x => x.cuenta === c.id && x.estado !== "cancelled"),
      n = f => R.filter(f).length;
    const est = [
      ["En cocina", n(x => x.estado === "pending"), ""],
      ["Preparando", n(x => ["confirmed", "preparing"].includes(x.estado)), ""],
      ["¡Listo para llevar!", n(x => x.estado === "ready"), "ok"]
    ].filter(e => e[1]).map(([t, k, cl]) => `<span class="badge ${cl}">${t} ${k}</span>`).join("");
    return `<button class="tarjeta mz-mesa" data-act="mz-abrir" data-id="${c.id}"><div class="fila"
        style="padding:0"><b style="font-size:1.2rem">Mesa ${c.mesa}</b><span>${esc(c.nombre)}</span><b
        style="margin-left:auto">${moneda.format(totalCuenta(c))}</b></div><small class="nota">${esc(c.mesero)}${c.mesero === yo
      ? " (tú)"
      : ""} · abierta ${c.hora}</small><div>${est}${c.pideCuenta
      ? `<span class="badge mal">🧾 Pidió la cuenta</span>`
      : ""}</div></button>`;
  }).join("") || vacio("No hay mesas abiertas. Toca “Nueva mesa”."));
}
function mzNueva() {
  const libres = Array.from({ length: 15 }, (_, i) => i + 1).filter(n => !cuentaDeMesa(n));
  return `<div class="tarjeta"><h2>Nueva mesa</h2><label>Número de mesa</label><select
      class="campo keep" id="mz-num">${libres.map(n => `<option>${n}</option>`).join("")}</select><label>Nombre de la mesa</label><input
      class="campo keep" id="mz-nom" placeholder="Ej. Familia López, Cumpleaños de Ana"
      maxlength="40" autocomplete="off"><button class="btn-rojo mz-btn" data-act="mz-abrir-mesa">Abrir mesa</button><button
      class="chip" style="margin-top:10px" data-act="mz-home">← Volver</button></div>`;
}
function mzMesa(c) {
  const M = S.m,
    B = borradores(c),
    R = D.comandas.filter(x => x.cuenta === c.id),
    q = M.q.toLowerCase();
  const draft = B.map(
    i => `<div class="tarjeta" style="margin-bottom:8px"><div class="fila" style="padding:0"><b
        style="flex:1">${esc(i.n)}${(i.opc || []).length
      ? `<br><small class="nota" style="margin:0">${esc(i.opc.join(", "))}</small>`
      : ""}</b><button class="chip" data-act="mz-q" data-iid="${i.id}" data-d="-1">−</button><b>${i.q}</b><button
        class="chip" data-act="mz-q" data-iid="${i.id}" data-d="1">+</button><button class="ico"
        data-act="mz-del" data-iid="${i.id}" aria-label="Quitar">🗑</button></div><input
        class="campo" id="mi-${i.id}" data-mi="${i.id}" value="${esc(i.nota || "")}"
        placeholder="Nota (ej. con alga, empanizado…)" maxlength="80" style="margin:8px 0 0"></div>`
  ).join("");
  const prods = (
    q
      ? D.menu.flatMap(m => m.p).filter(p => p.n.toLowerCase().includes(q))
      : (D.menu[M.cat] || D.menu[0]).p
  ).filter(p => p.on);
  const picker = M.pick
    ? `<div class="tarjeta" style="margin-bottom:12px"><div class="cats">${D.menu.map(
      (m, i) => `<button class="chip" data-act="mz-cat" data-v="${i}" aria-pressed="${M.cat === i
        && !q}">${m.e} ${esc(m.n)}</button>`
    ).join("")}</div><input class="campo" id="mz-q" placeholder="Buscar producto…" value="${esc(M.q)}"
        style="margin:8px 0">` + (
      prods.length
        ? prods.map(
          p => `<div class="pick__fila"><span style="flex:1"><b>${esc(p.n)}</b><br><small>${moneda.format(p.c)}</small></span><button
              class="chip" data-act="mz-add" data-n="${esc(p.n)}">＋ Agregar</button></div>`
        ).join("")
        : vacio("No hay productos disponibles aquí. Pon precio y actívalos en Menú.")
    ) + `<button class="chip" style="margin-top:8px" data-act="mz-nopick">Cerrar lista</button></div>`
    : `<button class="btn-verde mz-btn" data-act="mz-pick">＋ Agregar productos</button>`;
  const rondas = R.map(cm => {
    const its = c.items.filter(i => i.rid === cm.id);
    return `<div class="tarjeta" style="margin-bottom:10px"><div class="fila" style="padding:0"><b>Ronda ${cm.ronda}</b><small
        class="nota" style="margin:0">${cm.hora}</small><span class="badge ${cm.estado === "ready"
      ? "ok"
      : cm.estado === "cancelled"
      ? "mal"
      : ""}">${RLBL[cm.estado]}</span><button class="chip" style="margin-left:auto"
        data-act="mz-imp" data-id="${cm.id}">🖨 Imprimir</button></div>`
      + its.map(
        i => `<div class="fila" style="padding:6px 0;border-top:1px solid var(--borde)"><span
            style="flex:1">${i.est === "cancelado"
          ? `<s>${i.q}× ${esc(i.n)}</s> <span class="badge mal">Quitado</span>`
          : `${i.q}× ${esc(i.n)}`}${i.nota
          ? `<br><small class="nota" style="margin:0">${esc(i.nota)}</small>`
          : ""}</span>${i.est === "enviado"
          ? `<button class="chip" data-act="mz-del" data-iid="${i.id}">Quitar</button>`
          : ""}</div>`
      ).join("")
      + (
        cm.estado === "ready"
          ? `<button class="btn-verde mz-btn" style="margin-top:8px" data-act="mz-ent" data-id="${cm.id}">✔ Ya lo llevé a la mesa</button>`
          : ""
      )
      + `</div>`;
  }).join("");
  const nB = B.reduce((s, i) => s + i.q, 0);
  return `<div class="mz-top" style="justify-content:flex-start;gap:10px"><button class="chip"
      data-act="mz-home">← Mesas</button><div><b style="font-size:1.3rem">Mesa ${c.mesa}</b> · ${esc(c.nombre)}<br><small
      class="nota">${esc(c.mesero)} · abierta ${c.hora}</small></div></div>`
    + (B.length ? `<h2 style="margin:12px 0 8px">Por enviar</h2>${draft}` : "")
    + picker
    + (R.length ? `<h2 style="margin:16px 0 8px">Enviado a cocina</h2>${rondas}` : "")
    + `<div class="tarjeta"><div class="fila" style="padding:0"><b>Total de la mesa</b><b
        style="margin-left:auto;font-size:1.3rem">${moneda.format(totalCuenta(c))}</b></div>${c.pideCuenta
      ? `<p class="nota">🧾 Ya pediste la cuenta; la caja la cobrará.</p>`
      : `<button class="chip" style="margin-top:8px" data-act="mz-cuenta">🧾 Pedir la cuenta</button>`}${!itemsVivos(c).length && !B.length
      ? ` <button class="chip" data-act="mz-liberar">Liberar mesa</button>`
      : ""}</div>`
    + `<div class="mz-barra"><button class="btn-rojo mz-btn" data-act="mz-env" ${nB
      ? ""
      : "disabled"}>${nB ? `Enviar a cocina (${nB})` : "Nada por enviar"}</button></div>`;
}
