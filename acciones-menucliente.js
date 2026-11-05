/* Genera el archivo "menú para clientes" con el menú actual del panel (platillos, opciones, fotos, club y datos del negocio).
   No incluye clientes, ventas ni nada interno. */
Object.assign(A,{
 "menu-cliente":()=>{
   if(typeof PLANTILLA_MENU_CLIENTES==="undefined"){toast("Esta función está en el archivo único (sushi-puuk.html).");return false;}
   const menu=D.menu.map(c=>({e:c.e,n:c.n,p:c.p.filter(p=>p.on&&p.c>0)})).filter(c=>c.p.length);
   const n=menu.reduce((s,c)=>s+c.p.length,0);
   if(!n){toast("No hay productos con precio y disponibles para publicar.");return false;}
   const raw={generado:new Date().toLocaleString("es-MX"),neg:{...D.neg},menu,mods:D.mods,prog:D.prog,dis:D.dis,recomp:D.recomp.filter(r=>r.activa)};
   const html=PLANTILLA_MENU_CLIENTES.replace("/*DATOS_MENU*/null",()=>JSON.stringify(raw).replace(/</g,"\\u003c"));
   descargar("menu-clientes.html",html,"text/html;charset=utf-8");
   toast(`Menú para clientes generado: ${n} productos en ${menu.length} categorías`);return false;}
});
