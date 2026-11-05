/* Cuentas de mesa de los meseros: rondas, comandas, quitar productos, cobro y comanda impresa.
   Una CUENTA es la mesa abierta. Cada vez que el mesero manda a cocina se crea una RONDA (comanda)
   que lleva SOLO los productos nuevos; lo que ya salió nunca se vuelve a mandar. */
const uid=()=>++D.uid;
const cuenta=id=>D.cuentas.find(c=>c.id===id);
const cuentaDeMesa=n=>D.cuentas.find(c=>c.abierta&&+c.mesa===+n);
const itemsVivos=c=>c.items.filter(i=>i.est!=="cancelado");
const borradores=c=>c.items.filter(i=>i.est==="borrador");
const totalCuenta=c=>itemsVivos(c).reduce((s,i)=>s+i.c*i.q,0);
const nombreMesero=()=>lsGet("sushipuuk-mesero")||"";
const RLBL={pending:"En cocina",confirmed:"Preparando",preparing:"Preparando",ready:"¡Listo para llevar!",delivered:"Entregado",cancelled:"Cancelado"};

function abrirMesa(num,nombre,mesero){
  if(cuentaDeMesa(num))return null;
  const c={id:uid(),mesa:+num,nombre:nombre.trim(),mesero,abierta:true,fecha:hoyT(),hora:horaT(),ronda:0,items:[],pideCuenta:false};
  D.cuentas.push(c);log(`Mesa ${c.mesa} (${c.nombre}) abierta por ${mesero}`);return c;
}
function agregarBorrador(c,p,opc=[],extra=0){
  const it=c.items.find(i=>i.est==="borrador"&&i.n===p.n&&!i.nota&&(i.opc||[]).join("|")===opc.join("|"));
  if(it)it.q++;else c.items.push({id:uid(),n:p.n,c:p.c+extra,q:1,nota:"",opc,est:"borrador"});
}
// Manda a cocina SOLO lo que está en borrador y lo marca como enviado
function enviarRonda(c){
  const B=borradores(c);if(!B.length)return null;
  c.ronda++;
  const cm={id:uid(),cuenta:c.id,ronda:c.ronda,mesa:c.mesa,nombre:c.nombre,mesero:c.mesero,fecha:hoyT(),hora:horaT(),estado:"pending",items:B.map(i=>({iid:i.id,n:i.n,q:i.q,nota:i.nota,opc:i.opc||[]}))};
  B.forEach(i=>{i.est="enviado";i.rid=cm.id;});
  D.comandas.push(cm);D.comandas=D.comandas.slice(-300);
  D.cola.unshift({id:`Mesa ${c.mesa} · ronda ${c.ronda}`,ref:{t:"c",id:cm.id},f:horaT(),r:Object.fromEntries(Object.entries(ruta({items:cm.items})).map(([k,v])=>[k,v.length]))});D.cola=D.cola.slice(0,20);
  log(`Mesa ${c.mesa} (${c.nombre}): ronda ${c.ronda} enviada a cocina`);
  return cm;
}
// Quita un producto: los borradores se borran sin más; los ya enviados se cancelan y, si la cocina ya los tiene, se le avisa
function quitarItem(c,iid){
  const i=c.items.find(x=>x.id===iid);if(!i)return;
  if(i.est==="borrador"){c.items=c.items.filter(x=>x!==i);return;}
  const cm=D.comandas.find(x=>x.id===i.rid);i.est="cancelado";
  if(!cm)return;
  const antes=cm.estado,l=cm.items.find(x=>x.iid===iid);if(l)l.cancelado=true;
  if(cm.items.every(x=>x.cancelado)&&cm.estado!=="delivered")cm.estado="cancelled";
  if(["confirmed","preparing","ready"].includes(antes))   // la cocina ya lo estaba haciendo: avisarle
    decir(quien(),`⚠ Mesa ${c.mesa} (${c.nombre}): quitaron ${i.q}× ${i.n} de la ronda ${cm.ronda} (estaba: ${RLBL[antes]})`,true);
  log(`Mesa ${c.mesa}: quitaron ${i.q}× ${i.n}`);
}
// Cobra la cuenta: genera UN pedido normal (con todo lo consumido) para reportes, clientes y lealtad
function cobrarCuenta(c,metodo,cid){
  const V=itemsVivos(c);if(!V.length)return null;
  const agg={};V.forEach(i=>{const k=i.n+"|"+i.c+"|"+(i.nota||"")+"|"+(i.opc||[]).join(",");agg[k]=agg[k]||{n:i.n,c:i.c,q:0,nota:i.nota||"",opc:i.opc||[]};agg[k].q+=i.q;});
  const o={id:++D.seq,fecha:hoyT(),hora:horaT(),ts:Date.now(),items:Object.values(agg),total:totalCuenta(c),metodo,tipo:"mesa",mesa:String(c.mesa),estado:"pending",cliente:cid||"mostrador",origen:"mesero",mesero:c.mesero,nombreMesa:c.nombre,nota:`Mesa ${c.mesa} · ${c.nombre}`,cuenta:c.id};
  ORDENES.push(o);completar(o);c.abierta=false;c.cerrada=horaT();c.pedido=o.id;
  log(`Mesa ${c.mesa} cobrada: ${moneda.format(o.total)} (pedido #${o.id})`);
  return o;
}
// Comanda para imprimir: una hoja por estación, y en las rondas siguientes avisa que es SOLO lo nuevo
function comandaMesaTxt(cm){
  const cab=`${negocio().toUpperCase()} · COMANDA\nMesa ${cm.mesa} · ${cm.nombre}\nMesero: ${cm.mesero||"-"}   ${cm.hora}\n`+(cm.ronda>1?`*** RONDA ${cm.ronda} · AGREGADO ***\n(solo lo nuevo; lo anterior ya salió)\n`:`RONDA 1\n`);
  return Object.entries(ruta({items:cm.items.filter(i=>!i.cancelado)})).map(([k,it])=>cab+`ESTACIÓN: ${k}\n--------------------------------\n`+it.map(i=>`${i.q} x ${i.n}`+(notaItem(i)?`\n   >> ${notaItem(i)}`:"")).join("\n")+"\n--------------------------------").join("\n\n\f\n");
}
function imprimirTxt(txt){
  $("print-area").innerHTML=txt.split("\n\n\f\n").map(t=>`<pre>${esc(t)}</pre>`).join("");
  document.body.classList.add("imprimiendo");
  setTimeout(()=>{window.print();document.body.classList.remove("imprimiendo");},50);
}

// Estado de las rondas de una mesa (para caja y meseros)
function rondasBadges(c){
  const R=D.comandas.filter(x=>x.cuenta===c.id&&x.estado!=="cancelled"),n=f=>R.filter(f).length;
  return [["En cocina",n(x=>x.estado==="pending"),""],["Preparando",n(x=>["confirmed","preparing"].includes(x.estado)),""],["¡Listo para llevar!",n(x=>x.estado==="ready"),"ok"]].filter(e=>e[1]).map(([t,k,cl])=>`<span class="badge ${cl}">${t} ${k}</span>`).join("");
}
