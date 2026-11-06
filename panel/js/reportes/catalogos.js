/* ==========================================================
   TEXTOS Y COLORES (todo en español)
   ========================================================== */
const ESTADOS = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado"
};
const METODOS = {
  efectivo: { nombre: "Efectivo", color: "#B8972A" },
  tarjeta: { nombre: "Tarjeta", color: "#C8372D" },
  transferencia: { nombre: "Transferencia", color: "#2D5F4F" }
};
const PERIODOS = [
  { id: "hoy", nombre: "Hoy" },
  { id: "semanal", nombre: "Semanal" },
  { id: "mensual", nombre: "Mensual" },
  { id: "anual", nombre: "Anual" }
];

const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
