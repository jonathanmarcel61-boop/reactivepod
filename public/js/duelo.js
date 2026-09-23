// =====================================================
// REHABPOD — DUELO DE COLORES PARA DOS JUGADORES (reglas puras)
//
// Cada jugador tiene un color. En cada ronda se encienden dos Pods: uno con el
// color de cada jugador. Gana el punto quien golpea antes SU Pod. A mitad de
// la partida los jugadores intercambian de color (así ningún color ni posición
// favorece a nadie). Al final gana quien sumó más puntos.
//
// Sin DOM: se prueba con Node. Se carga antes de app.js; expone `RehabDuelo`.
// =====================================================

(function (raiz) {
  "use strict";

  const COLORES = {
    red: { clave: "red", nombre: "Rojo", css: "#ef4444", comando: "red" },
    blue: { clave: "blue", nombre: "Azul", css: "#3b82f6", comando: "blue" },
    green: { clave: "green", nombre: "Verde", css: "#22c55e", comando: "green" },
    yellow: { clave: "yellow", nombre: "Amarillo", css: "#facc15", comando: "yellow" },
    purple: { clave: "purple", nombre: "Morado", css: "#a855f7", comando: "purple" },
    orange: { clave: "orange", nombre: "Naranja", css: "#f97316", comando: "orange" },
  };

  const RONDAS_VALIDAS = [6, 10, 16];
  const LIMITE_RONDA_MS = 5000;

  function crearPartida(o) {
    const rondas = RONDAS_VALIDAS.includes(Number(o.rondas)) ? Number(o.rondas) : 10;
    let [c1, c2] = (o.colores || []).filter((c) => COLORES[c]);
    if (!c1) c1 = "red";
    if (!c2 || c2 === c1) c2 = c1 === "blue" ? "red" : "blue";
    const nombre = (n, def) => String(n || "").trim().slice(0, 20) || def;
    const pods = [...new Set(o.podsDisponibles || [])];
    if (pods.length < 2) throw new Error("Se necesitan al menos 2 Pods para el duelo.");
    return {
      rondas,
      colores: [c1, c2],
      nombres: [nombre(o.nombres && o.nombres[0], "Jugador 1"), nombre(o.nombres && o.nombres[1], "Jugador 2")],
      pods,
      rng: o.rng || Math.random,
      indice: -1, // ronda actual (0-based); -1 = aún no empieza
      ronda: null,
      historial: [], // [{ganador:0|1|null, tiempo, pods:[a,b], colores:[x,y]}]
      terminada: false,
    };
  }

  const mitadDe = (est, indice) => (indice < est.rondas / 2 ? 0 : 1);

  /** Color (clave) que tiene el jugador j en la ronda `indice`. */
  function colorDe(est, j, indice) {
    return mitadDe(est, indice) === 0 ? est.colores[j] : est.colores[1 - j];
  }

  /** Dos Pods distintos al azar. */
  function elegirPods(disponibles, rng) {
    const lista = [...disponibles];
    const a = lista.splice(Math.floor(rng() * lista.length), 1)[0];
    const b = lista[Math.floor(rng() * lista.length)];
    return [a, b];
  }

  /**
   * Prepara la siguiente ronda. Devuelve { fin:true } si ya se jugaron todas o
   * { fin:false, cambioColor } (cambioColor: entra la segunda mitad).
   */
  function siguienteRonda(est) {
    if (est.indice + 1 >= est.rondas) {
      est.terminada = true;
      est.ronda = null;
      return { fin: true, cambioColor: false };
    }
    est.indice++;
    const pods = elegirPods(est.pods, est.rng);
    est.ronda = {
      numero: est.indice + 1,
      pods, // pods[0] es el Pod del jugador 1; pods[1] el del jugador 2
      colores: [colorDe(est, 0, est.indice), colorDe(est, 1, est.indice)],
      abierta: false,
      tEncendido: null,
    };
    return { fin: false, cambioColor: est.indice === est.rondas / 2 };
  }

  /** Marca el momento en que se encienden los Pods (la ronda acepta golpes). */
  function abrirRonda(est, t) {
    if (!est.ronda) return;
    est.ronda.abierta = true;
    est.ronda.tEncendido = t;
  }

  /**
   * Un golpe en el Pod `pod` en el instante `t` (ms). `quien` (0/1) se indica
   * cuando el golpe viene de la pantalla de un jugador; con Pods físicos se
   * deduce de a quién pertenece el Pod. Solo cuenta el golpe al Pod propio.
   * Devuelve { valido, ganador?, tiempo? }.
   */
  function registrarGolpe(est, pod, t, quien) {
    const r = est.ronda;
    if (!r || !r.abierta) return { valido: false, motivo: "cerrada" };
    let jugador = r.pods.indexOf(pod);
    if (jugador < 0) return { valido: false, motivo: "no-encendido" };
    if (quien === 0 || quien === 1) {
      if (quien !== jugador) return { valido: false, motivo: "pod-ajeno" };
    }
    r.abierta = false;
    const tiempo = Math.max(0, t - r.tEncendido) / 1000;
    est.historial.push({ ganador: jugador, tiempo, pods: [...r.pods], colores: [...r.colores] });
    return { valido: true, ganador: jugador, tiempo };
  }

  /** Nadie golpeó a tiempo: la ronda no da punto. */
  function cerrarSinPunto(est) {
    const r = est.ronda;
    if (!r || !r.abierta) return false;
    r.abierta = false;
    est.historial.push({ ganador: null, tiempo: null, pods: [...r.pods], colores: [...r.colores] });
    return true;
  }

  const media = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

  /** Marcador y estadísticas (sirve durante y al final de la partida). */
  function resumen(est) {
    const jug = [0, 1].map((j) => {
      const ganadas = est.historial.filter((h) => h.ganador === j);
      const mitad1 = est.historial.filter((h, i) => h.ganador === j && mitadDe(est, i) === 0).length;
      const mitad2 = ganadas.length - mitad1;
      const tiempos = ganadas.map((h) => h.tiempo);
      return {
        nombre: est.nombres[j],
        puntos: ganadas.length,
        porMitad: [mitad1, mitad2],
        promedio: media(tiempos),
        mejor: tiempos.length ? Math.min(...tiempos) : null,
      };
    });
    const sinPunto = est.historial.filter((h) => h.ganador === null).length;
    let ganador = null;
    if (jug[0].puntos !== jug[1].puntos) ganador = jug[0].puntos > jug[1].puntos ? 0 : 1;
    return { jugadores: jug, ganador, empate: est.terminada && ganador === null, sinPunto, jugadas: est.historial.length, rondas: est.rondas };
  }

  const API = { COLORES, RONDAS_VALIDAS, LIMITE_RONDA_MS, crearPartida, colorDe, elegirPods, siguienteRonda, abrirRonda, registrarGolpe, cerrarSinPunto, resumen, mitadDe };
  raiz.RehabDuelo = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
