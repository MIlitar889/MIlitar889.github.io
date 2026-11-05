/* Acceso: ahora lo da Supabase (correo y contraseña por persona, ver nube.js).
   Estas funciones solo conservan los nombres que usan las pantallas. */
const credencial=()=>window.USUARIO&&USUARIO.rol==="dueno"?{u:USUARIO.nombre}:null;
const sesionActiva=()=>!!credencial();
const iniciarSesion=()=>{};
const cerrarSesiones=()=>Nube.salir();
