/* Acciones de la app del dueño */
Object.assign(A, {
  "dn-tab": b => {
    S.dn.tab = b.dataset.v;
    window.scrollTo(0, 0);
  },
  "dn-per": b => {
    S.dn.per = b.dataset.v;
    S.dn.lim = 60;
  },
  "dn-est": b => {
    S.dn.est = b.dataset.v;
    S.dn.lim = 60;
  },
  "dn-ver": b => {
    S.dn.ver = String(S.dn.ver) === b.dataset.id ? null : b.dataset.id;
  },
  "dn-salir": () => {
    Nube.salir();
    return false;
  },
  "dn-cuenta": () => {
    S.dn.cuenta = !S.dn.cuenta;
  },
  "dn-cambiar": () => {
    (async() => {
      const a = $("dn-pa").value, n = $("dn-pn").value, n2 = $("dn-pn2").value;
      if (n.length < 6) return toast("La nueva contraseña debe tener al menos 6 caracteres.");
      if (n !== n2) return toast("Las contraseñas nuevas no coinciden.");
      const e = await Nube.cambiarClave(a, n);
      if (e) return toast(e);
      S.dn.cuenta = false;
      toast("Contraseña cambiada");
      render();
    })();
    return false;
  },
  "dn-mas": () => {
    S.dn.lim += 60;
  },
  "dn-csv": () => {
    const f = [
      [
        "Pedido",
        "Fecha",
        "Hora",
        "Tipo",
        "Nombre de la mesa",
        "Cliente",
        "Mesero",
        "Pago",
        "Estado",
        "Total",
        "Productos",
        "Motivo de cancelación"
      ],
      ...filtraHist().map(
        o => [
          o.id,
          o.fecha,
          o.hora || "",
          tipoT(o),
          o.nombreMesa || "",
          nomCli(o.cliente),
          o.mesero || "Caja",
          (METODOS[o.metodo] || { nombre: o.metodo }).nombre,
          ESTADOS[o.estado],
          o.total,
          (o.items || []).map(i => i.q + "x " + i.n + (notaItem(i) ? " (" + notaItem(i) + ")" : "")).join("; "),
          o.motivo || ""
        ]
      )
    ];
    descargar("historial-pedidos-" + hoyT() + ".csv", aCSV(f), "text/csv;charset=utf-8");
    return false;
  }
});
document.addEventListener("input", e => {
  if (e.target.id === "dn-q") {
    S.dn.q = e.target.value;
    S.dn.lim = 60;
    render();
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "dn-met") {
    S.dn.met = t.value;
    render();
  } else if (t.id === "dn-mes") {
    S.dn.mes = t.value;
    render();
  }
});
