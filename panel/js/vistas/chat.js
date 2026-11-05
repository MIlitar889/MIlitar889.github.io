/* Chat general entre caja, cocina y meseros */
function chatHTML(n,pre){
  const yo=quien(),M=D.chat.slice(-n);
  return `<div class="chat"><div class="chat-msgs">`+(M.map(m=>m.sis?`<p class="chat-sis">${esc(m.t)} <small>${esc(m.f)}</small></p>`:`<div class="burbuja ${m.de===yo?"mia":""}"><small>${esc(m.de)} · ${esc(m.f)}</small><p>${esc(m.t)}</p></div>`).join("")||`<p class="nota" style="text-align:center">Aún no hay mensajes</p>`)
  +`</div><div class="chat-in"><input class="campo keep" id="chat-t" placeholder="Escribe un mensaje…" maxlength="200" autocomplete="off" value="${esc(pre||"")}"><button class="btn-verde" data-act="chat-send">Enviar</button></div></div>`;
}
function vChat(){
  const yo=quien();
  return cab("💬 Chat general","Mensajes entre caja, cocina y meseros",`<label style="margin:0">Estoy como: <select class="campo" id="chat-quien" style="width:auto;display:inline-block;margin:0 0 0 6px">${["Caja","Cocina","Mesero","Dueño"].map(x=>`<option ${x===yo?"selected":""}>${x}</option>`).join("")}</select></label>`)
  +`<div class="tarjeta">${chatHTML(100)}</div>`;
}
