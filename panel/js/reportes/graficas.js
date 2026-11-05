/* ==========================================================
   DIBUJO
   ========================================================== */
const $ = id => document.getElementById(id);

function dibujarIndicadores(r) {
  const tarjetas = [
    ["Ventas totales", moneda.format(r.total), "var(--rojo)"],
    ["Órdenes", r.ordenes, "var(--dorado)"],
    ["Ticket promedio", moneda.format(r.ticket), "var(--negro)"],
    ["Clientes únicos", r.clientes, "var(--turquesa)"],
  ];
  $("indicadores").innerHTML = tarjetas.map(([etiqueta, valor, color]) => `
    <article class="tarjeta indicador" style="--color:${color}">
      <p class="indicador__etiqueta">${etiqueta}</p>
      <p class="indicador__valor">${valor}</p>
    </article>`).join("");
}

function dibujarLinea(serie, hayVentas) {
  if (!hayVentas) {
    $("grafica-ventas").innerHTML = `<p class="vacio">No hay ventas en este período.</p>`;
    return;
  }
  const W = 560, H = 260, m = { i: 56, d: 16, s: 14, b: 34 };
  const max = Math.max(...serie.map(p => p.valor)) || 1;
  const x = i => m.i + (serie.length === 1 ? (W - m.i - m.d) / 2 : i * (W - m.i - m.d) / (serie.length - 1));
  const y = v => H - m.b - (v / max) * (H - m.b - m.s);

  const guias = [0, .25, .5, .75, 1].map(f => {
    const v = max * f;
    return `<line x1="${m.i}" x2="${W - m.d}" y1="${y(v)}" y2="${y(v)}" stroke="#ECECE8"/>
            <text x="${m.i - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#6B7280">${Math.round(v)}</text>`;
  }).join("");

  // Muestra como máximo ~6 etiquetas en el eje X para que no se encimen.
  const paso = Math.ceil(serie.length / 6);
  const ejeX = serie.map((p, i) => i % paso ? "" :
    `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#6B7280">${p.etiqueta}</text>`).join("");

  const linea = serie.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.valor)}`).join(" ");
  const puntos = serie.map((p, i) => p.valor
    ? `<circle cx="${x(i)}" cy="${y(p.valor)}" r="4" fill="#fff" stroke="var(--rojo)" stroke-width="3">
         <title>${p.etiqueta}: ${moneda.format(p.valor)}</title></circle>` : "").join("");

  $("grafica-ventas").innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ventas por día">
      ${guias}${ejeX}
      <path d="${linea}" fill="none" stroke="var(--rojo)" stroke-width="3" stroke-linejoin="round"/>
      ${puntos}
    </svg>`;
}

function dibujarDona(montos) {
  const total = Object.values(montos).reduce((a, b) => a + b, 0);
  if (!total) { $("grafica-pagos").innerHTML = `<p class="vacio">No hay pagos en este período.</p>`; return; }

  const R = 70, C = 2 * Math.PI * R;
  let acumulado = 0;
  const arcos = Object.entries(montos).map(([clave, monto]) => {
    const largo = (monto / total) * C;
    const color = (METODOS[clave] || { color: "#999" }).color;
    const arco = `<circle r="${R}" cx="100" cy="100" fill="none" stroke="${color}" stroke-width="34"
      stroke-dasharray="${largo} ${C - largo}" stroke-dashoffset="${-acumulado}" transform="rotate(-90 100 100)"/>`;
    acumulado += largo;
    return arco;
  }).join("");

  const leyenda = Object.entries(montos).map(([clave, monto]) => {
    const info = METODOS[clave] || { nombre: clave, color: "#999" };
    return `<li style="--color:${info.color}"><i></i>${info.nombre}<b>${moneda.format(monto)} · ${Math.round(monto / total * 100)}%</b></li>`;
  }).join("");

  $("grafica-pagos").innerHTML = `
    <svg viewBox="0 0 200 200" style="max-width:220px;margin:0 auto" role="img" aria-label="Métodos de pago">${arcos}</svg>
    <ul class="leyenda">${leyenda}</ul>`;
}

function dibujarEstados(conteo) {
  const total = Object.values(conteo).reduce((a, b) => a + b, 0);
  if (!total) { $("grafica-estados").innerHTML = `<p class="vacio">No hay órdenes en este período.</p>`; return; }
  $("grafica-estados").innerHTML = `<div class="barras">` + Object.entries(conteo).map(([estado, n]) => `
    <div class="barra__fila">
      <span>${ESTADOS[estado] || estado}</span>
      <div class="barra__pista"><div class="barra__relleno" style="width:${n / total * 100}%"></div></div>
      <b>${n}</b>
    </div>`).join("") + `</div>`;
}
