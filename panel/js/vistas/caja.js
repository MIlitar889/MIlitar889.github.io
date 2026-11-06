/* ---- Nueva venta (caja) ---- */
function vCaja() {
  const K = S.caja,
    tot = K.items.reduce((s, i) => s + i.c * i.q, 0),
    c = cli(K.cli),
    P = D.prog,
    cat = D.menu[K.cat] || D.menu[0],
    ps = cat.p.filter(p => p.on);
  const g = c && c.m && tot >= P.minimo ? gana({ total: tot }) : 0;
  return cab(
    "Nueva venta",
    "Al registrar el pedido se actualizan Pedidos, Reportes, Estadísticas, Clientes, Lealtad e Impresoras"
  )
    + `<div class="dos caja"><div>`
    + chips(D.menu.map((m, i) => [i, m.e + " " + m.n]), "caja-cat", K.cat)
    + (
      ps.length
        ? `<div class="prodgrid">` + ps.map(
          p => `<button class="tarjeta pbtn" data-act="caja-add" data-n="${esc(p.n)}">${foto(p)}<b>${esc(p.n)}</b><span>${moneda.format(p.c)}</span></button>`
        ).join("") + `</div>`
        : `<div class="tarjeta">${vacio(
          "No hay productos disponibles en esta categoría. Agrégalos en Menú."
        )}</div>`
    )
    + `</div><aside class="tarjeta"><h2>Ticket</h2>`
    + (
      K.items.length
        ? K.items.map(
          (i, x) => `<div style="padding:6px 0;border-bottom:1px solid var(--borde)"><div
              class="fila" style="padding:0"><span style="flex:1">${esc(i.n)}${(i.opc || []).length
            ? `<br><small class="nota" style="margin:0">${esc(i.opc.join(", "))}</small>`
            : ""}</span><button class="chip" data-act="caja-q" data-i="${x}" data-d="-1">−</button><b>${i.q}</b><button
              class="chip" data-act="caja-q" data-i="${x}" data-d="1">+</button><span>${moneda.format(i.c * i.q)}</span></div><input
              class="campo" id="ni-${x}" data-ni="${x}" value="${esc(i.nota || "")}"
              placeholder="Nota para este producto (ej. con alga, empanizado…)" maxlength="80"
              style="margin:6px 0 0"></div>`
        ).join("")
        : vacio("Elige productos del menú")
    )
    + `<label>Cliente</label><input class="campo keep" id="c-cli" list="dl-cli"
        placeholder="Buscar por nombre o teléfono"><datalist id="dl-cli">${D.clientes.map(
      x => `<option value="${esc(x.n)} · ${esc(x.t||x.e||"sin dato")}">`
    ).join("")}</datalist>`
    + (
      c
        ? `<p class="nota">${esc(c.n)} · ${c.m
          ? "Club " + nivel(c)[0] + " · " + fmtU(c.bal)
          : "no inscrito al Club"}</p>`
        : ""
    )
    + `<details class="acord"><summary>Cliente nuevo</summary><input class="campo keep" id="c-n"
        placeholder="Nombre"><input class="campo keep" id="c-t" placeholder="Teléfono"><input
        class="campo keep" id="c-e" placeholder="Correo (opcional)"><label><input type="checkbox"
        class="keep" id="c-m"> Inscribir al Club</label></details>`
    + `<label>Tipo de pedido</label>`
    + chips(Object.entries(TIPO), "caja-tipo", K.tipo)
    + (
      K.tipo === "mesa"
        ? `<select class="campo keep" id="c-mesa" data-caja="mesa"><option value="">Elige mesa</option>${Array.from({ length: 15 }, (_, i) => i + 1).map(
          n => `<option value="${n}" ${+K.mesa === n ? "selected" : ""}>Mesa ${n}${mesaOcupada(n).length
            ? " (ocupada)"
            : ""}</option>`
        ).join("")}</select>`
        : ""
    )
    + `<label>Método de pago</label>`
    + chips(Object.entries(METODOS).map(([k, v]) => [k, v.nombre]), "caja-met", K.metodo)
    + `<textarea class="campo keep" id="c-nota" rows="2"
        placeholder="Nota general del pedido (opcional)"></textarea>`
    + `<p style="font-size:1.4rem;font-weight:800;margin:6px 0">Total: ${moneda.format(tot)}</p>`
    + (g ? `<p class="nota">Este cliente ganará ${fmtU(g)} al entregar el pedido.</p>` : "")
    + `<div class="periodo__botones"><button class="btn-rojo" data-act="caja-ok">Registrar pedido</button><button
        class="btn-verde" data-act="caja-ent">Cobrar y entregar</button></div></aside></div>`;
}
