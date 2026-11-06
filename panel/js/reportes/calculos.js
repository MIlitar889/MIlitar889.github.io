/* ==========================================================
   CÁLCULOS
   ========================================================== */
function filtrar(periodo) {
  const { desde, hasta } = rangoDe(periodo);
  return ORDENES.filter(o => {
    const f = aFecha(o.fecha);
    return f >= desde && f <= hasta && o.estado !== "cancelled";
  });
}

function resumen(lista) {
  const total = lista.reduce((s, o) => s + o.total, 0);
  return {
    total,
    ordenes: lista.length,
    ticket: lista.length ? total / lista.length : 0,
    clientes: new Set(lista.map(o => o.cliente).filter(c => c && c !== "mostrador")).size
  };
}

// Serie para la línea: un punto por día (o por mes en "anual"), con $0 donde no hubo ventas.
function serieVentas(lista, periodo) {
  const { desde, hasta } = rangoDe(periodo);
  const porMes = periodo === "anual";
  const puntos = new Map();
  const cursor = new Date(desde);
  while (cursor <= hasta) {
    const clave = porMes ? `${cursor.getFullYear()}-${cursor.getMonth()}` : aTexto(cursor);
    puntos.set(clave, { etiqueta: porMes ? etiquetaMes(cursor) : etiquetaDia(cursor), valor: 0 });
    porMes ? cursor.setMonth(cursor.getMonth() + 1, 1) : cursor.setDate(cursor.getDate() + 1);
  }
  lista.forEach(o => {
    const f = aFecha(o.fecha);
    const clave = porMes ? `${f.getFullYear()}-${f.getMonth()}` : o.fecha;
    if (puntos.has(clave)) puntos.get(clave).valor += o.total;
  });
  return [...puntos.values()];
}

function contar(lista, campo, sumar = false) {
  const r = { };
  lista.forEach(o => {
    r[o[campo]] = (r[o[campo]] || 0) + (sumar ? o.total : 1);
  });
  return r;
}
