// =====================================================
// REHABPOD — PANTALLA PROGRESO: GRÁFICOS CLAROS
//
// Pinta la tarjeta "¿Cómo vas?" con una frase simple y tres gráficos SVG
// (reacción, precisión, constancia). Se recalcula al abrir Progreso y cuando
// cambia el periodo o el ejercicio. Se carga DESPUÉS de app.js.
// =====================================================

(function () {
  "use strict";

  const G = window.RehabGraficos;
  const M = window.RehabMetas;
  if (!G || typeof mostrarProgreso !== "function") return;

  const estado = { dias: 30, modo: "" };

  const el = (id) => document.getElementById(id);
  const historial = () => (obtenerPerfilActivo() || {}).historial || [];

  function llenarModos() {
    const sel = el("progresoModo");
    if (!sel) return;
    const opciones = G.modosDisponibles(historial());
    if (estado.modo && !opciones.includes(estado.modo)) estado.modo = "";
    sel.innerHTML =
      `<option value="">Todos los ejercicios</option>` +
      opciones.map((m) => `<option value="${escaparHTML(m)}">${escaparHTML(m)}</option>`).join("");
    sel.value = estado.modo;
  }

  function pintar() {
    if (!el("progresoClaro")) return;
    llenarModos();
    const meta = M ? M.leerMeta() : 3;
    const p = G.paquete(historial(), { dias: estado.dias || null, modo: estado.modo || null, meta, ancho: 340 });

    const frase = el("progresoFrase");
    frase.textContent = p.comparacion.mensaje;
    frase.dataset.tendencia = p.comparacion.tendencia;

    const trozos = [
      ["progresoFigReaccion", "progresoGrafReaccion", p.reaccion, "gr"],
      ["progresoFigPrecision", "progresoGrafPrecision", p.precision, "gp"],
      ["progresoFigSemanas", "progresoGrafSemanas", estado.modo ? null : p.semanas, "gs"],
    ];
    trozos.forEach(([fig, cont, grafico, id]) => {
      const f = el(fig);
      f.hidden = !grafico;
      el(cont).innerHTML = grafico ? G.svgDe(grafico, id) : "";
    });
  }

  document.querySelectorAll("#progresoPeriodo button").forEach((b) => {
    b.addEventListener("click", () => {
      estado.dias = Number(b.dataset.dias);
      document.querySelectorAll("#progresoPeriodo button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      pintar();
    });
  });

  const sel = el("progresoModo");
  if (sel) {
    sel.addEventListener("change", () => {
      estado.modo = sel.value;
      pintar();
    });
  }

  const mostrarBase = mostrarProgreso;
  mostrarProgreso = function () {
    const r = mostrarBase.apply(this, arguments);
    try {
      pintar();
    } catch (error) {
      console.error("Progreso claro", error);
    }
    return r;
  };

  window.rehabProgreso = { pintar, estado };
})();
