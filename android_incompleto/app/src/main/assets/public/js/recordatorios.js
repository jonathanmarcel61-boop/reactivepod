// =====================================================
// REHABPOD — RECORDATORIOS DE ENTRENAMIENTO (lógica pura)
//
// Decide QUÉ recordatorios programar, sin tocar el DOM ni el teléfono:
//   · configuración (días de la semana + hora) con validación;
//   · lista de los próximos avisos (por defecto 21 días), omitiendo horas
//     pasadas y el aviso de HOY si ya entrenaste;
//   · textos amables en español.
// La entrega (notificaciones reales de Android o aviso dentro de la app) la
// hace recordatorios-ui.js. Todas las fechas son en hora LOCAL del teléfono y
// `ahora` es inyectable para probar con fechas fijas.
//
// Días: 1 = lunes … 7 = domingo. Se carga antes de app.js.
// =====================================================

(function (raiz) {
  "use strict";

  const M = raiz.RehabMetas || (typeof require === "function" ? require("./metas.js") : null);

  const CLAVE = "rehabpodRecordatorios";
  const ID_BASE = 9100; // ids de notificación reservados: 9100–9199
  const ID_MAX = 9199;
  const HORIZONTE_DIAS = 21;
  const DIAS_NOMBRE = ["", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
  const DIAS_CORTO = ["", "L", "M", "X", "J", "V", "S", "D"];
  const POR_DEFECTO = Object.freeze({ activo: false, dias: [1, 3, 5], hora: "18:00" });

  // -----------------------------------------------------
  // Configuración
  // -----------------------------------------------------
  const RE_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const horaValida = (h) => typeof h === "string" && RE_HORA.test(h);

  function partirHora(h) {
    const m = RE_HORA.exec(horaValida(h) ? h : POR_DEFECTO.hora);
    return { hora: Number(m[1]), minuto: Number(m[2]) };
  }

  /** Devuelve una configuración siempre válida (días únicos, ordenados, 1–7). */
  function sanear(c) {
    const o = c && typeof c === "object" ? c : {};
    const dias = Array.isArray(o.dias) ? [...new Set(o.dias.map(Number).filter((d) => Number.isInteger(d) && d >= 1 && d <= 7))].sort((a, b) => a - b) : POR_DEFECTO.dias.slice();
    return { activo: o.activo === true, dias, hora: horaValida(o.hora) ? o.hora : POR_DEFECTO.hora };
  }

  function leer(almacen) {
    try {
      const a = almacen || raiz.localStorage;
      const bruto = a.getItem(CLAVE);
      return sanear(bruto ? JSON.parse(bruto) : null);
    } catch (_) {
      return sanear(null);
    }
  }

  function guardar(config, almacen) {
    const limpia = sanear(config);
    try {
      (almacen || raiz.localStorage).setItem(CLAVE, JSON.stringify(limpia));
    } catch (_) {}
    return limpia;
  }

  /** "lunes, miércoles y viernes a las 18:00" */
  function describir(config) {
    const c = sanear(config);
    if (!c.dias.length) return "Elige al menos un día";
    let dias;
    if (c.dias.length === 7) dias = "todos los días";
    else {
      const n = c.dias.map((d) => DIAS_NOMBRE[d]);
      dias = n.length === 1 ? n[0] : `${n.slice(0, -1).join(", ")} y ${n[n.length - 1]}`;
    }
    return `${dias} a las ${c.hora}`;
  }

  // -----------------------------------------------------
  // Textos
  // -----------------------------------------------------
  const CUERPOS = [
    "Unos minutos de ejercicio hoy suman mucho. ¿Empezamos?",
    "Tus Pods te esperan. Una rutina corta y listo.",
    "Buen momento para entrenar tu reacción.",
    "La constancia es lo que da resultados. ¡Vamos!",
    "Calienta y supera tu mejor tiempo de hoy.",
  ];

  function primerNombre(nombre) {
    return String(nombre || "").trim().split(/\s+/)[0] || "";
  }

  /** Texto del aviso número `indice` (rota para no repetirse). */
  function mensaje(nombre, indice) {
    const n = primerNombre(nombre);
    const i = Math.abs(Number(indice) || 0);
    return {
      title: n ? `${n}, es hora de entrenar` : "Es hora de entrenar",
      body: CUERPOS[i % CUERPOS.length],
    };
  }

  // -----------------------------------------------------
  // Próximos avisos
  // -----------------------------------------------------
  /**
   * @param {object} config
   * @param {object} [o]
   * @param {Date}   [o.ahora]
   * @param {object[]} [o.historial]  para no avisar hoy si ya entrenó
   * @param {string} [o.nombre]
   * @param {number} [o.horizonte=21]  días hacia adelante (incluye hoy)
   * @returns {{id:number, at:Date, title:string, body:string}[]}
   */
  function proximas(config, o = {}) {
    const c = sanear(config);
    if (!c.activo || !c.dias.length) return [];
    const ahora = o.ahora ? new Date(o.ahora) : new Date();
    const horizonte = Math.max(1, Math.min(Number(o.horizonte) || HORIZONTE_DIAS, ID_MAX - ID_BASE + 1));
    const { hora, minuto } = partirHora(c.hora);

    const entrenoHoy = !!(M && o.historial && M.diasConSesion(o.historial).has(M.claveDia(ahora)));
    const lista = [];
    for (let k = 0; k < horizonte; k++) {
      const dia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + k, hora, minuto, 0, 0);
      const diaSemana = dia.getDay() === 0 ? 7 : dia.getDay();
      if (!c.dias.includes(diaSemana)) continue;
      if (dia.getTime() <= ahora.getTime() + 1000) continue; // ya pasó (o es ahora mismo)
      if (k === 0 && entrenoHoy) continue;
      const m = mensaje(o.nombre, lista.length);
      lista.push({ id: ID_BASE + lista.length, at: dia, title: m.title, body: m.body });
    }
    return lista;
  }

  const esNuestro = (id) => Number.isInteger(id) && id >= ID_BASE && id <= ID_MAX;

  const API = { CLAVE, ID_BASE, ID_MAX, HORIZONTE_DIAS, DIAS_NOMBRE, DIAS_CORTO, POR_DEFECTO, horaValida, partirHora, sanear, leer, guardar, describir, mensaje, proximas, esNuestro };
  raiz.RehabRecordatorios = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
