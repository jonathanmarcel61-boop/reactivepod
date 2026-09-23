// =====================================================
// REHABPOD — AJUSTES: COLORES DEL ENTRENAMIENTO
//
// Antes esta opción vivía en Cuenta, junto a sonidos, tema y privacidad
// (repetidos en Ajustes). Ahora Ajustes es el único lugar de las preferencias
// de la app. Se carga DESPUÉS de app.js.
// =====================================================

(function () {
  "use strict";

  const grid = document.getElementById("ajusteColoresGrid");
  if (!grid || typeof CLAVES_COLORES_REACTIPOD === "undefined" || typeof ajustesApp === "undefined") return;

  const aviso = document.getElementById("ajusteColoresAviso");
  const minimo = document.getElementById("ajusteColoresMinimo");
  if (minimo) minimo.textContent = String(MINIMO_COLORES_ACTIVOS);

  function activos() {
    return new Set(Array.isArray(ajustesApp.coloresActivos) ? ajustesApp.coloresActivos : CLAVES_COLORES_REACTIPOD);
  }

  function pintar() {
    const marcados = activos();
    grid.innerHTML = CLAVES_COLORES_REACTIPOD.map((clave) => {
      const info = catalogoColoresPersonalizados[clave];
      const nombre = info.nombre.charAt(0) + info.nombre.slice(1).toLowerCase();
      return `
        <label class="ajColor">
          <input type="checkbox" data-color="${clave}" ${marcados.has(clave) ? "checked" : ""}>
          <span class="ajColor__muestra" style="background:${info.css}" aria-hidden="true"></span>
          <span>${nombre}</span>
        </label>`;
    }).join("");
  }

  grid.addEventListener("change", (e) => {
    const check = e.target.closest("input[data-color]");
    if (!check) return;
    const seleccionados = [...grid.querySelectorAll("input[data-color]")].filter((c) => c.checked).map((c) => c.dataset.color);

    if (seleccionados.length < MINIMO_COLORES_ACTIVOS) {
      // Con menos colores los 4 Pods no podrían mostrar colores distintos entre sí.
      check.checked = true;
      if (aviso) aviso.textContent = `Necesitas al menos ${MINIMO_COLORES_ACTIVOS} colores activos.`;
      return;
    }
    if (aviso) aviso.textContent = "";
    ajustesApp.coloresActivos = seleccionados;
    guardarAjustes();
  });

  pintar();
  window.rehabColoresAjustes = { pintar };
})();
