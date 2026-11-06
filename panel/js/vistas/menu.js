/* ---- Menú (editor) ---- */
function vMenu() {
  const q = S.mq.toLowerCase();
  const cats = D.menu.map((c, ci) => {
    const ps = c.p.map((p, pi) => [p, pi]).filter(([p]) => !q || p.n.toLowerCase().includes(q));
    if (q && !ps.length) return "";
    return `<section class="tarjeta cat"><div class="cat__cab"><button class="emo"
        data-act="cat-emo" data-c="${ci}">${c.e}</button><div style="flex:1"><input class="campo"
        data-ec="${ci}" value="${esc(c.n)}" style="margin:0;font-weight:800"><small class="nota">${c.p.length
      ? c.p.length + (c.t > c.p.length ? " de " + c.t : "") + " productos"
      : c.t + " productos (pendientes de captura)"}</small></div><button class="ico"
        data-act="cat-del" data-c="${ci}" title="Eliminar categoría">🗑</button><button class="ico"
        data-act="cat-tog" data-c="${ci}">${c.cerr ? "▾" : "▴"}</button></div>`
      + (
        c.cerr
          ? ""
          : ps.map(
            ([p, pi]) => `<div class="prod2" data-drop="${ci}-${pi}"><label class="foto-cambio"
                title="Cambiar foto">${foto(p)}<span>📷</span><input type="file" accept="image/*"
                hidden data-foto="${ci}-${pi}"></label><div><input class="campo" data-c="${ci}"
                data-p="${pi}" data-f="n" value="${esc(p.n)}" style="margin:0 0 6px;font-weight:700"><div>${p.c
              ? ""
              : '<span class="badge mal">Falta precio</span>'}${p.m.map(
              (m, mi) => `<span class="pill">${esc(m)} <button data-act="mod-quit" data-c="${ci}"
                  data-p="${pi}" data-m="${mi}">×</button></span>`
            ).join("")}<select class="pill" data-asig="${ci}-${pi}"><option value="">+ modificador</option>${D.mods.filter(m => !p.m.includes(m.n)).map(m => `<option>${esc(m.n)}</option>`).join("")}</select></div><textarea
                class="campo" rows="2" data-c="${ci}" data-p="${pi}" data-f="d"
                style="margin:6px 0 0">${esc(p.d)}</textarea><div class="fila"
                style="padding:6px 0;gap:12px"><label class="fila"
                style="padding:0;gap:6px;margin:0"><input type="checkbox" data-c="${ci}" data-p="${pi}"
                data-f="promo" ${p.promo ? "checked" : ""}> Promo</label><label class="fila"
                style="padding:0;gap:6px;margin:0"><input type="checkbox" data-c="${ci}" data-p="${pi}"
                data-f="dest" ${p.dest ? "checked" : ""}> Destacado</label><select class="campo"
                data-mover="${ci}-${pi}" style="width:auto;margin:0" title="Mover a otra categoría">${D.menu.map(
              (c2, i2) => `<option value="${i2}" ${i2 === ci ? "selected" : ""}>${esc(c2.e)} ${esc(c2.n)}</option>`
            ).join("")}</select></div></div><div class="pprecio"><input class="campo" type="number"
                min="0" step="0.5" data-c="${ci}" data-p="${pi}" data-f="c" value="${p.c}"><label
                class="sw" title="Disponible"><input type="checkbox" data-c="${ci}" data-p="${pi}"
                data-f="on" ${p.on ? "checked" : ""}><i></i></label><button class="ico"
                data-act="prod-del" data-c="${ci}" data-p="${pi}" title="Eliminar">🗑</button></div></div>`
          ).join("") + `<div style="padding:12px 16px"><button class="chip" data-act="prod-add"
              data-c="${ci}">+ Agregar producto</button></div>`
      )
      + `</section>`;
  }).join("");
  const mods = D.mods.map(
    (m, i) => `<details class="mod" draggable="true" data-mod="${esc(m.n)}" ${S.mo === i
      ? "open"
      : ""}><summary><span>⠿ ${esc(m.n)}</span><span class="cnt">${m.o.length || m.k}</span></summary>`
      + `<input class="campo" data-gn="${i}" value="${esc(m.n)}" style="margin:6px 0"><label
          class="fila" style="padding:0;gap:6px;margin:0 0 6px"><input type="checkbox" data-greq="${i}"
          ${m.req ? "checked" : ""}> Obligatorio elegir una opción</label>`
      + (
        m.o.length
          ? m.o.map(
            (o, oi) => `<div class="fila" style="padding:4px 0;flex-wrap:nowrap"><input
                class="campo" data-on="${i}-${oi}" value="${esc(o.n)}" style="margin:0"><input
                class="campo" type="number" step="0.5" min="0" data-op="${i}-${oi}" value="${o.p
              || 0}" style="margin:0;width:78px" title="Precio extra"><button class="ico"
                data-act="opt-del" data-i="${i}" data-o="${oi}" aria-label="Quitar opción">✕</button></div>`
          ).join("")
          : `<p class="nota">Sin opciones todavía (el cliente no verá nada que elegir).</p>`
      )
      + `<div class="fila" style="padding:0;flex-wrap:nowrap"><input class="campo keep" id="mo-${i}"
          placeholder="Nueva opción" style="margin:0"><input class="campo keep" id="mp-${i}"
          type="number" step="0.5" min="0" placeholder="+$" style="margin:0;width:78px"><button
          class="chip" data-act="mod-opt" data-i="${i}">Agregar</button></div><button class="chip"
          style="margin-top:8px" data-act="mod-del" data-i="${i}">Eliminar grupo</button></details>`
  ).join("");
  return `<div class="encabezado"><div
      style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><h1
      style="font-size:1.4rem;color:var(--texto);-webkit-text-fill-color:currentColor;background:none">Editor de menú</h1><input
      class="campo" id="q-menu" placeholder="Buscar producto…" value="${esc(S.mq)}"
      style="width:240px;margin:0"></div><div class="periodo__botones"><span class="nota">Los cambios se guardan al instante</span><button
      class="boton-exportar" data-act="plato-nuevo">＋ Agregar platillo</button><button
      class="boton-exportar" data-act="menu-cliente">📱 Menú para clientes</button><button
      class="boton-exportar" data-act="menu-json">Descargar menú (JSON)</button></div></div><div
      class="menu-ed"><div>${cats}<button class="btn-verde" data-act="cat-add">+ Agregar categoría</button></div><aside
      class="tarjeta"><h2>Modificadores</h2>${mods}<button class="chip" data-act="mod-add">+ Agregar modificador</button><p
      class="nota">Arrastra el nombre a un producto para asignarlo.</p></aside></div>`;
}

// Reduce la foto elegida (máx. 420 px, JPG) para que ocupe poco y se guarde dentro del panel
function reducirImagen(file, max, cb) {
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)),
        c = document.createElement("canvas");
      c.width = Math.round(im.width * k);
      c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      cb(c.toDataURL("image/jpeg",.78));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
}
