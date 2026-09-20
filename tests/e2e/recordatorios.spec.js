const { test, expect } = require("@playwright/test");
const { abrirApp, vigilarErrores } = require("./helpers");

const irAjustes = (page) => page.evaluate(() => mostrarPantalla(pantallaAjustes));

// Simula el plugin nativo de notificaciones locales.
function simularNativo(page, { permiso = "granted" } = {}) {
  return page.evaluate((permiso) => {
    window.__ln = { programadas: [], canceladas: [], canales: [], permisoActual: permiso };
    window.Capacitor = window.Capacitor || {};
    window.Capacitor.isNativePlatform = () => true;
    window.Capacitor.Plugins = window.Capacitor.Plugins || {};
    window.Capacitor.Plugins.LocalNotifications = {
      checkPermissions: async () => ({ display: window.__ln.permisoActual }),
      requestPermissions: async () => ({ display: window.__ln.permisoActual }),
      createChannel: async (c) => void window.__ln.canales.push(c.id),
      getPending: async () => ({ notifications: window.__ln.programadas.map((n) => ({ id: n.id })) }),
      cancel: async ({ notifications }) => {
        const ids = notifications.map((n) => n.id);
        window.__ln.canceladas.push(...ids);
        window.__ln.programadas = window.__ln.programadas.filter((n) => !ids.includes(n.id));
      },
      schedule: async ({ notifications }) => void window.__ln.programadas.push(...notifications),
    };
  }, permiso);
}

