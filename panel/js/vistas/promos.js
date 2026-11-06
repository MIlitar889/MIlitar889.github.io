/* ---- Promos (push) ---- */
const PLANT = [
  ["🍣 ¡Promo del día!", "2x1 en rolls hoy hasta las 9pm. ¡No te lo pierdas!"],
  ["🔥 Nuevo en el menú", "Prueba nuestro rollo de la semana."],
  ["⏰ Hoy abrimos hasta tarde", "Pide por WhatsApp o en sushipuuk.com."]
];
function vPromos() {
  const head = `<div class="encabezado"><div><h2 class="sub" style="margin:0">🔔 Notificaciones Push</h2><p
      class="nota">17 suscriptores activos</p></div><div class="periodo__botones">${[
    ["enviar", "Enviar"],
    ["hist", "Historial (" + (15 + D.hist.length) + ")"]
  ].map(
    ([k, t]) => `<button class="chip" data-act="pr-tab" data-v="${k}" aria-pressed="${S.ptab === k}">${t}</button>`
  ).join("")}</div></div><div class="cuenta"><span class="badge">📱 Android: 16</span><span
      class="badge">🖥 Desktop: 1</span></div>`;
  if (S.ptab === "hist") return head
    + `<article class="tarjeta">`
    + (
      D.hist.map(
        h => `<p><b>${esc(h.t)}</b> — ${esc(h.m)}<br><small class="nota">${h.f} · ${esc(h.a)}</small></p>`
      ).join("")
        || ""
    )
    + `<p class="nota">15 envíos anteriores (sin detalle en la captura original).</p></article>`;
  return head
    + `<article class="tarjeta"><select class="campo" id="plant"><option value="">✨ Plantillas recomendadas (elige una para llenar el formulario)</option>${PLANT.map(
      (p, i) => `<option value="${i}">${esc(p[0])}</option>`
    ).join("")}</select>
  <label>TÍTULO *</label><input class="campo keep" id="p-t" maxlength="80"
        placeholder="Ej: 🍣 ¡Promo del día!"><p class="nota" id="n-t"
        style="text-align:right;margin:-6px 0 6px">0/80</p>
  <label>MENSAJE *</label><textarea
        class="campo keep" id="p-m" rows="3" maxlength="200"
        placeholder="Ej: 2x1 en rolls hoy hasta las 9pm."></textarea><p class="nota" id="n-m"
        style="text-align:right;margin:-6px 0 6px">0/200</p>
  <label>URL AL HACER CLIC (OPCIONAL)</label><input
        class="campo keep" id="p-u" value="https://www.sushipuuk.com">
  <label>AUDIENCIA</label><select
        class="campo keep" id="p-a"><option>Todos los suscriptores (17)</option><option>Solo socios del Club (${D.clientes.filter(c => c.m).length})</option></select>
  <button
        class="btn-rojo" id="push-send" data-act="push-send" style="width:100%" disabled>Enviar a 17 suscriptores</button></article>`;
}
const updPush = () => {
  const t = $("p-t"), m = $("p-m");
  if (!t) return;
  $("n-t").textContent = t.value.length + "/80";
  $("n-m").textContent = m.value.length + "/200";
  $("push-send").disabled = !(t.value.trim() && m.value.trim());
};
