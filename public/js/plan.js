// =====================================================
// REHABPOD — GENERADOR DE RUTINAS PERSONALIZADAS
//
// Lógica pura (sin DOM ni motor de entrenamiento) para poder probarla con
// Node. A partir de lo que el usuario elige (objetivos, nivel y minutos)
// arma una rutina de varios bloques cuya duración SUMA exactamente el tiempo
// pedido: calentamiento suave, bloques principales y un reto final, con
// descansos cortos entre ellos.
//
// Se carga antes de app.js como script clásico; expone `RehabPlan` en window
// y también por module.exports para las pruebas unitarias.
// =====================================================

(function (raiz) {
  "use strict";

  /** Qué se quiere mejorar. `modos` se calcula abajo a partir de APTITUD. */
  const OBJETIVOS = {
    reaccion: {
      titulo: "Reacción y velocidad",
      icono: "⚡",
      descripcion: "Responder más rápido a cada estímulo.",
    },
    coordinacion: {
      titulo: "Coordinación y agilidad",
      icono: "🔄",
      descripcion: "Moverte entre Pods con fluidez y a dos manos.",
    },
    memoria: {
      titulo: "Memoria",
      icono: "🧠",
      descripcion: "Recordar secuencias y reglas mientras respondes.",
    },
    atencion: {
      titulo: "Atención y control",
      icono: "🎯",
      descripcion: "Discriminar colores y frenar respuestas equivocadas.",
    },
  };

  /**
   * Cuánto trabaja cada modo cada objetivo (0–1). Un modo puede servir para
   * varios objetivos. `entrenador` no está: exige a una persona controlando.
   */
  const APTITUD = {
    simple: { reaccion: 1.0, atencion: 0.3 },
    persecucion: { reaccion: 0.8, coordinacion: 0.6 },
    contrarreloj: { reaccion: 0.9, coordinacion: 0.3 },
    colores: { reaccion: 0.5, atencion: 0.7, memoria: 0.3 },
    doble: { coordinacion: 0.9, reaccion: 0.5, atencion: 0.4 },
    circuito: { coordinacion: 1.0, reaccion: 0.4 },
    automatico: { coordinacion: 0.8, reaccion: 0.4 },
    libre: { coordinacion: 0.6, reaccion: 0.2 },
    secuencia: { memoria: 1.0, atencion: 0.4 },
    prohibido: { atencion: 1.0, memoria: 0.4, reaccion: 0.3 },
    stroop: { atencion: 1.0, memoria: 0.5 },
    cazaColor: { atencion: 0.9, reaccion: 0.4, memoria: 0.3 },
  };

  /** Modos suaves que sirven de calentamiento. */
  const CALENTAMIENTO = ["simple", "libre", "automatico", "persecucion", "colores"];

  const NIVELES = ["principiante", "intermedio", "avanzado"];
  const DIFICULTAD_MOTOR = { principiante: "facil", intermedio: "media", avanzado: "dificil" };
  const ORDEN_DIFICULTAD = ["facil", "media", "dificil"];

  /** Opciones de tiempo ofrecidas (minutos) → cantidad de bloques. */
  const BLOQUES_POR_MINUTOS = { 5: 3, 10: 4, 15: 5, 20: 6, 30: 8 };
  const MINUTOS_VALIDOS = Object.keys(BLOQUES_POR_MINUTOS).map(Number);

  const MIN_BLOQUE_SEG = 30;

  /** Aptitud mínima para que un modo cuente como entrenamiento de un objetivo. */
  const APTITUD_MINIMA = 0.4;

  function descansoPara(minutos) {
    if (minutos <= 5) return 10;
    if (minutos <= 15) return 15;
    return 20;
  }

  /** Redondea a múltiplos de 5 s (más fácil de leer). */
  function a5(n) {
    return Math.round(n / 5) * 5;
  }

  /** Elige un elemento con probabilidad proporcional a su peso. */
  function elegirPonderado(candidatos, rng) {
    const total = candidatos.reduce((s, c) => s + c.peso, 0);
    if (total <= 0) return candidatos[0];
    let x = rng() * total;
    for (const c of candidatos) {
      x -= c.peso;
      if (x <= 0) return c;
    }
    return candidatos[candidatos.length - 1];
  }

  /**
   * Repartir `total` segundos entre bloques según sus pesos, en múltiplos de
   * 5 s, respetando el mínimo por bloque. El último absorbe lo que sobre para
   * que la suma sea exacta.
   */
  function repartir(total, pesos) {
    const sumaPesos = pesos.reduce((a, b) => a + b, 0);
    const partes = pesos.map((p) => Math.max(MIN_BLOQUE_SEG, a5((total * p) / sumaPesos)));
    const usados = partes.slice(0, -1).reduce((a, b) => a + b, 0);
    partes[partes.length - 1] = total - usados;
    return partes;
  }

  /**
   * Genera la rutina.
   * @param {object} o
   * @param {number} o.minutos            5, 10, 15, 20 o 30
   * @param {string[]} o.objetivos        1 o 2 claves de OBJETIVOS
   * @param {string} o.nivel              principiante | intermedio | avanzado
   * @param {string[]} [o.evitar]         modos a no repetir (los de la rutina anterior)
   * @param {(modo:string)=>number} [o.minPods]  mínimo de Pods que exige un modo
   * @param {number} [o.podsDisponibles]  Pods que se podrán usar (por defecto 4)
   * @param {()=>number} [o.rng]          generador 0–1 (inyectable para pruebas)
   */
  function generarPlan(o) {
    const rng = o.rng || Math.random;
    const minutos = MINUTOS_VALIDOS.includes(Number(o.minutos)) ? Number(o.minutos) : 5;
    const nivel = NIVELES.includes(o.nivel) ? o.nivel : "intermedio";
    const objetivos = (o.objetivos || []).filter((k) => OBJETIVOS[k]).slice(0, 2);
    if (!objetivos.length) objetivos.push("reaccion");
    const evitar = new Set(o.evitar || []);
    const minPods = o.minPods || (() => 1);
    const pods = Number(o.podsDisponibles) || 4;

    const permitido = (modo) => APTITUD[modo] && minPods(modo) <= pods;

    const n = BLOQUES_POR_MINUTOS[minutos];
    const descanso = descansoPara(minutos);
    const totalSeg = minutos * 60;
    const segBloques = totalSeg - (n - 1) * descanso;

    const dificultadBase = DIFICULTAD_MOTOR[nivel];
    const idxBase = ORDEN_DIFICULTAD.indexOf(dificultadBase);
    const dificultadSuave = ORDEN_DIFICULTAD[Math.max(0, idxBase - 1)];

    const usados = [];

    /** Elige un modo para `objetivo`, prefiriendo no repetir ni los previos. */
    function elegirModo(objetivo, { pool, prohibidos = [] } = {}) {
      const base = (pool || Object.keys(APTITUD)).filter(
        (m) => permitido(m) && (APTITUD[m][objetivo] || 0) >= APTITUD_MINIMA
      );
      const intentos = [
        // 1) ni de la rutina anterior, ni ya usado en esta, ni prohibido
        (m) => !evitar.has(m) && !usados.includes(m) && !prohibidos.includes(m),
        // 2) permite los de la rutina anterior, pero no repite dentro de esta
        (m) => !usados.includes(m) && !prohibidos.includes(m),
        // 3) permite repetir, salvo lo prohibido (el bloque inmediato anterior)
        (m) => !prohibidos.includes(m),
        // 4) lo que haya
        () => true,
      ];
      for (const filtro of intentos) {
        const lista = base.filter(filtro).map((m) => ({ modo: m, peso: APTITUD[m][objetivo] }));
        if (lista.length) return elegirPonderado(lista, rng).modo;
      }
      // Ningún modo sirve para ese objetivo con los Pods disponibles.
      const respaldo = Object.keys(APTITUD).filter(permitido);
      return respaldo[0] || "simple";
    }

    const bloques = [];

    // 1) Calentamiento: suave y alineado con lo que se quiere trabajar.
    {
      const objetivo = objetivos[0];
      const pool = CALENTAMIENTO.filter(permitido);
      let modo = null;
      const candidatos = pool
        .filter((m) => !evitar.has(m))
        .map((m) => ({ modo: m, peso: 0.2 + (APTITUD[m][objetivo] || 0) }));
      const lista = candidatos.length
        ? candidatos
        : pool.map((m) => ({ modo: m, peso: 0.2 + (APTITUD[m][objetivo] || 0) }));
      modo = lista.length ? elegirPonderado(lista, rng).modo : "simple";
      usados.push(modo);
      bloques.push({ modo, rol: "calentamiento", objetivo, dificultad: dificultadSuave });
    }

    // Cada objetivo tiene un modo "ancla" (el que más lo trabaja). Entra siempre,
    // salvo que se pida evitarlo (rutina diferente a la anterior).
    const ancla = (objetivo) =>
      Object.keys(APTITUD).find((m) => permitido(m) && APTITUD[m][objetivo] === 1);

    // Los objetivos se reparten por turnos entre todos los bloques que no son el
    // calentamiento, así con 2 objetivos ambos se trabajan aunque la rutina sea corta.
    const objetivoDelBloque = (k) => objetivos[k % objetivos.length]; // k = 0 es el primer principal
    const principales = n - 2;
    const objetivoReto = objetivoDelBloque(principales);

    // Si el reto final es de reacción, contrarreloj se guarda para él.
    const reservados = objetivoReto === "reaccion" ? ["contrarreloj"] : [];

    // 2) Bloques principales.
    for (let i = 0; i < principales; i++) {
      const objetivo = objetivoDelBloque(i);
      const previo = bloques[bloques.length - 1].modo;
      const a = ancla(objetivo);
      let modo;
      if (a && !evitar.has(a) && !usados.includes(a) && a !== previo && !reservados.includes(a)) {
        modo = a;
      } else {
        modo = elegirModo(objetivo, { prohibidos: [previo, ...reservados] });
      }
      usados.push(modo);
      bloques.push({ modo, rol: "principal", objetivo, dificultad: dificultadBase });
    }

    // 3) Reto final: intenso (contrarreloj si es de reacción).
    {
      const objetivo = objetivoReto;
      const previo = bloques[bloques.length - 1].modo;
      let modo = null;
      if (objetivo === "reaccion" && permitido("contrarreloj") && !evitar.has("contrarreloj") && previo !== "contrarreloj" && !usados.includes("contrarreloj")) {
        modo = "contrarreloj";
      } else {
        modo = elegirModo(objetivo, { prohibidos: [previo] });
      }
      usados.push(modo);
      bloques.push({ modo, rol: "reto", objetivo, dificultad: dificultadBase });
    }

    // Duración: calentamiento más corto, el resto parejo; suma exacta.
    const pesos = bloques.map((b) => (b.rol === "calentamiento" ? 0.6 : 1));
    const segundos = repartir(segBloques, pesos);
    bloques.forEach((b, i) => {
      b.segundos = segundos[i];
    });

    return {
      minutos,
      objetivos,
      nivel,
      descanso,
      totalSegundos: bloques.reduce((s, b) => s + b.segundos, 0) + (bloques.length - 1) * descanso,
      bloques,
    };
  }

  // -----------------------------------------------------
  // Adaptación de la dificultad
  // -----------------------------------------------------

  /** Precisión 0–1 de un bloque, o null si hay pocos datos para juzgar. */
  function precisionDe(aciertos, errores) {
    const total = Number(aciertos || 0) + Number(errores || 0);
    if (total < 6) return null;
    return Number(aciertos || 0) / total;
  }

  /**
   * Cambio de nivel sugerido tras un bloque: +1 si le fue muy bien, −1 si le
   * fue mal, 0 en otro caso o si no hay datos suficientes (p. ej. Modo libre,
   * donde no hay errores posibles, o un bloque muy corto).
   */
  function deltaNivel(aciertos, errores) {
    const p = precisionDe(aciertos, errores);
    if (p === null) return 0;
    if (p >= 0.92) return 1;
    if (p < 0.6) return -1;
    return 0;
  }

  /**
   * Modos donde el usuario no puede equivocarse (o el resultado no depende de
   * él): su "precisión" siempre sería 100 % y subiría el nivel sin motivo.
   */
  const MODOS_SIN_ERROR = ["libre", "automatico"];

  /** Igual que deltaNivel, pero ignora los modos sin errores posibles. */
  function deltaNivelDeBloque(modo, aciertos, errores) {
    if (MODOS_SIN_ERROR.includes(modo)) return 0;
    return deltaNivel(aciertos, errores);
  }

  /** Aplica un delta a una dificultad del motor, sin salir de facil…dificil. */
  function moverDificultad(dificultad, delta) {
    const i = ORDEN_DIFICULTAD.indexOf(dificultad);
    if (i < 0) return dificultad;
    return ORDEN_DIFICULTAD[Math.min(ORDEN_DIFICULTAD.length - 1, Math.max(0, i + delta))];
  }

  /**
   * Nivel sugerido según las últimas sesiones guardadas (las que registran
   * dificultad y tienen errores posibles). Devuelve null si no hay datos.
   * @param {Array<{dificultad?:string, aciertos:number, errores:number}>} historial
   */
  function nivelSugerido(historial) {
    const validas = (historial || [])
      .filter((s) => ORDEN_DIFICULTAD.includes(s.dificultad) && precisionDe(s.aciertos, s.errores) !== null)
      .slice(-3);
    if (validas.length < 2) return null;

    const ultima = validas[validas.length - 1].dificultad;
    const media =
      validas.reduce((s, x) => s + precisionDe(x.aciertos, x.errores), 0) / validas.length;

    let sugerida = ultima;
    if (media >= 0.92) sugerida = moverDificultad(ultima, 1);
    else if (media < 0.6) sugerida = moverDificultad(ultima, -1);

    return NIVELES[ORDEN_DIFICULTAD.indexOf(sugerida)];
  }

  const API = {
    OBJETIVOS,
    APTITUD,
    NIVELES,
    DIFICULTAD_MOTOR,
    MINUTOS_VALIDOS,
    generarPlan,
    deltaNivel,
    deltaNivelDeBloque,
    MODOS_SIN_ERROR,
    moverDificultad,
    precisionDe,
    nivelSugerido,
  };

  raiz.RehabPlan = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
