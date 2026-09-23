// =====================================================
// REHABPOD — VOZ EN ESPAÑOL
//
// Locución con la síntesis de voz del teléfono (speechSynthesis): cuenta
// atrás, avisos de la rutina y felicitaciones, útil cuando la persona mira
// los Pods y no la pantalla. Si el dispositivo no tiene voz, no pasa nada:
// la app sigue igual, solo sin locución.
//
// Activada por defecto; se puede apagar en Ajustes (clave rehabpodVoz).
// Se carga antes de app.js; expone `RehabVoz` y module.exports.
// =====================================================

(function (raiz) {
  "use strict";

  const CLAVE = "rehabpodVoz";

  // Español latino primero (más natural en Ecuador), luego cualquier español.
  const PREFERENCIA = ["es-EC", "es-419", "es-MX", "es-US", "es-CO", "es-PE", "es-AR", "es-CL", "es"];

  const NUMEROS = { 1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco" };

  /** Elige la mejor voz en español de una lista de voces del sistema. */
  function elegirVozDe(voces) {
    const es = (voces || []).filter((v) => /^es\b|^es[-_]/i.test(v.lang || ""));
    if (!es.length) return null;
    for (const pref of PREFERENCIA) {
      const encontrada = es.find((v) => (v.lang || "").replace("_", "-").toLowerCase().startsWith(pref.toLowerCase()));
      if (encontrada) return encontrada;
    }
    return es[0];
  }

  function disponible() {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof window.SpeechSynthesisUtterance !== "undefined"
    );
  }

  function activa() {
    try {
      return localStorage.getItem(CLAVE) !== "false";
    } catch (_) {
      return true;
    }
  }

  function fijarActiva(valor) {
    try {
      localStorage.setItem(CLAVE, valor ? "true" : "false");
    } catch (_) {}
    if (!valor) callar();
  }

  function callar() {
    try {
      if (disponible()) window.speechSynthesis.cancel();
    } catch (_) {}
  }

  /**
   * Dice un texto. Por defecto interrumpe lo que estuviera sonando para que la
   * cuenta atrás no se desfase. Devuelve true si lo mandó a hablar.
   */
  function hablar(texto, opciones) {
    if (!texto || !disponible() || !activa()) return false;
    const o = opciones || {};
    try {
      const synth = window.speechSynthesis;
      if (o.interrumpir !== false) synth.cancel();
      const u = new window.SpeechSynthesisUtterance(String(texto));
      const voz = elegirVozDe(synth.getVoices());
      if (voz) {
        u.voice = voz;
        u.lang = voz.lang;
      } else {
        u.lang = "es-419";
      }
      u.rate = o.velocidad || 1.05;
      u.pitch = 1;
      synth.speak(u);
      return true;
    } catch (_) {
      return false;
    }
  }

  /** "3" → "tres" para que se lea bien en cualquier voz. */
  function numeroEnPalabras(n) {
    return NUMEROS[n] || String(n);
  }

  const API = { CLAVE, elegirVozDe, disponible, activa, fijarActiva, callar, hablar, numeroEnPalabras };
  raiz.RehabVoz = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
