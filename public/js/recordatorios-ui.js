// =====================================================
// REHABPOD — RECORDATORIOS (interfaz y entrega)
//
// Ajustes → Recordatorios: activar, elegir días y hora, aviso de prueba.
//   · Android (app instalada): notificaciones reales con
//     @capacitor/local-notifications; funcionan con la app cerrada.
//   · Navegador: avisa dentro de la app mientras esté abierta.
// La lista de avisos se recalcula al abrir la app, al volver a ella, al
// cambiar los ajustes y al guardar un entrenamiento (así no te avisa el
// mismo día que ya entrenaste). La lógica pura está en recordatorios.js.
//
// Se carga DESPUÉS de app.js y motivacion.js.
// =====================================================

(function () {
  "use strict";

  const R = window.RehabRecordatorios;
  if (!R || typeof obtenerPerfilActivo !== "function") return;

  const ID_PRUEBA = 9050; // fuera del rango 9100–9199 que se limpia al reprogramar
  const CANAL = "recordatorios";
  const el = (id) => document.getElementById(id);

  const plugin = () => (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null;
  const esNativo = () => !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform() && plugin());

  const perfil = () => obtenerPerfilActivo() || { nombre: "", historial: [] };
  const aviso = (m, t) => (typeof avisarRehab === "function" ? avisarRehab(m, { tipo: t || "info", duracion: t === "error" ? 8000 : 6000 }) : undefined);

  // -----------------------------------------------------
  // Notificaciones del sistema (Android)
  // -----------------------------------------------------
  let canalListo = null;
  async function asegurarCanal(LN) {
    if (canalListo !== null) return canalListo;
    try {
      await LN.createChannel({ id: CANAL, name: "Recordatorios de entrenamiento", description: "Avisos para que no olvides entrenar", importance: 3, visibility: 1 });
      canalListo = true;
    } catch (_) {
      canalListo = false;
    }
    return canalListo;
  }

  async function permisoNativo(LN) {
    let estado = await LN.checkPermissions();
    if (estado.display === "granted") return true;
    estado = await LN.requestPermissions();
    return estado.display === "granted";
  }

  async function cancelarPropias(LN) {
    const { notifications } = await LN.getPending();
    const ids = (notifications || []).filter((n) => R.esNuestro(n.id)).map((n) => ({ id: n.id }));
    if (ids.length) await LN.cancel({ notifications: ids });
  }

  // -----------------------------------------------------
  // Aviso dentro de la app (navegador)
  // -----------------------------------------------------
  let temporizador = null;
  function programarWeb(lista) {
    clearTimeout(temporizador);
    temporizador = null;
    if (!lista.length) return;
    const espera = lista[0].at.getTime() - Date.now();
    if (espera <= 0 || espera > 2147483000) return;
    temporizador = setTimeout(() => {
      aviso(`${lista[0].title}. ${lista[0].body}`, "info");
      sincronizar();
    }, espera);
  }

  // -----------------------------------------------------
  // Sincronizar: deja programado exactamente lo que dice la configuración
  // -----------------------------------------------------
  let cola = Promise.resolve();
  function sincronizar() {
    cola = cola.then(hacerSincronizar, hacerSincronizar);
    return cola;
  }

  async function hacerSincronizar() {
    const cfg = R.leer();
    try {
      if (esNativo()) {
        const LN = plugin();
        await cancelarPropias(LN);
        if (!cfg.activo) return { programados: 0 };
        if (!(await permisoNativo(LN))) return { programados: 0, sinPermiso: true };
        const lista = R.proximas(cfg, { historial: perfil().historial, nombre: perfil().nombre });
        const conCanal = await asegurarCanal(LN);
        if (lista.length) {
          await LN.schedule({
            notifications: lista.map((x) => ({
              id: x.id,
              title: x.title,
              body: x.body,
              ...(conCanal ? { channelId: CANAL } : {}),
              schedule: { at: x.at, allowWhileIdle: true },
            })),
          });
        }
        return { programados: lista.length };
      }
      const lista = cfg.activo ? R.proximas(cfg, { historial: perfil().historial, nombre: perfil().nombre }) : [];
      programarWeb(lista);
      return { programados: lista.length };
    } catch (error) {
      console.error("Recordatorios", error);
      return { programados: 0, error: true };
    }
  }

  // -----------------------------------------------------
  // Interfaz en Ajustes
  // -----------------------------------------------------
  function textoEstado(cfg) {
    if (!cfg.activo) return "Un aviso en el teléfono para que no olvides entrenar";
    if (!cfg.dias.length) return "Elige al menos un día";
    return esNativo() ? `Te avisaremos ${R.describir(cfg)}` : `Te avisaremos ${R.describir(cfg)} (en el navegador, solo con la app abierta)`;
  }

  function pintar() {
    const cfg = R.leer();
    const chk = el("ajusteRecordatorio");
    if (!chk) return;
    chk.checked = cfg.activo;
    el("recordatorioOpciones").hidden = !cfg.activo;
    el("ajusteRecordatorioEstado").textContent = textoEstado(cfg);
    document.querySelectorAll("#recordatorioDias button").forEach((b) => b.setAttribute("aria-pressed", String(cfg.dias.includes(Number(b.dataset.dia)))));
    el("recordatorioHora").value = cfg.hora;
  }

  async function cambiar(parcial, { validarPermiso } = {}) {
    const antes = R.leer();
    R.guardar({ ...antes, ...parcial });
    pintar();
    const r = await sincronizar();
    if (r.sinPermiso) {
      R.guardar({ ...antes, activo: false });
      pintar();
      aviso("Para recordarte necesitamos permiso de notificaciones. Actívalo para RehabPod en los ajustes del teléfono y vuelve a intentarlo.", "error");
      return false;
    }
    if (r.error) aviso("No pudimos programar los recordatorios. Inténtalo de nuevo.", "error");
    else if (validarPermiso) aviso(`Listo. Te avisaremos ${R.describir(R.leer())}.`, "exito");
    return true;
  }

  const chk = el("ajusteRecordatorio");
  if (chk) {
    chk.addEventListener("change", async () => {
      const activar = chk.checked;
      if (activar && !R.leer().dias.length) R.guardar({ ...R.leer(), dias: R.POR_DEFECTO.dias.slice() });
      await cambiar({ activo: activar }, { validarPermiso: activar });
    });

    document.querySelectorAll("#recordatorioDias button").forEach((b) => {
      b.addEventListener("click", () => {
        const cfg = R.leer();
        const d = Number(b.dataset.dia);
        const dias = cfg.dias.includes(d) ? cfg.dias.filter((x) => x !== d) : [...cfg.dias, d];
        cambiar({ dias });
      });
    });

    el("recordatorioHora").addEventListener("change", (e) => {
      if (R.horaValida(e.target.value)) cambiar({ hora: e.target.value });
      else pintar();
    });

    el("recordatorioPrueba").addEventListener("click", async () => {
      const m = R.mensaje(perfil().nombre, 0);
      if (esNativo()) {
        try {
          const LN = plugin();
          if (!(await permisoNativo(LN))) {
            aviso("Permite las notificaciones de RehabPod en los ajustes del teléfono para recibir avisos.", "error");
            return;
          }
          const conCanal = await asegurarCanal(LN);
          await LN.schedule({
            notifications: [{ id: ID_PRUEBA, title: m.title, body: m.body, ...(conCanal ? { channelId: CANAL } : {}), schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true } }],
          });
          aviso("Aviso de prueba enviado: llegará en unos segundos. Si no aparece, revisa los permisos de notificaciones del teléfono.", "exito");
        } catch (error) {
          console.error("Aviso de prueba", error);
          aviso("No pudimos enviar el aviso de prueba.", "error");
        }
      } else {
        aviso(`${m.title}. ${m.body}`, "info");
      }
    });
  }

  // Al guardar un entrenamiento se recalcula (así no avisa el mismo día).
  if (typeof guardarEntrenamiento === "function") {
    const base = guardarEntrenamiento;
    guardarEntrenamiento = function () {
      const r = base.apply(this, arguments);
      sincronizar();
      return r;
    };
  }

  // Al volver a la app (por si pasaron días sin abrirla).
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") sincronizar();
  });

  pintar();
  sincronizar();

  window.rehabRecordatorios = { sincronizar, pintar, esNativo };
})();
