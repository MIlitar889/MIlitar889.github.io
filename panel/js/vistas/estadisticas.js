/* ---- Estadísticas ---- */
function previo(per) {
  const { desde, hasta } = rangoDe(per),
    dias = Math.round((hasta - desde) / 864e5) + 1,
    h = new Date(desde);
  h.setDate(h.getDate() - 1);
  const d = new Date(h);
  d.setDate(d.getDate() - dias + 1);
  return vivos().filter(o => {
    const f = aFecha(o.fecha);
    return f >= d && f <= h;
  });
}
function vEst() {
  const L = filtrar(S.est),
    r = resumen(L),
    pt = previo(S.est).reduce((s, o) => s + o.total, 0),
    dl = pt ? Math.round((r.total - pt) / pt * 1000) / 10 : null;
  const pc = k => L.length ? Math.round(L.filter(k).length / L.length * 100) : 0, prod = { };
  L.forEach(o => (o.items || []).forEach(i => {
    prod[i.n] = (prod[i.n] || 0) + i.q;
  }));
  const horas = Array.from(
    { length: 24 },
    (_, h) => (
      { etiqueta: h + "h", valor: L.filter(o => o.hora && +o.hora.slice(0, 2) === h).length }
    )
  );
  const m = contar(L, "metodo", true);
  return cab(
    `Dashboard ejecutivo <span class="badge ok"
        style="font-size:.7rem;-webkit-text-fill-color:#166534">● Sincronizado: ${new Date().toLocaleTimeString("es-MX")}</span>`,
    "Métricas en tiempo real verificadas"
  )
    + chips(
      [["hoy", "Hoy"], ["semanal", "Semana"], ["mensual", "Mes"], ["anual", "Año"]],
      "est-p",
      S.est
    )
    + kpi(
      [
        [
          "Ventas totales",
          moneda.format(r.total)
            + (
              dl === null
                ? ""
                : ` <span class="badge ${dl<0?"mal":"ok"}">${dl<0?"▼":"▲"} ${Math.abs(dl)}%</span>`
            ),
          "var(--rojo)",
          `${pc(o=>(o.origen||"online")==="online")}% en línea`
        ],
        ["Órdenes totales", r.ordenes, "var(--dorado)", `${pc(o=>o.tipo==="mesa")}% en mesa`],
        ["Ticket promedio", moneda.format(r.ticket), "var(--negro)", "Por orden"],
        ["Clientes únicos", r.clientes, "var(--turquesa)", "En el período"]
      ]
    )
    + `<div class="graficas"><article class="tarjeta grafica"><h2>Actividad por hora (24h)</h2>${cols(horas)}</article><article
        class="tarjeta grafica"><h2>Métodos de pago</h2>${donut(
      Object.entries(m).map(
        ([k, v]) => [
          (METODOS[k] || { nombre: k }).nombre,
          v,
          (METODOS[k] || { color: "#999" }).color
        ]
      ),
      moneda.format.bind(moneda)
    )}</article></div>`
    + `<article class="tarjeta"><h2>⭐ Productos más vendidos</h2>${barrasH(
      Object.entries(prod).sort((a, b) => b[1] - a[1]).slice(0, 8)
    )}</article>`;
}
