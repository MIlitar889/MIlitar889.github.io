/* Almacén único de datos: se arma con los valores de data/ y se guarda en el navegador */
/* ==========================================================
   ALMACÉN ÚNICO DE DATOS (todas las pantallas leen y escriben aquí)
   Se guarda solo en este navegador (localStorage).
   ========================================================== */
const KEY="sushipuuk-panel-v3";



const DEF=()=>{
  const cl=CLIENTES_INICIALES
   .map(([n,t,hp,ht])=>({id:t,n,t,e:"",hp,ht,m:false,bal:0,vis:0}));
  const mods=MODIFICADORES_INICIALES.map(([n,k])=>({n,k,o:[]}));
  return {seq:100,clientes:cl,mods,
   menu:JSON.parse(JSON.stringify(MENU_INICIAL)),
   imp:JSON.parse(JSON.stringify(IMPRESORAS_INICIALES)),
   prog:JSON.parse(JSON.stringify(PROGRAMA_INICIAL)),
   recomp:[],canjes:[],emit:0,
   dis:JSON.parse(JSON.stringify(DISENO_INICIAL)),
   hist:[],cola:[],act:[],chat:[],cuentas:[],comandas:[],uid:0,neg:JSON.parse(JSON.stringify(NEGOCIO_INICIAL))};
};
const CODIGO_ABC="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function codigoNuevo(d){let c;do{c="PUUK-"+Array.from({length:8},()=>CODIGO_ABC[Math.floor(Math.random()*CODIGO_ABC.length)]).join("");}while((d.clientes||[]).some(x=>x.code===c));return c;}
const normalizar=d=>{
  d.chat=d.chat||[];d.cuentas=d.cuentas||[];d.comandas=d.comandas||[];d.uid=d.uid||0;
  (d.mods||[]).forEach(m=>{m.o=(m.o||[]).map(x=>typeof x==="string"?{n:x,p:0}:x);if(m.req===undefined)m.req=false;});
  (d.recomp||[]).forEach(r=>{r.id=r.id||"r"+Math.random().toString(36).slice(2,8);r.tipo=r.tipo||"producto";r.limite=r.limite||0;r.desc=r.desc||"";r.img=r.img||"";if(r.reset===undefined)r.reset=true;if(r.activa===undefined)r.activa=true;});
  (d.clientes||[]).forEach(c=>{if(c.m&&!c.code)c.code=codigoNuevo(d);});
  (d.menu||[]).forEach(c=>c.p.forEach(p=>{p.m=p.m||[];}));
  d.neg=d.neg||{};Object.keys(NEGOCIO_INICIAL).forEach(k=>{if(d.neg[k]===undefined||d.neg[k]==="")d.neg[k]=NEGOCIO_INICIAL[k];});
  (d.ordenes||[]).forEach(o=>{o.ts=o.ts||new Date(o.fecha+"T"+(o.hora||"00:00")+":00").getTime();});
  return d;};
let D=null;
try{D=JSON.parse(localStorage.getItem(KEY));}catch(e){}
if(D&&D.ordenes){ORDENES.splice(0,ORDENES.length,...D.ordenes);}else{D=DEF();}
D.ordenes=ORDENES;
normalizar(D);
let ultimoGuardado=null;
try{ultimoGuardado=localStorage.getItem(KEY);}catch(e){}
const guardar=()=>{try{D.ordenes=ORDENES;ultimoGuardado=JSON.stringify(D);localStorage.setItem(KEY,ultimoGuardado);}catch(e){if(!guardar.av){guardar.av=1;try{toast("⚠ No se pudo guardar (espacio lleno o navegador bloqueado). Descarga un respaldo en Configuración.");}catch(x){}}}};

// Antes de cada acción: si otra ventana guardó cambios, se toman primero para no pisarlos
function sincronizar(){try{const v=localStorage.getItem(KEY);if(v&&v!==ultimoGuardado){D=normalizar(JSON.parse(v));ORDENES.splice(0,ORDENES.length,...D.ordenes);D.ordenes=ORDENES;ultimoGuardado=v;}}catch(e){}}
