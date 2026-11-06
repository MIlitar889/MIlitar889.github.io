/* ---- Clientes ---- */
function vClientes() {
  const q = S.q.toLowerCase(),
    L = D.clientes.filter(c => (c.n + c.t + c.e + (c.code || "")).toLowerCase().includes(q)),
    sel = cli(S.cli),
    st = sel && stC(sel);
  return cab(
    "Base de clientes",
    `${D.clientes.length} clientes registrados`,
    `<button class="boton-exportar" data-act="cli-csv">Exportar CSV</button>`
  ) + `<div class="dos"><div><input class="campo" id="q-cli"
      placeholder="Buscar por nombre, teléfono o correo…" value="${esc(S.q)}"><div class="lista">` + L.map(c => {
    const s = stC(c);
    return `<button class="tarjeta fila fila--btn" data-act="cli-sel" data-id="${esc(c.id)}"><span
        class="avatar">${esc(c.n[0].toUpperCase())}</span><span><b>${esc(c.n)}</b><br><small>${esc(c.t || c.e || "sin contacto")}</small></span>${c.m
      ? `<span class="badge ok">Club</span>`
      : ""}<span style="margin-left:auto;text-align:right">${s.ped} pedidos<br><b>${moneda.format(s.tot)}</b></span></button>`;
  }).join("") + `</div></div><aside class="tarjeta">` + (
    sel
      ? `<h2>${esc(sel.n)}</h2><p>${esc(sel.t || "")} ${esc(sel.e || "")}</p><p>${st.ped} pedidos · ${moneda.format(st.tot)} · ticket ${moneda.format(st.tot / (st.ped || 1))}</p><p>${sel.m
        ? `Socio ${nivel(sel)[0]} · ${fmtU(sel.bal)}`
        : "No inscrito al Club"}</p><div class="periodo__botones"><button class="chip"
          data-act="cli-club" data-id="${esc(sel.id)}">${sel.m
        ? "Quitar del Club"
        : "Inscribir al Club"}</button><button class="chip" data-act="cli-venta" data-id="${esc(sel.id)}">Nueva venta</button></div><h2
          style="margin-top:14px">Pedidos en este panel</h2>` + (
        st.L.length
          ? st.L.slice(-6).reverse().map(
            o => `<p class="nota">#${o.id} · ${o.fecha} · ${moneda.format(o.total)}</p>`
          ).join("")
          : `<p class="nota">Los ${sel.hp} pedidos anteriores no traen detalle en la captura original.</p>`
      )
      : vacio("Selecciona un cliente para ver su historial")
  ) + `</aside></div>`;
}
