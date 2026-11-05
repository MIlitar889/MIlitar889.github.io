/* Acciones de la cocina (por ticket) y del panel de meseros. Se suman a las de acciones.js */
Object.assign(A,{
 /* ---- cocina: sirven igual para pedidos de caja ("o:12") y rondas de mesa ("c:5") ---- */
 "co-sig":b=>{const x=getT(b.dataset.k),n=KSIG[x.estado];if(b.dataset.k[0]==="o"&&n==="delivered")completar(x);else x.estado=n;log(`Cocina: ${b.dataset.k[0]==="o"?"pedido #"+x.id:"Mesa "+x.mesa+" ronda "+x.ronda} → ${ESTADOS[x.estado]}`);},
 "co-ant":b=>{const x=getT(b.dataset.k);x.estado=KANT[x.estado];},
 "co-av":b=>{const x=getT(b.dataset.k),pre=b.dataset.k[0]==="o"?`Pedido #${x.id}: `:`Mesa ${x.mesa} ronda ${x.ronda}: `,i=$("chat-t");S.kchat=true;if(i){if(!i.value)i.value=pre;}else S.pre=pre;setTimeout(()=>{const e=$("chat-t");if(e){e.focus();e.setSelectionRange(99,99);}},0);},
 "co-can":b=>{const x=getT(b.dataset.k);S.canId=b.dataset.k;$("can-t").textContent="Cancelar "+(b.dataset.k[0]==="o"?"pedido #"+x.id:`Mesa ${x.mesa}, ronda ${x.ronda}`);$("can-m").value="";$("dlg-can").showModal();return false;},
 "can-ok":()=>{
   const m=$("can-m").value.trim();if(!m){toast("Escribe el motivo para avisar a la caja.");return false;}
   const x=getT(S.canId);if(!x||["delivered","cancelled"].includes(x.estado)){$("dlg-can").close();return false;}
   x.estado="cancelled";x.motivo=m;x.por=quien();
   if(S.canId[0]==="c"){const c=cuenta(x.cuenta);if(c)c.items.forEach(i=>{if(i.rid===x.id)i.est="cancelado";});decir(quien(),`🚫 Mesa ${x.mesa} (${x.nombre}), ronda ${x.ronda} cancelada (${x.items.map(i=>i.q+"× "+i.n).join(", ")}): ${m}`,true);}
   else{x.motivo=m;x.por=quien();decir(quien(),`🚫 Pedido #${x.id} cancelado (${(x.items||[]).map(i=>i.q+"× "+i.n).join(", ")}): ${m}`,true);}
   log(`Cancelado por ${quien()}: ${m}`);$("dlg-can").close();toast("Cancelado. Se avisó por el chat.");},
 /* ---- meseros ---- */
 "mz-entrar":()=>{const n=$("mz-nombre").value.trim();if(!n){toast("Escribe tu nombre.");return false;}lsSet("sushipuuk-mesero",n);},
 "mz-salir":()=>{lsSet("sushipuuk-mesero","");S.m.vista="home";},
 "mz-home":()=>{S.m.vista="home";S.m.pick=false;},
 "mz-nueva":()=>{S.m.vista="nueva";},
 "mz-abrir-mesa":()=>{
   const n=+$("mz-num").value,nom=$("mz-nom").value.trim();
   if(!n){toast("No hay mesas libres.");return false;}
   if(!nom){toast("Escribe el nombre de la mesa.");return false;}
   const c=abrirMesa(n,nom,nombreMesero());if(!c){toast("Esa mesa ya está abierta.");return false;}
   S.m={vista:"mesa",id:c.id,cat:0,q:"",pick:true};$("mz-nom").value="";},
 "mz-abrir":b=>{S.m={vista:"mesa",id:+b.dataset.id,cat:0,q:"",pick:false};},
 "mz-pick":()=>{S.m.pick=true;},"mz-nopick":()=>{S.m.pick=false;},
 "mz-cat":b=>{S.m.cat=+b.dataset.v;S.m.q="";},
 "mz-add":b=>{agregarBorrador(cuenta(S.m.id),D.menu.flatMap(c=>c.p).find(p=>p.n===b.dataset.n));},
 "mz-q":b=>{const c=cuenta(S.m.id),i=c.items.find(x=>x.id==b.dataset.iid);i.q+=+b.dataset.d;if(i.q<1)quitarItem(c,i.id);},
 "mz-del":b=>{
   const c=cuenta(S.m.id),i=c.items.find(x=>x.id==b.dataset.iid);if(!i)return false;
   if(i.est!=="borrador"){
     const cm=D.comandas.find(x=>x.id===i.rid);let msg=`¿Quitar ${i.q}× ${i.n} de la cuenta?`;
     if(cm&&["confirmed","preparing","ready"].includes(cm.estado))msg+="\nLa cocina ya lo tiene: se le avisará al chef.";
     if(!confirm(msg))return false;
   }
   quitarItem(c,i.id);},
 "mz-env":()=>{const cm=enviarRonda(cuenta(S.m.id));if(!cm)return false;S.m.pick=false;toast(`Enviado a cocina: ronda ${cm.ronda}`);},
 "mz-ent":b=>{D.comandas.find(x=>x.id==b.dataset.id).estado="delivered";},
 "mz-cuenta":()=>{const c=cuenta(S.m.id);c.pideCuenta=true;decir(quien(),`🧾 Mesa ${c.mesa} (${c.nombre}) pide la cuenta: ${moneda.format(totalCuenta(c))}`,true);},
 "mz-liberar":()=>{const c=cuenta(S.m.id);if(!confirm("¿Liberar la mesa sin cobrar?"))return false;c.abierta=false;c.cerrada=horaT();S.m.vista="home";},
 "mz-imp":b=>{imprimirTxt(comandaMesaTxt(D.comandas.find(x=>x.id==b.dataset.id)));return false;},
 "cola-imp":b=>{const t=b.dataset.t,id=+b.dataset.id,x=t==="c"?D.comandas.find(c=>c.id===id):ORDENES.find(o=>o.id===id);if(!x){toast("Ya no existe ese pedido.");return false;}imprimirTxt(t==="c"?comandaMesaTxt(x):comanda(x).replace(/\n\n/g,"\n\n\f\n"));return false;},
 /* ---- caja: cobrar una mesa abierta ---- */
 "mz-cobrar":b=>{
   const c=cuenta(+b.dataset.id),met=$("cb-m-"+c.id).value,cv=$("cb-c-"+c.id).value,cl=D.clientes.find(x=>`${x.n} · ${x.t||x.e||"sin dato"}`===cv);
   const pend=D.comandas.filter(x=>x.cuenta===c.id&&["pending","confirmed","preparing","ready"].includes(x.estado)).length;
   if(pend&&!confirm(`Hay ${pend} ronda(s) que todavía no se entregan. ¿Cobrar de todos modos?`))return false;
   const o=cobrarCuenta(c,met,cl&&cl.id);if(!o){toast("La mesa no tiene productos para cobrar.");return false;}
   toast(`Mesa ${c.mesa} cobrada: ${moneda.format(o.total)} (pedido #${o.id})`);}
});
// Notas del mesero y buscador de productos
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.dataset.mi!==undefined){const c=cuenta(S.m.id),i=c&&c.items.find(x=>x.id==t.dataset.mi);if(i){i.nota=t.value;guardar();}}
  else if(t.id==="mz-q"){S.m.q=t.value;render();}
});
