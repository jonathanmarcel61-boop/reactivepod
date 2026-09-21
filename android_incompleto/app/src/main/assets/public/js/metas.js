// =====================================================
// REHABPOD — METAS SEMANALES, RACHAS Y MENSAJES PERSONALIZADOS
//
// Lógica pura (sin DOM) a partir del historial del perfil: días entrenados,
// racha, avance de la semana y el mensaje de bienvenida. Todas las fechas se
// interpretan en la hora LOCAL del teléfono; `ahora` es inyectable para poder
// probarlo con fechas fijas.
//
// Se carga antes de app.js; expone `RehabMetas` en window y por module.exports.
// =====================================================

(function (raiz) {
  "use strict";

  const CLAVE_META = "rehabpodMetaSemanal";
  const META_POR_DEFECTO = 3;
  const DIAS_LARGO = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const DIAS_CORTO = ["L", "M", "X", "J", "V", "S", "D"]; // semana que empieza el lunes

  const FRASES = [
    "Prepárate para reaccionar más rápido.",
    "Cinco minutos bien hechos suman más de lo que crees.",
    "Hoy toca superar tu mejor tiempo.",
    "La constancia se nota en cada golpe.",
    "Calienta, enfócate y a por ello.",
    "Un buen día para mejorar tu reacción.",
  ];

  // -----------------------------------------------------
  // Fechas
  // -----------------------------------------------------
  function inicioDelDia(fecha) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  /** "2026-09-19" en hora local (el mes va de 1 a 12). */
  function claveDia(fecha) {
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${m}-${d}`;
  }

  function fechaDeSesion(sesion) {
    const f = sesion && sesion.timestamp ? new Date(sesion.timestamp) : new Date(sesion && sesion.fecha);
    return Number.isNaN(f.getTime()) ? null : f;
  }

  /** Conjunto de días (claveDia) en los que hubo al menos una sesión. */
  function diasConSesion(historial) {
    const dias = new Set();
    (historial || []).forEach((s) => {
      const f = fechaDeSesion(s);
      if (f) dias.add(claveDia(f));
    });
    return dias;
  }

  /** Lunes 00:00 de la semana de `fecha`. */
  function inicioDeSemana(fecha) {
    const d = inicioDelDia(fecha);
    const desdeLunes = (d.getDay() + 6) % 7; // lunes = 0 … domingo = 6
    d.setDate(d.getDate() - desdeLunes);
    return d;
  }

  /** Identificador de la semana, p. ej. "2026-09-14" (su lunes). */
  function claveSemana(fecha) {
    return claveDia(inicioDeSemana(fecha));
  }

  function diasEntre(a, b) {
    return Math.round((inicioDelDia(b) - inicioDelDia(a)) / 86400000);
  }

  // -----------------------------------------------------
  // Racha y semana
  // -----------------------------------------------------

  /**
   * Racha de días seguidos. Sigue viva si hoy todavía no se entrenó pero ayer
   * sí (hay hasta el final de hoy para mantenerla).
   */
  function calcularRacha(historial, ahora) {
    ahora = ahora || new Date();
    const dias = diasConSesion(historial);
    const entrenoHoy = dias.has(claveDia(ahora));

    const cursor = inicioDelDia(ahora);
    if (!entrenoHoy) cursor.setDate(cursor.getDate() - 1);

    let racha = 0;
    for (let i = 0; i < 3650 && dias.has(claveDia(cursor)); i++) {
      racha++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Mejor racha de toda la historia.
    const ordenados = [...dias].sort();
    let mejor = 0;
    let actual = 0;
    let previo = null;
    for (const clave of ordenados) {
      const [y, m, d] = clave.split("-").map(Number);
      const f = new Date(y, m - 1, d);
      actual = previo && diasEntre(previo, f) === 1 ? actual + 1 : 1;
      mejor = Math.max(mejor, actual);
      previo = f;
    }

    return { racha, entrenoHoy, enRiesgo: !entrenoHoy && racha > 0, mejor };
  }

  function normalizarMeta(meta) {
    const n = Math.round(Number(meta));
    return Number.isFinite(n) && n >= 1 && n <= 7 ? n : META_POR_DEFECTO;
  }

  /** Avance de la semana en curso (lunes a domingo). La meta cuenta DÍAS entrenados. */
  function estadoSemana(historial, meta, ahora) {
    ahora = ahora || new Date();
    meta = normalizarMeta(meta);
    const dias = diasConSesion(historial);
    const lunes = inicioDeSemana(ahora);
    const hoy = claveDia(ahora);

    const detalle = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      const clave = claveDia(d);
      detalle.push({
        clave,
        etiqueta: DIAS_CORTO[i],
        nombre: DIAS_LARGO[d.getDay()],
        entreno: dias.has(clave),
        esHoy: clave === hoy,
        futuro: clave > hoy,
      });
    }

    const hechos = detalle.filter((d) => d.entreno).length;
    return {
      claveSemana: claveDia(lunes),
      dias: detalle,
      hechos,
      meta,
      restantes: Math.max(0, meta - hechos),
      cumplida: hechos >= meta,
    };
  }

  // -----------------------------------------------------
  // Mensajes
  // -----------------------------------------------------
  function saludoHora(ahora) {
    const h = (ahora || new Date()).getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  const plural = (n, uno, varios) => (n === 1 ? uno : varios);

  /**
   * Mensaje de la pantalla de bienvenida según la situación de la persona.
   * @returns {{saludo:string, mensaje:string, tipo:string}}
   */
  function mensajeBienvenida(o) {
    const ahora = o.ahora || new Date();
    const rng = o.rng || Math.random;
    const historial = o.historial || [];
    const nombre = String(o.nombre || "").trim();
    const saludo = saludoHora(ahora) + (nombre ? `, ${nombre}` : "");

    const r = calcularRacha(historial, ahora);
    const semana = estadoSemana(historial, o.meta, ahora);

    if (!historial.length) {
      return { saludo, tipo: "primera", mensaje: "Es tu primera vez: empieza con una rutina de 5 minutos y verás tu progreso." };
    }

    const fechas = historial.map(fechaDeSesion).filter(Boolean);
    const ultima = fechas.length ? new Date(Math.max(...fechas.map((f) => f.getTime()))) : null;
    const sinEntrenar = ultima ? diasEntre(ultima, ahora) : 0;
    if (sinEntrenar >= 7) {
      return { saludo, tipo: "regreso", mensaje: `Hace ${sinEntrenar} días que no entrenas. Retomemos con una rutina corta de 5 minutos.` };
    }

    if (semana.cumplida) {
      return { saludo, tipo: "meta", mensaje: `¡Meta semanal cumplida! Llevas ${semana.hechos} ${plural(semana.hechos, "día", "días")} esta semana.` };
    }

    if (r.enRiesgo && r.racha >= 2) {
      return { saludo, tipo: "racha-riesgo", mensaje: `Llevas ${r.racha} días seguidos: entrena hoy y mantén tu racha.` };
    }

    if (r.entrenoHoy && r.racha >= 2) {
      return { saludo, tipo: "racha", mensaje: `¡${r.racha} días seguidos! Vas muy bien.` };
    }

    if (semana.hechos > 0) {
      const f = semana.restantes;
      return { saludo, tipo: "avance", mensaje: `${plural(f, "Te falta", "Te faltan")} ${f} ${plural(f, "día", "días")} para tu meta de la semana.` };
    }

    return { saludo, tipo: "frase", mensaje: FRASES[Math.floor(rng() * FRASES.length) % FRASES.length] };
  }

  // -----------------------------------------------------
  // Meta guardada (por dispositivo)
  // -----------------------------------------------------
  function leerMeta() {
    try {
      return normalizarMeta(localStorage.getItem(CLAVE_META) ?? META_POR_DEFECTO);
    } catch (_) {
      return META_POR_DEFECTO;
    }
  }

  function guardarMeta(meta) {
    try {
      localStorage.setItem(CLAVE_META, String(normalizarMeta(meta)));
    } catch (_) {}
    return normalizarMeta(meta);
  }

  const API = {
    CLAVE_META,
    META_POR_DEFECTO,
    claveDia,
    claveSemana,
    diasConSesion,
    calcularRacha,
    estadoSemana,
    saludoHora,
    mensajeBienvenida,
    normalizarMeta,
    leerMeta,
    guardarMeta,
  };

  raiz.RehabMetas = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
