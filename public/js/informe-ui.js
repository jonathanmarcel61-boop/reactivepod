// =====================================================
// REHABPOD — INFORME PROFESIONAL EN PDF (interfaz)
//
// Botón en la tarjeta de Progreso que abre una ventana con las opciones del
// informe (periodo, ejercicio, profesional, observaciones), genera el PDF en
// el propio teléfono y lo entrega:
//   · Android (Capacitor): guarda en caché con Filesystem y abre el menú
//     Compartir del sistema (WhatsApp, correo, imprimir, guardar en Drive…).
//   · Navegador móvil: navigator.share con archivo.
//   · Escritorio: descarga directa.
// La lógica de contenido está en informe.js y pdf.js (sin dependencias).
//
// Se carga DESPUÉS de progreso.js.
// =====================================================

(function () {
  "use strict";

  const I = window.RehabInforme;
  const G = window.RehabGraficos;
  const M = window.RehabMetas;
  if (!I || !G || typeof modalRehab !== "function" || typeof obtenerPerfilActivo !== "function") return;

  const CLAVE_PROF = "rehabpodInformeProfesional";
  const MAX_OBS = 600;
  const MAX_PROF = 80;

  const el = (id) => document.getElementById(id);
  const esc = (t) => escaparHTML(String(t ?? ""));
  const perfil = () => obtenerPerfilActivo() || { nombre: "", historial: [] };

  const leerProf = () => {
    try {
      return localStorage.getItem(CLAVE_PROF) || "";
    } catch (_) {
      return "";
    }
  };
  const guardarProf = (v) => {
    try {
      localStorage.setItem(CLAVE_PROF, v);
    } catch (_) {}
  };

  // -----------------------------------------------------
  // Entrega del archivo
  // -----------------------------------------------------
  function aBase64(bytes) {
    let s = "";
    const T = 0x8000;
    for (let i = 0; i < bytes.length; i += T) s += String.fromCharCode.apply(null, bytes.subarray(i, i + T));
    return btoa(s);
  }

  const plugins = () => (window.Capacitor && window.Capacitor.Plugins) || {};
  const esNativo = () => !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());

  function descargar(bytes, nombre) {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return "descargado";
  }

  /** @returns {Promise<"compartido"|"descargado"|"cancelado">} */
  async function entregar(informe, { compartir }) {
    const { bytes, nombreArchivo } = informe;
    const P = plugins();

    if (esNativo() && P.Filesystem && P.Share) {
      const r = await P.Filesystem.writeFile({ path: nombreArchivo, data: aBase64(bytes), directory: "CACHE" });
      try {
        await P.Share.share({ title: "Informe RehabPod", text: "Informe de entrenamiento", url: r.uri, dialogTitle: "Compartir informe" });
        return "compartido";
      } catch (e) {
        if (/cancel/i.test(String((e && e.message) || e))) return "cancelado";
        throw e;
      }
    }

    if (compartir && typeof navigator.share === "function" && typeof File === "function") {
      const archivo = new File([bytes], nombreArchivo, { type: "application/pdf" });
      if (!navigator.canShare || navigator.canShare({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo], title: "Informe RehabPod" });
          return "compartido";
        } catch (e) {
          if (e && e.name === "AbortError") return "cancelado";
        }
      }
    }
    return descargar(bytes, nombreArchivo);
  }

  // -----------------------------------------------------
  // Ventana de opciones
  // -----------------------------------------------------
  const estado = { dias: 30 };
  let ventana = null;

  function construirVentana() {
    if (ventana) return ventana;
    ventana = modalRehab({ id: "informe", titulo: "Informe profesional", eyebrow: "PDF", icono: "📄", ancho: 520, clase: "inf", z: "calc(var(--z-modal) + 8)" });
    ventana.cuerpo.innerHTML = `
      <p class="inf-intro">Crea un PDF con tus gráficos, cifras y sesiones. Puedes enviarlo a tu fisioterapeuta o imprimirlo.</p>

      <div class="inf-campo">
        <span class="inf-etiqueta" id="infPeriodoEtiqueta">Periodo</span>
        <div class="segmentado segmentado--4" id="infPeriodo" role="group" aria-labelledby="infPeriodoEtiqueta">
          <button type="button" data-dias="7" aria-pressed="false">7 días</button>
          <button type="button" data-dias="30" aria-pressed="true">30 días</button>
          <button type="button" data-dias="90" aria-pressed="false">90 días</button>
          <button type="button" data-dias="0" aria-pressed="false">Todo</button>
        </div>
      </div>

      <label class="campoFiltro" for="infModo">
        <span>Ejercicio</span>
        <select id="infModo"><option value="">Todos los ejercicios</option></select>
      </label>

      <label class="campoFiltro" for="infProfesional">
        <span>Profesional o centro (opcional)</span>
        <input type="text" id="infProfesional" maxlength="${MAX_PROF}" autocomplete="off" placeholder="Ej.: Lic. Ana Pérez">
      </label>

      <label class="campoFiltro" for="infObservaciones">
        <span>Observaciones (opcional)</span>
        <textarea id="infObservaciones" rows="3" maxlength="${MAX_OBS}" placeholder="Notas que quieras incluir en el informe"></textarea>
      </label>

      <label class="inf-check">
        <input type="checkbox" id="infTabla" checked>
        <span>Incluir la lista de sesiones</span>
      </label>

      <p class="inf-estado" id="infEstado" role="status" aria-live="polite"></p>

      <div class="inf-acciones">
        <button type="button" class="boton botonPrincipal" id="infCompartir">Compartir PDF</button>
        <button type="button" class="boton botonOscuro" id="infDescargar">Guardar en el teléfono</button>
      </div>`;

    ventana.cuerpo.querySelectorAll("#infPeriodo button").forEach((b) => {
      b.addEventListener("click", () => {
        estado.dias = Number(b.dataset.dias);
        marcarPeriodo();
      });
    });
    el("infCompartir").addEventListener("click", () => generar(true));
    el("infDescargar").addEventListener("click", () => generar(false));
    return ventana;
  }

  function marcarPeriodo() {
    document.querySelectorAll("#infPeriodo button").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.dias) === estado.dias)));
  }

  function abrir() {
    const v = construirVentana();
    const prog = window.rehabProgreso && window.rehabProgreso.estado;
    estado.dias = prog && [7, 30, 90, 0].includes(prog.dias) ? prog.dias : estado.dias;
    marcarPeriodo();

    const sel = el("infModo");
    const modos = G.modosDisponibles(perfil().historial || []);
    const previo = prog && modos.includes(prog.modo) ? prog.modo : "";
    sel.innerHTML = `<option value="">Todos los ejercicios</option>` + modos.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join("");
    sel.value = previo;

    el("infProfesional").value = leerProf();
    el("infEstado").textContent = "";
    v.abrir();
  }

  let ocupado = false;
  async function generar(compartir) {
    if (ocupado) return;
    const historial = perfil().historial || [];
    if (!historial.length) {
      avisarRehab("Todavía no tienes entrenamientos guardados para el informe. Haz uno y vuelve.", { tipo: "info" });
      return;
    }
    const estadoEl = el("infEstado");
    const botones = [el("infCompartir"), el("infDescargar")];
    ocupado = true;
    botones.forEach((b) => (b.disabled = true));
    estadoEl.textContent = "Preparando tu informe…";
    try {
      const profesional = el("infProfesional").value.trim().slice(0, MAX_PROF);
      guardarProf(profesional);
      await new Promise((r) => setTimeout(r, 30));
      const informe = I.construir({
        perfil: perfil(),
        dias: estado.dias || null,
        modo: el("infModo").value || null,
        meta: M ? M.leerMeta() : 3,
        profesional,
        observaciones: el("infObservaciones").value.slice(0, MAX_OBS),
        incluirTabla: el("infTabla").checked,
      });
      if (!informe.resumen.sesiones) {
        estadoEl.textContent = "No hay sesiones en ese periodo. Elige un periodo más largo.";
        return;
      }
      const r = await entregar(informe, { compartir });
      if (r === "cancelado") {
        estadoEl.textContent = "";
      } else {
        estadoEl.textContent = r === "compartido" ? "Informe listo y compartido." : `Informe descargado: ${informe.nombreArchivo}`;
        avisarRehab(r === "compartido" ? "Informe compartido." : "Informe guardado. Búscalo en tus descargas.", { tipo: "exito" });
      }
    } catch (error) {
      console.error("Informe", error);
      estadoEl.textContent = "No pudimos crear el informe. Inténtalo de nuevo.";
      avisarRehab("No pudimos crear o compartir el informe. Inténtalo de nuevo.", { tipo: "error" });
    } finally {
      ocupado = false;
      botones.forEach((b) => (b.disabled = false));
    }
  }

  const boton = el("btnInformePDF");
  if (boton) boton.addEventListener("click", abrir);

  window.rehabInforme = { abrir, generar, entregar, aBase64 };
})();
