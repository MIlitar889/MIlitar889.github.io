/* ==========================================================
   PANEL: junta todo según el período elegido
   ========================================================== */
let periodoActual = "mensual";
let listaActual = [];

function actualizar() {
  listaActual = filtrar(periodoActual);
  const { desde, hasta } = rangoDe(periodoActual);
  $("periodo-rango").textContent = `Del ${etiquetaDia(desde)} al ${etiquetaDia(hasta)} de ${hasta.getFullYear()}`;

  document.querySelectorAll("#periodo-botones .chip").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.id === periodoActual));

  const r = resumen(listaActual);
  dibujarIndicadores(r);
  dibujarLinea(serieVentas(listaActual, periodoActual), r.ordenes > 0);
  dibujarDona(contar(listaActual, "metodo", true));
  dibujarEstados(contar(listaActual, "estado"));
  $("exportar").disabled = listaActual.length === 0;
}

$("periodo-botones").innerHTML = PERIODOS.map(p =>
  `<button class="chip" data-id="${p.id}" aria-pressed="false">${p.nombre}</button>`).join("");
$("periodo-botones").addEventListener("click", e => {
  const b = e.target.closest(".chip");
  if (b) { periodoActual = b.dataset.id; actualizar(); }
});


/* ==========================================================
   EXPORTAR (CSV: se abre directo en Excel)
   ========================================================== */
$("exportar").addEventListener("click", () => {
  const filas = [["Orden", "Fecha", "Total", "Método de pago", "Estado", "Cliente"]];
  listaActual.forEach(o => filas.push([
    o.id, o.fecha, o.total, (METODOS[o.metodo] || {}).nombre || o.metodo, ESTADOS[o.estado] || o.estado, o.cliente,
  ]));
  const csv = aCSV(filas);   // \uFEFF = acentos correctos en Excel
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  enlace.download = `reporte-ventas-${periodoActual}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
});
