/* Rutas, menú lateral y dibujo de la pantalla activa */
/* ==========================================================
   NAVEGACIÓN Y EVENTOS
   ========================================================== */
const VISTAS = {
  caja: vCaja,
  pedidos: vPedidos,
  cocina: vCocina,
  meseros: vMeseros,
  dueno: vDueno,
  chat: vChat,
  clientes: vClientes,
  reportes: null,
  lealtad: vLealtad,
  estadisticas: vEst,
  impresora: vImp,
  mesas: vMesas,
  promos: vPromos,
  menu: vMenu,
  menucli: vMenuCli,
  config: vConfig
};
const ICONOS = {
  menucli: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M12 18h.01"/>',
  caja: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  meseros: '<path d="M3 11h18M5 11v9M19 11v9M8 11V6a4 4 0 0 1 8 0v5"/>',
  dueno: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  cocina: '<path d="M6 13.9V21h12v-7.1M4 10a4 4 0 0 1 4-4 4 4 0 0 1 8 0 4 4 0 0 1 4 4z"/>',
  pedidos: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',
  clientes: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  reportes: '<path d="M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3"/>',
  lealtad: '<path d="m12 2 3 6.3 6.9 1-5 4.8 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.8 6.9-1z"/>',
  estadisticas: '<path d="m22 7-8.5 8.5-5-5L2 17M16 7h6v6"/>',
  impresora: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 9V3h12v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  mesas: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M20 20h.01"/>',
  promos: '<path d="M10.3 21a2 2 0 0 0 3.4 0M4 17h16c-1.3-1.4-2-3-2-9a6 6 0 0 0-12 0c0 6-.7 7.6-2 9z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  config: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  salir: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'
};
const NAV = [
  ["caja", "Nueva venta"],
  ["pedidos", "Pedidos"],
  ["cocina", "Cocina"],
  ["meseros", "Meseros"],
  ["dueno", "Dueño"],
  ["chat", "Chat"],
  ["clientes", "Clientes"],
  ["reportes", "Reportes"],
  ["lealtad", "Lealtad"],
  ["estadisticas", "Estadísticas"],
  ["impresora", "Impresora"],
  ["mesas", "Mesas QR"],
  ["promos", "Promos"],
  ["menu", "Menú"],
  ["menucli", "Menú de clientes"]
];
const item = ([k, t]) => `<button class="menu__item" data-k="${k}"><svg viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
    stroke-linejoin="round">${ICONOS[k]}</svg>${t}<span class="bd" data-bd="${k}"></span></button>`;
$("menu-lista").innerHTML = NAV.map(item).join("");
$("menu-pie").innerHTML = [["config", "Configuración"], ["salir", "Cerrar sesión"]].map(item).join("");

// Qué pantallas puede ver cada rol (la seguridad real está en las reglas de la base de datos; esto solo ordena la interfaz)
const INICIO = { dueno: "pedidos", caja: "pedidos", cocina: "cocina", mesero: "meseros" };
const vistaPermitida = k => {
  const r = window.USUARIO && USUARIO.rol;
  return r === "dueno"
    || (r === "caja" && k !== "dueno")
    || (r === "cocina" && k === "cocina")
    || (r === "mesero" && k === "meseros");
};
function render() {
  if (!window.USUARIO) return;
  if (!vistaPermitida(location.hash.slice(1) || "pedidos")) {
    location.hash = INICIO[USUARIO.rol];
    return;
  }
  document.querySelectorAll(".menu__item").forEach(b => {
    b.hidden = b.dataset.k !== "salir" && !vistaPermitida(b.dataset.k);
  });
  const h = location.hash.slice(1),
    k = VISTAS.hasOwnProperty(h) ? h : "pedidos",
    sec = $("v-" + k),
    keep = { },
    fa = document.activeElement,
    fid = fa && fa.id,
    fs = fa && fa.selectionStart,
    fe = fa && fa.selectionEnd;
  if (!sec.hidden) sec.querySelectorAll(".keep").forEach(e => {
    keep[e.id] = e.type === "checkbox" ? e.checked : e.value;
  });
  document.querySelectorAll("[data-vista]").forEach(s => {
    s.hidden = s.id !== "v-" + k;
  });
  if (VISTAS[k]) {
    sec.innerHTML = VISTAS[k]();
    sec.querySelectorAll(".keep").forEach(e => {
      if (e.id in keep) {
        if (e.type === "checkbox") e.checked = keep[e.id];
        else e.value = keep[e.id];
      }
    });
    if (k === "promos") updPush();
  } else actualizar();
  if (fid && $(fid)) {
    try {
      $(fid).focus();
      if (typeof fs === "number") $(fid).setSelectionRange(fs, fe);
    } catch (x) { }
  }  // no perder el cursor al refrescar
  if (k === "chat" || ((k === "cocina" || k === "meseros") && S.kchat)) marcarVisto();
  document.querySelectorAll('[data-bd="chat"]').forEach(x => {
    const n = sinLeer();
    x.textContent = n || "";
  });
  const cm = document.querySelector(".chat-msgs");
  if (cm) cm.scrollTop = cm.scrollHeight;
  document.querySelectorAll(".menu__item").forEach(b => {
    if (b.dataset.k === k) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  $("menu").classList.remove("abierto");
  document.body.classList.toggle("modo-cocina", k === "cocina");
  document.body.classList.toggle("modo-mesero", k === "meseros");
  document.body.classList.toggle("modo-dueno", k === "dueno");
  const mb = document.querySelector(".menu__marca strong");
  if (mb) mb.textContent = negocio();
  document.title = ({ dueno: "Dueño", cocina: "Cocina", meseros: "Meseros" }[k] || "Panel")
    + " | "
    + negocio();
}
function ir(k) {
  if (location.hash.slice(1) === k) render();
  else location.hash = k;
}
function dlg(t) {
  $("dlg-t").textContent = t;
  $("dlg").showModal();
}
const num = id => parseFloat($(id).value) || 0;
