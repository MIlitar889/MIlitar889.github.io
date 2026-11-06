/* Piezas de interfaz reutilizables: encabezados, chips, avisos, gráficas */
/* ---------- piezas de interfaz ---------- */
const cab = (t, s, extra = "") => `<header class="encabezado"><div><h1>${t}</h1><p>${s}</p></div>${extra}</header>`;
const vacio = t => `<p class="vacio">${t}</p>`;
const kpi = a => `<section class="indicadores">`
  + a.map(
    ([e, v, c, s]) => `<article class="tarjeta indicador" style="--color:${c}"><p
        class="indicador__etiqueta">${e}</p><p class="indicador__valor">${v}</p>${s
      ? `<p class="nota" style="margin:2px 0 0">${s}</p>`
      : ""}</article>`
  ).join("")
  + `</section>`;
const chips = (a, act, cur) => `<div class="periodo__botones" style="margin-bottom:16px">`
  + a.map(
    ([k, t]) => `<button class="chip" data-act="${act}" data-v="${k}" aria-pressed="${String(cur) === String(k)}">${t}</button>`
  ).join("")
  + `</div>`;
function toast(m) {
  const t = $("toast");
  t.textContent = m;
  t.classList.add("on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("on"), 3500);
}
function descargar(nombre, texto, tipo) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([texto], { type: tipo }));
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}
function cols(serie) {
  if (!serie.some(p => p.valor)) return vacio("Sin datos recientes");
  const W = 600,
    H = 190,
    max = Math.max(...serie.map(p => p.valor)),
    w = W / serie.length,
    paso = Math.ceil(serie.length / 8);
  return `<svg viewBox="0 0 ${W} ${H+24}">`
    + serie.map(
      (p, i) => `<rect x="${i * w + 2}" y="${H - p.valor / max * H}" width="${w - 4}" height="${p.valor / max * H}"
          rx="3" fill="var(--rojo)"><title>${p.etiqueta}: ${p.valor}</title></rect>${i % paso
        ? ""
        : `<text x="${i * w + w / 2}" y="${H + 16}" text-anchor="middle" font-size="11"
            fill="#6B7280">${p.etiqueta}</text>`}`
    ).join("")
    + `</svg>`;
}
function donut(E, f = v => v) {
  const T = E.reduce((s, e) => s + e[1], 0);
  if (!T) return vacio("Sin datos todavía");
  const R = 70, C = 2 * Math.PI * R;
  let a = 0;
  return `<svg viewBox="0 0 200 200" style="max-width:220px;margin:0 auto">` + E.map(([l, v, c]) => {
    const L = v / T * C,
      s = `<circle r="${R}" cx="100" cy="100" fill="none" stroke="${c}" stroke-width="34"
          stroke-dasharray="${L} ${C - L}" stroke-dashoffset="${-a}"
          transform="rotate(-90 100 100)"/>`;
    a += L;
    return s;
  }).join("") + `</svg><ul class="leyenda">` + E.map(
    ([l, v, c]) => `<li style="--color:${c}"><i></i>${l}<b>${f(v)} · ${Math.round(v / T * 100)}%</b></li>`
  ).join("") + `</ul>`;
}
function barrasH(R) {
  if (!R.length) return vacio("Sin ventas en este período");
  const m = Math.max(...R.map(r => r[1]));
  return `<div class="barras">`
    + R.map(
      ([l, v]) => `<div class="barra__fila"><span>${esc(l)}</span><div class="barra__pista"><div
          class="barra__relleno" style="width:${v / m * 100}%"></div></div><b>${v}</b></div>`
    ).join("")
    + `</div>`;
}

const foto = p => p.img
  ? `<img src="${esc(p.img)}" data-r="${esc(p.r || "")}" alt="" loading="lazy"
      onerror="if(this.dataset.r&&this.src!==this.dataset.r){this.src=this.dataset.r}else{this.remove()}">`
  : `<div class="noimg">🍣</div>`;

const negocio = () => (D.neg && D.neg.n) || "Sushi Pu'uk";
// CSV para Excel: comillas escapadas y acentos correctos
const aCSV = filas => "\uFEFF"
  + filas.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");

// Opciones (Normal / Empanizado…) + nota libre de un producto, juntas para mostrarlas en cocina, tickets y pedidos
const notaItem = i => [(i.opc || []).join(", "), (i.nota || "").trim()].filter(Boolean).join(" · ");
const gruposDe = p => (p.m || []).map(n => D.mods.find(g => g.n === n)).filter(g => g && g.o.length);
// Si el producto tiene grupos de opciones, abre el cuadro para elegir; si no, continúa de inmediato
function pedirOpciones(p, cb) {
  const G = gruposDe(p);
  if (!G.length) return cb([], 0);
  $("opc-t").textContent = p.n;
  $("opc-body").innerHTML = G.map(
    (g, gi) => `<fieldset class="opc"><legend>${esc(g.n)}${g.req?" *":""}</legend>`
      + g.o.map(
        (o, oi) => `<label class="opc-o"><input type="radio" name="g${gi}" value="${oi}" ${g.req && oi === 0
          ? "checked"
          : ""}> ${esc(o.n)}${o.p ? ` <small>+${moneda.format(o.p)}</small>` : ""}</label>`
      ).join("")
      + (
        g.req
          ? ""
          : `<label class="opc-o"><input type="radio" name="g${gi}" value="" checked> Sin elegir</label>`
      )
      + `</fieldset>`
  ).join("");
  S.opc = { p, G, cb };
  $("dlg-opc").showModal();
}
