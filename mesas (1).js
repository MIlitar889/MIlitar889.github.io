/* ---- Mesas QR ---- */
function vMesas(){
  return cab("QRs de mesas","15 mesas · Un solo QR por mesa → menú + llamar al mesero",`<button class="boton-exportar" data-act="imprimir">Imprimir todos</button>`)
  +`<div class="qrgrid">`+Array.from({length:15},(_,i)=>i+1).map(n=>{const oc=mesaOcupada(n);return `<figure class="tarjeta qr"><img src="${(typeof QR_DATA!=="undefined"&&QR_DATA[n])||`assets/qr/mesa-${n}.png`}" alt="QR mesa ${n}"><figcaption><b>Mesa ${n}</b> <span class="badge ${oc.length?"mal":"ok"}">${oc.length?"Ocupada · "+moneda.format(oc.reduce((s,o)=>s+o.total,0)):"Libre"}</span><br><a href="https://sushipuuk.com/mesa?n=${n}" target="_blank" rel="noopener">Abrir enlace</a></figcaption></figure>`;}).join("")+`</div>`;
}
