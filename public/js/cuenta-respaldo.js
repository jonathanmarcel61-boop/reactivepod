// =====================================================
// REHABPOD V45 — CUENTA SOLO PARA RESPALDO Y RECUPERACION
// =====================================================

(function () {
  "use strict";

  const TABLA = "rehab_user_backups";
  const VERSION = 1;
  const CLAVE_DUENO = "rehabpodBackupOwnerV45";
  const CLAVE_HUELLA = "rehabpodBackupFingerprintV45";
  const MAX_ITEM = 1_500_000;
  const CLAVES_EXACTAS = new Set([
    "reactipodDatos",
    "reactipodAjustes",
    "rehabpodRutinas",
    "rehabpodHistorialRutinas",
    "rehabpodRecordatorios",
    "rehabpodMetaSemanal",
    "rehabpodAsistentePrefs",
    "rehabpodVoz",
    "rehabpodCantidadPods",
    "rehabpodModoVirtual",
    "rehabpodColorMemoria",
    "rehabpodColorCaza",
    "rehabpodTiempoAutomatico",
    "rehabpodDosJugadores",
  ]);
  const PREFIJOS = ["rehabpodRutinas:"];

  let cloud = null;
  let usuario = null;
  let copia = null;
  let perfilCuenta = null;
  let sincronizando = false;
  let intervalo = null;

  const esc = (valor) =>
    typeof escaparHTML === "function"
      ? escaparHTML(String(valor ?? ""))
      : String(valor ?? "").replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;" })[c]);

  function clavePermitida(clave) {
    return CLAVES_EXACTAS.has(clave) || PREFIJOS.some((p) => clave.startsWith(p));
  }

  function capturarDatos() {
    const datos = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const clave = localStorage.key(i);
      if (!clave || !clavePermitida(clave)) continue;
      const valor = localStorage.getItem(clave);
      if (typeof valor === "string" && valor.length <= MAX_ITEM) datos[clave] = valor;
    }
    return datos;
  }

  function huella(datos) {
    const texto = JSON.stringify(datos);
    let h = 2166136261;
    for (let i = 0; i < texto.length; i += 1) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  }

  function fechaLegible(fecha) {
    if (!fecha) return "Todavía no hay una copia";
    try {
      return new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(fecha));
    } catch (_) {
      return String(fecha);
    }
  }

  async function cliente() {
    if (typeof window.rehabGetSupabaseClient !== "function") return null;
    cloud = await window.rehabGetSupabaseClient();
    return cloud;
  }

  async function cargarEstado() {
    copia = null;
    perfilCuenta = null;
    const c = await cliente();
    if (!c) return false;
    const { data: sesion, error: sesionError } = await c.auth.getSession();
    if (sesionError) throw sesionError;
    usuario = sesion?.session?.user || null;
    if (!usuario) return false;

    const { data: perfil, error: perfilError } = await c
      .from("rehab_profiles")
      .select("full_name, specialty, age, weight_kg, height_cm")
      .eq("user_id", usuario.id)
      .maybeSingle();
    if (perfilError) throw perfilError;
    perfilCuenta = perfil || null;

    const registro = usuario.user_metadata?.rehabpod_registration;
    if (registro && perfilCuenta) {
      const cambios = {};
      if ((!perfilCuenta.specialty || perfilCuenta.specialty === "unspecified") && registro.specialty) cambios.specialty = registro.specialty;
      if (perfilCuenta.age == null && registro.age != null) cambios.age = registro.age;
      if (perfilCuenta.weight_kg == null && registro.weight_kg != null) cambios.weight_kg = registro.weight_kg;
      if (perfilCuenta.height_cm == null && registro.height_cm != null) cambios.height_cm = registro.height_cm;
      if (Object.keys(cambios).length) {
        const { data: actualizado, error: actualizarError } = await c
          .from("rehab_profiles")
          .update(cambios)
          .eq("user_id", usuario.id)
          .select("full_name, specialty, age, weight_kg, height_cm")
          .single();
        if (actualizarError) throw actualizarError;
        perfilCuenta = actualizado;
      }
    }

    const { data, error } = await c
      .from(TABLA)
      .select("payload, schema_version, updated_at")
      .eq("user_id", usuario.id)
      .maybeSingle();
    if (error) throw error;
    copia = data || null;
    return true;
  }

  async function guardarCopia({ forzar = false } = {}) {
    if (sincronizando || !usuario || !cloud) return false;
    const dueno = localStorage.getItem(CLAVE_DUENO);
    if (!forzar && copia && dueno !== usuario.id) return false;

    const datos = capturarDatos();
    const fingerprint = huella(datos);
    if (!forzar && fingerprint === localStorage.getItem(CLAVE_HUELLA)) return true;

    sincronizando = true;
    try {
      const { data, error } = await cloud
        .from(TABLA)
        .upsert(
          { user_id: usuario.id, payload: datos, schema_version: VERSION, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
        .select("payload, schema_version, updated_at")
        .single();
      if (error) throw error;
      copia = data;
      localStorage.setItem(CLAVE_DUENO, usuario.id);
      localStorage.setItem(CLAVE_HUELLA, fingerprint);
      return true;
    } finally {
      sincronizando = false;
    }
  }

  function aplicarCopia(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("La copia guardada no tiene un formato válido.");
    }
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const clave = localStorage.key(i);
      if (clave && clavePermitida(clave)) localStorage.removeItem(clave);
    }
    for (const [clave, valor] of Object.entries(payload)) {
      if (!clavePermitida(clave) || typeof valor !== "string" || valor.length > MAX_ITEM) continue;
      localStorage.setItem(clave, valor);
    }
    localStorage.setItem(CLAVE_DUENO, usuario.id);
    localStorage.setItem(CLAVE_HUELLA, huella(capturarDatos()));
  }

  function perfilesLocales() {
    try {
      const datos = JSON.parse(localStorage.getItem("reactipodDatos") || "null");
      return {
        activo: datos?.perfilActivoId || null,
        lista: Array.isArray(datos?.perfiles) ? datos.perfiles : [],
      };
    } catch (_) {
      return { activo: null, lista: [] };
    }
  }

  function htmlPerfilesEncabezado(conSesion) {
    const perfiles = perfilesLocales();
    const chips = perfiles.lista.length
      ? perfiles.lista
          .map((perfil) => {
            const nombre = String(perfil?.nombre || "Perfil");
            const inicial = nombre.trim().charAt(0).toUpperCase() || "P";
            const activo = String(perfil?.id) === String(perfiles.activo);
            return `<div class="rehabV46Perfil ${activo ? "activo" : ""}">
              <span class="rehabV46PerfilAvatar">${esc(inicial)}</span>
              <span><strong>${esc(nombre)}</strong><small>${activo ? "Perfil activo" : `${Array.isArray(perfil?.historial) ? perfil.historial.length : 0} sesiones`}</small></span>
            </div>`;
          })
          .join("")
      : '<div class="rehabV45Nota">Todavía no hay perfiles creados.</div>';

    return `<section class="rehabV46CuentaHero">
      <div class="rehabV46CuentaEstado"><span class="rehabV46Nube">${conSesion ? "✓" : "☁"}</span><div>
        <span class="rehabV46Eyebrow">${conSesion ? "CUENTA ACTIVADA" : "RESPALDO OPCIONAL"}</span>
        <h3>${conSesion ? "Tus datos están protegidos" : "Protege tus entrenamientos"}</h3>
        <p>${conSesion ? esc(usuario?.email || "") : "Inicia sesión para recuperar tus datos si cambias de teléfono."}</p>
      </div></div>
      <div class="rehabV46PerfilesTitulo"><span>PERFILES DE ESTE TELÉFONO</span><strong>${perfiles.lista.length}</strong></div>
      <div class="rehabV46Perfiles">${chips}</div>
    </section>`;
  }

  function htmlLocal() {
    const locales = perfilesLocales();
    const perfiles = locales.lista.length;
    let sesiones = 0;
    sesiones = locales.lista.reduce((n, p) => n + (Array.isArray(p?.historial) ? p.historial.length : 0), 0);
    return `<div class="rehabV40Card rehabV46Resumen"><div class="rehabV40SecTitulo">RESUMEN DEL RESPALDO</div>
      <div class="rehabV46Metricas"><div><strong>${perfiles}</strong><span>Perfiles</span></div><div><strong>${sesiones}</strong><span>Entrenamientos</span></div></div>
      <div class="rehabV45Nota">También se respaldan rutinas, historial, recordatorios y ajustes. Las conexiones Bluetooth no se copian: en un teléfono nuevo debes volver a conectar los Pods.</div></div>`;
  }

  function htmlSinSesion() {
    return `${htmlPerfilesEncabezado(false)}<div class="rehabV40Card rehabV46Acceso"><div class="rehabV40SecTitulo">RESPALDO EN LA NUBE</div>
      <h3>Continúa donde lo dejaste</h3><p>La cuenta se usa únicamente para guardar y recuperar tus datos. No necesitas proporcionar peso, altura ni edad.</p>
      <button id="rehabV45Entrar" class="rehabV40Btn" type="button">INICIAR SESIÓN O CREAR CUENTA</button></div>`;
  }

  function htmlConSesion() {
    const dueno = localStorage.getItem(CLAVE_DUENO);
    const otroDispositivo = !!copia && dueno !== usuario.id;
    return `${htmlPerfilesEncabezado(true)}
      <div class="rehabV40Card"><div class="rehabV40SecTitulo">TU COPIA DE SEGURIDAD</div>
        <div class="rehabV40Dato"><span>Última copia</span><strong>${esc(fechaLegible(copia?.updated_at))}</strong></div>
        <div class="rehabV45Estado ${otroDispositivo ? "advertencia" : "ok"}">${otroDispositivo ? "Encontramos una copia existente. Elige restaurarla o reemplazarla con los datos de este teléfono." : "Este teléfono está vinculado. Los cambios se guardarán automáticamente cuando haya conexión."}</div>
        <div class="rehabV40Acciones">
          ${copia ? '<button id="rehabV45Restaurar" class="rehabV40Btn ok" type="button">RESTAURAR EN ESTE TELÉFONO</button>' : ""}
          <button id="rehabV45Guardar" class="rehabV40Btn sec" type="button">${otroDispositivo ? "USAR LOS DATOS DE ESTE TELÉFONO" : "GUARDAR AHORA"}</button>
        </div><div id="rehabV45Mensaje" class="rehabV40Mensaje"></div></div>
      ${htmlDatosCuenta()}
      <details class="rehabV40Card rehabV46Desplegable"><summary><span><small>SEGURIDAD</small><strong>Cambiar contraseña</strong></span><b>⌄</b></summary>
        <div class="rehabV46DesplegableCuerpo"><div class="rehabV40Campo"><label>NUEVA CONTRASEÑA</label><input id="rehabV45Pass1" type="password" minlength="10" autocomplete="new-password" placeholder="10+ caracteres, mayúscula, minúscula y número"></div>
        <div class="rehabV40Campo"><label>REPETIR CONTRASEÑA</label><input id="rehabV45Pass2" type="password" minlength="10" autocomplete="new-password" placeholder="Repite la contraseña"></div>
        <button id="rehabV45CambiarPass" class="rehabV40Btn sec" type="button">ACTUALIZAR CONTRASEÑA</button><div id="rehabV45SegMensaje" class="rehabV40Mensaje"></div></div></details>
      <button id="rehabV45Salir" class="rehabV46CerrarSesion" type="button">Cerrar sesión</button>`;
  }

  function etiquetaTipoUso(valor) {
    const opciones = {
      athlete: "Deportista",
      fitness: "Fitness / gimnasio",
      rehabilitation: "Rehabilitación / fisioterapia",
      cognitive_training: "Entrenamiento cognitivo",
      recreational: "Recreativo",
      other: "Otro",
      unspecified: "Sin especificar",
    };
    return opciones[valor] || "Sin especificar";
  }

  function htmlDatosCuenta() {
    if (!perfilCuenta) return "";
    const opcionales = [
      perfilCuenta.age != null ? `${perfilCuenta.age} años` : null,
      perfilCuenta.weight_kg != null ? `${Number(perfilCuenta.weight_kg)} kg` : null,
      perfilCuenta.height_cm != null ? `${Number(perfilCuenta.height_cm)} cm` : null,
    ].filter(Boolean);
    return `<div class="rehabV40Card rehabV47DatosCuenta"><div class="rehabV40SecTitulo">DATOS DE LA CUENTA</div>
      <div class="rehabV40Dato"><span>Tipo de uso</span><strong>${esc(etiquetaTipoUso(perfilCuenta.specialty))}</strong></div>
      <div class="rehabV40Dato"><span>Datos opcionales</span><strong>${esc(opcionales.length ? opcionales.join(" · ") : "No proporcionados")}</strong></div>
      <div class="rehabV45Nota">La edad, el peso y la altura son opcionales y no cambian los entrenamientos actuales.</div></div>`;
  }

  function mensaje(id, texto, tipo = "") {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `rehabV40Mensaje ${tipo}`;
    el.textContent = texto;
  }

  async function render(contentId = "contenidoCuentaCloud") {
    const host = document.getElementById(contentId);
    if (!host) return;
    host.innerHTML = '<div class="rehabV40Aviso">Comprobando tu respaldo...</div>';
    try {
      const sesion = await cargarEstado();
      if (sesion && !copia) await guardarCopia({ forzar: true });
      host.innerHTML = `<div class="rehabV40Wrap rehabV46Cuenta">${sesion ? htmlConSesion() : htmlSinSesion()}${htmlLocal()}</div>`;
      activarEventos(contentId);
      programarAutomatico();
    } catch (error) {
      host.innerHTML = `<div class="rehabV40Wrap">${htmlLocal()}<div class="rehabV40Aviso">${esc(typeof rehabMensajeError === "function" ? rehabMensajeError(error) : error.message)}</div></div>`;
    }
  }

  function cerrarLogin() { document.getElementById("rehabV45Login")?.remove(); }

  function abrirLogin() {
    cerrarLogin();
    const overlay = document.createElement("div");
    overlay.id = "rehabV45Login";
    overlay.className = "rehabV45Login";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `<div class="rehabV45LoginCard"><button id="rehabV45CerrarLogin" class="rehabV45Cerrar" aria-label="Cerrar">×</button>
      <div class="rehabV46LoginMarca"><span>☁</span><div><small>REHABPOD</small><h2>Guarda tu progreso</h2></div></div>
      <p class="rehabV46LoginIntro">Usa el mismo correo para recuperar perfiles, rutinas, historial y ajustes en otro teléfono.</p>
      <div class="rehabV47Pestanas" role="tablist" aria-label="Acceso a la cuenta"><button id="rehabV47TabLogin" type="button" role="tab" aria-selected="true">Iniciar sesión</button><button id="rehabV47TabCrear" type="button" role="tab" aria-selected="false">Crear cuenta</button></div>
      <div class="rehabV46LoginCampos"><label>Correo electrónico</label><input id="rehabV45Email" type="email" autocomplete="email" placeholder="nombre@correo.com">
      <label>Contraseña</label><input id="rehabV45Password" type="password" minlength="10" autocomplete="current-password" placeholder="Tu contraseña">
      <div id="rehabV47CamposRegistro" hidden>
        <label>Tipo de uso</label><select id="rehabV47TipoUso">
          <option value="athlete">Deportista</option><option value="fitness">Fitness / gimnasio</option><option value="rehabilitation">Rehabilitación / fisioterapia</option><option value="cognitive_training">Entrenamiento cognitivo</option><option value="recreational">Recreativo</option><option value="other">Otro</option>
        </select>
        <div class="rehabV47OpcionalesTitulo"><strong>Datos opcionales</strong><span>Puedes dejarlos vacíos</span></div>
        <div class="rehabV47Opcionales"><label>Edad<input id="rehabV47Edad" type="number" inputmode="numeric" min="5" max="100" placeholder="Ej. 26"></label><label>Peso (kg)<input id="rehabV47Peso" type="number" inputmode="decimal" min="20" max="300" step="0.1" placeholder="Ej. 63"></label><label>Altura (cm)<input id="rehabV47Altura" type="number" inputmode="decimal" min="80" max="230" step="0.1" placeholder="Ej. 166"></label></div>
        <p class="rehabV47Privacidad">Estos datos no son obligatorios y no se usan para diagnóstico médico.</p>
      </div></div>
      <button id="rehabV47Enviar" class="rehabV40Btn rehabV46LoginPrincipal" type="button">INICIAR SESIÓN</button>
      <button id="rehabV45Recuperar" class="rehabV27Link rehabV46Recuperar" type="button">Olvidé mi contraseña</button>
      <div id="rehabV45LoginMensaje" class="rehabV40Mensaje" aria-live="polite"></div></div>`;
    document.body.appendChild(overlay);
    document.getElementById("rehabV45CerrarLogin").onclick = cerrarLogin;
    overlay.onclick = (e) => { if (e.target === overlay) cerrarLogin(); };
    let creando = false;
    const cambiarModo = (crear) => {
      creando = crear;
      overlay.classList.toggle("rehabV47Registro", crear);
      document.getElementById("rehabV47TabLogin").setAttribute("aria-selected", String(!crear));
      document.getElementById("rehabV47TabCrear").setAttribute("aria-selected", String(crear));
      document.getElementById("rehabV47CamposRegistro").hidden = !crear;
      document.getElementById("rehabV47Enviar").textContent = crear ? "CREAR CUENTA" : "INICIAR SESIÓN";
      document.getElementById("rehabV45Recuperar").hidden = crear;
      document.getElementById("rehabV45Password").autocomplete = crear ? "new-password" : "current-password";
      mensaje("rehabV45LoginMensaje", "");
    };
    document.getElementById("rehabV47TabLogin").onclick = () => cambiarModo(false);
    document.getElementById("rehabV47TabCrear").onclick = () => cambiarModo(true);
    document.getElementById("rehabV47Enviar").onclick = () => autenticar(creando);
    document.getElementById("rehabV45Recuperar").onclick = recuperar;
    document.getElementById("rehabV45Email").focus();
  }

  async function autenticar(crear) {
    const email = String(document.getElementById("rehabV45Email")?.value || "").trim();
    const password = String(document.getElementById("rehabV45Password")?.value || "");
    if (!rehabValidarEmail(email)) return mensaje("rehabV45LoginMensaje", "Escribe un correo válido.", "error");
    if (!rehabValidarPassword(password)) return mensaje("rehabV45LoginMensaje", "Usa al menos 10 caracteres, con mayúscula, minúscula y número.", "error");
    let registro = null;
    if (crear) {
      const opcional = (id, minimo, maximo, etiqueta) => {
        const texto = String(document.getElementById(id)?.value || "").trim();
        if (!texto) return null;
        const valor = Number(texto);
        if (!Number.isFinite(valor) || valor < minimo || valor > maximo) {
          throw new Error(`${etiqueta} debe estar entre ${minimo} y ${maximo}.`);
        }
        return valor;
      };
      try {
        registro = {
          specialty: String(document.getElementById("rehabV47TipoUso")?.value || "other"),
          age: opcional("rehabV47Edad", 5, 100, "La edad"),
          weight_kg: opcional("rehabV47Peso", 20, 300, "El peso"),
          height_cm: opcional("rehabV47Altura", 80, 230, "La altura"),
        };
      } catch (error) {
        return mensaje("rehabV45LoginMensaje", error.message, "error");
      }
    }
    try {
      const c = await cliente();
      let respuesta;
      if (crear) {
        const nombre = (typeof obtenerPerfilActivo === "function" && obtenerPerfilActivo()?.nombre) || "Usuario RehabPod";
        respuesta = await c.auth.signUp({ email, password, options: { data: { full_name: nombre, role: "user", specialty: registro.specialty, rehabpod_registration: registro } } });
      } else {
        respuesta = await c.auth.signInWithPassword({ email, password });
      }
      if (respuesta.error) throw respuesta.error;
      if (crear && !respuesta.data?.session) return mensaje("rehabV45LoginMensaje", "Cuenta creada. Revisa tu correo, confirma la cuenta y luego inicia sesión.", "ok");
      if (crear && respuesta.data?.user) {
        const { error: perfilError } = await c.from("rehab_profiles").update(registro).eq("user_id", respuesta.data.user.id);
        if (perfilError) throw perfilError;
      }
      cerrarLogin();
      await render("contenidoCuentaCloud");
    } catch (error) { mensaje("rehabV45LoginMensaje", rehabMensajeError(error), "error"); }
  }

  async function recuperar() {
    const email = String(document.getElementById("rehabV45Email")?.value || "").trim();
    if (!rehabValidarEmail(email)) return mensaje("rehabV45LoginMensaje", "Escribe tu correo primero.", "error");
    try {
      const c = await cliente();
      const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
      if (error) throw error;
      mensaje("rehabV45LoginMensaje", "Si la cuenta existe, recibirás un enlace para cambiar la contraseña.", "ok");
    } catch (error) { mensaje("rehabV45LoginMensaje", rehabMensajeError(error), "error"); }
  }

  function activarEventos(contentId) {
    document.getElementById("rehabV45Entrar")?.addEventListener("click", abrirLogin);
    document.getElementById("rehabV45Guardar")?.addEventListener("click", async (e) => {
      const reemplaza = !!copia && localStorage.getItem(CLAVE_DUENO) !== usuario.id;
      if (reemplaza) {
        const ok = await confirmarRehab({ titulo: "Reemplazar copia", mensaje: "Esto reemplazará la copia de tu otro teléfono con los datos de este dispositivo.", aceptar: "Reemplazar copia" });
        if (!ok) return;
      }
      e.currentTarget.disabled = true;
      try { await guardarCopia({ forzar: true }); mensaje("rehabV45Mensaje", "Copia guardada correctamente.", "ok"); setTimeout(() => render(contentId), 700); }
      catch (error) { mensaje("rehabV45Mensaje", rehabMensajeError(error), "error"); }
      finally { e.currentTarget.disabled = false; }
    });
    document.getElementById("rehabV45Restaurar")?.addEventListener("click", async () => {
      const ok = await confirmarRehab({ titulo: "Restaurar copia", mensaje: "Los datos guardados en este teléfono serán reemplazados por la copia de la nube.", aceptar: "Restaurar" });
      if (!ok) return;
      try { aplicarCopia(copia.payload); avisarRehab("Copia restaurada. La app se reiniciará para cargar tus datos.", { tipo: "exito" }); setTimeout(() => location.reload(), 900); }
      catch (error) { mensaje("rehabV45Mensaje", error.message, "error"); }
    });
    document.getElementById("rehabV45CambiarPass")?.addEventListener("click", async () => {
      const p1 = String(document.getElementById("rehabV45Pass1")?.value || "");
      const p2 = String(document.getElementById("rehabV45Pass2")?.value || "");
      if (!rehabValidarPassword(p1)) return mensaje("rehabV45SegMensaje", "Usa al menos 10 caracteres, con mayúscula, minúscula y número.", "error");
      if (p1 !== p2) return mensaje("rehabV45SegMensaje", "Las contraseñas no coinciden.", "error");
      const { error } = await cloud.auth.updateUser({ password: p1 });
      mensaje("rehabV45SegMensaje", error ? rehabMensajeError(error) : "Contraseña actualizada.", error ? "error" : "ok");
    });
    document.getElementById("rehabV45Salir")?.addEventListener("click", async () => {
      const ok = await confirmarRehab({ titulo: "Cerrar sesión", mensaje: "La copia seguirá guardada en la nube.", aceptar: "Cerrar sesión" });
      if (!ok) return;
      await cloud.auth.signOut(); usuario = null; copia = null; programarAutomatico(); await render(contentId);
    });
  }

  function programarAutomatico() {
    if (intervalo) clearInterval(intervalo);
    intervalo = null;
    if (!usuario || localStorage.getItem(CLAVE_DUENO) !== usuario.id) return;
    intervalo = setInterval(() => guardarCopia().catch((e) => console.warn("V45 respaldo automático:", e)), 60000);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && usuario && localStorage.getItem(CLAVE_DUENO) === usuario.id) {
      guardarCopia().catch(() => {});
    }
  });

  function ocultarFuncionesProfesionales() {
    ["rehabV28HomeBtn", "rehabV27BtnCloud"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }

  window.rehabV40RenderCuenta = render;
  window.rehabCloudAbrir = abrirLogin;
  window.rehabV45GuardarCopia = guardarCopia;
  setTimeout(ocultarFuncionesProfesionales, 0);
  setTimeout(ocultarFuncionesProfesionales, 1600);
})();