test.describe("Recordatorios", () => {
  test("Ajustes: apagado por defecto, se activa, elige días y hora y lo recuerda", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await irAjustes(page);
    const chk = page.locator("#ajusteRecordatorio");
    await expect(chk).not.toBeChecked();
    await expect(page.locator("#recordatorioOpciones")).toBeHidden();

    await chk.check();
    await expect(page.locator("#recordatorioOpciones")).toBeVisible();
    await expect(page.locator("#ajusteRecordatorioEstado")).toContainText("lunes, miércoles y viernes a las 18:00");

    // Cada día es un botón de al menos 44 px con nombre accesible completo.
    const martes = page.locator('#recordatorioDias button[aria-label="Martes"]');
    expect((await martes.boundingBox()).height).toBeGreaterThanOrEqual(44);
    expect((await martes.boundingBox()).width).toBeGreaterThanOrEqual(36);
    await martes.click();
    await expect(martes).toHaveAttribute("aria-pressed", "true");
    await page.locator("#recordatorioHora").fill("07:30");
    await expect(page.locator("#ajusteRecordatorioEstado")).toContainText("a las 07:30");

    await page.screenshot({ path: "test-results/recordatorios-ajustes.png" });

    // Persiste tras recargar.
    await page.reload();
    await irAjustes(page);
    await expect(page.locator("#ajusteRecordatorio")).toBeChecked();
    await expect(martes).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#recordatorioHora")).toHaveValue("07:30");
    expect(errores).toEqual([]);
  });

  test("sin ningún día pide elegir al menos uno", async ({ page }) => {
    await abrirApp(page);
    await irAjustes(page);
    await page.locator("#ajusteRecordatorio").check();
    for (const d of ["Lunes", "Miércoles", "Viernes"]) await page.locator(`#recordatorioDias button[aria-label="${d}"]`).click();
    await expect(page.locator("#ajusteRecordatorioEstado")).toContainText("Elige al menos un día");
  });

  test("en el navegador el aviso de prueba sale dentro de la app", async ({ page }) => {
    await abrirApp(page);
    await irAjustes(page);
    await page.locator("#ajusteRecordatorio").check();
    await expect(page.locator("#ajusteRecordatorioEstado")).toContainText("solo con la app abierta");
    await page.locator("#recordatorioPrueba").click();
    await expect(page.locator(".rp-aviso").last()).toContainText("es hora de entrenar");
  });

  test("en Android programa notificaciones reales, sin repetir ids, y las cancela al apagar", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await simularNativo(page);
    await irAjustes(page);
    await page.locator("#ajusteRecordatorio").check();
    await expect.poll(() => page.evaluate(() => window.__ln.programadas.length)).toBeGreaterThan(0);

    const n = await page.evaluate(() => window.__ln.programadas);
    expect(n.length).toBeLessThanOrEqual(21);
    expect(new Set(n.map((x) => x.id)).size).toBe(n.length);
    expect(n.every((x) => x.id >= 9100 && x.id <= 9199 && x.channelId === "recordatorios" && x.schedule.allowWhileIdle)).toBe(true);
    // Solo lunes, miércoles y viernes a las 18:00 (hora local).
    const dias = await page.evaluate(() => window.__ln.programadas.map((x) => [new Date(x.schedule.at).getDay(), new Date(x.schedule.at).getHours()]));
    expect(dias.every(([d, h]) => [1, 3, 5].includes(d) && h === 18)).toBe(true);

    // Cambiar la hora reprograma sin duplicar.
    await page.locator("#recordatorioHora").fill("06:15");
    await expect.poll(() => page.evaluate(() => window.__ln.programadas.every((x) => new Date(x.schedule.at).getHours() === 6))).toBe(true);
    expect(await page.evaluate(() => new Set(window.__ln.programadas.map((x) => x.id)).size === window.__ln.programadas.length)).toBe(true);

    // Aviso de prueba: id fuera del rango que se limpia.
    await page.locator("#recordatorioPrueba").click();
    await expect.poll(() => page.evaluate(() => window.__ln.programadas.some((x) => x.id === 9050))).toBe(true);

    await page.locator("#ajusteRecordatorio").uncheck();
    await expect.poll(() => page.evaluate(() => window.__ln.programadas.filter((x) => x.id >= 9100).length)).toBe(0);
    expect(errores).toEqual([]);
  });

  test("si el teléfono no da permiso, se apaga solo y explica qué hacer", async ({ page }) => {
    await abrirApp(page);
    await simularNativo(page, { permiso: "denied" });
    await irAjustes(page);
    await page.locator("#ajusteRecordatorio").click(); // vuelve a apagarse solo, por eso no usamos check()
    await expect(page.locator(".rp-aviso--error")).toContainText("permiso de notificaciones");
    await expect(page.locator("#ajusteRecordatorio")).not.toBeChecked();
    expect(await page.evaluate(() => window.__ln.programadas.length)).toBe(0);
  });

  test("al guardar un entrenamiento hoy, el aviso de hoy se cancela", async ({ page }) => {
    await abrirApp(page);
    await simularNativo(page);
    await page.evaluate(() => {
      const h = new Date();
      // Recordatorio para hoy, dentro de un rato, para que exista.
      const dia = h.getDay() === 0 ? 7 : h.getDay();
      const en = new Date(Date.now() + 2 * 3600 * 1000);
      window.__cfg = { activo: true, dias: [dia], hora: `${String(en.getHours()).padStart(2, "0")}:${String(en.getMinutes()).padStart(2, "0")}` };
    });
    const hoyAntes = await page.evaluate(async () => {
      RehabRecordatorios.guardar(window.__cfg);
      await rehabRecordatorios.sincronizar();
      const hoy = new Date().getDate();
      return window.__ln.programadas.filter((x) => new Date(x.schedule.at).getDate() === hoy).length;
    });
    // (si el "dentro de 2 h" cruza medianoche no hay aviso hoy y la prueba no aplica)
    test.skip(hoyAntes === 0, "El aviso de prueba cae mañana");
    expect(hoyAntes).toBe(1);
    const hoyDespues = await page.evaluate(async () => {
      const perfil = obtenerPerfilActivo();
      perfil.historial.push({ timestamp: Date.now(), fecha: "hoy", modo: "Reacción aleatoria", aciertos: 5, errores: 0, promedio: 0.7, dificultad: "media" });
      await rehabRecordatorios.sincronizar();
      const hoy = new Date().getDate();
      return window.__ln.programadas.filter((x) => new Date(x.schedule.at).getDate() === hoy).length;
    });
    expect(hoyDespues).toBe(0);
  });
});
