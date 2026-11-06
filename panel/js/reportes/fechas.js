/* ==========================================================
   FECHAS
   ========================================================== */
function aTexto(d) {
  // Date -> "2026-10-03"
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}
function aFecha(texto) {
  // "2026-10-03" -> Date (hora local)
  const[a, m, d] = texto.split("-").map(Number);
  return new Date(a, m - 1, d);
}
function etiquetaDia(d) {
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" }).replace(".", "");
}
function etiquetaMes(d) {
  return d.toLocaleDateString("es-MX", { month: "short" }).replace(".", "");
}

// Devuelve el rango [desde, hasta] según el período elegido.
function rangoDe(periodo) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const desde = new Date(hoy);
  if (periodo === "semanal") desde.setDate(hoy.getDate() - 6);
  if (periodo === "mensual") desde.setDate(1);
  if (periodo === "anual") {
    desde.setMonth(0);
    desde.setDate(1);
  }
  return { desde, hasta: hoy };
}
