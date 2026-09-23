// Utilidades compartidas por las pruebas E2E de RehabPod.
// La app se sirve desde /public con un servidor estático (ver playwright.config.js).

const RUIDO_ESPERADO = [
  /Failed to load resource/i, // Supabase/CDN bloqueado a propósito en las pruebas
  /net::ERR_/i,
  /No se pudo cargar Supabase/i,
  /Supabase/i,
  /RehabPod Cloud/i, // errores esperados al no haber red hacia Supabase
  /Sin conexi[oó]n a internet/i,
];

/** Registra errores de página (excepciones no capturadas y console.error reales). */
function vigilarErrores(page) {
  const errores = [];
  page.on("pageerror", (e) => errores.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (RUIDO_ESPERADO.some((rx) => rx.test(t))) return;
    errores.push("console.error: " + t);
  });
  return errores;
}

/**
 * Abre la app lista para usar.
 * @param {object} opt
 * @param {boolean} [opt.virtual=true]  activa los pods virtuales (sin hardware BLE)
 * @param {boolean} [opt.terminos=true] marca los términos como aceptados
 * @param {string}  [opt.tema]          "claro" | "oscuro"
 * @param {object}  [opt.ajustes]       ajustes adicionales a mezclar en reactipodAjustes
 */
async function abrirApp(page, opt = {}) {
  const { virtual = true, terminos = true, tema, ajustes = {} } = opt;

  // Supabase se carga desde un CDN en tiempo de ejecución: en pruebas se bloquea
  // para que sean deterministas y no dependan de la red.
  await page.context().route(/cdn\.jsdelivr\.net/, (r) => r.abort());

  await page.addInitScript(
    ({ virtual, terminos, tema, ajustes }) => {
      if (sessionStorage.getItem("__rehab_test_init")) return;
      sessionStorage.setItem("__rehab_test_init", "1");
      if (virtual) localStorage.setItem("rehabpodModoVirtual", "true");
      const a = Object.assign({}, ajustes);
      if (terminos) {
        a.terminosAceptados = {
          otorgado: true,
          fecha: new Date().toISOString(),
          version: "v1",
        };
      }
      if (tema) a.tema = tema;
      localStorage.setItem("reactipodAjustes", JSON.stringify(a));
    },
    { virtual, terminos, tema, ajustes }
  );

  await page.goto("/", { waitUntil: "load" });
  if (terminos) await esperarSplash(page);
}

/**
 * Dispara el clic directamente sobre el elemento, sin comprobar si algo lo tapa.
 * En la línea base el indicador de sincronización (V42) cubre parte del botón
 * "volver"; las pruebas de flujo no deben depender de ese defecto (hay una
 * prueba específica en smoke.spec.js que lo vigila).
 */
async function tocar(page, selector) {
  await page.locator(selector).first().dispatchEvent("click");
}

/** Espera a que desaparezca la pantalla de bienvenida (splash). */
async function esperarSplash(page) {
  await page.waitForFunction(
    () => !document.getElementById("splashReactiPod") ||
      !document.getElementById("splashReactiPod").offsetWidth,
    null,
    { timeout: 15000 }
  );
}

async function pantallaActiva(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll(".pantalla.activa")].map((e) => e.id)
  );
}

/** Abre la lista de modos de una categoría que contenga el modo pedido y lo selecciona. */
async function elegirModo(page, modo) {
  await page.click("#btnEntrenamiento");
  await page.waitForSelector(".rehabV22Categoria");
  const n = await page.locator(".rehabV22Categoria").count();
  for (let i = 0; i < n; i++) {
    await page.locator(".rehabV22Categoria").nth(i).click();
    const tarjeta = page.locator(`.rehabV22Modo[data-modo="${modo}"]`);
    try {
      await tarjeta.waitFor({ state: "visible", timeout: 1500 });
      await tarjeta.click();
      return true;
    } catch (_) {
      await page.locator(".rehabV22Volver").click().catch(() => {});
    }
  }
  return false;
}

/** Pulsa "Iniciar" y la intro; espera a estar en la pantalla de entrenamiento. */
async function comenzarEntrenamiento(page) {
  await page.click("#btnComenzar");
  await page.click("#btnComenzarIntroReactiPod");
  await page.waitForFunction(
    () => document.getElementById("pantallaEntrenamiento")?.classList.contains("activa"),
    null,
    { timeout: 20000 }
  );
}

/**
 * Juega pulsando el pod encendido (o pods al azar) hasta llegar a Resultados.
 * @returns {Promise<boolean>} true si llegó a Resultados antes del límite
 */
async function jugarHastaResultados(page, limiteMs = 60000) {
  const t0 = Date.now();
  let paso = 0;
  while (Date.now() - t0 < limiteMs) {
    const fin = await page.evaluate(() =>
      document.getElementById("pantallaResultados")?.classList.contains("activa")
    );
    if (fin) return true;
    const idx = await page.evaluate(() => {
      const base = new Set(["rgb(55, 65, 81)", "rgb(27, 33, 31)", "rgb(36, 43, 40)"]);
      for (let i = 1; i <= 4; i++) {
        const el = document.getElementById("luzPod" + i);
        if (el && el.offsetWidth && !base.has(getComputedStyle(el).backgroundColor)) return i - 1;
      }
      return -1;
    });
    const objetivo = idx >= 0 ? idx : paso++ % 4;
    await page.locator(".pod").nth(objetivo).click({ force: true, timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(idx >= 0 ? 350 : 500);
  }
  return false;
}

module.exports = {
  tocar,
  vigilarErrores,
  abrirApp,
  esperarSplash,
  pantallaActiva,
  elegirModo,
  comenzarEntrenamiento,
  jugarHastaResultados,
};
