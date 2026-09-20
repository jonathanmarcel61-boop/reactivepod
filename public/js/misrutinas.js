// =====================================================
// REHABPOD — MIS RUTINAS: GUARDADAS, FAVORITAS Y MANUALES (interfaz)
//
// Tarjeta en Inicio con las favoritas/recientes, ventana con todas las
// rutinas (iniciar, favorita, editar, duplicar, eliminar) y un constructor
// para armar rutinas a mano. Se ejecutan con el asistente (Pods físicos o
// simulados). La lógica pura está en rutinas.js.
//
// Se carga DESPUÉS de app.js y de asistente.js.
// =====================================================

(function () {
  "use strict";

  const R = window.RehabRutinas;
  const P = window.RehabPlan;
  if (!R || !P || typeof modalRehab !== "function" || !window.rehabAsistente) return;

  const Z = "calc(var(--z-modal) + 9)";
  const NOMBRE_DIF = { facil: "Fácil", media: "Media", dificil: "Difícil" };
  const fmtSeg = (s) => (s % 60 ? `${Math.floor(s / 60)} min ${s % 60} s`.replace(/^0 min /, "") : `${s / 60} min`);

  const nube = () => window.rehabRutinasNube;

  const perfilId = () => (obtenerPerfilActivo() || {}).id || "local";

  /** Modos que se pueden usar en una rutina (los que conoce el generador y la app). */
  function modosUsables() {
    const defs = window.REHAB_V22_MODOS || {};
    return Object.keys(P.APTITUD).filter((k) => defs[k]).map((k) => ({ clave: k, titulo: defs[k].titulo || k, icono: defs[k].icono || "⚡" }));
  }
  const validos = () => modosUsables().map((m) => m.clave);

  const leer = () => R.leer(perfilId(), validos());
  const guardar = (lista) => R.guardar(perfilId(), lista);

  const objetivosTexto = (plan) => plan.objetivos.map((k) => P.OBJETIVOS[k].titulo).join(" + ");

  // -----------------------------------------------------
  // Guardar desde el asistente
  // -----------------------------------------------------
  async function guardarPlan(plan, origen) {
    const lista = leer();
    const previo = lista.find((r) => R.firma(r.plan) === R.firma(R.sanearPlan(plan, validos()) || plan));
    if (previo) {
      avisarRehab(`Ya tienes esta rutina guardada como «${previo.nombre}».`, { tipo: "info" });
      return previo;
    }
    if (lista.length >= R.MAX_RUTINAS) {
      avisarRehab(`Llegaste al máximo de ${R.MAX_RUTINAS} rutinas guardadas. Elimina alguna para guardar otra.`, { tipo: "error" });
      return null;
    }
    const nombre = await pedirTextoRehab({
      titulo: "Guardar rutina",
      mensaje: "Ponle un nombre para encontrarla fácil.",
      etiqueta: "Nombre de la rutina",
      valor: R.nombreSugerido(R.sanearPlan(plan, validos()) || plan),
      maxLongitud: R.MAX_NOMBRE,
      aceptar: "Guardar",
      validar: (t) => (t ? null : "Escribe un nombre."),
    });
    if (nombre === null || nombre === undefined) return null;
    const r = R.agregar(lista, { plan, nombre, origen: origen || "asistente" }, validos());
    if (!r.rutina) {
      avisarRehab("No se pudo guardar la rutina.", { tipo: "error" });
      return null;
    }
    guardar(r.lista);
    pintarInicio();
    avisarRehab(`Rutina «${r.rutina.nombre}» guardada. Márcala con ★ en Mis rutinas para tenerla como favorita.`, { tipo: "exito", duracion: 6000 });
    return r.rutina;
  }

  function enlazarBotonGuardar(boton, plan) {
    const pintar = () => {
      const ya = leer().some((r) => R.firma(r.plan) === R.firma(R.sanearPlan(plan, validos()) || plan));
      boton.textContent = ya ? "Rutina guardada ✓" : "Guardar rutina";
      boton.disabled = ya;
    };
    pintar();
    boton.addEventListener("click", async () => {
      await guardarPlan(plan);
      pintar();
    });
  }

  // -----------------------------------------------------
  // Tarjeta de Inicio
  // -----------------------------------------------------
  function filaInicio(r) {
    const res = R.resumen(r.plan);
    return `
      <li class="rut-item rut-item--compacta" data-id="${escaparHTML(r.id)}">
        <span class="rut-estrella-fija" aria-hidden="true">${r.favorita ? "★" : ""}</span>
        <div class="rut-info"><b>${escaparHTML(r.nombre)}</b><small>${escaparHTML(res.texto)}</small></div>
        <button type="button" class="boton botonPrincipal rut-ir" data-accion="iniciar" aria-label="Iniciar ${escaparHTML(r.nombre)}">Iniciar</button>
      </li>`;
  }

  function pintarInicio() {
    const lista = document.getElementById("listaMisRutinasInicio");
    if (!lista) return;
    const todas = R.ordenar(leer());
    const vacio = document.getElementById("misRutinasVacio");
    lista.innerHTML = todas.slice(0, 3).map(filaInicio).join("");
    vacio.hidden = todas.length > 0;
    document.getElementById("btnVerMisRutinas").textContent = todas.length > 3 ? `Ver todas (${todas.length})` : "Ver y editar";
    document.getElementById("btnVerMisRutinas").hidden = !todas.length;
  }

  const resumenBase = actualizarResumenInicio;
  actualizarResumenInicio = function () {
    const r = resumenBase.apply(this, arguments);
    try {
      pintarInicio();
    } catch (e) {
      console.error("Mis rutinas", e);
    }
    return r;
  };

  // -----------------------------------------------------
  // Empezar una rutina guardada
  // -----------------------------------------------------
  function iniciar(id) {
    const r = leer().find((x) => x.id === id);
    if (!r) return;
    modalRehab({ id: "misRutinas", titulo: "Mis rutinas", ancho: 520, clase: "asis-modal", z: Z }).cerrar();
    window.rehabAsistente.vistaPrevia(JSON.parse(JSON.stringify(r.plan)), "", {
      fija: true,
      titulo: r.nombre,
      id: r.id,
      alVolver: abrirLista,
    });
  }

  document.addEventListener("rehabpod:rutina", (e) => {
    const d = e.detail || {};
    if (d.tipo === "inicio" && d.rutinaId) {
      guardar(R.registrarUso(leer(), d.rutinaId));
      pintarInicio();
    }
    if (d.tipo === "fin") {
      const plan = window.rehabAsistente.estado.plan;
      const acciones = document.querySelector("#asisEjecCuerpo .asis-acciones");
      if (plan && acciones && !document.getElementById("asisGuardarFin")) {
        const b = document.createElement("button");
        b.type = "button";
        b.id = "asisGuardarFin";
        b.className = "boton botonOscuro";
        acciones.insertBefore(b, acciones.children[1] || null);
        enlazarBotonGuardar(b, plan);
      }
    }
  });

  // -----------------------------------------------------
  // Lista completa
  // -----------------------------------------------------
  function ventanaLista() {
    return modalRehab({ id: "misRutinas", titulo: "Mis rutinas", eyebrow: "RUTINAS", icono: "⭐", ancho: 520, clase: "asis-modal", z: Z });
  }

  function filaCompleta(r) {
    const res = R.resumen(r.plan);
    const nombre = escaparHTML(r.nombre);
    return `
      <li class="rut-item" data-id="${escaparHTML(r.id)}">
        <button type="button" class="rut-estrella" data-accion="favorita" aria-pressed="${r.favorita}"
                aria-label="${r.favorita ? "Quitar de favoritas" : "Marcar como favorita"}: ${nombre}">${r.favorita ? "★" : "☆"}</button>
        <div class="rut-info"><b>${nombre}</b><small>${escaparHTML(res.texto)} · ${escaparHTML(objetivosTexto(r.plan))}${r.compartida ? ` · <span class="rut-compartida">Compartida con profesionales</span>` : ""}</small></div>
        <button type="button" class="boton botonPrincipal rut-ir" data-accion="iniciar" aria-label="Iniciar ${nombre}">Iniciar</button>
        <div class="rut-acciones">
          <button type="button" data-accion="editar" aria-label="Editar ${nombre}">Editar</button>
          <button type="button" data-accion="compartir" aria-label="${r.compartida ? "Dejar de compartir" : "Compartir con profesionales"}: ${nombre}">${r.compartida ? "Dejar de compartir" : "Compartir"}</button>
          <button type="button" data-accion="renombrar" aria-label="Cambiar nombre de ${nombre}">Nombre</button>
          <button type="button" data-accion="duplicar" aria-label="Duplicar ${nombre}">Duplicar</button>
          <button type="button" data-accion="eliminar" class="rut-peligro" aria-label="Eliminar ${nombre}">Eliminar</button>
        </div>
      </li>`;
  }

  function abrirLista() {
    const v = ventanaLista();
    const todas = R.ordenar(leer());
    v.titulo.textContent = "Mis rutinas";
    v.cuerpo.innerHTML = `
      ${
        todas.length
          ? `<ul class="rut-lista" aria-label="Rutinas guardadas">${todas.map(filaCompleta).join("")}</ul>`
          : `<p class="asis-nota">Todavía no tienes rutinas guardadas. Arma una con el asistente y pulsa «Guardar rutina», o crea una a tu manera.</p>`
      }
      <div class="asis-acciones">
        <button type="button" id="rutCrear" class="boton botonPrincipal">Crear rutina a mi manera</button>
      </div>`;
    v.cuerpo.querySelector("#rutCrear").addEventListener("click", () => abrirConstructor());
    v.cuerpo.querySelectorAll("[data-accion]").forEach((b) => {
      b.addEventListener("click", () => accion(b.dataset.accion, b.closest("[data-id]").dataset.id));
    });
    v.abrir();
    v.titulo.setAttribute("tabindex", "-1");
    v.titulo.focus({ preventScroll: true });
  }

  async function accion(que, id) {
    let lista = leer();
    const r = lista.find((x) => x.id === id);
    if (!r) return;
    if (que === "iniciar") return iniciar(id);
    if (que === "favorita") {
      guardar(R.alternarFavorita(lista, id));
      pintarInicio();
      return abrirLista();
    }
    if (que === "editar") return abrirConstructor(r);
    if (que === "compartir") {
      if (!nube()) return avisarRehab("Compartir no está disponible ahora.", { tipo: "info" });
      await nube().alternar(r);
      pintarInicio();
      return abrirLista();
    }
    if (que === "renombrar") {
      const nombre = await pedirTextoRehab({ titulo: "Cambiar nombre", etiqueta: "Nombre de la rutina", valor: r.nombre, maxLongitud: R.MAX_NOMBRE, aceptar: "Guardar", validar: (t) => (t ? null : "Escribe un nombre.") });
      if (nombre) {
        guardar(R.renombrar(lista, id, nombre));
        pintarInicio();
        if (r.compartida && nube()) nube().sincronizar(leer().find((x) => x.id === id));
      }
      return abrirLista();
    }
    if (que === "duplicar") {
      if (lista.length >= R.MAX_RUTINAS) return avisarRehab(`Máximo ${R.MAX_RUTINAS} rutinas guardadas.`, { tipo: "error" });
      const copia = { ...JSON.parse(JSON.stringify(r)), id: R.nuevoId(), nombre: R.nombreUnico(lista, `${r.nombre} (copia)`), favorita: false, usos: 0, ultimoUso: null, creada: Date.now() };
      guardar([...lista, copia]);
      pintarInicio();
      avisarRehab("Rutina duplicada.", { tipo: "exito" });
      return abrirLista();
    }
    if (que === "eliminar") {
      const seguro = await confirmarRehab({ titulo: "Eliminar rutina", mensaje: `¿Eliminar «${r.nombre}»? Esta acción no se puede deshacer.`, aceptar: "Eliminar", cancelar: "Conservar", peligro: true });
      if (seguro) {
        guardar(R.eliminar(lista, id));
        pintarInicio();
        avisarRehab("Rutina eliminada.", { tipo: "info" });
        // Si estaba compartida, también deja de verse en la biblioteca.
        if (r.compartida && nube()) nube().dejarDeCompartir(r, { silencioso: true });
      }
      return abrirLista();
    }
  }

  // -----------------------------------------------------
  // Constructor manual
  // -----------------------------------------------------
  function abrirConstructor(existente) {
    const v = modalRehab({ id: "rutinaManual", titulo: "Crear rutina", eyebrow: "RUTINAS", icono: "🛠️", ancho: 520, clase: "asis-modal", z: "calc(var(--z-modal) + 10)" });
    const modos = modosUsables();
    const filas = existente
      ? existente.plan.bloques.map((b) => ({ modo: b.modo, segundos: b.segundos, dificultad: b.dificultad }))
      : [{ modo: modos[0].clave, segundos: 60, dificultad: "media" }];
    let descanso = existente ? existente.plan.descanso : 15;

    v.titulo.textContent = existente ? "Editar rutina" : "Crear rutina";

    const opciones = (items, actual, fmt) => items.map((x) => `<option value="${x.v}" ${String(x.v) === String(actual) ? "selected" : ""}>${escaparHTML(fmt ? fmt(x) : x.t)}</option>`).join("");
    const durs = (actual) => {
      const lista = R.DURACIONES_SEG.includes(actual) ? R.DURACIONES_SEG : [...R.DURACIONES_SEG, actual].sort((a, b) => a - b);
      return opciones(lista.map((s) => ({ v: s, t: fmtSeg(s) })), actual);
    };

    function filaHTML(f, i) {
      return `
        <li class="rut-fila" data-i="${i}">
          <span class="asis-bloque__n" aria-hidden="true">${i + 1}</span>
          <div class="rut-fila__campos">
            <label><span>Ejercicio</span><select data-campo="modo">${opciones(modos.map((m) => ({ v: m.clave, t: `${m.icono} ${m.titulo}` })), f.modo)}</select></label>
            <label><span>Duración</span><select data-campo="segundos">${durs(f.segundos)}</select></label>
            <label><span>Dificultad</span><select data-campo="dificultad">${opciones(R.DIFICULTADES.map((d) => ({ v: d, t: NOMBRE_DIF[d] })), f.dificultad)}</select></label>
          </div>
          <div class="rut-fila__mover">
            <button type="button" data-mov="sube" aria-label="Subir ejercicio ${i + 1}" ${i === 0 ? "disabled" : ""}>↑</button>
            <button type="button" data-mov="baja" aria-label="Bajar ejercicio ${i + 1}" ${i === filas.length - 1 ? "disabled" : ""}>↓</button>
            <button type="button" data-mov="quita" class="rut-peligro" aria-label="Quitar ejercicio ${i + 1}" ${filas.length === 1 ? "disabled" : ""}>✕</button>
          </div>
        </li>`;
    }

    function total() {
      const seg = filas.reduce((s, f) => s + Number(f.segundos), 0) + (filas.length - 1) * descanso;
      return seg;
    }

    function dibujar(foco) {
      const nombreActual = v.cuerpo.querySelector("#rutNombre") ? v.cuerpo.querySelector("#rutNombre").value : existente ? existente.nombre : "";
      v.cuerpo.innerHTML = `
        <label class="rp-campo" for="rutNombre"><span>Nombre de la rutina</span>
          <input id="rutNombre" type="text" maxlength="${R.MAX_NOMBRE}" autocomplete="off" value="${escaparHTML(nombreActual)}" placeholder="Ej.: Mañanas suaves"></label>
        <ol class="rut-filas" aria-label="Ejercicios de la rutina">${filas.map(filaHTML).join("")}</ol>
        <button type="button" id="rutAnadir" class="boton botonOscuro" ${filas.length >= R.MAX_BLOQUES ? "disabled" : ""}>＋ Añadir ejercicio</button>
        <label class="rp-campo"><span>Descanso entre ejercicios</span>
          <select id="rutDescanso">${opciones(R.DESCANSOS.map((d) => ({ v: d, t: `${d} s` })), descanso)}</select></label>
        <p class="asis-nota asis-nota--resalta" id="rutTotal" role="status">Duración total: ${escaparHTML(fmtSeg(total()))}</p>
        <p id="rutError" class="asis-error" role="alert"></p>
        <div class="asis-acciones">
          <button type="button" id="rutGuardar" class="boton botonPrincipal">${existente ? "Guardar cambios" : "Guardar rutina"}</button>
          ${existente ? "" : `<button type="button" id="rutGuardarIr" class="boton botonOscuro">Guardar y empezar</button>`}
          <button type="button" id="rutCancelar" class="boton botonOscuro">Cancelar</button>
        </div>`;

      v.cuerpo.querySelectorAll(".rut-fila").forEach((li) => {
        const i = Number(li.dataset.i);
        li.querySelectorAll("select").forEach((s) =>
          s.addEventListener("change", () => {
            filas[i][s.dataset.campo] = s.dataset.campo === "segundos" ? Number(s.value) : s.value;
            v.cuerpo.querySelector("#rutTotal").textContent = "Duración total: " + fmtSeg(total());
          })
        );
        li.querySelectorAll("[data-mov]").forEach((b) =>
          b.addEventListener("click", () => {
            const m = b.dataset.mov;
            if (m === "quita") filas.splice(i, 1);
            else {
              const j = m === "sube" ? i - 1 : i + 1;
              [filas[i], filas[j]] = [filas[j], filas[i]];
            }
            dibujar();
          })
        );
      });
      v.cuerpo.querySelector("#rutAnadir").addEventListener("click", () => {
        const ult = filas[filas.length - 1];
        filas.push({ modo: modos[Math.min(filas.length, modos.length - 1)].clave, segundos: ult ? ult.segundos : 60, dificultad: ult ? ult.dificultad : "media" });
        dibujar();
        const sel = v.cuerpo.querySelectorAll(".rut-fila");
        sel[sel.length - 1].querySelector("select").focus();
      });
      v.cuerpo.querySelector("#rutDescanso").addEventListener("change", (e) => {
        descanso = Number(e.target.value);
        v.cuerpo.querySelector("#rutTotal").textContent = "Duración total: " + fmtSeg(total());
      });
      v.cuerpo.querySelector("#rutCancelar").addEventListener("click", () => {
        v.cerrar();
      });
      const intentar = (empezar) => () => {
        const nombre = R.limpiarNombre(v.cuerpo.querySelector("#rutNombre").value);
        const error = v.cuerpo.querySelector("#rutError");
        if (!nombre) {
          error.textContent = "Escribe un nombre para la rutina.";
          v.cuerpo.querySelector("#rutNombre").focus();
          return;
        }
        const plan = R.planManual({ descanso, bloques: filas }, validos());
        if (!plan) {
          error.textContent = "Añade al menos un ejercicio.";
          return;
        }
        let lista = leer();
        let rutina;
        if (existente) {
          lista = R.reemplazarPlan(lista, existente.id, plan, validos());
          lista = R.renombrar(lista, existente.id, nombre);
          rutina = lista.find((x) => x.id === existente.id);
        } else {
          const r = R.agregar(lista, { plan, nombre, origen: "manual" }, validos());
          if (r.llena) {
            error.textContent = `Llegaste al máximo de ${R.MAX_RUTINAS} rutinas. Elimina alguna primero.`;
            return;
          }
          if (r.repetida) {
            error.textContent = `Ya tienes una rutina igual: «${r.rutina.nombre}».`;
            return;
          }
          lista = r.lista;
          rutina = r.rutina;
        }
        guardar(lista);
        pintarInicio();
        v.cerrar();
        avisarRehab(`Rutina «${rutina.nombre}» guardada.`, { tipo: "exito" });
        if (existente && rutina.compartida && nube()) nube().sincronizar(rutina);
        if (empezar) iniciar(rutina.id);
        else abrirLista();
      };
      v.cuerpo.querySelector("#rutGuardar").addEventListener("click", intentar(false));
      const ir = v.cuerpo.querySelector("#rutGuardarIr");
      if (ir) ir.addEventListener("click", intentar(true));
      if (foco) v.cuerpo.querySelector(foco).focus();
    }

    dibujar();
    v.abrir();
    v.titulo.setAttribute("tabindex", "-1");
    v.titulo.focus({ preventScroll: true });
  }

  // -----------------------------------------------------
  // Botones de Inicio
  // -----------------------------------------------------
  const inicio = document.getElementById("listaMisRutinasInicio");
  if (inicio) {
    inicio.addEventListener("click", (e) => {
      const b = e.target.closest('[data-accion="iniciar"]');
      if (b) iniciar(b.closest("[data-id]").dataset.id);
    });
  }
  const ver = document.getElementById("btnVerMisRutinas");
  if (ver) ver.addEventListener("click", abrirLista);
  const crear = document.getElementById("btnCrearRutina");
  if (crear) crear.addEventListener("click", () => abrirConstructor());

  window.rehabRutinas = { guardarPlan, enlazarBotonGuardar, abrirLista, abrirConstructor, pintarInicio, leer, guardar };
  try {
    pintarInicio();
  } catch (_) {}
})();
