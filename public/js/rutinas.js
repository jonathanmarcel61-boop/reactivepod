// =====================================================
// REHABPOD — RUTINAS GUARDADAS Y FAVORITAS (lógica pura)
//
// Guarda rutinas del asistente o armadas a mano, con nombre y estrella de
// favorita. Todo se valida al leer del almacenamiento para que un dato
// dañado nunca rompa la app. Sin DOM: se prueba con Node.
//
// Se carga antes de app.js; expone `RehabRutinas` y module.exports.
// =====================================================

(function (raiz) {
  "use strict";

  const P = raiz.RehabPlan || (typeof require === "function" ? require("./plan.js") : null);

  const MAX_RUTINAS = 30;
  const MAX_BLOQUES = 12;
  const SEG_MIN = 30;
  const SEG_MAX = 600;
  const MAX_NOMBRE = 40;
  const DIFICULTADES = ["facil", "media", "dificil"];
  const DESCANSOS = [10, 15, 20, 30];
  const DURACIONES_SEG = [30, 45, 60, 90, 120, 180, 300];
  const PREFIJO = "rehabpodRutinas:";

  /** Objetivo que más trabaja un modo (para rotularlo y adaptar). */
  function objetivoDeModo(modo) {
    const apt = (P && P.APTITUD && P.APTITUD[modo]) || {};
    let mejor = "reaccion";
    let valor = -1;
    Object.entries(apt).forEach(([k, v]) => {
      if (v > valor) {
        valor = v;
        mejor = k;
      }
    });
    return mejor;
  }

  const modoValido = (modo, validos) => (validos ? validos.includes(modo) : !!(P && P.APTITUD && P.APTITUD[modo]));

  function limpiarNombre(nombre) {
    return String(nombre == null ? "" : nombre).replace(/\s+/g, " ").trim().slice(0, MAX_NOMBRE);
  }

  function totalSegundos(bloques, descanso) {
    return bloques.reduce((s, b) => s + b.segundos, 0) + Math.max(0, bloques.length - 1) * descanso;
  }

  /**
   * Valida y normaliza un plan (con el formato de RehabPlan). Devuelve null si
   * no hay ningún ejercicio válido.
   */
  function sanearPlan(plan, validos) {
    if (!plan || !Array.isArray(plan.bloques)) return null;
    const bloques = plan.bloques
      .filter((b) => b && modoValido(b.modo, validos))
      .slice(0, MAX_BLOQUES)
      .map((b, i, arr) => {
        const seg = Math.round(Number(b.segundos));
        return {
          modo: b.modo,
          rol: b.rol === "calentamiento" || b.rol === "reto" ? b.rol : "principal",
          objetivo: b.objetivo && P && P.OBJETIVOS[b.objetivo] ? b.objetivo : objetivoDeModo(b.modo),
          dificultad: DIFICULTADES.includes(b.dificultad) ? b.dificultad : "media",
          segundos: Number.isFinite(seg) ? Math.max(SEG_MIN, Math.min(SEG_MAX, seg)) : 60,
        };
      });
    if (!bloques.length) return null;

    const descanso = DESCANSOS.includes(Number(plan.descanso)) ? Number(plan.descanso) : 15;
    const total = totalSegundos(bloques, descanso);
    const objetivos = [...new Set(bloques.filter((b) => b.rol !== "calentamiento").map((b) => b.objetivo))].slice(0, 2);
    return {
      minutos: Math.max(1, Math.round(total / 60)),
      objetivos: objetivos.length ? objetivos : [bloques[0].objetivo],
      nivel: P && P.NIVELES.includes(plan.nivel) ? plan.nivel : "intermedio",
      descanso,
      totalSegundos: total,
      bloques,
    };
  }

  /** Plan armado a mano: [{modo, segundos, dificultad}] + descanso. */
  function planManual(o, validos) {
    return sanearPlan({ descanso: o.descanso, nivel: o.nivel, bloques: (o.bloques || []).map((b) => ({ modo: b.modo, segundos: b.segundos, dificultad: b.dificultad, rol: "principal" })) }, validos);
  }

  const firma = (plan) => plan.bloques.map((b) => `${b.modo}:${b.segundos}:${b.dificultad}`).join("|") + `#${plan.descanso}`;

  function resumen(plan) {
    const min = Math.floor(plan.totalSegundos / 60);
    const seg = plan.totalSegundos % 60;
    const duracion = seg ? `${min} min ${seg} s` : `${min} min`;
    return { ejercicios: plan.bloques.length, totalSegundos: plan.totalSegundos, duracion, texto: `${plan.bloques.length} ${plan.bloques.length === 1 ? "ejercicio" : "ejercicios"} · ${duracion}` };
  }

  function nombreSugerido(plan) {
    const objetivos = plan.objetivos.map((k) => (P && P.OBJETIVOS[k] ? P.OBJETIVOS[k].titulo : k)).join(" + ");
    return limpiarNombre(`${plan.minutos} min · ${objetivos}`);
  }

  function idNuevo() {
    return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /** Nombre que no repite ninguno de la lista ("Mi rutina", "Mi rutina (2)"…). */
  function nombreUnico(lista, nombre) {
    const base = limpiarNombre(nombre) || "Mi rutina";
    const usados = new Set(lista.map((r) => r.nombre.toLowerCase()));
    if (!usados.has(base.toLowerCase())) return base;
    for (let n = 2; n < 100; n++) {
      const cand = limpiarNombre(`${base.slice(0, MAX_NOMBRE - 5)} (${n})`);
      if (!usados.has(cand.toLowerCase())) return cand;
    }
    return base;
  }

  /**
   * Añade una rutina. Si ya hay una con los mismos ejercicios devuelve esa
   * (sin duplicarla). Resultado: { lista, rutina, repetida, llena }.
   */
  function agregar(lista, o, validos) {
    const plan = sanearPlan(o.plan, validos);
    if (!plan) return { lista, rutina: null, repetida: false, llena: false };
    const existente = lista.find((r) => firma(r.plan) === firma(plan));
    if (existente) return { lista, rutina: existente, repetida: true, llena: false };
    if (lista.length >= MAX_RUTINAS) return { lista, rutina: null, repetida: false, llena: true };
    const rutina = {
      id: idNuevo(),
      nombre: nombreUnico(lista, o.nombre || nombreSugerido(plan)),
      favorita: !!o.favorita,
      origen: o.origen === "manual" ? "manual" : "asistente",
      plan,
      creada: o.ahora || Date.now(),
      usos: 0,
      ultimoUso: null,
    };
    return { lista: [...lista, rutina], rutina, repetida: false, llena: false };
  }

  const cambiar = (lista, id, fn) => lista.map((r) => (r.id === id ? fn(r) : r));

  const alternarFavorita = (lista, id) => cambiar(lista, id, (r) => ({ ...r, favorita: !r.favorita }));
  const renombrar = (lista, id, nombre) => {
    const otras = lista.filter((r) => r.id !== id);
    return cambiar(lista, id, (r) => ({ ...r, nombre: nombreUnico(otras, nombre || r.nombre) }));
  };
  const eliminar = (lista, id) => lista.filter((r) => r.id !== id);
  const registrarUso = (lista, id, ahora) => cambiar(lista, id, (r) => ({ ...r, usos: r.usos + 1, ultimoUso: ahora || Date.now() }));
  const reemplazarPlan = (lista, id, plan, validos) => {
    const p = sanearPlan(plan, validos);
    return p ? cambiar(lista, id, (r) => ({ ...r, plan: p })) : lista;
  };

  /** Favoritas primero; dentro de cada grupo, la usada o creada más recientemente. */
  function ordenar(lista) {
    return [...lista].sort((a, b) => {
      if (a.favorita !== b.favorita) return a.favorita ? -1 : 1;
      return (b.ultimoUso || b.creada || 0) - (a.ultimoUso || a.creada || 0);
    });
  }

  /** Lee y valida lo guardado (nunca lanza). */
  function normalizarLista(crudo, validos) {
    if (!Array.isArray(crudo)) return [];
    const salida = [];
    const ids = new Set();
    for (const r of crudo) {
      if (!r || typeof r !== "object") continue;
      const plan = sanearPlan(r.plan, validos);
      if (!plan) continue;
      let id = typeof r.id === "string" && r.id ? r.id : idNuevo();
      if (ids.has(id)) id = idNuevo();
      ids.add(id);
      salida.push({
        id,
        nombre: limpiarNombre(r.nombre) || nombreSugerido(plan),
        favorita: !!r.favorita,
        origen: r.origen === "manual" ? "manual" : "asistente",
        plan,
        creada: Number(r.creada) || 0,
        usos: Math.max(0, Math.round(Number(r.usos) || 0)),
        ultimoUso: Number(r.ultimoUso) || null,
      });
      if (salida.length >= MAX_RUTINAS) break;
    }
    return salida;
  }

  function leer(perfilId, validos) {
    try {
      return normalizarLista(JSON.parse(localStorage.getItem(PREFIJO + perfilId) || "[]"), validos);
    } catch (_) {
      return [];
    }
  }

  function guardar(perfilId, lista) {
    try {
      localStorage.setItem(PREFIJO + perfilId, JSON.stringify(lista));
      return true;
    } catch (_) {
      return false;
    }
  }

  const API = {
    MAX_RUTINAS, MAX_BLOQUES, MAX_NOMBRE, SEG_MIN, SEG_MAX, DESCANSOS, DURACIONES_SEG, DIFICULTADES,
    objetivoDeModo, nuevoId: idNuevo, limpiarNombre, sanearPlan, planManual, resumen, nombreSugerido, nombreUnico,
    agregar, alternarFavorita, renombrar, eliminar, registrarUso, reemplazarPlan, ordenar, normalizarLista, leer, guardar, firma,
  };
  raiz.RehabRutinas = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
