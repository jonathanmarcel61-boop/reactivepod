// =====================================================
// REHABPOD — COMPONENTES DE INTERFAZ COMPARTIDOS
//
//   modalRehab()      ventana modal accesible (reemplaza 8 copias del mismo modal)
//   vigilarOverlay()  añade accesibilidad a un overlay que ya existe
//   avisarRehab()     aviso no bloqueante (reemplaza alert)
//   confirmarRehab()  confirmación (reemplaza confirm) -> Promise<boolean>
//   pedirTextoRehab() entrada de texto (reemplaza prompt) -> Promise<string|null>
//
// Se carga como script clásico antes de app.js (ver index.html). Los estilos
// están en style.css, sección "COMPONENTES COMPARTIDOS".
//
// Los modales se abren y cierran alternando el atributo `hidden` del overlay,
// igual que antes; un MutationObserver detecta el cambio y se encarga de
// mover el foco, cerrar con Esc y atrapar el Tab. Así el código existente
// que hace `overlay.hidden = false` sigue funcionando sin cambios.
// =====================================================

(function (raiz) {
  "use strict";

  const SELECTOR_ENFOCABLES = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type=hidden])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  const abiertos = []; // pila de overlays visibles; el último es el de arriba

  function esVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function enfocables(contenedor) {
    return Array.from(contenedor.querySelectorAll(SELECTOR_ENFOCABLES)).filter(esVisible);
  }

  function dialogoDe(overlay) {
    return overlay.querySelector('[role="dialog"], [role="alertdialog"]') || overlay;
  }

  function alAbrir(overlay) {
    if (abiertos.includes(overlay)) return;
    overlay.__rpFocoPrevio = document.activeElement;
    abiertos.push(overlay);

    const dialogo = dialogoDe(overlay);
    if (!dialogo.hasAttribute("tabindex")) dialogo.setAttribute("tabindex", "-1");
    // Se enfoca el propio diálogo: el lector de pantalla anuncia su título y el
    // siguiente Tab llega al primer control.
    requestAnimationFrame(() => {
      if (!overlay.hidden && !dialogo.contains(document.activeElement)) {
        dialogo.focus({ preventScroll: true });
      }
    });
  }

  function alCerrar(overlay) {
    const i = abiertos.indexOf(overlay);
    if (i >= 0) abiertos.splice(i, 1);

    const previo = overlay.__rpFocoPrevio;
    overlay.__rpFocoPrevio = null;
    if (previo && typeof previo.focus === "function" && document.contains(previo)) {
      previo.focus({ preventScroll: true });
    }
    if (typeof overlay.__rpAlCerrar === "function") overlay.__rpAlCerrar();
  }

  function alTeclear(evento) {
    if (!abiertos.length) return;
    const overlay = abiertos[abiertos.length - 1];

    if (evento.key === "Escape") {
      if (overlay.__rpEsc === false) return; // p. ej. el flujo de rutina no se descarta con Esc
      evento.stopPropagation();
      overlay.hidden = true;
      return;
    }

    if (evento.key !== "Tab") return;

    const dialogo = dialogoDe(overlay);
    const lista = enfocables(dialogo);
    if (!lista.length) {
      evento.preventDefault();
      dialogo.focus();
      return;
    }

    const primero = lista[0];
    const ultimo = lista[lista.length - 1];
    const activo = document.activeElement;
    const dentro = dialogo.contains(activo) && activo !== dialogo;

    if (evento.shiftKey && (!dentro || activo === primero)) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && (!dentro || activo === ultimo)) {
      evento.preventDefault();
      primero.focus();
    }
  }

  document.addEventListener("keydown", alTeclear, true);

  /**
   * Hace accesible cualquier overlay existente: Esc, trampa de foco y retorno
   * del foco. Idempotente.
   * @param {HTMLElement} overlay elemento que se muestra/oculta con `hidden`
   * @param {{alCerrar?: Function, cerrarConEsc?: boolean}} [opciones]  cerrarConEsc=false para overlays que no deben descartarse con Esc
   */
  function vigilarOverlay(overlay, opciones = {}) {
    if (!overlay || overlay.__rpVigilado) return overlay;
    overlay.__rpVigilado = true;
    overlay.__rpAlCerrar = opciones.alCerrar || null;
    overlay.__rpEsc = opciones.cerrarConEsc !== false;

    new MutationObserver(() => {
      if (overlay.hidden) alCerrar(overlay);
      else alAbrir(overlay);
    }).observe(overlay, { attributes: true, attributeFilter: ["hidden"] });

    if (!overlay.hidden) alAbrir(overlay);
    return overlay;
  }

  /**
   * Crea (una sola vez) una ventana modal accesible.
   *
   * Conserva la convención de ids que ya usaba la app para no romper el código
   * existente:  `${id}Overlay`, `${id}Cerrar` y `${id}Contenido`.
   *
   * @param {object} o
   * @param {string} o.id            prefijo de ids, p. ej. "rehabV23"
   * @param {string} o.titulo        título visible
   * @param {string} [o.idTitulo]    id del <h2> (por defecto `${id}Titulo`)
   * @param {string} [o.eyebrow]     rótulo pequeño sobre el título ("REHABPOD")
   * @param {string} [o.logo]        URL de una imagen para la cabecera
   * @param {string} [o.icono]       texto/emoji alternativo al logo
   * @param {string} [o.clase]       clase extra del diálogo (para estilos propios del contenido)
   * @param {number} [o.ancho=900]   ancho máximo en px
   * @param {string} [o.z]           z-index como expresión CSS, p. ej. "calc(var(--z-modal) + 2)" (orden de apilado entre modales que se abren unos desde otros)
   * @param {string} [o.contenidoHTML] HTML inicial del cuerpo
   * @param {Function} [o.alCerrar]  se llama cada vez que se cierra
   * @returns {{overlay:HTMLElement, dialogo:HTMLElement, cuerpo:HTMLElement, titulo:HTMLElement, abrir:Function, cerrar:Function}}
   */
  function modalRehab(o) {
    const idOverlay = `${o.id}Overlay`;
    let overlay = document.getElementById(idOverlay);

    if (!overlay) {
      const idTitulo = o.idTitulo || `${o.id}Titulo`;
      overlay = document.createElement("div");
      overlay.id = idOverlay;
      overlay.className = "rp-overlay";
      overlay.hidden = true;
      if (o.z) overlay.style.setProperty("--rp-z", String(o.z));

      const marca = o.logo
        ? `<img src="${escaparHTML(o.logo)}" alt="" class="rp-modal__logo">`
        : o.icono
          ? `<span class="rp-modal__icono" aria-hidden="true">${escaparHTML(o.icono)}</span>`
          : "";

      overlay.innerHTML = `
        <div class="rp-modal ${escaparHTML(o.clase || "")}" role="dialog" aria-modal="true"
             aria-labelledby="${escaparHTML(idTitulo)}" style="--rp-ancho:${Number(o.ancho) || 900}px">
          <div class="rp-modal__cab">
            <div class="rp-modal__marca">
              ${marca}
              <div>
                <div class="rp-modal__eyebrow">${escaparHTML(o.eyebrow || "REHABPOD")}</div>
                <h2 id="${escaparHTML(idTitulo)}" class="rp-modal__titulo">${escaparHTML(o.titulo || "")}</h2>
              </div>
            </div>
            <button type="button" id="${escaparHTML(o.id)}Cerrar" class="rp-modal__cerrar"
                    aria-label="Cerrar">×</button>
          </div>
          <div id="${escaparHTML(o.id)}Contenido" class="rp-modal__cuerpo">${o.contenidoHTML || ""}</div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector(".rp-modal__cerrar").addEventListener("click", () => {
        overlay.hidden = true;
      });
      overlay.addEventListener("click", (evento) => {
        if (evento.target === overlay) overlay.hidden = true;
      });
      vigilarOverlay(overlay, { alCerrar: o.alCerrar });
    }

    return {
      overlay,
      dialogo: overlay.querySelector(".rp-modal"),
      cuerpo: overlay.querySelector(".rp-modal__cuerpo"),
      titulo: overlay.querySelector(".rp-modal__titulo"),
      abrir: () => { overlay.hidden = false; },
      cerrar: () => { overlay.hidden = true; },
    };
  }

  // -----------------------------------------------------
  // Avisos (toast) — reemplazan alert()
  // -----------------------------------------------------

  function regionAvisos() {
    let region = document.getElementById("rpAvisos");
    if (!region) {
      region = document.createElement("div");
      region.id = "rpAvisos";
      region.className = "rp-avisos";
      document.body.appendChild(region);
    }
    return region;
  }

  /**
   * Muestra un aviso breve y no bloqueante.
   * @param {string} mensaje
   * @param {{tipo?: "info"|"exito"|"error", duracion?: number}} [opciones]
   */
  function avisarRehab(mensaje, opciones = {}) {
    const tipo = opciones.tipo || "info";
    const duracion = opciones.duracion ?? (tipo === "error" ? 7000 : 4500);

    const aviso = document.createElement("div");
    aviso.className = `rp-aviso rp-aviso--${tipo}`;
    aviso.setAttribute("role", tipo === "error" ? "alert" : "status");
    aviso.textContent = String(mensaje ?? "");

    const cerrar = document.createElement("button");
    cerrar.type = "button";
    cerrar.className = "rp-aviso__cerrar";
    cerrar.setAttribute("aria-label", "Cerrar aviso");
    cerrar.textContent = "×";
    cerrar.addEventListener("click", () => aviso.remove());
    aviso.appendChild(cerrar);

    regionAvisos().appendChild(aviso);
    if (duracion > 0) setTimeout(() => aviso.remove(), duracion);
    return aviso;
  }

  // -----------------------------------------------------
  // Confirmar / pedir texto — reemplazan confirm() y prompt()
  // -----------------------------------------------------

  let contadorDialogos = 0;

  function dialogoPromesa(construir) {
    return new Promise((resolve) => {
      const n = ++contadorDialogos;
      const overlay = document.createElement("div");
      overlay.className = "rp-overlay rp-overlay--dialogo";
      overlay.hidden = true;
      overlay.innerHTML = construir(n);
      document.body.appendChild(overlay);

      const terminar = (valor) => {
        if (terminado) return;
        terminado = true;
        overlay.hidden = true;
        setTimeout(() => overlay.remove(), 0);
        resolve(valor);
      };
      let terminado = false;

      // Cerrar con Esc o clic fuera cuenta como cancelar.
      vigilarOverlay(overlay, { alCerrar: () => terminar(null) });
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) terminar(null);
      });

      overlay.hidden = false;
      construir.enlazar && construir.enlazar(overlay, terminar);
    });
  }

  /**
   * Pide confirmación. Resuelve true si acepta, false si cancela o cierra.
   * @param {{titulo?:string, mensaje?:string, detalleHTML?:string, aceptar?:string, cancelar?:string, peligro?:boolean, icono?:string}} o
   * @returns {Promise<boolean>}
   */
  function confirmarRehab(o = {}) {
    const construir = (n) => `
      <div class="rp-modal rp-modal--dialogo" role="alertdialog" aria-modal="true"
           aria-labelledby="rpDlgTitulo${n}" aria-describedby="rpDlgTexto${n}" style="--rp-ancho:440px">
        ${o.icono ? `<div class="rp-modal__icono rp-modal__icono--grande" aria-hidden="true">${escaparHTML(o.icono)}</div>` : ""}
        <h2 id="rpDlgTitulo${n}" class="rp-modal__titulo">${escaparHTML(o.titulo || "¿Continuar?")}</h2>
        <p id="rpDlgTexto${n}" class="rp-dialogo__texto">${escaparHTML(o.mensaje || "")}</p>
        ${o.detalleHTML ? `<div class="rp-dialogo__detalle">${o.detalleHTML}</div>` : ""}
        <div class="rp-dialogo__acciones">
          <button type="button" class="rp-btn rp-btn--sec" data-rp="cancelar">${escaparHTML(o.cancelar || "Cancelar")}</button>
          <button type="button" class="rp-btn ${o.peligro ? "rp-btn--peligro" : ""}" data-rp="aceptar">${escaparHTML(o.aceptar || "Aceptar")}</button>
        </div>
      </div>`;
    construir.enlazar = (overlay, terminar) => {
      overlay.querySelector('[data-rp="cancelar"]').addEventListener("click", () => terminar(null));
      overlay.querySelector('[data-rp="aceptar"]').addEventListener("click", () => terminar(true));
      // Por seguridad el foco inicial va al botón "Cancelar" en acciones destructivas.
      requestAnimationFrame(() =>
        overlay.querySelector(o.peligro ? '[data-rp="cancelar"]' : '[data-rp="aceptar"]')?.focus()
      );
    };
    return dialogoPromesa(construir).then((v) => v === true);
  }

  /**
   * Pide un texto. Resuelve con el texto (recortado) o null si cancela.
   * @param {{titulo?:string, mensaje?:string, etiqueta?:string, valor?:string, placeholder?:string, aceptar?:string, cancelar?:string, maxLongitud?:number, inputMode?:string, validar?:(texto:string)=>string|null}} o
   * @returns {Promise<string|null>}
   */
  function pedirTextoRehab(o = {}) {
    const construir = (n) => `
      <form class="rp-modal rp-modal--dialogo" role="dialog" aria-modal="true"
            aria-labelledby="rpDlgTitulo${n}" style="--rp-ancho:440px" novalidate>
        <h2 id="rpDlgTitulo${n}" class="rp-modal__titulo">${escaparHTML(o.titulo || "Escribe un valor")}</h2>
        ${o.mensaje ? `<p class="rp-dialogo__texto">${escaparHTML(o.mensaje)}</p>` : ""}
        <label class="rp-campo" for="rpDlgCampo${n}">
          <span>${escaparHTML(o.etiqueta || "")}</span>
          <input id="rpDlgCampo${n}" type="text" autocomplete="off"
                 value="${escaparHTML(o.valor || "")}"
                 placeholder="${escaparHTML(o.placeholder || "")}"
                 ${o.maxLongitud ? `maxlength="${Number(o.maxLongitud)}"` : ""}
                 ${o.inputMode ? `inputmode="${escaparHTML(o.inputMode)}"` : ""}>
        </label>
        <p class="rp-campo__error" id="rpDlgError${n}" role="alert" hidden></p>
        <div class="rp-dialogo__acciones">
          <button type="button" class="rp-btn rp-btn--sec" data-rp="cancelar">${escaparHTML(o.cancelar || "Cancelar")}</button>
          <button type="submit" class="rp-btn" data-rp="aceptar">${escaparHTML(o.aceptar || "Aceptar")}</button>
        </div>
      </form>`;
    construir.enlazar = (overlay, terminar) => {
      const form = overlay.querySelector("form");
      const campo = overlay.querySelector("input");
      const error = overlay.querySelector(".rp-campo__error");
      overlay.querySelector('[data-rp="cancelar"]').addEventListener("click", () => terminar(null));
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const texto = campo.value.trim();
        const problema = typeof o.validar === "function" ? o.validar(texto) : null;
        if (problema) {
          error.textContent = problema;
          error.hidden = false;
          campo.setAttribute("aria-invalid", "true");
          campo.setAttribute("aria-describedby", error.id);
          campo.focus();
          return;
        }
        terminar(texto);
      });
      requestAnimationFrame(() => {
        campo.focus();
        campo.select();
      });
    };
    return dialogoPromesa(construir);
  }

  const API = { modalRehab, vigilarOverlay, avisarRehab, confirmarRehab, pedirTextoRehab };
  Object.assign(raiz, API);
  raiz.RehabUI = API;
})(typeof window !== "undefined" ? window : globalThis);
