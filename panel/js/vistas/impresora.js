/* ---- Impresora ---- */
function vImp() {
  return cab(
    "🖨️ Impresoras",
    "Cada pedido nuevo reparte sus productos entre las impresoras según la categoría."
  )
    + `<div class="tarjeta fila" style="margin-bottom:16px"><input class="campo keep" id="imp-n"
        placeholder="Nombre (ej. Caja)" style="max-width:220px;margin:0"><input class="campo keep"
        id="imp-ip" placeholder="192.168.1.x:9100" style="max-width:220px;margin:0"><button
        class="chip" data-act="imp-add">Nueva impresora</button></div>`
    + D.imp.map(
      (p, i) => `<div class="tarjeta" style="margin-bottom:12px"><div class="fila" style="padding:0"><b>${esc(p.n)}</b><span
          class="badge ${p.on ? "ok" : ""}">${p.on ? "Activa" : "Inactiva"}</span><code>${esc(p.ip)}</code></div><p
          class="nota">80 mm · 48 caracteres · Comanda de cocina. Toca una categoría para asignarla o quitarla:</p><div
          class="periodo__botones">${D.menu.map(
        c => `<button class="chip" data-act="imp-cat" data-i="${i}" data-v="${esc(c.n)}"
            aria-pressed="${p.cats.includes(c.n)}">${c.e} ${esc(c.n)}</button>`
      ).join("")}</div><div class="periodo__botones" style="margin-top:10px"><button class="chip"
          data-act="imp-test" data-i="${i}">Prueba</button><button class="chip" data-act="imp-tog"
          data-i="${i}">${p.on ? "Desactivar" : "Activar"}</button></div></div>`
    ).join("")
    + `<div class="tarjeta" style="margin-bottom:12px"><h2>Cola de impresión</h2>`
    + (
      D.cola.length
        ? D.cola.slice(0, 6).map(
          c => `<p class="nota" style="margin:4px 0">#${c.id} · ${c.f} → ${Object.entries(c.r).map(([k, n]) => `${esc(k)} (${n})`).join(", ")}${c.ref
            ? ` <button class="chip" data-act="cola-imp" data-t="${c.ref.t}" data-id="${c.ref.id}">🖨 Reimprimir</button>`
            : ""}</p>`
        ).join("")
        : vacio("Aún no se ha enviado ninguna comanda")
    )
    + `</div><div class="tarjeta"><b>Bridge de impresión local</b> <span class="badge mal">1 error</span><p
        class="nota">El Bridge es un programa instalado en una computadora del local. Sin él no salen las comandas impresas.</p></div>`;
}
