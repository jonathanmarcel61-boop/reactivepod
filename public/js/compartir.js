// =====================================================
// REHABPOD — COMPARTIR RESULTADOS (WhatsApp y otras apps)
//
// Textos claros y cortos para mandar por WhatsApp. Usa el menú "Compartir"
// del teléfono cuando existe (Android/iOS) y, si no, abre WhatsApp con el
// mensaje escrito; como último recurso copia el texto.
//
// Se carga antes de app.js; expone `RehabCompartir` y module.exports.
// =====================================================

(function (raiz) {
  "use strict";

  const nombreDe = (n) => String(n || "").trim() || "Un deportista";

  function porcentaje(aciertos, errores) {
    const total = Number(aciertos || 0) + Number(errores || 0);
    return total > 0 ? Math.round((Number(aciertos || 0) / total) * 100) : null;
  }

  const seg = (n) => `${Number(n).toFixed(3)} s`;

  /** Resultado de un entrenamiento suelto. */
  function textoResultado(o) {
    const pct = porcentaje(o.aciertos, o.errores);
    const lineas = [
      `🏁 ${nombreDe(o.nombre)} terminó ${o.modo || "un entrenamiento"} en RehabPod`,
      `✅ ${Number(o.aciertos || 0)} aciertos · ❌ ${Number(o.errores || 0)} errores${pct === null ? "" : ` (${pct} %)`}`,
    ];
    if (typeof o.mejor === "number") lineas.push(`⚡ Mejor reacción: ${seg(o.mejor)}`);
    if (typeof o.promedio === "number") lineas.push(`⏱️ Promedio: ${seg(o.promedio)}`);
    lineas.push("¿Puedes superarlo? Entrena con RehabPod.");
    return lineas.join("\n");
  }

  /** Resumen de una rutina completa. */
  function textoRutina(o) {
    const pct = porcentaje(o.aciertos, o.errores);
    const lineas = [
      `🏁 ${nombreDe(o.nombre)} completó una rutina de ${o.minutos} min en RehabPod`,
      `🎯 Objetivo: ${o.objetivos}`,
      `✅ ${Number(o.aciertos || 0)} aciertos · ❌ ${Number(o.errores || 0)} errores${pct === null ? "" : ` (${pct} %)`}`,
      `💪 ${Number(o.ejercicios || 0)} ejercicios`,
    ];
    if (typeof o.mejor === "number") lineas.push(`⚡ Mejor reacción: ${seg(o.mejor)}`);
    if (o.racha >= 2) lineas.push(`🔥 Racha: ${o.racha} días seguidos`);
    lineas.push("¿Te animas? Entrena con RehabPod.");
    return lineas.join("\n");
  }

  /**
   * Comparte el texto. Devuelve: "compartido" | "whatsapp" | "copiado" |
   * "cancelado" | "error".
   */
  async function compartir(texto, titulo) {
    const nav = typeof navigator !== "undefined" ? navigator : {};

    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: titulo || "RehabPod", text: texto });
        return "compartido";
      } catch (error) {
        if (error && error.name === "AbortError") return "cancelado";
        // Otro fallo: se prueba con WhatsApp.
      }
    }

    try {
      const url = "https://wa.me/?text=" + encodeURIComponent(texto);
      const ventana = typeof window !== "undefined" ? window.open(url, "_blank", "noopener") : null;
      if (ventana) return "whatsapp";
    } catch (_) {}

    try {
      await nav.clipboard.writeText(texto);
      return "copiado";
    } catch (_) {
      return "error";
    }
  }

  const API = { textoResultado, textoRutina, porcentaje, compartir };
  raiz.RehabCompartir = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
