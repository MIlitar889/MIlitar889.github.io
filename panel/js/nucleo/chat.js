/* Chat general: mensajes entre caja, cocina y meseros, y aviso de mensajes sin leer */
const lsGet = k => {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
};
const lsSet = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch (e) { }
};
// Quién escribe: en la pantalla de cocina siempre "Cocina"; en el resto, lo que se elija en Chat (por defecto "Caja")
const quien = () => location.hash === "#cocina"
  ? "Cocina"
  : location.hash === "#meseros"
  ? ("Mesero " + (lsGet("sushipuuk-mesero") || "")).trim()
  : (lsGet("sushipuuk-quien") || "Caja");
function decir(de, t, sis) {
  const u = D.chat.length ? D.chat[D.chat.length - 1].id : 0;
  D.chat.push({ id: Math.max(Date.now(), u + 1), f: horaT(), de, t, sis: !!sis });
  D.chat = D.chat.slice(-200);
}
// Último mensaje leído: se guarda por aparato Y por rol, para que Caja y Cocina en el mismo navegador no se borren los avisos
const visto = () => +(lsGet("sushipuuk-chat-visto-" + quien()) || 0);
const marcarVisto = () => {
  if (D.chat.length) lsSet("sushipuuk-chat-visto-" + quien(), D.chat[D.chat.length - 1].id);
};
const sinLeer = () => D.chat.filter(m => m.id > visto() && m.de !== quien()).length;
