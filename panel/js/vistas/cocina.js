/* Pantalla de cocina para tablet: tres columnas, notas por producto, cancelar, chat y rondas de mesa */
const KSIG = { pending: "preparing", confirmed: "ready", preparing: "ready", ready: "delivered" };  // avanzar
const KANT = { confirmed: "pending", preparing: "pending", ready: "preparing" };  // regresar un paso
S.ks = "todas";
S.son = false;
S.ultPend = null;
S.kchat = false;
S.pre = "";

const minDesde = o => Math.max(
  0,
  Math.round(
    (Date.now() - new Date((o.fecha || hoyT()) + "T" + (o.hora || "00:00") + ":00")) / 60000
  )
);  // minutos desde que se pidió
function beep() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)(), g = c.createGain();
    g.connect(c.destination);
    [880, 1175].forEach((f, i) => {
      const o = c.createOscillator(), t = c.currentTime + i *.2;
      o.frequency.value = f;
      o.connect(g);
      g.gain.setValueAtTime(.3, t);
      o.start(t);
      o.stop(t +.15);
    });
  } catch (e) { }
}

// Un "ticket" es lo que cocina tiene que preparar: un pedido de caja, o UNA ronda de una mesa (solo lo nuevo)
const prevRondas = c => D.comandas.filter(
  x => x.cuenta === c.cuenta && x.ronda < c.ronda && x.estado !== "cancelled"
).map(
  x => `${x.items.filter(i=>!i.cancelado).map(i=>i.q+"× "+i.n).join(", ")} (${ESTADOS[x.estado]})`
).join(" · ");
function ticketsCocina() {
  const hoy = hoyT(), T = [], vivo = e => !["delivered", "cancelled"].includes(e);
  ORDENES.forEach(o => {
    if (!o.cuenta && vivo(o.estado)) T.push(
      {
        k: "o:" + o.id,
        fecha: o.fecha,
        tit: "#" + o.id,
        sub: tipoT(o),
        hora: o.hora || "",
        estado: o.estado,
        items: o.items || [],
        nota: o.nota
      }
    );
  });
  D.comandas.forEach(c => {
    if (vivo(c.estado)) T.push(
      {
        k: "c:" + c.id,
        fecha: c.fecha,
        tit: "Mesa " + c.mesa,
        sub: c.nombre,
        mesero: c.mesero,
        ronda: c.ronda,
        hora: c.hora,
        estado: c.estado,
        items: c.items,
        nota: "",
        prev: prevRondas(c)
      }
    );
  });
  return T.filter(t => minDesde(t) <= 1080).sort(
    (a, b) => ((a.fecha || "") + a.hora).localeCompare((b.fecha || "") + b.hora)
  );  // solo lo de las últimas 18 horas
}
// Productos que le tocan a la estación elegida (según las categorías asignadas a cada impresora)
const itemsT = t => S.ks === "todas" ? t.items : (ruta({ items: t.items })[S.ks] || []);
const getT = k => {
  const[t, id] = k.split(":");
  return t === "o" ? ORDENES.find(o => o.id == id) : D.comandas.find(c => c.id == id);
};

function vCocina() {
  const hoy = hoyT(), L = ticketsCocina().map(t => ({ t, it: itemsT(t) })).filter(x => x.it.length);
  const col = (titulo, estados, boton) => {
    const R = L.filter(x => estados.includes(x.t.estado));
    return `<section class="kcol"><h2>${titulo} <span class="badge">${R.length}</span></h2>` + (R.map(({ t, it }) => {
      const m = minDesde(t), c = m >= 20 ? "late" : m >= 10 ? "warn" : "";
      return `<article class="kcard ${c}"><header><b>${esc(t.tit)}</b><span>${esc(t.sub)}</span><span
          class="kt">${m} min</span></header>`
        + (t.ronda ? `<p class="kmeta">Mesero: ${esc(t.mesero||"-")} · Ronda ${t.ronda}</p>` : "")
        + (
          t.ronda > 1
            ? `<p class="kextra">➕ AGREGADO · RONDA ${t.ronda}: preparar SOLO lo de abajo</p>`
            : ""
        )
        + (t.prev ? `<p class="kprev">Ya enviado antes: ${esc(t.prev)}</p>` : "")
        + `<ul>${it.map(
          i => i.cancelado
            ? `<li class="kcanc"><s>${i.q}× ${esc(i.n)}</s> CANCELADO</li>`
            : `<li><b>${i.q}×</b> ${esc(i.n)}${notaItem(i)
              ? ` <span class="kinota">— ${esc(notaItem(i))}</span>`
              : ""}</li>`
        ).join("")}</ul>`
        + (t.nota ? `<p class="knota">⚠ ${esc(t.nota)}</p>` : "")
        + `<footer><div class="kfila">${KANT[t.estado]
          ? `<button class="kb kb--gris" data-act="co-ant" data-k="${t.k}" aria-label="Regresar">↩</button>`
          : ""}<button class="kb" data-act="co-sig" data-k="${t.k}">${boton}</button></div>`
        + `<div class="kfila"><button class="kb kb--chico" data-act="co-av" data-k="${t.k}">💬 Avisar</button><button
            class="kb kb--chico kb--rojo" data-act="co-can" data-k="${t.k}">✖ Cancelar</button></div></footer></article>`;
    }).join("") || `<p class="kvacio">Sin pedidos</p>`) + `</section>`;
  };
  const pend = L.filter(x => x.t.estado === "pending").length;
  if (S.ultPend !== null && pend > S.ultPend && S.son) beep();
  S.ultPend = pend;
  const sts = [
    ["todas", "Todas"],
    ...D.imp.map(p => [p.n, p.n]),
    ["Sin impresora (caja)", "Sin impresora"]
  ],
    sl = sinLeer();
  const chat = S.kchat ? `<section class="kchat">${chatHTML(30,S.pre)}</section>` : "";
  S.pre = "";
  const entregados = ORDENES.filter(o => o.fecha === hoy && o.estado === "delivered" && !o.cuenta).length
    + D.comandas.filter(c => c.fecha === hoy && c.estado === "delivered").length;
  return `<div class="kocina"><div class="khead"><h1>👨‍🍳 Cocina</h1><div class="kbar">${sts.map(
    ([k, t]) => `<button class="kchip" data-act="co-st" data-v="${esc(k)}" aria-pressed="${S.ks === k}">${esc(t)}</button>`
  ).join("")}</div><div class="kbar"><span class="kreloj">${new Date().toLocaleTimeString(
    "es-MX",
    { hour: "2-digit", minute: "2-digit" }
  )}</span><button class="kchip" data-act="co-chat" aria-pressed="${S.kchat}">💬 Chat${!S.kchat && sl
    ? ` (${sl})`
    : ""}</button><button class="kchip" data-act="co-son" aria-pressed="${S.son}">${S.son
    ? "🔔 Sonido"
    : "🔕 Sonido"}</button><button class="kchip" data-act="co-full">⛶ Pantalla completa</button><a
      class="kchip" href="#pedidos">← Panel</a></div></div>${chat}`
    + `<div class="kcols">${col("Nuevos", ["pending"], "▶ Empezar")}${col(
      "Preparando",
      ["confirmed", "preparing"],
      "✔ Listo"
    )}${col("Listos", ["ready"], "Entregado")}</div><p class="kpie">Entregados hoy: ${entregados} · los pedidos nuevos llegan al instante · los minutos se refrescan cada 30 s</p></div>`;
}
