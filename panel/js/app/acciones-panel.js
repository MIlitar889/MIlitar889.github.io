/* Acciones del panel: opciones de platillos, pedidos con línea de tiempo, recompensas, editor de menú y datos del negocio */
Object.assign(A, {
  /* ---- opciones al agregar un producto (caja y meseros) ---- */
  "opc-ok": () => {
    const { G, cb } = S.opc;
    const opc = [];
    let ex = 0;
    G.forEach((g, gi) => {
      const r = document.querySelector(`#opc-body input[name="g${gi}"]:checked`);
      if (r && r.value !== "") {
        const o = g.o[+r.value];
        opc.push(o.n);
        ex += o.p || 0;
      }
    });
    $("dlg-opc").close();
    S.opc = null;
    cb(opc, ex);
    return false;
  },
  "opc-no": () => {
    $("dlg-opc").close();
    S.opc = null;
    return false;
  },
  "caja-add": b => {
    const p = D.menu.flatMap(c => c.p).find(p => p.n === b.dataset.n);
    pedirOpciones(p, (opc, ex) => {
      const k = opc.join("|"),
        it = S.caja.items.find(i => i.n === p.n && !i.nota && (i.opc || []).join("|") === k);
      if (it) it.q++;
      else S.caja.items.push({ n: p.n, c: p.c + ex, q: 1, nota: "", opc });
      render();
      guardar();
    });
    return false;
  },
  "mz-add": b => {
    const p = D.menu.flatMap(c => c.p).find(p => p.n === b.dataset.n);
    pedirOpciones(p, (opc, ex) => {
      agregarBorrador(cuenta(S.m.id), p, opc, ex);
      render();
      guardar();
    });
    return false;
  },
  /* ---- pedidos ---- */
  "ped-abrir": b => {
    S.pedAb = String(S.pedAb) === b.dataset.id ? null : b.dataset.id;
  },
  "ped-set": b => {
    const o = ORDENES.find(o => o.id == b.dataset.id), e = b.dataset.e;
    if (!o || ["delivered", "cancelled"].includes(o.estado)) return false;
    if (e === "cancelled") {
      const m = prompt("Motivo de la cancelación (puedes dejarlo vacío):");
      if (m === null) return false;
      o.estado = "cancelled";
      o.motivo = m.trim();
      o.por = quien();
      decir(quien(), `🚫 Pedido #${o.id} cancelado${o.motivo?": "+o.motivo:""}`, true);
    } else if (e === "delivered") completar(o);
    else o.estado = e;
    o.te = o.te || { };
    o.te[o.estado] = Date.now();
    log(`Pedido #${o.id}: ${ESTADOS[o.estado]}`);
  },
  "ped-imp": b => {
    const o = ORDENES.find(o => o.id == b.dataset.id);
    imprimirTxt(comanda(o).replace(/\n\n/g, "\n\n\f\n"));
    return false;
  },
  /* ---- recompensas ---- */
  "rec-nueva": () => {
    S.rf = true;
    S.re = null;
    S.rimg = null;
  },
  "rec-edit": b => {
    S.rf = true;
    S.re = b.dataset.id;
    S.rimg = null;
  },
  "rec-cerrar": () => {
    S.rf = false;
    S.re = null;
    S.rimg = null;
  },
  "rec-guardar": () => {
    const n = $("r-n").value.trim(), c = +$("r-c").value;
    if (!n || !(c > 0)) {
      toast("Escribe el nombre y los sellos requeridos.");
      return false;
    }
    const base = {
      n,
      tipo: $("r-tipo").value,
      costo: c,
      limite: Math.max(0, Math.round(+$("r-lim").value || 0)),
      desc: $("r-desc").value.trim(),
      reset: $("r-reset").checked,
      activa: $("r-act").checked
    };
    const e = D.recomp.find(r => r.id === S.re);
    if (e) {
      const antes = e.n;
      Object.assign(e, base);
      if (S.rimg) e.img = S.rimg;
      if (antes !== e.n) D.canjes.forEach(x => {
        if (x.r === antes) x.r = e.n;
      });
    } else D.recomp.push({ id: "r" + Date.now().toString(36), ...base, img: S.rimg || "" });
    S.rf = false;
    S.re = null;
    S.rimg = null;
    toast("Recompensa guardada");
  },
  "rec-act": b => {
    const r = D.recomp.find(x => x.id === b.dataset.id);
    r.activa = !r.activa;
  },
  "rec-del": b => {
    if (!confirm("¿Eliminar esta recompensa?")) return false;
    D.recomp = D.recomp.filter(x => x.id !== b.dataset.id);
  },
  "l-canje": b => {
    const r = D.recomp[+b.dataset.r], c = cli(S.lc);
    if (!r || !c || !puedeCanjear(c, r)) {
      toast("Todavía no puede canjear esta recompensa.");
      return false;
    }
    c.bal = r.reset && D.prog.tipo === "sellos" ? 0 : +(c.bal - r.costo).toFixed(2);
    D.canjes.unshift({ f: hoyT(), c: c.id, r: r.n });
    log(`${c.n} canjeó ${r.n}`);
    toast("Canje registrado: entrega " + r.n);
  },
  /* ---- editor de menú ---- */
  "plato-nuevo": () => {
    S.platoImg = "";
    ["pl-n", "pl-c", "pl-d"].forEach(i => {
      $(i).value = "";
    });
    $("pl-promo").checked = false;
    $("pl-prev").innerHTML = "";
    $("pl-cat").innerHTML = D.menu.map(
      (c, i) => `<option value="${i}">${esc(c.e)} ${esc(c.n)}</option>`
    ).join("");
    $("dlg-plato").showModal();
    return false;
  },
  "plato-no": () => {
    $("dlg-plato").close();
    return false;
  },
  "plato-ok": () => {
    const n = $("pl-n").value.trim(), c = +$("pl-c").value;
    if (!n) {
      toast("Escribe el nombre del platillo.");
      return false;
    }
    if (!(c > 0)) {
      toast("Escribe un precio mayor a 0.");
      return false;
    }
    const cat = D.menu[+$("pl-cat").value];
    cat.p.unshift(
      {
        n,
        c,
        d: $("pl-d").value.trim(),
        img: S.platoImg || "",
        r: "",
        on: true,
        m: [],
        promo: $("pl-promo").checked
      }
    );
    cat.t = Math.max(cat.t, cat.p.length);
    cat.cerr = false;
    $("dlg-plato").close();
    toast(`"${n}" agregado a ${cat.n}.`);
  },
  "mod-add": () => {
    const n = prompt("Nombre del grupo de opciones (ej. Tipo de rollo):");
    if (n) {
      D.mods.unshift({ n, k: 0, o: [], req: false });
      S.mo = 0;
    }
  },
  "mod-opt": b => {
    const i = +b.dataset.i, n = $("mo-" + i).value.trim();
    S.mo = i;
    if (!n) return;
    D.mods[i].o.push({ n, p: Math.max(0, parseFloat($("mp-" + i).value) || 0) });
    $("mo-" + i).value = "";
    $("mp-" + i).value = "";
  },
  "opt-del": b => {
    S.mo = +b.dataset.i;
    D.mods[+b.dataset.i].o.splice(+b.dataset.o, 1);
  },
  "mod-del": b => {
    const g = D.mods[+b.dataset.i];
    if (!confirm(`¿Eliminar el grupo "${g.n}"?`)) return false;
    D.menu.forEach(c => c.p.forEach(p => {
      p.m = p.m.filter(x => x !== g.n);
    }));
    D.mods.splice(+b.dataset.i, 1);
    S.mo = null;
  },
  /* ---- datos del negocio ---- */
  "neg-save": () => {
    const v = id => $(id).value.trim();
    Object.assign(
      D.neg,
      {
        n: v("n-n"),
        sucursal: v("n-suc"),
        lema: v("n-lema"),
        tel: v("n-tel"),
        dir: v("n-dir"),
        hor: v("n-hor"),
        maps: v("n-maps"),
        fb: v("n-fb"),
        ig: v("n-ig"),
        tt: v("n-tt")
      }
    );
    toast("Datos del negocio guardados");
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.dataset.plimg) {
    reducirImagen(t.files[0], 420, u => {
      S.platoImg = u;
      $("pl-prev").innerHTML = `<img src="${u}"
          style="width:56px;height:56px;border-radius:10px;object-fit:cover" alt="">`;
    });
  } else if (t.dataset.rimg) {
    reducirImagen(t.files[0], 160, u => {
      S.rimg = u;
      render();
    });
  } else if (t.dataset.mover) {
    const[c, p] = t.dataset.mover.split("-").map(Number), [it] = D.menu[c].p.splice(p, 1);
    D.menu[+t.value].p.unshift(it);
    render();
    guardar();
  } else if (t.dataset.greq !== undefined) {
    D.mods[+t.dataset.greq].req = t.checked;
    guardar();
  }
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.te) {
    const o = ORDENES.find(x => x.id == t.dataset.te);
    if (o) {
      o.tiempoEst = Math.max(1, Math.round(+t.value) || 30);
      guardar();
    }
  } else if (t.dataset.gn !== undefined) {
    const g = D.mods[+t.dataset.gn], old = g.n;
    g.n = t.value;
    D.menu.forEach(c => c.p.forEach(p => {
      p.m = p.m.map(x => x === old ? t.value : x);
    }));
    guardar();
  } else if (t.dataset.on !== undefined) {
    const[i, o] = t.dataset.on.split("-").map(Number);
    D.mods[i].o[o].n = t.value;
    guardar();
  } else if (t.dataset.op !== undefined) {
    const[i, o] = t.dataset.op.split("-").map(Number);
    D.mods[i].o[o].p = Math.max(0, parseFloat(t.value) || 0);
    guardar();
  }
});
