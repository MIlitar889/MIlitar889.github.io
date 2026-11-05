/* Botones, formularios y arranque de la aplicación */
const A={
 "co-st":b=>{S.ks=b.dataset.v;},
 "co-son":()=>{S.son=!S.son;if(S.son)beep();},
 "co-full":()=>{if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen();return false;},
 "co-sig":b=>{const o=ORDENES.find(o=>o.id==b.dataset.id),n=KSIG[o.estado];if(n==="delivered")completar(o);else o.estado=n;log(`Cocina: pedido #${o.id} → ${ESTADOS[o.estado]}`);},
 "co-ant":b=>{const o=ORDENES.find(o=>o.id==b.dataset.id);o.estado=KANT[o.estado];},
 "caja-cat":b=>{S.caja.cat=+b.dataset.v;},
 "caja-add":b=>{const p=D.menu.flatMap(c=>c.p).find(p=>p.n===b.dataset.n),it=S.caja.items.find(i=>i.n===p.n&&!i.nota);if(it)it.q++;else S.caja.items.push({n:p.n,c:p.c,q:1,nota:""});},
 "caja-q":b=>{const it=S.caja.items[+b.dataset.i];it.q+=+b.dataset.d;if(it.q<1)S.caja.items.splice(+b.dataset.i,1);},
 "caja-tipo":b=>{S.caja.tipo=b.dataset.v;if(b.dataset.v!=="mesa")S.caja.mesa="";},
 "caja-met":b=>{S.caja.metodo=b.dataset.v;},
 "caja-ok":()=>{crear(false).then(()=>{render();guardar();});return false;},
 "caja-ent":()=>{crear(true).then(()=>{render();guardar();});return false;},
 "ped-f":b=>{S.ped=b.dataset.v;},
 "ped-sig":b=>{const o=ORDENES.find(o=>o.id==b.dataset.id),n=SIG[o.estado];if(n==="delivered")completar(o);else o.estado=n;log(`Pedido #${o.id}: ${ESTADOS[o.estado]}`);},
 "ped-can":b=>{const o=ORDENES.find(o=>o.id==b.dataset.id),m=prompt("Motivo de la cancelación (puedes dejarlo vacío):");if(m===null)return false;o.estado="cancelled";o.motivo=m.trim();o.por=quien();decir(quien(),`🚫 Pedido #${o.id} cancelado${o.motivo?": "+o.motivo:""}`,true);log(`Pedido #${o.id} cancelado`);},
 "co-can":b=>{S.canId=b.dataset.id;$("can-t").textContent="Cancelar pedido #"+b.dataset.id;$("can-m").value="";$("dlg-can").showModal();return false;},
 "can-ok":()=>{const m=$("can-m").value.trim();if(!m){toast("Escribe el motivo para avisar a la caja.");return false;}
   const o=ORDENES.find(o=>o.id==S.canId);if(!o||o.estado==="delivered"||o.estado==="cancelled"){$("dlg-can").close();return false;}
   o.estado="cancelled";o.motivo=m;o.por=quien();decir(quien(),`🚫 Pedido #${o.id} cancelado (${(o.items||[]).map(i=>i.q+"× "+i.n).join(", ")}): ${m}`,true);log(`Pedido #${o.id} cancelado por ${o.por}: ${m}`);
   $("dlg-can").close();toast(`Pedido #${o.id} cancelado. Se avisó a la caja.`);},
 "can-cerrar":()=>{$("dlg-can").close();return false;},
 "co-av":b=>{const i=$("chat-t"),pre=`Pedido #${b.dataset.id}: `;S.kchat=true;if(i){if(!i.value)i.value=pre;}else S.pre=pre;setTimeout(()=>{const x=$("chat-t");if(x){x.focus();x.setSelectionRange(99,99);}},0);},
 "co-chat":()=>{S.kchat=!S.kchat;setTimeout(()=>{const x=$("chat-t");if(x)x.focus();},0);},
 "chat-send":()=>{const i=$("chat-t"),t=i?i.value.trim():"";if(!t)return false;decir(quien(),t);i.value="";},
 "ped-com":b=>{dlg(comanda(ORDENES.find(o=>o.id==b.dataset.id)));return false;},
 "cli-sel":b=>{S.cli=b.dataset.id;},
 "cli-club":b=>{const c=cli(b.dataset.id);c.m=!c.m;log(`${c.n} ${c.m?"se inscribió al":"salió del"} Club`);},
 "cli-venta":b=>{S.caja.cli=b.dataset.id;const c=cli(b.dataset.id);ir("caja");setTimeout(()=>{$("c-cli").value=`${c.n} · ${c.t||c.e||"sin dato"}`;},0);return false;},
 "cli-csv":()=>{const f=[["Nombre","Teléfono","Correo","Pedidos","Total","Club"],...D.clientes.map(c=>{const s=stC(c);return[c.n,c.t,c.e,s.ped,s.tot,c.m?"sí":"no"];})];descargar("clientes-sushi-puuk.csv",aCSV(f),"text/csv;charset=utf-8");return false;},
 "lt-t":b=>{S.lt=b.dataset.v;},
 "l-sel":b=>{S.lc=b.dataset.id;},
 "l-sumar":b=>{const c=cli(b.dataset.id);c.bal=+(c.bal+(D.prog.tipo==="sellos"?D.prog.porVisita:1)).toFixed(2);D.emit++;log(`Suma manual a ${c.n}`);},
 "l-canje":b=>{const r=D.recomp[+b.dataset.r],c=cli(S.lc);if(c.bal<r.costo)return toast("Todavía no le alcanza.");c.bal=+(c.bal-r.costo).toFixed(2);D.canjes.unshift({f:hoyT(),c:c.id,r:r.n});log(`${c.n} canjeó ${r.n}`);toast("Canje registrado: entrega "+r.n);},
 "rec-add":()=>{const n=$("r-n").value.trim(),c=num("r-c");if(!n||c<=0)return toast("Escribe el nombre y el costo.");D.recomp.push({n,costo:c});$("r-n").value="";$("r-c").value="";},
 "rec-del":b=>{D.recomp.splice(+b.dataset.i,1);},
 "k-tipo":b=>{D.prog.tipo=b.dataset.v;},
 "k-save":()=>{const P=D.prog;P.nombre=$("k-nom").value.trim()||P.nombre;P.bienv=$("k-bien").value;P.minimo=num("k-min");P.meta=Math.max(1,Math.round(num("k-meta")));P.plata=num("k-plata");P.oro=num("k-oro");if($("k-pv"))P.porVisita=num("k-pv");if($("k-ppd"))P.ppd=num("k-ppd");if($("k-pct"))P.pct=num("k-pct");toast("Configuración guardada");},
 "dis-ico":b=>{D.dis.icono=b.dataset.v;D.dis.iconoImg="";},
 "dis-save":()=>{toast("Diseño guardado: la tarjeta de los clientes usa estos colores y textos.");return false;},
 "est-p":b=>{S.est=b.dataset.v;},
 "imp-add":()=>{const n=$("imp-n").value.trim(),ip=$("imp-ip").value.trim();if(!n||!ip)return toast("Escribe el nombre y la dirección IP.");D.imp.push({n,ip,on:true,cats:[]});$("imp-n").value="";$("imp-ip").value="";},
 "imp-tog":b=>{const p=D.imp[+b.dataset.i];p.on=!p.on;},
 "imp-cat":b=>{const p=D.imp[+b.dataset.i],v=b.dataset.v;D.imp.forEach(x=>{x.cats=x.cats.filter(c=>c!==v||x===p);});p.cats=p.cats.includes(v)?p.cats.filter(c=>c!==v):[...p.cats,v];},
 "imp-test":()=>{toast("Un navegador no puede imprimir en la red local; esa prueba la hace el Bridge de impresión.");return false;},
 "imprimir":()=>{window.print();return false;},
 "pr-tab":b=>{S.ptab=b.dataset.v;},
 "push-send":()=>{D.hist.unshift({t:$("p-t").value.trim(),m:$("p-m").value.trim(),a:$("p-a").value,f:new Date().toLocaleDateString("es-MX")});["p-t","p-m"].forEach(i=>{$(i).value="";});log("Promo registrada: "+D.hist[0].t);toast("Guardada en el historial. En este prototipo no sale una notificación real.");},
 "cat-emo":b=>{const e=prompt("Emoji de la categoría:",D.menu[+b.dataset.c].e);if(e)D.menu[+b.dataset.c].e=e;},
 "cat-del":b=>{const c=D.menu[+b.dataset.c];if(confirm(`¿Eliminar "${c.n}" y sus ${c.p.length} productos?`)){D.imp.forEach(p=>{p.cats=p.cats.filter(x=>x!==c.n);});D.menu.splice(+b.dataset.c,1);}},
 "cat-tog":b=>{const c=D.menu[+b.dataset.c];c.cerr=!c.cerr;},
 "cat-add":()=>{const n=prompt("Nombre de la categoría:");if(n)D.menu.push({e:"🍣",n,t:0,p:[]});},
 "prod-add":b=>{const n=prompt("Nombre del producto:");if(!n)return;const c=D.menu[+b.dataset.c];c.p.push({n,c:parseFloat(prompt("Precio:","150"))||0,d:"",img:"",on:true,m:[]});c.t=Math.max(c.t,c.p.length);},
 "prod-del":b=>{const c=D.menu[+b.dataset.c];if(confirm(`¿Eliminar "${c.p[+b.dataset.p].n}"?`))c.p.splice(+b.dataset.p,1);},
 "mod-quit":b=>{D.menu[+b.dataset.c].p[+b.dataset.p].m.splice(+b.dataset.m,1);},
 "mod-add":()=>{const n=prompt("Nombre del modificador:");if(n)D.mods.unshift({n,k:0,o:[]});},
 "mod-opt":b=>{const m=D.mods[+b.dataset.i],v=$("mo-"+b.dataset.i).value.trim();if(v){if(!m.o.length&&m.k)toast("Las opciones originales no se capturaron; aquí se guardan las nuevas.");m.o.push(v);$("mo-"+b.dataset.i).value="";}},
 "menu-json":()=>{descargar("menu-sushi-puuk.json",JSON.stringify(D.menu,null,1),"application/json");return false;},
 "neg-save":()=>{D.neg={n:$("n-n").value,tel:$("n-tel").value,dir:$("n-dir").value,hor:$("n-hor").value};toast("Datos del negocio guardados");},
 "bk-dl":()=>{D.ordenes=ORDENES;descargar("respaldo-sushi-puuk-"+hoyT()+".json",JSON.stringify(D),"application/json");return false;},
};
document.addEventListener("click",e=>{
  sincronizar();if(location.hash==="#dueno"&&sesionActiva())iniciarSesion();   // actividad del dueño: renueva la sesión
  const nav=e.target.closest(".menu__item");
  if(nav){if(nav.dataset.k==="salir"){Nube.salir();}else if(["cocina","meseros","dueno"].includes(nav.dataset.k))window.open(location.href.split("#")[0]+"#"+nav.dataset.k,"puuk-"+nav.dataset.k);else ir(nav.dataset.k);return;}
  const b=e.target.closest("[data-act]");if(!b||!A[b.dataset.act])return;
  if(A[b.dataset.act](b)===false)return guardar();
  render();guardar();
});
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.id==="q-cli"||t.id==="q-menu"||t.id==="q-lc"){S[{ "q-cli":"q","q-menu":"mq","q-lc":"lq"}[t.id]]=t.value;render();const n=$(t.id);n.focus();n.setSelectionRange(99,99);}
  else if(t.dataset.ni!==undefined){S.caja.items[+t.dataset.ni].nota=t.value;}
  else if(t.dataset.f){const p=D.menu[+t.dataset.c].p[+t.dataset.p];p[t.dataset.f]=t.dataset.f==="c"?parseFloat(t.value)||0:["on","promo","dest"].includes(t.dataset.f)?t.checked:t.value;}
  else if(t.dataset.ec!==undefined){const m=D.menu[+t.dataset.ec];D.imp.forEach(p=>{p.cats=p.cats.map(x=>x===m.n?t.value:x);});m.n=t.value;}   // las impresoras siguen a la categoría renombrada
  else if(t.dataset.d){D.dis[t.dataset.d]=t.value;$("preview").innerHTML=prev();}
  else if(t.id==="p-t"||t.id==="p-m")updPush();
  guardar();
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.id==="plant"&&t.value!==""){const p=PLANT[+t.value];$("p-t").value=p[0];$("p-m").value=p[1];updPush();}
  else if(t.id==="chat-quien"){lsSet("sushipuuk-quien",t.value);render();}
  else if(t.id==="c-cli"){const c=D.clientes.find(x=>`${x.n} · ${x.t||x.e||"sin dato"}`===t.value||x.code===t.value.trim().toUpperCase());S.caja.cli=c?c.id:"";render();}
  else if(t.id==="c-mesa"){S.caja.mesa=t.value;render();}
  else if(t.id==="pc-sel"){S.pc=t.value;$("preview").innerHTML=prev();}
  else if(t.dataset.foto){const[c,p]=t.dataset.foto.split("-").map(Number);reducirImagen(t.files[0],420,u=>{const pr=D.menu[c].p[p];pr.img=u;pr.r="";render();guardar();toast("Foto guardada");});}
  else if(t.dataset.asig){const[c,p]=t.dataset.asig.split("-").map(Number);if(t.value){D.menu[c].p[p].m.push(t.value);render();guardar();}}
  else if(t.dataset.d){D.dis[t.dataset.d]=t.value;$("preview").innerHTML=prev();guardar();}
  else if(t.id==="bk-up"&&t.files[0]){if(!confirm("Se cargará el respaldo en la base de datos y lo verán todos los aparatos. ¿Continuar?")){t.value="";return;}const r=new FileReader();r.onload=()=>{try{const n=JSON.parse(r.result);if(!n.ordenes||!n.clientes)throw 0;D=normalizar(n);ORDENES.splice(0,ORDENES.length,...D.ordenes);D.ordenes=ORDENES;render();Nube.restaurado();}catch(x){toast("Ese archivo no es un respaldo válido.");}};r.readAsText(t.files[0]);}
});
// Arrastrar un modificador sobre un producto para asignarlo
document.addEventListener("dragstart",e=>{const m=e.target.closest&&e.target.closest("[data-mod]");if(m)e.dataTransfer.setData("text/plain",m.dataset.mod);});
document.addEventListener("dragover",e=>{const p=e.target.closest&&e.target.closest("[data-drop]");if(p){e.preventDefault();p.classList.add("sobre");}});
document.addEventListener("dragleave",e=>{const p=e.target.closest&&e.target.closest("[data-drop]");if(p)p.classList.remove("sobre");});
document.addEventListener("drop",e=>{const p=e.target.closest&&e.target.closest("[data-drop]");if(!p)return;e.preventDefault();const[c,i]=p.dataset.drop.split("-").map(Number),n=e.dataTransfer.getData("text/plain"),pr=D.menu[c].p[i];if(n&&!pr.m.includes(n)){pr.m.push(n);guardar();}render();});
$("boton-menu").addEventListener("click",()=>$("menu").classList.toggle("abierto"));
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="chat-t"){e.preventDefault();if(A["chat-send"]()!==false){render();guardar();}}});
window.addEventListener("hashchange",render);
// Los cambios de otros aparatos llegan desde nube.js (tiempo real); aquí se avisa de mensajes nuevos y rondas listas
function recibirCambios(antes){
  try{
    if(antes){
      const m=D.chat.filter(x=>!antes.chat.has(x.id)&&x.de!==quien());
      if(m.length){const u=m[m.length-1];toast(`💬 ${u.de}: ${u.t}`);beep();}
      // al mesero le avisa cuando una de SUS rondas ya está lista
      if(location.hash==="#meseros")D.comandas.filter(c=>c.estado==="ready"&&antes.com[c.id]!=="ready"&&c.mesero===nombreMesero()).forEach(c=>{toast(`🍣 Mesa ${c.mesa}: ronda ${c.ronda} lista para llevar`);beep();});
    }
    render();
  }catch(x){}
}
// La pantalla de cocina se refresca sola para actualizar los minutos de espera
setInterval(()=>{if(["#cocina","#meseros","#dueno"].includes(location.hash))render();},30000);
render();
