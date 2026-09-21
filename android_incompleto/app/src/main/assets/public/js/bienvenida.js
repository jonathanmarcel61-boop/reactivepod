// =====================================================
// REHABPOD — PANTALLA DE BIENVENIDA ANIMADA Y PERSONALIZADA
//
// Al abrir la app: logo, cuatro Pods que se encienden en secuencia, saludo
// según la hora con el nombre del perfil y un mensaje según cómo va la
// persona (racha, meta de la semana, regreso tras varios días…). Se puede
// saltar tocando la pantalla. Con "reducir movimiento" no hay animación.
//
// Se carga antes de app.js; expone `RehabBienvenida` y module.exports.
// =====================================================

(function (raiz) {
  "use strict";

  const DURACION_MS = 2800;
  const SALIDA_MS = 450;

  const escapar = (t) =>
    String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /** Texto del saludo y del mensaje (separado del DOM para poder probarlo). */
  function textos(perfil, opciones) {
    const M = raiz.RehabMetas;
    const o = opciones || {};
    if (!M) return { saludo: "¡Bienvenido!", mensaje: "Prepárate para reaccionar más rápido.", tipo: "frase" };
    return M.mensajeBienvenida({
      nombre: perfil && perfil.nombre,
      historial: (perfil && perfil.historial) || [],
      meta: o.meta !== undefined ? o.meta : M.leerMeta(),
      ahora: o.ahora,
      rng: o.rng,
    });
  }

  /** Crea la pantalla y la retira sola. Devuelve el elemento. */
  function mostrar(perfil, opciones) {
    if (typeof document === "undefined") return null;
    const previa = document.getElementById("splashReactiPod");
    if (previa) previa.remove();

    const t = textos(perfil, opciones);
    const splash = document.createElement("div");
    splash.id = "splashReactiPod";
    splash.className = "apertura";
    splash.setAttribute("role", "status");
    splash.setAttribute("aria-live", "polite");
    splash.innerHTML = `
      <img class="apertura__logo" src="logo-full.png" alt="RehabPod">
      <div class="apertura__pods" aria-hidden="true">
        <span class="apertura__pod apertura__pod--1"></span>
        <span class="apertura__pod apertura__pod--2"></span>
        <span class="apertura__pod apertura__pod--3"></span>
        <span class="apertura__pod apertura__pod--4"></span>
      </div>
      <p class="apertura__saludo">${escapar(t.saludo)}</p>
      <p class="apertura__mensaje">${escapar(t.mensaje)}</p>
      <p class="apertura__saltar">Toca para continuar</p>
    `;
    splash.dataset.tipo = t.tipo;

    let cerrado = false;
    const cerrar = () => {
      if (cerrado) return;
      cerrado = true;
      splash.classList.add("apertura--sale");
      setTimeout(() => splash.remove(), SALIDA_MS + 50);
    };
    splash.addEventListener("click", cerrar);
    document.body.appendChild(splash);
    setTimeout(cerrar, (opciones && opciones.duracion) || DURACION_MS);

    return splash;
  }

  const API = { DURACION_MS, textos, mostrar };
  raiz.RehabBienvenida = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
