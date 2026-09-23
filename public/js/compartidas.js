// =====================================================
// REHABPOD — RUTINAS COMPARTIDAS CON PROFESIONALES (lógica pura)
//
// Convierte una rutina guardada en el registro que se comparte en la nube y
// viceversa. TODO lo que llega de la nube es texto de otra persona: se vuelve
// a validar y normalizar aquí (nunca se confía en el contenido), y solo se
// comparten los ejercicios: sin resultados, sin historial, sin datos de salud.
//
// Sin DOM ni red: se prueba con Node. Se carga después de rutinas.js.
// =====================================================

(function (raiz) {
  "use strict";

  const R = raiz.RehabRutinas || (typeof require === "function" ? require("./rutinas.js") : null);
  const P = raiz.RehabPlan || (typeof require === "function" ? require("./plan.js") : null);

  const MAX_AUTOR = 40;
  const ANONIMO = "Usuario de RehabPod";

  const norm = (t) => String(t == null ? "" : t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const limpiar = (t, max) => String(t == null ? "" : t).replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

  /**
   * Registro para la tabla `rehab_shared_routines` (sin author_id: lo pone la
   * base de datos con la sesión). Devuelve null si la rutina no es válida.
   */
  function paraNube(rutina, o = {}) {
    if (!rutina) return null;
    const plan = R.sanearPlan(rutina.plan, o.validos);
    if (!plan) return null;
    const autor = o.mostrarNombre ? limpiar(o.nombreAutor, MAX_AUTOR) : "";
    return {
      local_id: String(rutina.id),
      author_name: autor || null,
      name: R.limpiarNombre(rutina.nombre) || R.nombreSugerido(plan),
      minutes: plan.minutos,
      level: plan.nivel,
      objectives: plan.objetivos,
      plan,
    };
  }

  /** Fila de la nube → elemento de la biblioteca (o null si es inválida). */
  function desdeNube(fila, validos) {
    if (!fila || typeof fila !== "object" || !fila.id) return null;
    const plan = R.sanearPlan(fila.plan, validos);
    if (!plan) return null;
    return {
      id: String(fila.id),
      nombre: R.limpiarNombre(fila.name) || R.nombreSugerido(plan),
      autor: limpiar(fila.author_name, MAX_AUTOR) || ANONIMO,
      plan,
      resumen: R.resumen(plan),
      creada: fila.created_at ? new Date(fila.created_at).getTime() || 0 : 0,
    };
  }

  /** Categoría del editor de profesionales según lo que más trabaja la rutina. */
  function categoriaV23(plan) {
    const peso = {};
    plan.bloques.forEach((b) => {
      peso[b.objetivo] = (peso[b.objetivo] || 0) + b.segundos;
    });
    const cognitivo = (peso.memoria || 0) + (peso.atencion || 0);
    const motor = (peso.reaccion || 0) + (peso.coordinacion || 0);
    return cognitivo > motor ? "neurologia" : "deportista";
  }

  /** Rutina en el formato del editor de profesionales (rehabpodRutinas), para editarla y asignarla. */
  function aRutinaV23(item, o = {}) {
    const ahora = o.ahora || Date.now();
    const azar = () => Math.random().toString(36).slice(2, 8);
    return {
      id: `rutina_${ahora}_${azar()}`,
      nombre: item.nombre,
      categoria: categoriaV23(item.plan),
      descansoSeg: item.plan.descanso,
      ejercicios: item.plan.bloques.map((b, i) => ({
        id: `ej_${ahora}_${i}_${azar()}`,
        modo: b.modo,
        dificultad: b.dificultad,
        finalizarPor: "tiempo",
        valor: b.segundos,
      })),
      origen: "comunidad",
      creadaEn: ahora,
      actualizadaEn: ahora,
    };
  }

  /** Filtros de la biblioteca: texto (nombre, autor, objetivos), objetivo y nivel. */
  function filtrar(lista, f = {}) {
    const q = norm(f.texto).trim();
    return lista.filter((it) => {
      if (f.objetivo && !it.plan.objetivos.includes(f.objetivo)) return false;
      if (f.nivel && it.plan.nivel !== f.nivel) return false;
      if (!q) return true;
      const pajar = norm(`${it.nombre} ${it.autor} ${it.plan.objetivos.map((k) => (P && P.OBJETIVOS[k] ? P.OBJETIVOS[k].titulo : k)).join(" ")}`);
      return pajar.includes(q);
    });
  }

  /** ¿Ya tiene el profesional una rutina con estos mismos ejercicios? (para no duplicar) */
  function yaCopiada(rutinasV23, item) {
    const firma = (ej) => ej.map((e) => `${e.modo}:${e.valor}:${e.dificultad}`).join("|");
    const esta = firma(item.plan.bloques.map((b) => ({ modo: b.modo, valor: b.segundos, dificultad: b.dificultad })));
    return rutinasV23.find((r) => Array.isArray(r.ejercicios) && firma(r.ejercicios) === esta && Number(r.descansoSeg) === item.plan.descanso) || null;
  }

  const API = { ANONIMO, MAX_AUTOR, paraNube, desdeNube, categoriaV23, aRutinaV23, filtrar, yaCopiada };
  raiz.RehabCompartidas = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
