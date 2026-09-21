// =====================================================
// REHABPOD — ASISTENTE DE RUTINAS A MEDIDA
//
// Sustituye al antiguo "Recomiéndame una rutina" (que devolvía siempre el
// mismo modo). Ahora el usuario elige qué quiere mejorar (hasta 2 objetivos),
// su nivel y cuánto tiempo tiene; RehabPlan arma una rutina de varios bloques
// que suma justo ese tiempo, y este módulo la ejecuta sola: bloque → descanso
// → bloque… ajustando la dificultad según cómo le va. Al terminar ofrece
// "Otra rutina diferente".
//
// Se carga DESPUÉS de app.js: usa el motor de entrenamiento existente
// (iniciarEntrenamiento, finalizarEntrenamiento…) igual que hace V29 con las
// rutinas asignadas, pero sin nube: todo ocurre en el dispositivo.
// =====================================================

(function () {
  "use strict";

  if (typeof RehabPlan === "undefined" || typeof iniciarEntrenamiento !== "function") return;

  const P = RehabPlan;
  const CLAVE_PREFS = "rehabpodAsistentePrefs";

  const NOMBRE_DIFICULTAD = { facil: "Fácil", media: "Media", dificil: "Difícil" };
  const NOMBRE_NIVEL = { principiante: "Principiante", intermedio: "Intermedio", avanzado: "Avanzado" };
  const MINUTOS_TEXTO = { 5: "5 min", 10: "10 min", 15: "15 min", 20: "20 min", 30: "30 min" };

  // -----------------------------------------------------
  // Estado de la rutina en curso
  // -----------------------------------------------------
  const S = {
    activa: false,
    plan: null, // plan original
    bloques: [], // copia mutable (la dificultad se adapta sobre la marcha)
    indice: 0,
    resultados: [],
    inicioMs: 0,
    ajuste: 0, // −1, 0 o +1 respecto al nivel elegido
    original: null, // ajustes de la app a restaurar al terminar
    intervalo: null,
    restante: 0,
    prefs: null,
    notaVista: "",
    rutinaId: null,
  };

  // -----------------------------------------------------
  // Utilidades
  // -----------------------------------------------------
  function infoModo(modo) {
    const m = (window.REHAB_V22_MODOS || {})[modo] || {};
    return {
      icono: m.icono || "⚡",
      titulo: m.titulo || modo,
      descripcion: m.descripcion || "",
    };
  }

  function minPodsDe(modo) {
    try {
      return typeof rehabMinimoPodsModo === "function" ? rehabMinimoPodsModo(modo) : 1;
    } catch (_) {
      return 1;
    }
  }

  function leerPrefs() {
    try {
      const p = JSON.parse(localStorage.getItem(CLAVE_PREFS) || "null");
      if (p && typeof p === "object") return p;
    } catch (_) {}
    return {};
  }

  function guardarPrefs() {
    try {
      localStorage.setItem(CLAVE_PREFS, JSON.stringify(S.prefs));
    } catch (_) {}
  }

  function rolTexto(b) {
    if (b.rol === "calentamiento") return "Calentamiento";
    if (b.rol === "reto") return "Reto final";
    return "Entrenamiento · " + (P.OBJETIVOS[b.objetivo]?.titulo || "");
  }

  function historialPerfil() {
    try {
      return obtenerPerfilActivo()?.historial || [];
    } catch (_) {
      return [];
    }
  }

  function modosDe(plan) {
    return plan.bloques.map((b) => b.modo);
  }

  function generar(evitar) {
    return P.generarPlan({
      minutos: S.prefs.minutos,
      objetivos: S.prefs.objetivos,
      nivel: S.prefs.nivel,
      evitar: evitar || [],
      minPods: minPodsDe,
      podsDisponibles: 4,
    });
  }

  // -----------------------------------------------------
  // Ventana del asistente (formulario y vista previa)
  // -----------------------------------------------------
  function ventanaAsistente() {
    return modalRehab({
      id: "asistente",
      titulo: "Tu rutina a medida",
      eyebrow: "ASISTENTE",
      icono: "🎯",
      ancho: 520,
      clase: "asis-modal",
      z: "calc(var(--z-modal) + 9)", // por encima del indicador de sincronización y la campana
    });
  }

  function enfocarTitulo(v) {
    v.titulo.setAttribute("tabindex", "-1");
    v.titulo.focus({ preventScroll: true });
    v.cuerpo.scrollTop = 0;
    v.dialogo.scrollTop = 0;
  }

  function abrirFormulario() {
    const v = ventanaAsistente();
    S.prefs = Object.assign({ objetivos: [], nivel: "intermedio", minutos: 5 }, leerPrefs());
    if (!Array.isArray(S.prefs.objetivos)) S.prefs.objetivos = [];
    S.prefs.objetivos = S.prefs.objetivos.filter((k) => P.OBJETIVOS[k]).slice(0, 2);
    if (!P.MINUTOS_VALIDOS.includes(Number(S.prefs.minutos))) S.prefs.minutos = 5;

    const sugerido = P.nivelSugerido(historialPerfil());
    const nivelInicial = sugerido || (P.NIVELES.includes(S.prefs.nivel) ? S.prefs.nivel : "intermedio");

    const objetivos = Object.entries(P.OBJETIVOS)
      .map(
        ([clave, o]) => `
        <label class="asis-op">
          <input type="checkbox" name="asisObjetivo" value="${clave}" ${S.prefs.objetivos.includes(clave) ? "checked" : ""}>
          <span class="asis-op__txt"><b>${o.icono} ${escaparHTML(o.titulo)}</b><small>${escaparHTML(o.descripcion)}</small></span>
        </label>`
      )
      .join("");

    const niveles = P.NIVELES.map(
      (n) => `
        <label class="asis-op asis-op--centro">
          <input type="radio" name="asisNivel" value="${n}" ${n === nivelInicial ? "checked" : ""}>
          <span class="asis-op__txt"><b>${NOMBRE_NIVEL[n]}</b>${n === sugerido ? "<small>Sugerido</small>" : ""}</span>
        </label>`
    ).join("");

    const tiempos = P.MINUTOS_VALIDOS.map(
      (m) => `
        <label class="asis-op asis-op--centro">
          <input type="radio" name="asisMinutos" value="${m}" ${m === Number(S.prefs.minutos) ? "checked" : ""}>
          <span class="asis-op__txt"><b>${MINUTOS_TEXTO[m]}</b></span>
        </label>`
    ).join("");

    v.titulo.textContent = "Tu rutina a medida";
    v.cuerpo.innerHTML = `
      <p class="asis-intro">Te armamos una rutina con varios ejercicios que suma justo el tiempo que tienes.</p>

      <fieldset class="asis-grupo">
        <legend>1. ¿Qué quieres mejorar? <small>Elige hasta 2</small></legend>
        <div class="asis-lista">${objetivos}</div>
      </fieldset>

      <fieldset class="asis-grupo">
        <legend>2. ¿Cuál es tu nivel?</legend>
        <div class="asis-fila asis-fila--3">${niveles}</div>
        ${sugerido ? `<p class="asis-nota">Según tus últimas sesiones te sugerimos <b>${NOMBRE_NIVEL[sugerido]}</b>.</p>` : ""}
      </fieldset>

      <fieldset class="asis-grupo">
        <legend>3. ¿Cuánto tiempo tienes?</legend>
        <div class="asis-fila asis-fila--5">${tiempos}</div>
      </fieldset>

      <p id="asisError" class="asis-error" role="alert"></p>
      <p class="asis-nota">Si trabajas una condición médica específica, vincúlate también con un profesional (Cuenta → Vincular): esta rutina es una guía general.</p>

      <div class="asis-acciones">
        <button type="button" id="asisArmar" class="boton botonPrincipal">Armar mi rutina</button>
      </div>
    `;

    const error = v.cuerpo.querySelector("#asisError");
    const marcados = () => [...v.cuerpo.querySelectorAll('input[name="asisObjetivo"]:checked')];

    v.cuerpo.querySelectorAll('input[name="asisObjetivo"]').forEach((input) => {
      input.addEventListener("change", () => {
        if (marcados().length > 2) {
          input.checked = false;
          error.textContent = "Puedes elegir hasta 2 objetivos. Quita uno para elegir otro.";
        } else {
          error.textContent = "";
        }
      });
    });

    v.cuerpo.querySelector("#asisArmar").addEventListener("click", () => {
      const elegidos = marcados().map((i) => i.value);
      if (!elegidos.length) {
        error.textContent = "Elige al menos un objetivo para armar tu rutina.";
        return;
      }
      S.prefs = {
        objetivos: elegidos,
        nivel: v.cuerpo.querySelector('input[name="asisNivel"]:checked').value,
        minutos: Number(v.cuerpo.querySelector('input[name="asisMinutos"]:checked').value),
      };
      guardarPrefs();
      mostrarVistaPrevia(generar(), "");
    });

    v.abrir();
    enfocarTitulo(v);
  }

  function filaBloqueHTML(b, i) {
    const m = infoModo(b.modo);
    return `
      <li class="asis-bloque">
        <span class="asis-bloque__n" aria-hidden="true">${i + 1}</span>
        <span class="asis-bloque__txt">
          <b>${m.icono} ${escaparHTML(m.titulo)}</b>
          <small>${escaparHTML(rolTexto(b))} · ${NOMBRE_DIFICULTAD[b.dificultad] || b.dificultad}</small>
        </span>
        <span class="asis-bloque__t">${escaparHTML(formatoDuracionLarga(b.segundos))}</span>
      </li>`;
  }

  /**
   * opciones: { fija: true } para una rutina guardada (sin "Otra propuesta"),
   * titulo, id (de la rutina guardada), alVolver (función del botón Volver).
   */
  function mostrarVistaPrevia(plan, nota, opciones) {
    const op = opciones || {};
    const v = ventanaAsistente();
    S.plan = plan;
    S.notaVista = nota || "";
    S.rutinaId = op.id || null;
    const objetivos = plan.objetivos.map((k) => P.OBJETIVOS[k].titulo).join(" + ");
    const puedeGuardar = !op.fija && window.rehabRutinas;

    v.titulo.textContent = op.titulo || "Tu rutina de " + plan.minutos + " min";
    v.cuerpo.innerHTML = `
      <p class="asis-intro"><b>${escaparHTML(objetivos)}</b> · nivel ${NOMBRE_NIVEL[plan.nivel]}</p>
      ${nota ? `<p class="asis-nota asis-nota--resalta" role="status">${escaparHTML(nota)}</p>` : ""}
      <ol class="asis-bloques" aria-label="Ejercicios de la rutina">
        ${plan.bloques.map(filaBloqueHTML).join("")}
      </ol>
      <p class="asis-nota">${plan.bloques.length} ejercicios seguidos, con ${plan.descanso} s de descanso entre ellos. Si te va muy bien o muy mal, ajustamos la dificultad del siguiente.</p>
      <label class="asis-op asis-op--virtual">
        <input type="checkbox" id="asisVirtual" ${virtualSugerido() ? "checked" : ""}>
        <span class="asis-op__txt"><b>Usar Pods simulados</b><small>Sin Pods físicos: tocas los Pods en la pantalla del teléfono.</small></span>
      </label>
      <p id="asisAvisoPods" class="asis-error" role="alert"></p>
      <div class="asis-acciones">
        <button type="button" id="asisComenzar" class="boton botonPrincipal">Comenzar rutina</button>
        ${op.fija ? "" : `<button type="button" id="asisOtra" class="boton botonOscuro">Otra propuesta</button>`}
        ${puedeGuardar ? `<button type="button" id="asisGuardar" class="boton botonOscuro"></button>` : ""}
        <button type="button" id="asisVolver" class="boton botonOscuro">${op.fija ? "Volver a mis rutinas" : "Cambiar preferencias"}</button>
      </div>
    `;

    v.cuerpo.querySelector("#asisComenzar").addEventListener("click", () => {
      const virtual = v.cuerpo.querySelector("#asisVirtual").checked;
      comenzar(plan, virtual, v.cuerpo.querySelector("#asisAvisoPods"));
    });
    const otra = v.cuerpo.querySelector("#asisOtra");
    if (otra) otra.addEventListener("click", () => mostrarVistaPrevia(generar(modosDe(plan)), ""));
    const guardar = v.cuerpo.querySelector("#asisGuardar");
    if (guardar) window.rehabRutinas.enlazarBotonGuardar(guardar, plan);
    v.cuerpo.querySelector("#asisVolver").addEventListener("click", op.fija && op.alVolver ? op.alVolver : abrirFormulario);

    v.abrir();
    enfocarTitulo(v);
  }

  // -----------------------------------------------------
  // Ventana de la rutina en curso (sin cerrar accidental)
  // -----------------------------------------------------
  function ventanaEjecucion() {
    let ov = document.getElementById("asisEjecOverlay");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "asisEjecOverlay";
      ov.className = "rp-overlay";
      ov.hidden = true;
      ov.style.setProperty("--rp-z", "calc(var(--z-modal) + 10)");
      ov.innerHTML = `
        <div class="rp-modal asis-modal asis-ejec" role="dialog" aria-modal="true"
             aria-labelledby="asisEjecTitulo" style="--rp-ancho:480px">
          <h2 id="asisEjecTitulo" class="rp-modal__titulo" tabindex="-1"></h2>
          <div id="asisEjecCuerpo"></div>
        </div>`;
      document.body.appendChild(ov);
      // La rutina no se descarta con Esc ni tocando fuera: solo con "Cancelar".
      vigilarOverlay(ov, { cerrarConEsc: false });
    }
    return {
      ov,
      titulo: ov.querySelector("#asisEjecTitulo"),
      cuerpo: ov.querySelector("#asisEjecCuerpo"),
      abrir() {
        ov.hidden = false;
      },
      cerrar() {
        ov.hidden = true;
      },
    };
  }

  /** Avisa a otros módulos (voz, compartir, metas) sin acoplarlos a este archivo. */
  function emitir(tipo, detalle) {
    try {
      document.dispatchEvent(new CustomEvent("rehabpod:rutina", { detail: Object.assign({ tipo }, detalle) }));
    } catch (_) {}
  }

  function detenerIntervalo() {
    if (S.intervalo) clearInterval(S.intervalo);
    S.intervalo = null;
  }

  function barraProgreso(i, total) {
    const pct = Math.round((i / total) * 100);
    return `<div class="asis-progreso" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${i}" aria-label="Progreso de la rutina"><span style="width:${pct}%"></span></div>`;
  }

  /**
   * Pantalla entre bloques: en el primero "Prepárate", en los demás el descanso.
   * Cuenta atrás y arranca sola el siguiente bloque.
   */
  function mostrarTransicion(i, previo, nota) {
    const b = S.bloques[i];
    const m = infoModo(b.modo);
    const primera = i === 0;
    const segundos = primera ? 5 : S.plan.descanso;
    const w = ventanaEjecucion();

    w.titulo.textContent = primera ? "Prepárate" : "Descanso";
    w.cuerpo.innerHTML = `
      <div class="asis-eyebrow">EJERCICIO ${i + 1} DE ${S.bloques.length} · ${escaparHTML(rolTexto(b).toUpperCase())}</div>
      ${barraProgreso(i, S.bloques.length)}
      ${
        previo
          ? `<p class="asis-previo">Ejercicio anterior: <b>${previo.aciertos}</b> aciertos · <b>${previo.errores}</b> errores${previo.precision === null ? "" : ` · ${Math.round(previo.precision * 100)} %`}</p>`
          : ""
      }
      ${nota ? `<p class="asis-nota asis-nota--resalta" role="status">${escaparHTML(nota)}</p>` : ""}
      <div class="asis-siguiente">
        <div class="asis-siguiente__icono" aria-hidden="true">${m.icono}</div>
        <div>
          <b>${escaparHTML(m.titulo)}</b>
          <small>${NOMBRE_DIFICULTAD[b.dificultad] || b.dificultad} · ${escaparHTML(formatoDuracionLarga(b.segundos))}</small>
        </div>
      </div>
      <p class="asis-desc">${escaparHTML(m.descripcion)}</p>
      <div class="asis-cuenta" id="asisCuenta" aria-hidden="true">${segundos}</div>
      <p class="asis-nota" id="asisCuentaTexto">${primera ? "Empieza en" : "Siguiente ejercicio en"} <span id="asisCuentaNum">${segundos}</span> s</p>
      <div class="asis-acciones">
        <button type="button" id="asisYa" class="boton botonPrincipal">${primera ? "Empezar ya" : "Saltar descanso"}</button>
        <button type="button" id="asisCancelar" class="boton botonOscuro">Cancelar rutina</button>
      </div>
    `;
    w.abrir();
    w.titulo.focus({ preventScroll: true });
    emitir("transicion", { primera, titulo: w.titulo.textContent, ejercicio: m.titulo, numero: i + 1, total: S.bloques.length, nota });

    S.restante = segundos;
    const pintar = () => {
      const c = document.getElementById("asisCuenta");
      const n = document.getElementById("asisCuentaNum");
      if (c) c.textContent = String(S.restante);
      if (n) n.textContent = String(S.restante);
    };

    const arrancar = () => {
      detenerIntervalo();
      S.intervalo = setInterval(() => {
        S.restante--;
        pintar();
        if (S.restante <= 0) {
          detenerIntervalo();
          comenzarBloque(i);
        }
      }, 1000);
    };
    arrancar();

    document.getElementById("asisYa").onclick = () => {
      detenerIntervalo();
      comenzarBloque(i);
    };

    document.getElementById("asisCancelar").onclick = async () => {
      detenerIntervalo(); // la cuenta se pausa mientras se decide
      const seguro = await confirmarRehab({
        titulo: "Cancelar rutina",
        mensaje: "¿Quieres detener la rutina? Los ejercicios ya terminados quedan guardados en tu historial.",
        aceptar: "Sí, detener",
        cancelar: "Seguir",
        peligro: true,
      });
      if (seguro) abortar("Rutina detenida.");
      else if (S.activa) arrancar();
    };
  }

  // -----------------------------------------------------
  // Motor: configurar y lanzar un bloque
  // -----------------------------------------------------
  function asegurarOpcion(select, valor, etiqueta) {
    if (!select) return;
    valor = String(valor);
    if (![...select.options].some((o) => o.value === valor)) {
      const op = document.createElement("option");
      op.value = valor;
      op.textContent = etiqueta;
      op.dataset.asis = "1";
      select.appendChild(op);
    }
    select.value = valor;
  }

  function configurarBloque(b) {
    modoActual = b.modo;
    ajustesApp.dificultad = b.dificultad;
    dificultadActual = b.dificultad;
    try {
      guardarAjustes();
    } catch (_) {}

    try {
      configurarModo();
    } catch (error) {
      console.warn("Asistente: configurarModo", error);
    }

    const tipo = document.getElementById("tipoFinalGeneralReactiPod");
    if (tipo) tipo.value = "tiempo";
    asegurarOpcion(document.getElementById("duracionGeneralReactiPod"), b.segundos, `${b.segundos} segundos`);

    if (b.modo === "contrarreloj") {
      asegurarOpcion(document.getElementById("duracionContrarrelojReactiPod"), b.segundos, `${b.segundos} segundos`);
    }

    let disponibles = 4;
    try {
      disponibles = rehabIndicesPodsConectados().length || cantidadConectados();
    } catch (_) {}
    cantidadPodsSeleccionada = Math.max(minPodsDe(b.modo), Math.min(4, disponibles));
    const selectorCantidad = document.getElementById("cantidadPodsEntrenamientoRehabPod");
    if (selectorCantidad) selectorCantidad.value = String(cantidadPodsSeleccionada);

    try {
      pintarControlesExperiencia();
    } catch (_) {}
  }

  function comenzarBloque(i) {
    if (!S.activa) return;
    const w = ventanaEjecucion();
    w.cerrar();
    try {
      configurarBloque(S.bloques[i]);
      iniciarEntrenamiento();
      if (!entrenamientoActivo) throw new Error("No se pudo iniciar el ejercicio.");
    } catch (error) {
      console.error("Asistente: iniciar bloque", error);
      abortar("No se pudo continuar la rutina. Revisa que los Pods sigan conectados.", "error");
    }
  }

  function guardarOriginal() {
    S.original = {
      dificultad: ajustesApp.dificultad,
      tipo: document.getElementById("tipoFinalGeneralReactiPod")?.value,
      cantidad: cantidadPodsSeleccionada,
      virtual: !!rehabModoVirtual,
    };
  }

  /** Enciende o apaga los Pods simulados igual que el interruptor de Ajustes. */
  function fijarVirtual(valor) {
    if (!!rehabModoVirtual === !!valor) return;
    rehabModoVirtual = !!valor;
    try {
      localStorage.setItem(REHABPOD_CLAVE_MODO_VIRTUAL, rehabModoVirtual ? "true" : "false");
    } catch (_) {}
    try {
      rehabActualizarModoVirtual();
      rehabActualizarControlCantidadPods();
      rehabActualizarVisualesPodsActivos();
      actualizarEstadoGeneralPods();
    } catch (error) {
      console.error("Asistente: Pods simulados", error);
    }
  }

  /** Por defecto se sugieren Pods simulados si no hay 4 Pods físicos. */
  function virtualSugerido() {
    return !!rehabModoVirtual || cantidadConectados() < 4;
  }

  function restaurar() {
    const o = S.original;
    if (o) {
      ajustesApp.dificultad = o.dificultad;
      dificultadActual = o.dificultad || "media";
      try {
        guardarAjustes();
      } catch (_) {}
      const tipo = document.getElementById("tipoFinalGeneralReactiPod");
      if (tipo && o.tipo) tipo.value = o.tipo;
      cantidadPodsSeleccionada = o.cantidad;
      fijarVirtual(o.virtual);
    }
    document.querySelectorAll("option[data-asis]").forEach((op) => op.remove());
    S.original = null;
    try {
      pintarControlesExperiencia();
    } catch (_) {}
  }

  function comenzar(plan, virtual, aviso) {
    if (!virtual && cantidadConectados() < 4) {
      const msg = "No encontramos los 4 Pods. Enciéndelos y acércalos al teléfono, o marca «Usar Pods simulados».";
      if (aviso) aviso.textContent = msg;
      avisarRehab(msg, { tipo: "error" });
      return;
    }
    if (aviso) aviso.textContent = "";
    ventanaAsistente().cerrar();
    emitir("inicio", { rutinaId: S.rutinaId || null });
    iniciarPlan(plan, { virtual: !!virtual });
  }

  /** Arranca la ejecución de un plan (también lo usan las pruebas). */
  function iniciarPlan(plan, opciones) {
    S.plan = plan;
    S.bloques = plan.bloques.map((b) => Object.assign({}, b, { dificultadPlan: b.dificultad }));
    S.indice = 0;
    S.resultados = [];
    S.ajuste = 0;
    S.inicioMs = Date.now();
    S.activa = true;
    guardarOriginal();
    if (opciones && opciones.virtual) fijarVirtual(true);
    mostrarTransicion(0, null, "");
  }

  function abortar(mensaje, tipo) {
    if (!S.activa && !S.original) return;
    S.activa = false;
    detenerIntervalo();
    ventanaEjecucion().cerrar();
    restaurar();
    emitir("cancelada", { mensaje: mensaje || "" });
    if (mensaje) avisarRehab(mensaje, { tipo: tipo || "info" });
    try {
      mostrarPantalla(pantallaInicio);
    } catch (_) {}
  }

  // -----------------------------------------------------
  // Fin de cada bloque (se intercepta el fin del motor)
  // -----------------------------------------------------
  const mostrarIntroBase = mostrarIntroduccionEntrenamiento;
  mostrarIntroduccionEntrenamiento = function () {
    // En una rutina guiada no se repite la explicación: ya se vio en "Prepárate".
    if (S.activa) {
      iniciarCuenta();
      return;
    }
    return mostrarIntroBase.apply(this, arguments);
  };

  const finalizarBase = finalizarEntrenamiento;
  finalizarEntrenamiento = async function () {
    if (!S.activa || !entrenamientoActivo || finalizacionEnCursoV12) {
      return finalizarBase.apply(this, arguments);
    }

    const b = S.bloques[S.indice];

    // La celebración se reserva para el resumen final de toda la rutina.
    const celebracion = mostrarCelebracionFinal;
    try {
      mostrarCelebracionFinal = async function () {};
      await finalizarBase.apply(this, arguments);
    } finally {
      mostrarCelebracionFinal = celebracion;
    }

    const tiempos = (Array.isArray(resultados) ? resultados : [])
      .filter((r) => typeof r.tiempo === "number" && Number.isFinite(r.tiempo))
      .map((r) => r.tiempo);

    const registro = {
      modo: b.modo,
      rol: b.rol,
      dificultad: b.dificultad,
      segundos: b.segundos,
      aciertos: Number(aciertos || 0),
      errores: Number(errores || 0),
      promedio: tiempos.length ? tiempos.reduce((x, y) => x + y, 0) / tiempos.length : null,
      mejor: tiempos.length ? Math.min(...tiempos) : null,
      precision: P.precisionDe(aciertos, errores),
      sinError: P.MODOS_SIN_ERROR.includes(b.modo),
    };
    S.resultados.push(registro);
    S.indice++;

    if (!S.activa) return;

    // Adaptación: el calentamiento (más fácil a propósito) no cuenta.
    let nota = "";
    if (b.rol !== "calentamiento") {
      const delta = P.deltaNivelDeBloque(b.modo, aciertos, errores);
      const nuevo = Math.max(-1, Math.min(1, S.ajuste + delta));
      if (nuevo !== S.ajuste) {
        nota =
          nuevo > S.ajuste
            ? "¡Vas muy bien! Subimos la dificultad de los siguientes ejercicios."
            : "Bajamos un poco la dificultad de los siguientes ejercicios para que puedas afinar.";
        S.ajuste = nuevo;
      }
    }
    for (let k = S.indice; k < S.bloques.length; k++) {
      const s = S.bloques[k];
      s.dificultad = s.rol === "calentamiento" ? s.dificultadPlan : P.moverDificultad(s.dificultadPlan, S.ajuste);
    }

    if (S.indice >= S.bloques.length) {
      await terminar();
      return;
    }
    mostrarTransicion(S.indice, registro, nota);
  };

  const cancelarBase = cancelarEntrenamiento;
  cancelarEntrenamiento = async function () {
    if (!S.activa) return cancelarBase.apply(this, arguments);
    const estaba = entrenamientoActivo;
    await cancelarBase.apply(this, arguments);
    if (estaba && entrenamientoActivo) return; // dijo "No" al confirm: sigue entrenando
    abortar("Rutina detenida. Los ejercicios terminados quedaron guardados.");
  };

  // -----------------------------------------------------
  // Resumen final y "Otra rutina diferente"
  // -----------------------------------------------------
  function nivelSiguiente() {
    // Se juzga con todos los ejercicios donde se puede fallar, sin el calentamiento.
    const validos = S.resultados.filter((r) => r.rol !== "calentamiento" && !r.sinError);
    const a = validos.reduce((s, r) => s + r.aciertos, 0);
    const e = validos.reduce((s, r) => s + r.errores, 0);
    const delta = P.deltaNivel(a, e);
    const idx = P.NIVELES.indexOf(S.plan.nivel);
    const nuevo = P.NIVELES[Math.max(0, Math.min(P.NIVELES.length - 1, idx + delta))];
    return { nivel: nuevo, delta, aciertos: a, errores: e };
  }

  async function terminar() {
    S.activa = false;
    detenerIntervalo();
    restaurar();

    const totalA = S.resultados.reduce((s, r) => s + r.aciertos, 0);
    const totalE = S.resultados.reduce((s, r) => s + r.errores, 0);
    const prec = P.precisionDe(totalA, totalE);
    const mejor = S.resultados.map((r) => r.mejor).filter((x) => typeof x === "number");
    const siguiente = nivelSiguiente();
    const seg = Math.max(0, Math.round((Date.now() - S.inicioMs) / 1000));

    const w = ventanaEjecucion();
    w.titulo.textContent = "¡Rutina completada!";
    w.cuerpo.innerHTML = `
      <div class="asis-eyebrow">${S.resultados.length} EJERCICIOS · ${escaparHTML(S.plan.objetivos.map((k) => P.OBJETIVOS[k].titulo).join(" + ").toUpperCase())}</div>
      <div class="asis-resumen">
        <div><b>${escaparHTML(formatoDuracionLarga(seg))}</b><small>Tiempo total</small></div>
        <div><b>${totalA}</b><small>Aciertos</small></div>
        <div><b>${totalE}</b><small>Errores</small></div>
        <div><b>${prec === null ? "—" : Math.round(prec * 100) + " %"}</b><small>Precisión</small></div>
      </div>
      ${mejor.length ? `<p class="asis-previo">Tu mejor reacción: <b>${Math.min(...mejor).toFixed(3)} s</b></p>` : ""}
      <ul class="asis-tabla" aria-label="Resultado por ejercicio">
        ${S.resultados
          .map((r, i) => {
            const m = infoModo(r.modo);
            return `<li><span>${i + 1}. ${m.icono} ${escaparHTML(m.titulo)}</span><span>${NOMBRE_DIFICULTAD[r.dificultad] || r.dificultad} · ${r.aciertos}/${r.aciertos + r.errores}</span></li>`;
          })
          .join("")}
      </ul>
      <p class="asis-nota asis-nota--resalta" role="status">${
        siguiente.delta > 0
          ? `Lo hiciste muy bien: para la próxima te proponemos nivel <b>${NOMBRE_NIVEL[siguiente.nivel]}</b>.`
          : siguiente.delta < 0
            ? `Fue exigente: para la próxima te proponemos nivel <b>${NOMBRE_NIVEL[siguiente.nivel]}</b> y así afinas.`
            : `Buen ritmo: seguimos con nivel <b>${NOMBRE_NIVEL[siguiente.nivel]}</b>.`
      }</p>
      <div class="asis-acciones">
        <button type="button" id="asisOtraRutina" class="boton botonPrincipal">Otra rutina diferente</button>
        <button type="button" id="asisTerminar" class="boton botonOscuro">Terminar</button>
      </div>
    `;
    w.abrir();
    w.titulo.focus({ preventScroll: true });
    emitir("fin", {
      minutos: S.plan.minutos,
      objetivos: S.plan.objetivos.map((k) => P.OBJETIVOS[k].titulo).join(" + "),
      aciertos: totalA,
      errores: totalE,
      ejercicios: S.resultados.length,
      mejor: mejor.length ? Math.min(...mejor) : null,
    });

    document.getElementById("asisTerminar").onclick = () => {
      w.cerrar();
      try {
        mostrarPantalla(pantallaInicio);
        actualizarResumenInicio();
      } catch (_) {}
    };

    document.getElementById("asisOtraRutina").onclick = () => {
      const previos = modosDe(S.plan);
      S.prefs = Object.assign({}, S.prefs, { nivel: siguiente.nivel });
      guardarPrefs();
      w.cerrar();
      const plan = generar(previos);
      mostrarVistaPrevia(
        plan,
        siguiente.delta === 0
          ? "Una rutina distinta a la anterior, con el mismo objetivo y tiempo."
          : `Una rutina distinta, ahora en nivel ${NOMBRE_NIVEL[siguiente.nivel]}.`
      );
    };
  }

  // -----------------------------------------------------
  // Punto de entrada
  // -----------------------------------------------------
  const boton = document.getElementById("btnAbrirAsistenteRutinas");
  if (boton) boton.onclick = abrirFormulario;

  // Se expone para pruebas automáticas y para abrirlo desde otras pantallas.
  window.rehabAsistente = { virtual: { fijar: fijarVirtual, sugerido: virtualSugerido }, abrir: abrirFormulario, iniciarPlan, vistaPrevia: mostrarVistaPrevia, estado: S, cancelar: () => abortar("", "info") };
})();
