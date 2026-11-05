/* Acciones de la app del dueño */
Object.assign(A,{
 "dn-tab":b=>{S.dn.tab=b.dataset.v;window.scrollTo(0,0);},
 "dn-per":b=>{S.dn.per=b.dataset.v;S.dn.lim=60;},
 "dn-est":b=>{S.dn.est=b.dataset.v;S.dn.lim=60;},
 "dn-ver":b=>{S.dn.ver=String(S.dn.ver)===b.dataset.id?null:b.dataset.id;},
 "dn-crear":()=>{(async()=>{
   const u=$("dn-user").value.trim(),p1=$("dn-p1").value,p2=$("dn-p2").value;
   if(!u)return toast("Escribe tu nombre.");if(p1.length<6)return toast("La contraseña debe tener al menos 6 caracteres.");if(p1!==p2)return toast("Las contraseñas no coinciden.");
   const sal=nuevaSal(),alg=hayCripto()?"s2":"f1";
   lsSet(K_CRED,JSON.stringify({u,sal,alg,h:await huella(p1,sal,alg),creado:hoyT()}));iniciarSesion();log("Acceso del dueño creado");guardar();render();})();return false;},
 "dn-entrar":()=>{(async()=>{await entrarDueno($("dn-pass").value);const e=$("dn-pass");if(e)e.value="";render();})();return false;},
 "dn-salir":()=>{ssSet(K_SES,null);S.dn.cuenta=false;},
 "dn-cuenta":()=>{S.dn.cuenta=!S.dn.cuenta;},
 "dn-cambiar":()=>{(async()=>{
   const c=credencial(),a=$("dn-pa").value,n=$("dn-pn").value,n2=$("dn-pn2").value;
   let ok=false;try{ok=(await huella(a,c.sal,c.alg))===c.h;}catch(e){}
   if(!ok)return toast("La contraseña actual no es correcta.");if(n.length<6)return toast("La nueva contraseña debe tener al menos 6 caracteres.");if(n!==n2)return toast("Las contraseñas nuevas no coinciden.");
   const sal=nuevaSal(),alg=hayCripto()?"s2":"f1";c.sal=sal;c.alg=alg;c.h=await huella(n,sal,alg);lsSet(K_CRED,JSON.stringify(c));S.dn.cuenta=false;toast("Contraseña cambiada");render();})();return false;},
 "dn-reset":()=>{if(!confirm("¿Restablecer el acceso del dueño en este aparato? Tendrá que crear una contraseña nueva."))return false;lsSet(K_CRED,"");ssSet(K_SES,null);lsSet(K_INT,"{}");toast("Acceso restablecido. Al abrir la app del dueño se pedirá crear uno nuevo.");},
 "dn-mas":()=>{S.dn.lim+=60;},
 "dn-csv":()=>{
   const f=[["Pedido","Fecha","Hora","Tipo","Nombre de la mesa","Cliente","Mesero","Pago","Estado","Total","Productos","Motivo de cancelación"],
     ...filtraHist().map(o=>[o.id,o.fecha,o.hora||"",tipoT(o),o.nombreMesa||"",nomCli(o.cliente),o.mesero||"Caja",(METODOS[o.metodo]||{nombre:o.metodo}).nombre,ESTADOS[o.estado],o.total,(o.items||[]).map(i=>i.q+"x "+i.n+(notaItem(i)?" ("+notaItem(i)+")":"")).join("; "),o.motivo||""])];
   descargar("historial-pedidos-"+hoyT()+".csv",aCSV(f),"text/csv;charset=utf-8");return false;}
});
document.addEventListener("input",e=>{if(e.target.id==="dn-q"){S.dn.q=e.target.value;S.dn.lim=60;render();}});
document.addEventListener("change",e=>{const t=e.target;if(t.id==="dn-met"){S.dn.met=t.value;render();}else if(t.id==="dn-mes"){S.dn.mes=t.value;render();}});
document.addEventListener("keydown",e=>{if(e.key!=="Enter")return;if(e.target.id==="dn-pass")A["dn-entrar"]();else if(e.target.id==="dn-p2")A["dn-crear"]();});
