/* Almacén único de datos en memoria: se llena desde Supabase (nube.js) */
/* ==========================================================
   ALMACÉN ÚNICO DE DATOS (todas las pantallas leen y escriben aquí)
   Se sincroniza con Supabase (ver nube.js).
   ========================================================== */

const DEF = () => {
  const cl = CLIENTES_INICIALES.map(
    ([n, t, hp, ht]) => ({ id: t, n, t, e: "", hp, ht, m: false, bal: 0, vis: 0 })
  );
  const mods = MODIFICADORES_INICIALES.map(([n, k]) => ({ n, k, o: [] }));
  return {
    seq: 100,
    clientes: cl,
    mods,
    menu: JSON.parse(JSON.stringify(MENU_INICIAL)),
    imp: JSON.parse(JSON.stringify(IMPRESORAS_INICIALES)),
    prog: JSON.parse(JSON.stringify(PROGRAMA_INICIAL)),
    recomp: [],
    canjes: [],
    emit: 0,
    dis: JSON.parse(JSON.stringify(DISENO_INICIAL)),
    hist: [],
    cola: [],
    act: [],
    chat: [],
    cuentas: [],
    comandas: [],
    uid: 0,
    neg: JSON.parse(JSON.stringify(NEGOCIO_INICIAL))
  };
};
const CODIGO_ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function codigoNuevo(d) {
  let c;
  do {
    c = "PUUK-"
      + Array.from({ length: 8 }, () => CODIGO_ABC[Math.floor(Math.random() * CODIGO_ABC.length)]).join("");
  } while ((d.clientes || []).some(x => x.code === c));
  return c;
}
const normalizar = d => {
  d.chat = d.chat || [];
  d.cuentas = d.cuentas || [];
  d.comandas = d.comandas || [];
  d.uid = d.uid || 0;
  (d.mods || []).forEach(m => {
    m.o = (m.o || []).map(x => typeof x === "string" ? { n: x, p: 0 } : x);
    if (m.req === undefined) m.req = false;
  });
  (d.recomp || []).forEach(r => {
    r.id = r.id || "r" + Math.random().toString(36).slice(2, 8);
    r.tipo = r.tipo || "producto";
    r.limite = r.limite || 0;
    r.desc = r.desc || "";
    r.img = r.img || "";
    if (r.reset === undefined) r.reset = true;
    if (r.activa === undefined) r.activa = true;
  });
  (d.clientes || []).forEach(c => {
    if (c.m && !c.code) c.code = codigoNuevo(d);
  });
  (d.menu || []).forEach(c => c.p.forEach(p => {
    p.m = p.m || [];
  }));
  d.neg = d.neg || { };
  Object.keys(NEGOCIO_INICIAL).forEach(k => {
    if (d.neg[k] === undefined || d.neg[k] === "") d.neg[k] = NEGOCIO_INICIAL[k];
  });
  (d.ordenes || []).forEach(o => {
    o.ts = o.ts || new Date(o.fecha + "T" + (o.hora || "00:00") + ":00").getTime();
  });
  return d;
};
// Los datos vienen de la base de datos (nube.js). Aquí solo se arranca con los valores de ejemplo.
let D = DEF();
ORDENES.splice(0, ORDENES.length);
D.ordenes = ORDENES;
normalizar(D);
// guardar() avisa a nube.js, que compara y manda a Supabase solo lo que cambió
const guardar = () => {
  try {
    Nube.pedirGuardado();
  } catch (e) { }
};
function sincronizar() { }
