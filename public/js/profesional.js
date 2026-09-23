// =====================================================
// REHABPOD — PROFESIONALES Y RUTINAS COMPARTIDAS (interfaz + nube)
//
//  · Usuarios: en «Mis rutinas» pueden COMPARTIR una rutina con los
//    profesionales (solo los ejercicios; opcional mostrar su nombre) y dejar de
//    compartirla cuando quieran.
//  · Profesionales: en Inicio ven «MIS RUTINAS» (el editor de rutinas para
//    asignar) y, dentro de él, la BIBLIOTECA con lo que comparten los usuarios,
//    que pueden copiar a sus rutinas para editarlas y asignarlas.
//
// La seguridad real la pone Supabase (supabase/rutinas-compartidas.sql: solo
// los profesionales leen, solo el autor modifica). Aquí se valida todo lo que
// llega de la nube antes de mostrarlo. Se carga DESPUÉS de app.js.
// =====================================================

(function () {
  "use strict";

  const R = window.RehabRutinas;
  const C = window.RehabCompartidas;
  const P = window.RehabPlan;
  if (!R || !C || !P || typeof modalRehab !== "function") return;

  const TABLA = "rehab_shared_routines";
  const CLAVE_V23 = "rehabpodRutinas";
  const Z = "calc(var(--z-modal) + 11)";
  const NOMBRE_DIF = { facil: "Fácil", media: "Media", dificil: "Difícil" };
  const el = (id) => document.getElementById(id);
  const esc = (t) => escaparHTML(String(t ?? ""));

  const modosValidos = () => {
    const defs = window.REHAB_V22_MODOS || {};
    return Object.keys(P.APTITUD).filter((k) => defs[k]);
  };
  const tituloModo = (k) => ((window.REHAB_V22_MODOS || {})[k] || {}).titulo || k;
  const iconoModo = (k) => ((window.REHAB_V22_MODOS || {})[k] || {}).icono || "⚡";
  const objetivosTexto = (plan) => plan.objetivos.map((k) => (P.OBJETIVOS[k] ? P.OBJETIVOS[k].titulo : k)).join(" + ");

  // -----------------------------------------------------
  // Sesión y rol
  // -----------------------------------------------------
  async function cliente() {
    if (typeof window.rehabGetSupabaseClient !== "function") return null;
    try {
      return await window.rehabGetSupabaseClient();
    } catch (_) {
      return null;
    }
  }

  async function sesion() {
    const cloud = await cliente();
    if (!cloud) return { cloud: null, user: null };
    try {
      const { data } = await cloud.auth.getSession();
      return { cloud, user: (data && data.session && data.session.user) || null };
    } catch (_) {
      return { cloud, user: null };
    }
  }

  let cacheRol = null; // { userId, rol, nombre, en }
  async function perfilNube(forzar) {
    const { cloud, user } = await sesion();
    if (!cloud || !user) {
      cacheRol = null;
      return null;
    }
    if (!forzar && cacheRol && cacheRol.userId === user.id && Date.now() - cacheRol.en < 30000) return cacheRol;
    try {
      const { data, error } = await cloud.from("rehab_profiles").select("role, full_name").eq("user_id", user.id).single();
      if (error || !data) throw error || new Error("Sin perfil");
      cacheRol = { userId: user.id, rol: data.role === "professional" ? "professional" : "user", nombre: data.full_name || "", en: Date.now() };
    } catch (_) {
      cacheRol = { userId: user.id, rol: "user", nombre: "", en: Date.now() };
    }
    return cacheRol;
  }

  const esProfesional = async () => {
    const p = await perfilNube();
    return !!p && p.rol === "professional";
  };

  function mensajeError(error) {
    const txt = String((error && (error.message || error.code)) || "");
    if (/42P01|PGRST205|does not exist|schema cache/i.test(txt) || (error && error.code === "42P01")) {
      return "La biblioteca compartida todavía no está activada en el servidor. Avisa al administrador de RehabPod.";
    }
    if (/Máximo 50/i.test(txt)) return "Ya compartiste el máximo de 50 rutinas. Deja de compartir alguna para añadir otra.";
    try {
      return typeof rehabMensajeError === "function" ? rehabMensajeError(error) : "No se pudo completar la acción. Inténtalo de nuevo.";
    } catch (_) {
      return "No se pudo completar la acción. Inténtalo de nuevo.";
    }
  }

  // -----------------------------------------------------
  // Compartir mis rutinas (usuarios)
  // -----------------------------------------------------
  const rutinasApi = () => window.rehabRutinas;
  const miLista = () => rutinasApi().leer();
  const guardarLista = (l) => rutinasApi().guardar(l);

  async function subir(cloud, user, rutina, mostrarNombre, nombreAutor) {
    const fila = C.paraNube(rutina, { mostrarNombre, nombreAutor, validos: modosValidos() });
    if (!fila) throw new Error("La rutina no es válida.");
    const { error } = await cloud.from(TABLA).upsert({ ...fila, author_id: user.id }, { onConflict: "author_id,local_id" });
    if (error) throw error;
  }

  /** Pregunta cómo compartir. Resuelve { mostrarNombre } o null si cancela. */
  async function preguntarCompartir(nombre) {
    const detalle = `
      <ul class="cmp-lista">
        <li>Los profesionales de RehabPod podrán ver esta rutina: ejercicios, duración y objetivos.</li>
        <li>No se comparten tus resultados, tu historial ni datos de salud.</li>
        <li>Puedes dejar de compartirla cuando quieras.</li>
      </ul>
      <label class="cmp-check">
        <input type="checkbox" id="cmpMostrarNombre">
        <span>Mostrar mi nombre${nombre ? ` («${esc(nombre)}»)` : ""}. Si no, aparecerá como «${esc(C.ANONIMO)}».</span>
      </label>`;
    const promesa = confirmarRehab({ titulo: "Compartir con profesionales", icono: "🤝", mensaje: "¿Quieres compartir esta rutina?", detalleHTML: detalle, aceptar: "Compartir", cancelar: "Ahora no" });
    const chk = el("cmpMostrarNombre");
    let mostrarNombre = false;
    if (chk) chk.addEventListener("change", () => (mostrarNombre = chk.checked));
    const acepto = await promesa;
    return acepto ? { mostrarNombre } : null;
  }

  async function compartir(rutina) {
    const { cloud, user } = await sesion();
    if (!cloud || !user) {
      avisarRehab("Inicia sesión en Cuenta para compartir tus rutinas con profesionales.", { tipo: "info" });
      return false;
    }
    const perfil = await perfilNube();
    const nombreAutor = (perfil && perfil.nombre) || ((obtenerPerfilActivo() || {}).nombre || "");
    const decision = await preguntarCompartir(nombreAutor);
    if (!decision) return false;
    try {
      await subir(cloud, user, rutina, decision.mostrarNombre, nombreAutor);
      guardarLista(R.marcarCompartida(miLista(), rutina.id, { en: Date.now(), mostrarNombre: decision.mostrarNombre }));
      avisarRehab(`«${rutina.nombre}» ya está compartida con los profesionales.`, { tipo: "exito" });
      return true;
    } catch (error) {
      console.warn("Compartir rutina:", error);
      avisarRehab(mensajeError(error), { tipo: "error" });
      return false;
    }
  }

  async function dejarDeCompartir(rutina, { silencioso } = {}) {
    const { cloud, user } = await sesion();
    if (!cloud || !user) {
      if (!silencioso) avisarRehab("Inicia sesión en Cuenta para dejar de compartir esta rutina.", { tipo: "info" });
      return false;
    }
    try {
      const { error } = await cloud.from(TABLA).delete().eq("author_id", user.id).eq("local_id", rutina.id);
      if (error) throw error;
      guardarLista(R.marcarCompartida(miLista(), rutina.id, null));
      if (!silencioso) avisarRehab(`Dejaste de compartir «${rutina.nombre}».`, { tipo: "info" });
      return true;
    } catch (error) {
      console.warn("Dejar de compartir:", error);
      if (!silencioso) avisarRehab(mensajeError(error), { tipo: "error" });
      return false;
    }
  }

  /** Vuelve a subir una rutina ya compartida (tras editarla o renombrarla). Silencioso. */
  async function sincronizar(rutina) {
    if (!rutina || !rutina.compartida) return false;
    const { cloud, user } = await sesion();
    if (!cloud || !user) return false;
    try {
      const perfil = await perfilNube();
      const nombreAutor = (perfil && perfil.nombre) || ((obtenerPerfilActivo() || {}).nombre || "");
      await subir(cloud, user, rutina, rutina.compartida.mostrarNombre, nombreAutor);
      return true;
    } catch (error) {
      console.warn("Actualizar rutina compartida:", error);
      return false;
    }
  }

  async function alternar(rutina) {
    return rutina.compartida ? dejarDeCompartir(rutina) : compartir(rutina);
  }

  // -----------------------------------------------------
  // Biblioteca (profesionales)
  // -----------------------------------------------------
  const estadoBib = { items: [], texto: "", objetivo: "", nivel: "", cargando: false };

  function ventanaBiblioteca() {
    return modalRehab({ id: "bibliotecaRutinas", titulo: "Rutinas de usuarios", eyebrow: "BIBLIOTECA", icono: "📚", ancho: 600, clase: "asis-modal bib", z: Z });
  }

  function itemHTML(it) {
    const ejercicios = it.plan.bloques
      .map((b) => `<li>${esc(iconoModo(b.modo))} ${esc(tituloModo(b.modo))} · ${b.segundos} s · ${esc(NOMBRE_DIF[b.dificultad] || b.dificultad)}</li>`)
      .join("");
    return `
      <li class="bib-item" data-id="${esc(it.id)}">
        <div class="bib-item__cab">
          <b>${esc(it.nombre)}</b>
          <small>${esc(it.autor)} · ${esc(it.resumen.texto)} · ${esc(objetivosTexto(it.plan))} · Nivel ${esc(it.plan.nivel)}</small>
        </div>
        <details class="bib-detalle">
          <summary>Ver ejercicios (descanso ${it.plan.descanso} s)</summary>
          <ol>${ejercicios}</ol>
        </details>
        <button type="button" class="boton botonPrincipal" data-bib="copiar" aria-label="Copiar ${esc(it.nombre)} a mis rutinas">Copiar a mis rutinas</button>
      </li>`;
  }

  function pintarLista() {
    const lista = el("bibLista");
    const estado = el("bibEstado");
    if (!lista) return;
    const visibles = C.filtrar(estadoBib.items, estadoBib);
    lista.innerHTML = visibles.map(itemHTML).join("");
    if (estadoBib.cargando) estado.textContent = "Cargando rutinas…";
    else if (!estadoBib.items.length) estado.textContent = "Todavía nadie ha compartido rutinas. Cuando los usuarios las compartan, aparecerán aquí.";
    else if (!visibles.length) estado.textContent = "Ninguna rutina coincide con tu búsqueda.";
    else estado.textContent = `${visibles.length} ${visibles.length === 1 ? "rutina" : "rutinas"}`;
  }

  async function cargarBiblioteca() {
    const { cloud, user } = await sesion();
    if (!cloud || !user) {
      estadoBib.items = [];
      el("bibEstado").textContent = "Inicia sesión en Cuenta para ver la biblioteca.";
      return;
    }
    estadoBib.cargando = true;
    pintarLista();
    try {
      const { data, error } = await cloud.from(TABLA).select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      const validos = modosValidos();
      estadoBib.items = (data || []).map((f) => C.desdeNube(f, validos)).filter(Boolean);
      estadoBib.cargando = false;
      pintarLista();
    } catch (error) {
      console.warn("Biblioteca:", error);
      estadoBib.cargando = false;
      estadoBib.items = [];
      el("bibEstado").textContent = mensajeError(error);
      el("bibLista").innerHTML = "";
    }
  }

  function copiar(id) {
    const it = estadoBib.items.find((x) => x.id === id);
    if (!it) return;
    const lista = leerLista(CLAVE_V23, "RehabPod");
    const previa = C.yaCopiada(lista, it);
    if (previa) {
      avisarRehab(`Ya tienes esta rutina en Mis rutinas como «${previa.nombre}».`, { tipo: "info" });
      return;
    }
    lista.push(C.aRutinaV23(it));
    guardarJSON(CLAVE_V23, lista, "RehabPod");
    avisarRehab(`«${it.nombre}» se copió a Mis rutinas. Ya puedes editarla o asignarla.`, { tipo: "exito" });
  }

  async function abrirBiblioteca() {
    if (!(await esProfesional())) {
      avisarRehab("La biblioteca es solo para profesionales. Inicia sesión con tu cuenta profesional en Cuenta.", { tipo: "info" });
      return;
    }
    const v = ventanaBiblioteca();
    Object.assign(estadoBib, { texto: "", objetivo: "", nivel: "" });
    v.cuerpo.innerHTML = `
      <p class="asis-nota">Rutinas que los usuarios eligieron compartir. Cópialas a tus rutinas para editarlas y asignarlas.</p>
      <label class="campoFiltro" for="bibTexto"><span>Buscar</span><input type="search" id="bibTexto" placeholder="Nombre, autor u objetivo" autocomplete="off"></label>
      <div class="bib-filtros">
        <label class="campoFiltro" for="bibObjetivo"><span>Objetivo</span>
          <select id="bibObjetivo"><option value="">Todos</option>${Object.entries(P.OBJETIVOS).map(([k, o]) => `<option value="${esc(k)}">${esc(o.titulo)}</option>`).join("")}</select></label>
        <label class="campoFiltro" for="bibNivel"><span>Nivel</span>
          <select id="bibNivel"><option value="">Todos</option>${P.NIVELES.map((n) => `<option value="${esc(n)}">${esc(n.charAt(0).toUpperCase() + n.slice(1))}</option>`).join("")}</select></label>
      </div>
      <p class="bib-estado" id="bibEstado" role="status" aria-live="polite"></p>
      <ul class="bib-lista" id="bibLista" aria-label="Rutinas compartidas"></ul>
      <div class="asis-acciones">
        <button type="button" class="boton botonOscuro" id="bibActualizar">Actualizar lista</button>
        <button type="button" class="boton botonOscuro" id="bibIrMisRutinas">Ir a Mis rutinas</button>
      </div>`;
    v.cuerpo.querySelector("#bibTexto").addEventListener("input", (e) => {
      estadoBib.texto = e.target.value;
      pintarLista();
    });
    v.cuerpo.querySelector("#bibObjetivo").addEventListener("change", (e) => {
      estadoBib.objetivo = e.target.value;
      pintarLista();
    });
    v.cuerpo.querySelector("#bibNivel").addEventListener("change", (e) => {
      estadoBib.nivel = e.target.value;
      pintarLista();
    });
    v.cuerpo.querySelector("#bibLista").addEventListener("click", (e) => {
      const b = e.target.closest('[data-bib="copiar"]');
      if (b) copiar(b.closest("[data-id]").dataset.id);
    });
    v.cuerpo.querySelector("#bibActualizar").addEventListener("click", cargarBiblioteca);
    v.cuerpo.querySelector("#bibIrMisRutinas").addEventListener("click", () => {
      v.cerrar();
      if (typeof window.rehabV23AbrirRutinas === "function") window.rehabV23AbrirRutinas();
    });
    v.abrir();
    v.titulo.setAttribute("tabindex", "-1");
    v.titulo.focus({ preventScroll: true });
    await cargarBiblioteca();
  }

  // Botón de la biblioteca dentro del editor «Mis rutinas» de profesionales.
  document.addEventListener("rehabpod:v23lista", async () => {
    const b = el("rehabV23Biblioteca");
    if (!b) return;
    b.addEventListener("click", () => {
      const v23 = el("rehabV23Overlay");
      if (v23) v23.hidden = true;
      abrirBiblioteca();
    });
    if (await esProfesional()) b.hidden = false;
  });

  // -----------------------------------------------------
  // Inicio: «MIS RUTINAS» solo para profesionales
  // -----------------------------------------------------
  function asegurarBotonInicio() {
    let b = el("btnMisRutinasPro");
    if (b) return b;
    const ref = el("rehabV28HomeBtn") || el("btnEntrenamiento");
    if (!ref) return null;
    b = document.createElement("button");
    b.type = "button";
    b.id = "btnMisRutinasPro";
    b.className = "rehabV23BotonRutinas";
    b.hidden = true;
    b.innerHTML = "📋 MIS RUTINAS";
    b.addEventListener("click", () => {
      if (typeof window.rehabV23AbrirRutinas === "function") window.rehabV23AbrirRutinas();
    });
    ref.insertAdjacentElement("afterend", b);
    return b;
  }

  let actualizando = false;
  let pendiente = false;
  async function actualizarInicio() {
    // Si llega otra petición mientras se consulta, se repite al terminar (el estado pudo cambiar).
    if (actualizando) {
      pendiente = true;
      return;
    }
    actualizando = true;
    try {
      do {
        pendiente = false;
        const b = asegurarBotonInicio();
        if (!b) return;
        b.hidden = !(await esProfesional());
      } while (pendiente);
    } catch (_) {
    } finally {
      actualizando = false;
    }
  }

  async function vigilarSesion() {
    const cloud = await cliente();
    if (!cloud || !cloud.auth || typeof cloud.auth.onAuthStateChange !== "function") return;
    try {
      cloud.auth.onAuthStateChange(() => {
        cacheRol = null;
        setTimeout(actualizarInicio, 120);
      });
    } catch (_) {}
  }

  window.addEventListener("focus", () => {
    cacheRol = null;
    actualizarInicio();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) actualizarInicio();
  });

  if (typeof window.rehabV33ActualizarInterfaz === "function") {
    const base = window.rehabV33ActualizarInterfaz;
    window.rehabV33ActualizarInterfaz = async function () {
      const r = await base.apply(this, arguments);
      cacheRol = null;
      actualizarInicio();
      return r;
    };
  }

  setTimeout(() => {
    vigilarSesion();
    actualizarInicio();
  }, 900);

  window.rehabRutinasNube = { compartir, dejarDeCompartir, sincronizar, alternar, abrirBiblioteca, esProfesional, actualizarInicio, cargarBiblioteca };
})();
