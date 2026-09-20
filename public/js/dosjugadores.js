// =====================================================
// REHABPOD — MODO DOS JUGADORES (interfaz)
//
// Dos formas de jugar de a dos con el mismo teléfono:
//  · POR TURNOS: los dos hacen el mismo ejercicio uno después del otro y se
//    comparan los resultados (se apoya en el asistente de rutinas).
//  · DUELO DE COLORES: cada jugador tiene su color; se encienden dos Pods y gana
//    el punto quien golpea antes el suyo. A mitad de partida se cambian los
//    colores. Pantalla dividida (la mitad de arriba se lee desde el otro lado).
//
// Las partidas de dos jugadores NO se guardan en el historial ni en el progreso
// de nadie. Reglas puras en duelo.js. Se carga DESPUÉS de app.js y asistente.js.
// =====================================================

(function () {
  "use strict";

  const D = window.RehabDuelo;
  const P = window.RehabPlan;
  const A = window.rehabAsistente;
  if (!D || !P || !A || typeof modalRehab !== "function") return;

  const V = window.RehabVoz;
  const CLAVE = "rehabpodDosJugadores";
  const Z_AJUSTES = "calc(var(--z-modal) + 9)";
  const Z_DUELO = "calc(var(--z-modal) + 11)";
  const NOMBRE_DIF = { facil: "Fácil", media: "Media", dificil: "Difícil" };
  const TINTA = "#000000"; // negro sobre cualquier color de jugador: contraste ≥ 4.5

  const T = { segundosTurno: 0, cuenta: 800, esperaMin: 1000, esperaMax: 3000, limite: D.LIMITE_RONDA_MS, pausa: 1400, avisoCambio: 2400, ...(window.__rehabDueloTiempos || {}) };

  const api = { activo: false, estado: null, tiempos: T, config: null };
  window.rehabDosJugadores = api;

  const hablar = (t) => (V ? V.hablar(t) : false);
  const pitido = (f, d) => {
    try {
      if (typeof prepararAudio === "function") prepararAudio();
      if (typeof tono === "function") tono(f, d);
    } catch (_) {}
  };
  const ahoraMs = () => (window.performance && performance.now ? performance.now() : Date.now());

  // -----------------------------------------------------
  // Configuración guardada
  // -----------------------------------------------------
  function modosUsables() {
    const defs = window.REHAB_V22_MODOS || {};
    return Object.keys(P.APTITUD).filter((k) => defs[k]).map((k) => ({ clave: k, titulo: defs[k].titulo || k, icono: defs[k].icono || "⚡" }));
  }

  function nombrePerfil() {
    try {
      return (obtenerPerfilActivo() || {}).nombre || "Jugador 1";
    } catch (_) {
      return "Jugador 1";
    }
  }

  function leerConfig() {
    let g = {};
    try {
      g = JSON.parse(localStorage.getItem(CLAVE) || "{}") || {};
    } catch (_) {}
    const modos = modosUsables().map((m) => m.clave);
    return {
      modo: g.modo === "turnos" ? "turnos" : "duelo",
      nombres: [String(g.nombres && g.nombres[0] || nombrePerfil()).slice(0, 20), String(g.nombres && g.nombres[1] || "Jugador 2").slice(0, 20)],
      ejercicio: modos.includes(g.ejercicio) ? g.ejercicio : modos[0],
      segundos: [30, 60, 120].includes(g.segundos) ? g.segundos : 60,
      dificultad: ["facil", "media", "dificil"].includes(g.dificultad) ? g.dificultad : "media",
      rondas: D.RONDAS_VALIDAS.includes(g.rondas) ? g.rondas : 10,
      colores: [D.COLORES[g.colores && g.colores[0]] ? g.colores[0] : "red", D.COLORES[g.colores && g.colores[1]] ? g.colores[1] : "blue"],
    };
  }

  function guardarConfig(c) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(c));
    } catch (_) {}
  }

  // -----------------------------------------------------
  // Ventana de ajustes
  // -----------------------------------------------------
  function ventanaAjustes() {
    return modalRehab({ id: "dosJugadores", titulo: "Dos jugadores", eyebrow: "JUGAR DE A DOS", icono: "🤝", ancho: 520, clase: "asis-modal", z: Z_AJUSTES });
  }

  function opciones(items, actual) {
    return items.map((x) => `<option value="${escaparHTML(String(x.v))}" ${String(x.v) === String(actual) ? "selected" : ""}>${escaparHTML(x.t)}</option>`).join("");
  }

  function abrirAjustes() {
    const v = ventanaAjustes();
    const c = leerConfig();
    const modos = modosUsables();
    const coloresOp = Object.values(D.COLORES).map((k) => ({ v: k.clave, t: k.nombre }));

    v.titulo.textContent = "Dos jugadores";
    v.cuerpo.innerHTML = `
      <fieldset class="asis-grupo">
        <legend>¿Cómo quieren jugar?</legend>
        <div class="asis-lista">
          <label class="asis-op"><input type="radio" name="dosModo" value="duelo" ${c.modo === "duelo" ? "checked" : ""}>
            <span class="asis-op__txt"><b>⚔️ Duelo de colores</b><small>Cada uno su color: gana el punto quien golpea antes su Pod. A mitad cambian de color.</small></span></label>
          <label class="asis-op"><input type="radio" name="dosModo" value="turnos" ${c.modo === "turnos" ? "checked" : ""}>
            <span class="asis-op__txt"><b>🔁 Por turnos</b><small>Los dos hacen el mismo ejercicio, uno después del otro, y se comparan.</small></span></label>
        </div>
      </fieldset>

      <div class="rut-fila__campos dos-campos">
        <label><span>Nombre del jugador 1</span><input id="dosNombre0" class="dos-input" maxlength="20" value="${escaparHTML(c.nombres[0])}"></label>
        <label><span>Nombre del jugador 2</span><input id="dosNombre1" class="dos-input" maxlength="20" value="${escaparHTML(c.nombres[1])}"></label>
      </div>

      <div id="dosDueloOpc" class="rut-fila__campos dos-campos">
        <label><span>Rondas</span><select id="dosRondas">${opciones(D.RONDAS_VALIDAS.map((r) => ({ v: r, t: `${r} rondas` })), c.rondas)}</select></label>
        <label><span>Color del jugador 1</span><select id="dosColor0">${opciones(coloresOp, c.colores[0])}</select></label>
        <label><span>Color del jugador 2</span><select id="dosColor1">${opciones(coloresOp, c.colores[1])}</select></label>
      </div>

      <div id="dosTurnosOpc" class="rut-fila__campos dos-campos">
        <label><span>Ejercicio</span><select id="dosEjercicio">${opciones(modos.map((m) => ({ v: m.clave, t: `${m.icono} ${m.titulo}` })), c.ejercicio)}</select></label>
        <label><span>Duración de cada turno</span><select id="dosSegundos">${opciones([{ v: 30, t: "30 s" }, { v: 60, t: "1 min" }, { v: 120, t: "2 min" }], c.segundos)}</select></label>
        <label><span>Dificultad</span><select id="dosDificultad">${opciones(Object.entries(NOMBRE_DIF).map(([k, t]) => ({ v: k, t })), c.dificultad)}</select></label>
      </div>

      <label class="asis-op asis-op--virtual">
        <input type="checkbox" id="dosVirtual" ${A.virtual.sugerido() ? "checked" : ""}>
        <span class="asis-op__txt"><b>Usar Pods simulados</b><small>Sin Pods físicos: cada jugador toca los Pods en su mitad de la pantalla.</small></span>
      </label>

      <p class="asis-nota">Las partidas de dos jugadores no cuentan en tu progreso ni en tu historial.</p>
      <p id="dosError" class="asis-error" role="alert"></p>
      <div class="asis-acciones">
        <button type="button" id="dosEmpezar" class="boton botonPrincipal">Empezar</button>
        <button type="button" id="dosCancelar" class="boton botonOscuro">Cancelar</button>
      </div>`;

    const modoSel = () => v.cuerpo.querySelector('input[name="dosModo"]:checked').value;
    const actualizarVista = () => {
      v.cuerpo.querySelector("#dosDueloOpc").hidden = modoSel() !== "duelo";
      v.cuerpo.querySelector("#dosTurnosOpc").hidden = modoSel() !== "turnos";
    };
    v.cuerpo.querySelectorAll('input[name="dosModo"]').forEach((r) => r.addEventListener("change", actualizarVista));
    actualizarVista();

    // Los dos colores no pueden coincidir: si se repite, el otro cambia solo.
    const c0 = v.cuerpo.querySelector("#dosColor0");
    const c1 = v.cuerpo.querySelector("#dosColor1");
    const evitar = (cambiado, otro) => {
      if (cambiado.value === otro.value) otro.value = Object.keys(D.COLORES).find((k) => k !== cambiado.value);
    };
    c0.addEventListener("change", () => evitar(c0, c1));
    c1.addEventListener("change", () => evitar(c1, c0));

    v.cuerpo.querySelector("#dosCancelar").addEventListener("click", () => v.cerrar());
    v.cuerpo.querySelector("#dosEmpezar").addEventListener("click", () => {
      const nueva = {
        modo: modoSel(),
        nombres: [v.cuerpo.querySelector("#dosNombre0").value.trim() || "Jugador 1", v.cuerpo.querySelector("#dosNombre1").value.trim() || "Jugador 2"],
        ejercicio: v.cuerpo.querySelector("#dosEjercicio").value,
        segundos: Number(v.cuerpo.querySelector("#dosSegundos").value),
        dificultad: v.cuerpo.querySelector("#dosDificultad").value,
        rondas: Number(v.cuerpo.querySelector("#dosRondas").value),
        colores: [c0.value, c1.value],
      };
      const virtual = v.cuerpo.querySelector("#dosVirtual").checked;
      const error = v.cuerpo.querySelector("#dosError");
      if (!virtual) {
        const conectados = typeof cantidadConectados === "function" ? cantidadConectados() : 0;
        const necesarios = nueva.modo === "duelo" ? 2 : 4;
        if (conectados < necesarios) {
          error.textContent = `No encontramos ${necesarios === 2 ? "al menos 2 Pods" : "los 4 Pods"}. Enciéndelos y acércalos al teléfono, o marca «Usar Pods simulados».`;
          return;
        }
      }
      error.textContent = "";
      guardarConfig(nueva);
      v.cerrar();
      empezar(nueva, virtual);
    });

    v.abrir();
    v.titulo.setAttribute("tabindex", "-1");
    v.titulo.focus({ preventScroll: true });
  }

  // -----------------------------------------------------
  // Arranque y cierre comunes
  // -----------------------------------------------------
  let virtualPrevio = null;

  function prepararSesion(virtual) {
    api.activo = true;
    virtualPrevio = typeof rehabModoVirtual !== "undefined" ? !!rehabModoVirtual : false;
    if (virtual) A.virtual.fijar(true);
  }

  function terminarSesion() {
    api.activo = false;
    api.estado = null;
    if (virtualPrevio !== null) A.virtual.fijar(virtualPrevio);
    virtualPrevio = null;
    try {
      apagarTodosLosPods();
    } catch (_) {}
  }

  function empezar(cfg, virtual) {
    api.config = cfg;
    prepararSesion(virtual);
    if (cfg.modo === "duelo") duelo(cfg, virtual);
    else turnos(cfg, virtual);
  }

  // Ninguna partida de dos jugadores se guarda en el historial.
  const guardarBase = guardarEntrenamiento;
  guardarEntrenamiento = function () {
    if (api.activo) return undefined;
    return guardarBase.apply(this, arguments);
  };

  // -----------------------------------------------------
  // POR TURNOS
  // -----------------------------------------------------
  let turno = null; // { cfg, virtual, jugador, resultados:[] }

  function planTurno(cfg) {
    return {
      minutos: Math.max(1, Math.round(cfg.segundos / 60)),
      objetivos: [window.RehabRutinas ? window.RehabRutinas.objetivoDeModo(cfg.ejercicio) : "reaccion"],
      nivel: "intermedio",
      descanso: 10,
      totalSegundos: T.segundosTurno || cfg.segundos,
      bloques: [{ modo: cfg.ejercicio, rol: "principal", objetivo: window.RehabRutinas ? window.RehabRutinas.objetivoDeModo(cfg.ejercicio) : "reaccion", dificultad: cfg.dificultad, segundos: T.segundosTurno || cfg.segundos }],
    };
  }

  function ventanaTurno() {
    return modalRehab({ id: "dosTurno", titulo: "Turno", eyebrow: "DOS JUGADORES", icono: "🔁", ancho: 460, clase: "asis-modal", z: "calc(var(--z-modal) + 12)" });
  }

  function mostrarAvisoTurno() {
    const v = ventanaTurno();
    const { cfg, jugador } = turno;
    const modo = (window.REHAB_V22_MODOS || {})[cfg.ejercicio] || {};
    v.titulo.textContent = `Turno de ${cfg.nombres[jugador]}`;
    v.cuerpo.innerHTML = `
      <p class="asis-intro"><b>${escaparHTML(modo.icono || "")} ${escaparHTML(modo.titulo || cfg.ejercicio)}</b> · ${escaparHTML(NOMBRE_DIF[cfg.dificultad])} · ${cfg.segundos >= 60 ? cfg.segundos / 60 + " min" : cfg.segundos + " s"}</p>
      ${
        jugador === 1
          ? `<p class="asis-nota asis-nota--resalta" role="status">${escaparHTML(cfg.nombres[0])} ya terminó: hizo ${turno.resultados[0].aciertos} aciertos. ¡Ahora te toca superarlo!</p>`
          : `<p class="asis-nota">Entrega el teléfono y los Pods a ${escaparHTML(cfg.nombres[jugador])}. Cuando esté listo, pulsa «Empezar».</p>`
      }
      <div class="asis-acciones">
        <button type="button" id="dosTurnoIr" class="boton botonPrincipal">Empezar turno</button>
        <button type="button" id="dosTurnoSalir" class="boton botonOscuro">Cancelar partida</button>
      </div>`;
    v.cuerpo.querySelector("#dosTurnoIr").addEventListener("click", () => {
      v.cerrar();
      hablar(`Turno de ${cfg.nombres[jugador]}`);
      A.iniciarPlan(planTurno(cfg), { virtual: turno.virtual });
    });
    v.cuerpo.querySelector("#dosTurnoSalir").addEventListener("click", () => {
      v.cerrar();
      turno = null;
      terminarSesion();
    });
    v.abrir();
    v.titulo.setAttribute("tabindex", "-1");
    v.titulo.focus({ preventScroll: true });
  }

  function turnos(cfg, virtual) {
    turno = { cfg, virtual, jugador: 0, resultados: [] };
    mostrarAvisoTurno();
  }

  function compararTurnos(a, b) {
    if (a.aciertos !== b.aciertos) return a.aciertos > b.aciertos ? 0 : 1;
    if (typeof a.promedio === "number" && typeof b.promedio === "number" && a.promedio !== b.promedio) return a.promedio < b.promedio ? 0 : 1;
    return null;
  }

  function textoResultadoTurnos(cfg, res, ganador) {
    const modo = (window.REHAB_V22_MODOS || {})[cfg.ejercicio] || {};
    const fila = (j) => `${cfg.nombres[j]}: ${res[j].aciertos} aciertos, ${res[j].errores} errores${typeof res[j].mejor === "number" ? `, mejor ${res[j].mejor.toFixed(3)} s` : ""}`;
    return [`🤝 Duelo por turnos en RehabPod — ${modo.titulo || cfg.ejercicio}`, fila(0), fila(1), ganador === null ? "🤝 ¡Empate!" : `🏆 Ganó ${cfg.nombres[ganador]}`, "¿Quién gana la revancha? Entrena con RehabPod."].join("\n");
  }

  function mostrarComparacionTurnos() {
    const { cfg, resultados: res } = turno;
    const ganador = compararTurnos(res[0], res[1]);
    const v = modalRehab({ id: "dosFinal", titulo: "Resultado", eyebrow: "DOS JUGADORES", icono: "🏆", ancho: 480, clase: "asis-modal", z: "calc(var(--z-modal) + 12)" });
    v.titulo.textContent = ganador === null ? "¡Empate!" : `¡Ganó ${cfg.nombres[ganador]}!`;
    const col = (j) => `
      <div class="dos-col${ganador === j ? " dos-col--gana" : ""}">
        <h3>${escaparHTML(cfg.nombres[j])}${ganador === j ? " 🏆" : ""}</h3>
        <dl>
          <dt>Aciertos</dt><dd>${res[j].aciertos}</dd>
          <dt>Errores</dt><dd>${res[j].errores}</dd>
          <dt>Precisión</dt><dd>${res[j].precision === null ? "—" : Math.round(res[j].precision * 100) + " %"}</dd>
          <dt>Promedio</dt><dd>${typeof res[j].promedio === "number" ? res[j].promedio.toFixed(3) + " s" : "—"}</dd>
          <dt>Mejor</dt><dd>${typeof res[j].mejor === "number" ? res[j].mejor.toFixed(3) + " s" : "—"}</dd>
        </dl>
      </div>`;
    v.cuerpo.innerHTML = `
      <div class="dos-cols">${col(0)}${col(1)}</div>
      <p class="asis-nota">${ganador === null ? "Igualados en aciertos y en tiempo." : "Gana quien acierta más; si empatan, quien reacciona más rápido."}</p>
      <div class="asis-acciones">
        <button type="button" id="dosRevancha" class="boton botonPrincipal">Revancha</button>
        <button type="button" id="dosCompartir" class="boton botonOscuro">Compartir por WhatsApp</button>
        <button type="button" id="dosCerrar" class="boton botonOscuro">Terminar</button>
      </div>`;
    v.cuerpo.querySelector("#dosRevancha").addEventListener("click", () => {
      v.cerrar();
      turno = { cfg, virtual: turno.virtual, jugador: 0, resultados: [] };
      mostrarAvisoTurno();
    });
    v.cuerpo.querySelector("#dosCompartir").addEventListener("click", async () => {
      if (window.RehabCompartir) {
        const r = await window.RehabCompartir.compartir(textoResultadoTurnos(cfg, res, ganador), "Duelo en RehabPod");
        if (r === "compartido" || r === "whatsapp") avisarRehab("Resultado compartido.", { tipo: "exito" });
        else if (r === "copiado") avisarRehab("Copiamos el resultado para que lo pegues.", { tipo: "info" });
        else if (r === "error") avisarRehab("No pudimos compartir el resultado.", { tipo: "error" });
      }
    });
    v.cuerpo.querySelector("#dosCerrar").addEventListener("click", () => {
      v.cerrar();
      turno = null;
      terminarSesion();
      try {
        mostrarPantalla(pantallaInicio);
      } catch (_) {}
    });
    v.abrir();
    v.titulo.setAttribute("tabindex", "-1");
    v.titulo.focus({ preventScroll: true });
    hablar(ganador === null ? "Empate" : `Gana ${cfg.nombres[ganador]}`);
  }

  document.addEventListener("rehabpod:rutina", (e) => {
    const d = e.detail || {};
    if (!api.activo || !turno) return;

    if (d.tipo === "fin") {
      const r = A.estado.resultados[0];
      // El resumen de la rutina no se muestra: pasamos directo al siguiente turno.
      const ov = document.getElementById("asisEjecOverlay");
      if (ov) ov.hidden = true;
      turno.resultados[turno.jugador] = { aciertos: r.aciertos, errores: r.errores, promedio: r.promedio, mejor: r.mejor, precision: r.precision };
      if (turno.jugador === 0) {
        turno.jugador = 1;
        mostrarAvisoTurno();
      } else {
        mostrarComparacionTurnos();
      }
    }

    if (d.tipo === "cancelada") {
      turno = null;
      terminarSesion();
    }
  });

  // -----------------------------------------------------
  // DUELO DE COLORES
  // -----------------------------------------------------
  let ui = null; // referencias del DOM del duelo
  let sesionId = 0; // se incrementa al salir: corta cualquier espera pendiente
  let pendiente = null; // resolver de la ronda en curso
  let modoVirtual = false;
  let cfgDuelo = null;

  function construirDuelo() {
    let ov = document.getElementById("dueloOverlay");
    if (ov) ov.remove();
    ov = document.createElement("div");
    ov.id = "dueloOverlay";
    ov.className = "duelo";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-labelledby", "dueloTitulo");
    ov.style.setProperty("--rp-z", Z_DUELO);
    ov.style.zIndex = "calc(var(--z-modal) + 11)";
    const mitad = (j) => `
      <section class="duelo__mitad duelo__mitad--j${j + 1}" id="dueloMitad${j}" aria-label="Jugador ${j + 1}">
        <header class="duelo__cab">
          <span class="duelo__quien"><b class="duelo__nombre"></b><span class="duelo__color"><i class="duelo__muestra"></i><span class="duelo__colortxt"></span></span></span>
          <output class="duelo__puntos" aria-label="Puntos">0</output>
        </header>
        <div class="duelo__estado" data-fase="espera" role="status" aria-live="polite">Prepárate</div>
        <div class="duelo__pods" ${modoVirtual ? "" : "hidden"}>
          ${[0, 1, 2, 3].map((i) => `<button type="button" class="duelo__pod" data-pod="${i}" aria-label="Pod ${i + 1}"></button>`).join("")}
        </div>
      </section>`;
    ov.innerHTML = `
      <h2 id="dueloTitulo" class="rp-solo-lector">Duelo de colores</h2>
      ${mitad(1)}
      <div class="duelo__centro"><span id="dueloRonda">Ronda 1 de ${cfgDuelo.rondas}</span><button type="button" id="dueloSalir" class="duelo__salir">Salir</button></div>
      ${mitad(0)}`;
    document.body.appendChild(ov);
    ui = {
      ov,
      mitad: [ov.querySelector("#dueloMitad0"), ov.querySelector("#dueloMitad1")],
      ronda: ov.querySelector("#dueloRonda"),
    };
    // Tocar un Pod en pantalla: cuenta para el jugador de esa mitad.
    ui.mitad.forEach((m, j) => {
      m.querySelectorAll(".duelo__pod").forEach((b) => {
        b.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          golpe(Number(b.dataset.pod), j);
        });
        b.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            golpe(Number(b.dataset.pod), j);
          }
        });
      });
    });
    ui.ov.querySelector("#dueloSalir").addEventListener("click", salirDuelo);
  }

  function pintarJugadores() {
    const est = api.estado;
    [0, 1].forEach((j) => {
      const m = ui.mitad[j];
      const clave = est.ronda ? est.ronda.colores[j] : D.colorDe(est, j, Math.max(0, est.indice));
      const col = D.COLORES[clave];
      m.style.setProperty("--jugador", col.css);
      m.style.setProperty("--tinta", TINTA);
      m.querySelector(".duelo__nombre").textContent = est.nombres[j];
      m.querySelector(".duelo__colortxt").textContent = col.nombre;
      m.querySelector(".duelo__muestra").style.background = col.css;
    });
  }

  function pintarPuntos() {
    const r = D.resumen(api.estado);
    [0, 1].forEach((j) => {
      ui.mitad[j].querySelector(".duelo__puntos").textContent = String(r.jugadores[j].puntos);
    });
  }

  function decir(j, texto, fase) {
    const e = ui.mitad[j].querySelector(".duelo__estado");
    e.textContent = texto;
    e.dataset.fase = fase || "espera";
  }
  const decirTodos = (texto, fase) => [0, 1].forEach((j) => decir(j, texto, fase));

  function dormir(ms, id) {
    return new Promise((res) => setTimeout(() => res(id === sesionId), ms));
  }

  function encenderPods() {
    const r = api.estado.ronda;
    [0, 1].forEach((j) => {
      const col = D.COLORES[r.colores[j]];
      try {
        if (typeof enviarComandoPod === "function") enviarComandoPod(r.pods[j], col.comando);
      } catch (_) {}
      ui.mitad.forEach((m) => {
        const tile = m.querySelector(`.duelo__pod[data-pod="${r.pods[j]}"]`);
        // En la mitad de cada jugador solo se enciende SU Pod.
        if (tile && m === ui.mitad[j]) {
          tile.style.background = col.css;
          tile.style.boxShadow = `0 0 24px ${col.css}`;
          tile.dataset.encendido = "1";
        }
      });
    });
  }

  function apagarPods() {
    ui.ov.querySelectorAll(".duelo__pod").forEach((t) => {
      t.style.background = "";
      t.style.boxShadow = "";
      delete t.dataset.encendido;
    });
    try {
      apagarTodosLosPods();
    } catch (_) {}
  }

  /** Golpe desde un Pod físico (quien = undefined) o desde una mitad de pantalla. */
  function golpe(indice, quien) {
    const est = api.estado;
    if (!api.activo || !est || !pendiente) return { valido: false };
    const r = D.registrarGolpe(est, indice, ahoraMs(), quien);
    if (r.valido) {
      const fin = pendiente;
      pendiente = null;
      fin(r);
    }
    return r;
  }

  function esperarGolpe(id) {
    return new Promise((resolver) => {
      pendiente = resolver;
      setTimeout(() => {
        if (pendiente === resolver && id === sesionId) {
          pendiente = null;
          D.cerrarSinPunto(api.estado);
          resolver({ valido: false, ganador: null });
        }
      }, T.limite);
    });
  }

  // Los Pods físicos entran por procesarPulsacion (como en un entrenamiento).
  const pulsacionBase = procesarPulsacion;
  procesarPulsacion = function (indice) {
    if (api.activo && api.estado && ui && ui.ov.isConnected) {
      golpe(indice, undefined);
      return;
    }
    return pulsacionBase.apply(this, arguments);
  };

  async function cuentaAtras(id) {
    for (const n of [3, 2, 1]) {
      decirTodos(String(n), "cuenta");
      hablar(V ? V.numeroEnPalabras(n) : String(n));
      pitido(500, 100);
      if (!(await dormir(T.cuenta, id))) return false;
    }
    return true;
  }

  async function bucleDuelo(id) {
    const est = api.estado;
    if (!(await cuentaAtras(id))) return;

    for (;;) {
      const s = D.siguienteRonda(est);
      if (s.fin) break;

      if (s.cambioColor) {
        pintarJugadores();
        [0, 1].forEach((j) => decir(j, `¡Cambio de color! Ahora eres ${D.COLORES[est.ronda.colores[j]].nombre}`, "aviso"));
        hablar("¡Cambio de color!");
        pitido(700, 200);
        if (!(await dormir(T.avisoCambio, id))) return;
      }

      pintarJugadores();
      ui.ronda.textContent = `Ronda ${est.ronda.numero} de ${est.rondas}`;
      decirTodos("Atento…", "espera");
      const espera = T.esperaMin + Math.random() * (T.esperaMax - T.esperaMin);
      if (!(await dormir(espera, id))) return;

      encenderPods();
      D.abrirRonda(est, ahoraMs());
      [0, 1].forEach((j) => decir(j, "¡YA!", "ya"));
      pitido(900, 150);
      const res = await esperarGolpe(id);
      if (id !== sesionId) return;

      apagarPods();
      pintarPuntos();
      if (res.valido) {
        [0, 1].forEach((j) => decir(j, j === res.ganador ? `¡Punto! ${res.tiempo.toFixed(3)} s` : `Punto de ${est.nombres[res.ganador]}`, j === res.ganador ? "gana" : "pierde"));
        pitido(res.ganador === 0 ? 800 : 600, 120);
      } else {
        decirTodos("Nadie llegó a tiempo", "espera");
      }
      if (!(await dormir(T.pausa, id))) return;
    }

    if (id === sesionId) mostrarFinalDuelo();
  }

  function duelo(cfg, virtual) {
    cfgDuelo = cfg;
    modoVirtual = !!virtual;
    const pods = typeof rehabIndicesPodsConectados === "function" ? rehabIndicesPodsConectados() : [0, 1, 2, 3];
    let est;
    try {
      est = D.crearPartida({ rondas: cfg.rondas, colores: cfg.colores, nombres: cfg.nombres, podsDisponibles: pods });
    } catch (error) {
      avisarRehab("Para el duelo necesitas al menos 2 Pods conectados o simulados.", { tipo: "error" });
      terminarSesion();
      return;
    }
    api.estado = est;
    sesionId++;
    construirDuelo();
    pintarJugadores();
    pintarPuntos();
    ui.ov.hidden = false;
    ui.ov.querySelector("#dueloSalir").focus({ preventScroll: true });
    bucleDuelo(sesionId);
  }

  async function salirDuelo() {
    const seguro = await confirmarRehab({ titulo: "Salir del duelo", mensaje: "¿Quieres salir de la partida? Se perderá el marcador.", aceptar: "Salir", cancelar: "Seguir jugando", peligro: true });
    if (!seguro) return;
    cerrarDuelo();
  }

  function cerrarDuelo() {
    sesionId++;
    pendiente = null;
    if (ui && ui.ov) ui.ov.remove();
    ui = null;
    terminarSesion();
  }

  function textoResultadoDuelo(r, cfg) {
    const [a, b] = r.jugadores;
    return [
      "⚔️ Duelo de colores en RehabPod",
      `${a.nombre} ${a.puntos} – ${b.puntos} ${b.nombre}`,
      r.ganador === null ? "🤝 ¡Empate!" : `🏆 Ganó ${r.jugadores[r.ganador].nombre}`,
      [a, b].map((j) => (typeof j.mejor === "number" ? `⚡ ${j.nombre}: mejor ${j.mejor.toFixed(3)} s` : null)).filter(Boolean).join(" · "),
      "¿Quién gana la revancha? Entrena con RehabPod.",
    ].filter(Boolean).join("\n");
  }

  function mostrarFinalDuelo() {
    const est = api.estado;
    const cfg = cfgDuelo;
    const r = D.resumen(est);
    const ganador = r.ganador;
    apagarPods();
    if (ui && ui.ov) ui.ov.hidden = true;

    const v = modalRehab({ id: "dosFinal", titulo: "Resultado", eyebrow: "DUELO DE COLORES", icono: "🏆", ancho: 480, clase: "asis-modal", z: "calc(var(--z-modal) + 12)" });
    v.titulo.textContent = ganador === null ? "¡Empate!" : `¡Ganó ${r.jugadores[ganador].nombre}!`;
    const c1 = D.COLORES[cfg.colores[0]];
    const c2 = D.COLORES[cfg.colores[1]];
    const col = (j) => {
      const x = r.jugadores[j];
      const primera = D.COLORES[j === 0 ? cfg.colores[0] : cfg.colores[1]];
      const segunda = D.COLORES[j === 0 ? cfg.colores[1] : cfg.colores[0]];
      return `
        <div class="dos-col${ganador === j ? " dos-col--gana" : ""}">
          <h3>${escaparHTML(x.nombre)}${ganador === j ? " 🏆" : ""}</h3>
          <p class="dos-puntos" aria-label="${x.puntos} puntos">${x.puntos}</p>
          <dl>
            <dt>Con ${escaparHTML(primera.nombre)}</dt><dd>${x.porMitad[0]}</dd>
            <dt>Con ${escaparHTML(segunda.nombre)}</dt><dd>${x.porMitad[1]}</dd>
            <dt>Promedio</dt><dd>${typeof x.promedio === "number" ? x.promedio.toFixed(3) + " s" : "—"}</dd>
            <dt>Mejor</dt><dd>${typeof x.mejor === "number" ? x.mejor.toFixed(3) + " s" : "—"}</dd>
          </dl>
        </div>`;
    };
    v.cuerpo.innerHTML = `
      <div class="dos-cols">${col(0)}${col(1)}</div>
      <p class="asis-nota">${r.sinPunto ? `${r.sinPunto} ${r.sinPunto === 1 ? "ronda" : "rondas"} sin punto porque nadie llegó a tiempo. ` : ""}Los colores se intercambiaron a mitad de partida (${escaparHTML(c1.nombre)} y ${escaparHTML(c2.nombre)}).</p>
      <div class="asis-acciones">
        <button type="button" id="dosRevancha" class="boton botonPrincipal">Revancha</button>
        <button type="button" id="dosAjustes" class="boton botonOscuro">Cambiar ajustes</button>
        <button type="button" id="dosCompartir" class="boton botonOscuro">Compartir por WhatsApp</button>
        <button type="button" id="dosCerrar" class="boton botonOscuro">Terminar</button>
      </div>`;

    const cerrarTodo = () => {
      v.cerrar();
      if (ui && ui.ov) ui.ov.remove();
      ui = null;
      terminarSesion();
    };
    v.cuerpo.querySelector("#dosRevancha").addEventListener("click", () => {
      v.cerrar();
      duelo(cfg, modoVirtual);
    });
    v.cuerpo.querySelector("#dosAjustes").addEventListener("click", () => {
      cerrarTodo();
      abrirAjustes();
    });
    v.cuerpo.querySelector("#dosCompartir").addEventListener("click", async () => {
      if (!window.RehabCompartir) return;
      const res = await window.RehabCompartir.compartir(textoResultadoDuelo(r, cfg), "Duelo en RehabPod");
      if (res === "compartido" || res === "whatsapp") avisarRehab("Resultado compartido.", { tipo: "exito" });
      else if (res === "copiado") avisarRehab("Copiamos el resultado para que lo pegues.", { tipo: "info" });
      else if (res === "error") avisarRehab("No pudimos compartir el resultado.", { tipo: "error" });
    });
    v.cuerpo.querySelector("#dosCerrar").addEventListener("click", () => {
      cerrarTodo();
      try {
        mostrarPantalla(pantallaInicio);
      } catch (_) {}
    });
    v.abrir();
    v.titulo.setAttribute("tabindex", "-1");
    v.titulo.focus({ preventScroll: true });
    hablar(ganador === null ? "Empate" : `Gana ${r.jugadores[ganador].nombre}`);
  }

  // -----------------------------------------------------
  // Entrada en "Entrenamientos" (no en Inicio, para no sobrecargarlo)
  // -----------------------------------------------------
  function colocarEntrada() {
    const lista = document.getElementById("rehabV22Categorias");
    if (!lista) return;
    document.getElementById("btnDosJugadores")?.remove();
    const b = document.createElement("button");
    b.type = "button";
    b.id = "btnDosJugadores";
    b.className = "rehabV22Categoria rehabV22Categoria--dos";
    b.innerHTML = `
      <div class="rehabV22CategoriaIcono" aria-hidden="true">🤝</div>
      <div class="rehabV22CategoriaTitulo">Dos jugadores</div>
      <div class="rehabV22CategoriaSubtitulo">Reto entre dos con el mismo teléfono: por turnos o duelo de colores</div>
      <div class="rehabV22CategoriaCantidad">2 modalidades</div>`;
    b.addEventListener("click", abrirAjustes);
    lista.appendChild(b);
  }

  document.addEventListener("rehabpod:categorias", colocarEntrada);
  colocarEntrada();

  api.abrir = abrirAjustes;
  api.compararTurnos = compararTurnos;
  api.golpe = golpe;
})();
