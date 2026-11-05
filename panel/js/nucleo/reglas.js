/* Estado de la pantalla y reglas de negocio: clientes, niveles, premios, ventas */
/* ==========================================================
   AYUDAS Y REGLAS DE NEGOCIO
   ========================================================== */
const S={ped:"todos",est:"mensual",lt:"anal",cli:null,q:"",mq:"",lq:"",lc:null,pc:null,ptab:"enviar",
  caja:{items:[],tipo:"recoger",mesa:"",metodo:"efectivo",cat:0,cli:""}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const hoyT=()=>aTexto(new Date()),horaT=()=>new Date().toTimeString().slice(0,5);
const cli=id=>D.clientes.find(c=>c.id===id);
const nomCli=id=>cli(id)?cli(id).n:(id==="mostrador"?"Mostrador":"Cliente no registrado");
const vivos=()=>ORDENES.filter(o=>o.estado!=="cancelled");
const stC=c=>{const L=vivos().filter(o=>o.cliente===c.id);return{ped:c.hp+L.length,tot:c.ht+L.reduce((s,o)=>s+o.total,0),L};};
const NIV=[["Bronce","#CD7F32"],["Plata","#9CA3AF"],["Oro","#D4AF37"]];
const nivel=c=>c.vis>=D.prog.oro?NIV[2]:c.vis>=D.prog.plata?NIV[1]:NIV[0];
const UNI={sellos:"sellos",puntos:"puntos",monedero:"$"};
const fmtU=v=>D.prog.tipo==="monedero"?moneda.format(v):`${v} ${v===1?UNI[D.prog.tipo].slice(0,-1):UNI[D.prog.tipo]}`;
const gana=o=>{const P=D.prog;return P.tipo==="sellos"?P.porVisita:P.tipo==="puntos"?Math.floor(o.total*P.ppd):+(o.total*P.pct/100).toFixed(2);};
const log=t=>{D.act.unshift({f:new Date().toLocaleString("es-MX"),t});D.act=D.act.slice(0,30);};
const catDe=n=>{const c=D.menu.find(c=>c.p.some(p=>p.n===n));return c?c.n:"";};
const TIPO={recoger:"Recoger",domicilio:"Domicilio",mesa:"En mesa"};
const tipoT=o=>(TIPO[o.tipo]||"Recoger")+(o.mesa?" "+o.mesa:"");
const SIG={pending:"confirmed",confirmed:"preparing",preparing:"ready",ready:"delivered"};
const GRUPO={pending:"pendientes",confirmed:"proceso",preparing:"proceso",ready:"proceso",delivered:"completados",cancelled:"cancelados"};
const mesaOcupada=n=>[...vivos().filter(o=>o.tipo==="mesa"&&+o.mesa===n&&o.estado!=="delivered"),...D.cuentas.filter(c=>c.abierta&&+c.mesa===n).map(c=>({total:totalCuenta(c)}))];

// Reparte los productos de un pedido entre las impresoras según la categoría
function ruta(o){const r={};(o.items||[]).forEach(i=>{const im=D.imp.find(p=>p.on&&p.cats.includes(catDe(i.n)));const k=im?im.n:"Sin impresora (caja)";(r[k]=r[k]||[]).push(i);});return r;}
const comanda=o=>Object.entries(ruta(o)).map(([k,it])=>`${negocio().toUpperCase()} · COMANDA #${o.id} · ${k}\n${o.hora||""} ${tipoT(o)}\n----------------\n`+it.map(i=>`${i.q} x ${i.n}${notaItem(i)?" — "+notaItem(i):""}`).join("\n")+(o.nota?`\nNota: ${o.nota}`:"")).join("\n\n");

// Marca el pedido como entregado y entrega el premio de lealtad al socio
function completar(o){
  o.estado="delivered";o.te=o.te||{};o.te.delivered=Date.now();const c=cli(o.cliente),P=D.prog;
  if(c&&c.m&&!o.premio&&o.total>=P.minimo){const g=gana(o);c.bal=+(c.bal+g).toFixed(2);c.vis++;c.ult=o.fecha;c.tot=+((c.tot||0)+g).toFixed(2);D.emit=+(D.emit+g).toFixed(2);o.premio=g;log(`${c.n} ganó ${fmtU(g)} con el pedido #${o.id}`);}
}
async function crear(ent){
  const K=S.caja;if(!K.items.length)return toast("Agrega al menos un producto.");
  if(K.tipo==="mesa"&&!K.mesa)return toast("Elige la mesa.");
  if(S.creando)return;
  const n=$("c-n").value.trim(),t=$("c-t").value.trim(),em=$("c-e").value.trim(),mi=$("c-m").checked,nota=$("c-nota").value.trim();
  S.creando=true;let folio;
  try{folio=await Nube.folio();}catch(e){S.creando=false;return toast("No se pudo registrar el pedido: sin conexión con la base de datos. Inténtalo de nuevo.");}
  let id=K.cli;
  if(!id&&n){id=t||"c"+Date.now();if(!cli(id)){D.clientes.push({id,n,t,e:em,hp:0,ht:0,m:mi,bal:0,vis:0});log("Cliente nuevo: "+n);}}
  const o={id:folio,fecha:hoyT(),hora:horaT(),ts:Date.now(),items:K.items.map(i=>({n:i.n,c:i.c,q:i.q,nota:(i.nota||"").trim(),opc:i.opc||[]})),total:K.items.reduce((s,i)=>s+i.c*i.q,0),metodo:K.metodo,tipo:K.tipo,mesa:K.mesa,estado:"pending",cliente:id||"mostrador",origen:"caja",nota};
  ORDENES.push(o);if(ent)completar(o);
  D.cola.unshift({id:o.id,ref:{t:"o",id:o.id},f:horaT(),r:Object.fromEntries(Object.entries(ruta(o)).map(([k,v])=>[k,v.length]))});D.cola=D.cola.slice(0,20);
  log(`Pedido #${o.id} registrado por ${moneda.format(o.total)} (${nomCli(o.cliente)})`);
  S.caja.items=[];S.caja.cli="";S.caja.mesa="";["c-cli","c-n","c-t","c-e","c-nota"].forEach(i=>{$(i).value="";});$("c-m").checked=false;
  toast(`Pedido #${o.id} registrado: ${moneda.format(o.total)}`+(ent?" · entregado":""));
  S.creando=false;
}

// ¿Puede este cliente canjear esta recompensa ahora?
const puedeCanjear=(c,r)=>r.activa&&c.bal>=r.costo&&(!r.limite||D.canjes.filter(x=>x.c===c.id&&x.r===r.n).length<r.limite);
