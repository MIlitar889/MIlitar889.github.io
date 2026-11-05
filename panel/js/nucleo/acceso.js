/* Acceso del dueño: nombre y contraseña guardados como huella (hash) en este aparato.
   Es un bloqueo básico para que nadie curiosee las ventas en el teléfono del dueño.
   NO es seguridad de servidor: la protección real llegará con la base de datos central. */
const K_CRED="sushipuuk-dueno-cred",K_INT="sushipuuk-dueno-intentos",K_SES="sushipuuk-dueno-ses";
const MIN_SESION=30,MAX_INT=5,BLOQUEO_MIN=5;
const ssGet=k=>{try{return sessionStorage.getItem(k);}catch(e){return null;}};
const ssSet=(k,v)=>{try{if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v);}catch(e){}};
const credencial=()=>{try{return JSON.parse(lsGet(K_CRED)||"null");}catch(e){return null;}};
const hayCripto=()=>!!(window.crypto&&window.crypto.subtle);
const nuevaSal=()=>{const a=new Uint8Array(8);try{crypto.getRandomValues(a);}catch(e){for(let i=0;i<8;i++)a[i]=Math.random()*256;}return [...a].map(x=>x.toString(16).padStart(2,"0")).join("");};
// alg "s2" = SHA-256 (si el navegador lo permite); "f1" = huella simple de respaldo
async function huella(pass,sal,alg){
  const t=sal+"|"+pass;
  if(alg==="s2"){
    if(!hayCripto())throw new Error("sin cripto");
    const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));
    return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
  }
  let a=2166136261,b=5381;
  for(let r=0;r<2000;r++)for(let i=0;i<t.length;i++){a=Math.imul(a^t.charCodeAt(i),16777619)>>>0;b=(Math.imul(b,33)^t.charCodeAt(i)^a)>>>0;}
  return a.toString(16)+b.toString(16);
}
// La sesión dura mientras no pasen 30 minutos sin tocar la pantalla y se borra al cerrar la ventana
const sesionActiva=()=>{const t=+ssGet(K_SES)||0;return t>0&&Date.now()-t<MIN_SESION*60000;};
const iniciarSesion=()=>ssSet(K_SES,String(Date.now()));
const cerrarSesiones=()=>{ssSet(K_SES,null);lsSet("sushipuuk-mesero","");};
const intentos=()=>{try{return JSON.parse(lsGet(K_INT)||"{}");}catch(e){return{};}};
const bloqueadoHasta=()=>{const i=intentos();return i.hasta&&i.hasta>Date.now()?i.hasta:0;};
async function entrarDueno(pass){
  const c=credencial();if(!c)return false;
  if(bloqueadoHasta()){toast(`Demasiados intentos. Espera ${Math.ceil((bloqueadoHasta()-Date.now())/60000)} min.`);return false;}
  let h;try{h=await huella(pass,c.sal,c.alg);}catch(e){toast("Este navegador no puede verificar la contraseña.");return false;}
  if(h===c.h){lsSet(K_INT,"{}");iniciarSesion();return true;}
  const i=intentos();i.n=(i.n||0)+1;
  if(i.n>=MAX_INT){i.hasta=Date.now()+BLOQUEO_MIN*60000;i.n=0;toast(`Contraseña incorrecta. Acceso bloqueado ${BLOQUEO_MIN} minutos.`);}
  else toast(`Contraseña incorrecta. Te quedan ${MAX_INT-i.n} intentos.`);
  lsSet(K_INT,JSON.stringify(i));return false;
}
