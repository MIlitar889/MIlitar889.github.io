/* Supabase: inicio de sesión por rol, guardado y tiempo real.
   El resto del panel sigue usando D y ORDENES; este archivo los sincroniza con la tabla "registros":
   un registro por pedido, mesa, ronda, cliente, mensaje... y 3 registros "principal" (menu, config, estado). */
const Nube=(()=>{
  const OPER=["ordenes","comandas","cuentas","chat","clientes","canjes","estado"],   // lo que cocina y meseros pueden escribir (igual que en el SQL)
    COLS=["ordenes","cuentas","comandas","clientes","chat","canjes","menu","config","estado"],
    BORRA={dueno:["cuentas","comandas","clientes"],caja:["cuentas","comandas","clientes"],mesero:["cuentas","comandas"],cocina:[]},
    ARR={ordenes:()=>ORDENES,cuentas:()=>D.cuentas,comandas:()=>D.comandas,clientes:()=>D.clientes,chat:()=>D.chat,canjes:()=>D.canjes},
    CFG=["mods","imp","prog","recomp","dis","neg","hist"],EST=["emit","act","cola"];
  let sb=null,user=null,rol=null,cargado=false,sinBorrar=false,enviando=false,sondeando=false,evitarRecarga=false,
    tPend=null,tRetry=null,tRender=null,antesPend=null,cursor=0,vuelta=0,ultId=0;
  const conocido=new Map();   // lo último que sabemos que hay en la base: "coleccion/id" → texto canónico
  // Texto con las llaves ordenadas, para comparar sin importar el orden en que Postgres devuelve las llaves
  const canon=v=>{if(v===null||typeof v!=="object")return String(JSON.stringify(v));if(Array.isArray(v))return "["+v.map(x=>canon(x===undefined?null:x)).join(",")+"]";return "{"+Object.keys(v).filter(k=>v[k]!==undefined).sort().map(k=>JSON.stringify(k)+":"+canon(v[k])).join(",")+"}";};
  const idUnico=()=>{let v=Date.now()*1000+Math.floor(Math.random()*1000);if(v<=ultId)v=ultId+1;ultId=v;return v;};
  const puedeEscribir=c=>rol==="dueno"||rol==="caja"||OPER.includes(c);
  const colDe=k=>k.slice(0,k.indexOf("/")),idDe=k=>k.slice(k.indexOf("/")+1);
  const pick=(o,ks)=>Object.fromEntries(ks.map(k=>[k,o[k]]));
  const objDe=c=>c==="menu"?{cats:D.menu}:c==="config"?pick(D,CFG):pick(D,EST);
  function serializar(){
    const m=new Map();
    ORDENES.forEach(o=>m.set("ordenes/"+o.id,o));
    ["cuentas","comandas","clientes","chat"].forEach(c=>D[c].forEach(x=>m.set(c+"/"+x.id,x)));
    D.canjes.forEach(x=>{if(!x.id)x.id=idUnico();m.set("canjes/"+x.id,x);});
    ["menu","config","estado"].forEach(c=>m.set(c+"/principal",objDe(c)));
    return m;
  }
  const aviso=t=>{const e=$("red");if(e){e.hidden=!t;e.textContent=t||"";}};

  /* ---------- guardar: manda a la base solo lo que cambió ---------- */
  function pedirGuardado(){if(!cargado)return;clearTimeout(tPend);tPend=setTimeout(empujar,400);}
  async function empujar(){
    if(!cargado)return true;
    if(enviando){pedirGuardado();return true;}
    const act=serializar(),subir=[],borrar={};
    act.forEach((v,k)=>{const c=colDe(k);if(!puedeEscribir(c))return;const j=canon(v);if(conocido.get(k)!==j)subir.push({k,v,j,antes:conocido.get(k)});});
    if(!sinBorrar)conocido.forEach((j,k)=>{const c=colDe(k);if(!act.has(k)&&(BORRA[rol]||[]).includes(c))(borrar[c]=borrar[c]||[]).push(idDe(k));});
    if(!subir.length&&!Object.keys(borrar).length)return true;
    enviando=true;subir.forEach(s=>conocido.set(s.k,s.j));
    let ok=true;
    try{
      for(let i=0;i<subir.length;i+=40){
        const {error}=await sb.from("registros").upsert(subir.slice(i,i+40).map(s=>({coleccion:colDe(s.k),id:idDe(s.k),datos:s.v})),{onConflict:"coleccion,id"});
        if(error)throw error;
      }
      for(const c in borrar){const {error}=await sb.from("registros").delete().eq("coleccion",c).in("id",borrar[c]);if(error)throw error;borrar[c].forEach(id=>conocido.delete(c+"/"+id));}
      aviso("");
    }catch(e){
      ok=false;
      if(e&&(e.code==="42501"||e.status===403)){aviso("Sin permiso para guardar algo de lo último. Avisa al dueño.");setTimeout(()=>aviso(""),8000);}
      else{subir.forEach(s=>{if(s.antes===undefined)conocido.delete(s.k);else conocido.set(s.k,s.antes);});aviso("⚠ Sin conexión: los cambios se guardarán en cuanto vuelva. No cierres esta pantalla.");clearTimeout(tRetry);tRetry=setTimeout(empujar,5000);}
    }
    enviando=false;
    if(ok)pedirGuardado();   // por si algo cambió mientras se enviaba
    return ok;
  }

  /* ---------- recibir: cambios de otros aparatos ---------- */
  const loc=(c,id)=>{const a=ARR[c];return a?a().find(x=>String(x.id)===id):objDe(c);};
  function poner(c,datos){
    if(c==="menu"){if(datos.cats)D.menu=datos.cats;}
    else if(c==="config")CFG.forEach(f=>{if(datos[f]!==undefined)D[f]=datos[f];});
    else if(c==="estado")EST.forEach(f=>{if(datos[f]!==undefined)D[f]=datos[f];});
  }
  function aplicar(c,id,datos,borrar){
    const k=c+"/"+id,a=ARR[c];
    if(borrar){conocido.delete(k);if(a){const i=a().findIndex(x=>String(x.id)===id);if(i>=0){a().splice(i,1);return true;}}return false;}
    const j=canon(datos);
    if(conocido.get(k)===j)return false;   // es el eco de lo que yo mismo guardé
    if(puedeEscribir(c)&&conocido.has(k)){const l=loc(c,id);if(l!==undefined&&canon(l)!==conocido.get(k))return false;}   // tengo un cambio mío sin enviar: gana el mío
    conocido.set(k,j);
    if(a){const arr=a(),i=arr.findIndex(x=>String(x.id)===id);if(i>=0)arr[i]=datos;else arr.push(datos);}else poner(c,datos);
    return true;
  }
  function ordenar(){
    ORDENES.sort((x,y)=>(x.ts||x.id)-(y.ts||y.id));D.cuentas.sort((x,y)=>x.id-y.id);D.comandas.sort((x,y)=>x.id-y.id);
    D.chat.sort((x,y)=>x.id-y.id);if(D.chat.length>200)D.chat.splice(0,D.chat.length-200);D.canjes.sort((x,y)=>y.id-x.id);
  }
  function lote(filas){
    if(!antesPend)antesPend={chat:new Set(D.chat.map(m=>m.id)),com:Object.fromEntries(D.comandas.map(c=>[c.id,c.estado]))};
    let cambio=false;
    filas.forEach(f=>{
      const t=Date.parse(String(f.actualizado||"").replace(/(\.\d{3})\d+/,"$1"));if(t>cursor)cursor=t;
      if(COLS.includes(f.coleccion)&&aplicar(f.coleccion,String(f.id),f.datos,f.borrar))cambio=true;
    });
    if(!cambio){if(!tRender)antesPend=null;return;}
    normalizar(D);ordenar();
    clearTimeout(tRender);tRender=setTimeout(()=>{tRender=null;const a=antesPend;antesPend=null;recibirCambios(a);},150);
  }
  async function leer(fn){let d=0,out=[];for(;;){const {data,error}=await fn().range(d,d+999);if(error)throw error;out.push(...data);if(data.length<1000)return out;d+=1000;}}
  const traerTodo=()=>leer(()=>sb.from("registros").select("coleccion,id,datos,actualizado").order("coleccion").order("id"));
  function cargarFilas(filas){
    conocido.clear();ORDENES.splice(0,ORDENES.length);D.cuentas=[];D.comandas=[];D.clientes=[];D.chat=[];D.canjes=[];cursor=0;
    filas.forEach(f=>{
      if(!COLS.includes(f.coleccion))return;
      const id=String(f.id),t=Date.parse(String(f.actualizado).replace(/(\.\d{3})\d+/,"$1"));if(t>cursor)cursor=t;
      conocido.set(f.coleccion+"/"+id,canon(f.datos));
      const a=ARR[f.coleccion];if(a)a().push(f.datos);else poner(f.coleccion,f.datos);
    });
    if(!cursor)cursor=Date.now()-60000;
    normalizar(D);ordenar();
  }
  async function sondear(){
    if(!cargado||sondeando)return;sondeando=true;
    try{
      const desde=new Date(Math.max(0,cursor-10000)).toISOString();
      lote(await leer(()=>sb.from("registros").select("coleccion,id,datos,actualizado").gte("actualizado",desde).order("actualizado").order("coleccion").order("id")));
      if(++vuelta%6===0){   // cada ~30 s revisa si alguien borró mesas, rondas o clientes
        const hay=new Set((await leer(()=>sb.from("registros").select("coleccion,id").in("coleccion",["cuentas","comandas","clientes"]).order("coleccion").order("id"))).map(f=>f.coleccion+"/"+f.id));
        const fuera=[];conocido.forEach((j,k)=>{if(["cuentas","comandas","clientes"].includes(colDe(k))&&!hay.has(k))fuera.push({coleccion:colDe(k),id:idDe(k),borrar:true});});
        if(fuera.length)lote(fuera);
      }
      if(enviando===false&&!tRetry)aviso("");
    }catch(e){aviso("⚠ Sin conexión con la base de datos. Reintentando…");}
    sondeando=false;
  }
  function suscribir(){
    sb.channel("registros-vivo").on("postgres_changes",{event:"*",schema:"public",table:"registros"},p=>{
      const f=p.eventType==="DELETE"?p.old:p.new;if(!f||!COLS.includes(f.coleccion))return;
      if(p.eventType==="DELETE")lote([{coleccion:f.coleccion,id:f.id,borrar:true}]);
      else if(f.datos===undefined)sondear();   // registro muy grande: el aviso viene sin datos, se pide aparte
      else lote([f]);
    }).subscribe(s=>{if(s==="SUBSCRIBED")sondear();});
    setInterval(sondear,5000);
    window.addEventListener("online",()=>{sondear();pedirGuardado();});
  }

  /* ---------- números de pedido, respaldo y cuenta ---------- */
  async function folio(){const {data,error}=await sb.rpc("nuevo_folio");if(error)throw error;return Number(data);}
  async function restaurado(){   // después de cargar un respaldo: se guarda todo y se vuelve a leer para no perder lo que ya había
    sinBorrar=true;
    try{
      const m=Math.max(0,...ORDENES.map(o=>+o.id||0));
      if(m){const r=await sb.rpc("fijar_folio",{n:m});if(r.error)toast("Aviso: corre supabase/04_permisos_y_folios.sql para evitar números de pedido repetidos.");}
      if(!(await empujar()))throw new Error("no se pudo enviar");
      cargarFilas(await traerTodo());render();toast("Respaldo restaurado y guardado en la base de datos.");
    }catch(e){toast("No se pudo guardar el respaldo: "+(e.message||e));}
    sinBorrar=false;
  }
  async function cambiarClave(actual,nueva){
    const r=await sb.auth.signInWithPassword({email:user.email,password:actual});if(r.error)return "La contraseña actual no es correcta.";
    const u=await sb.auth.updateUser({password:nueva});return u.error?u.error.message:"";
  }
  async function salir(){evitarRecarga=true;try{await sb.auth.signOut();}catch(e){}location.reload();}

  /* ---------- inicio de sesión ---------- */
  const msg=t=>{const e=$("login-msg");if(e)e.textContent=t||"";};
  function mostrarLogin(t){document.body.classList.add("sin-sesion");$("login").hidden=false;msg(t);const b=$("login-btn");if(b)b.disabled=false;const e=$("login-email");if(e)e.focus();}
  async function arrancar(u){
    const {data:p,error}=await sb.from("perfiles").select("nombre,rol,activo").eq("id",u.id).maybeSingle();
    if(error||!p||!p.activo){evitarRecarga=true;try{await sb.auth.signOut();}catch(e){}evitarRecarga=false;return mostrarLogin(error?"No se pudo leer tu perfil: "+error.message:"Tu usuario todavía no tiene un perfil activo. Avisa al dueño.");}
    user=u;rol=p.rol;window.USUARIO={nombre:p.nombre,rol:p.rol,email:u.email};
    if(rol==="mesero")lsSet("sushipuuk-mesero",p.nombre);
    try{cargarFilas(await traerTodo());}catch(e){return mostrarLogin("No se pudieron cargar los datos: "+(e.message||e));}
    cargado=true;$("login").hidden=true;document.body.classList.remove("sin-sesion");
    suscribir();
    if(!vistaPermitida(location.hash.slice(1)||"pedidos"))location.hash=INICIO[rol];
    render();pedirGuardado();   // si la base está vacía, esto sube el menú y la configuración de ejemplo
  }
  async function iniciar(){
    $("login-form").addEventListener("submit",async e=>{
      e.preventDefault();if(!sb)return;$("login-btn").disabled=true;msg("Entrando…");
      const {data,error}=await sb.auth.signInWithPassword({email:$("login-email").value.trim(),password:$("login-pass").value});
      if(error){$("login-btn").disabled=false;return msg(error.status===400?"Correo o contraseña incorrectos.":"No se pudo entrar: "+error.message);}
      msg("Cargando datos…");$("login-pass").value="";await arrancar(data.user);
    });
    if(!window.supabase)return mostrarLogin("No se pudo cargar Supabase. Revisa la conexión a internet y recarga la página.");
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    sb.auth.onAuthStateChange(ev=>{if(ev==="SIGNED_OUT"&&!evitarRecarga)location.reload();});
    const {data}=await sb.auth.getSession();
    if(data.session)await arrancar(data.session.user);else mostrarLogin();
  }
  return {iniciar,pedirGuardado,folio,idUnico,restaurado,cambiarClave,salir};
})();
