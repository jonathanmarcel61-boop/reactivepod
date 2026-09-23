const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const { abrirApp, vigilarErrores } = require("./helpers");

async function sembrar(page, n) {
  await page.evaluate((n) => {
    const perfil = obtenerPerfilActivo();
    for (let i = 0; i < n; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i * 2);
      d.setHours(12, 0, 0, 0);
      perfil.historial.push({ timestamp: d.getTime(), fecha: d.toLocaleString(), modo: i % 2 ? "Secuencia / memoria" : "Reacción aleatoria", rondas: 10, aciertos: 8, errores: 2, promedio: 0.9 - i * 0.02, mejor: 0.5, peor: 1.2, dificultad: "media" });
    }
    guardarDatos();
  }, n);
}

async function irAProgreso(page) {
  await page.evaluate(() => {
    mostrarPantalla(pantallaProgreso);
    mostrarProgreso();
  });
}

test.describe("Informe profesional (PDF)", () => {
  test("sin entrenamientos avisa con amabilidad y no genera nada", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await irAProgreso(page);
    await page.locator("#btnInformePDF").click();
    await expect(page.locator("#informeOverlay")).toBeVisible();
    await page.locator("#infDescargar").click();
    await expect(page.locator(".rp-aviso--info")).toContainText("Todavía no tienes entrenamientos");
    expect(errores).toEqual([]);
  });

  test("con datos: opciones, descarga un PDF válido y se puede cerrar", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await sembrar(page, 10);
    await irAProgreso(page);
    await page.locator("#btnInformePDF").click();
    const modal = page.locator("#informeOverlay");
    await expect(modal).toBeVisible();
    await expect(page.locator("#infModo option")).toHaveCount(3);
    await page.locator("#infPeriodo button", { hasText: "90 días" }).click();
    await expect(page.locator("#infPeriodo button[aria-pressed=true]")).toHaveText("90 días");
    await page.locator("#infProfesional").fill("Lic. Ana Pérez");
    await page.locator("#infObservaciones").fill("Buen avance esta semana.");

    await page.screenshot({ path: "test-results/informe-modal.png" });

    const [descarga] = await Promise.all([page.waitForEvent("download"), page.locator("#infDescargar").click()]);
    expect(descarga.suggestedFilename()).toMatch(/^Informe-RehabPod-.*\.pdf$/);
    const ruta = await descarga.path();
    const bytes = fs.readFileSync(ruta);
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(3000);
    await expect(page.locator("#infEstado")).toContainText("Informe descargado");
    // Se recuerda el profesional para la próxima vez.
    expect(await page.evaluate(() => localStorage.getItem("rehabpodInformeProfesional"))).toBe("Lic. Ana Pérez");

    await page.locator("#informeCerrar").click();
    await expect(modal).toBeHidden();
    expect(errores).toEqual([]);
  });

  test("periodo sin sesiones explica qué hacer", async ({ page }) => {
    await abrirApp(page);
    await page.evaluate(() => {
      const perfil = obtenerPerfilActivo();
      const d = new Date();
      d.setDate(d.getDate() - 60);
      perfil.historial.push({ timestamp: d.getTime(), fecha: "x", modo: "Reacción aleatoria", aciertos: 5, errores: 1, promedio: 0.8, dificultad: "media" });
      guardarDatos();
    });
    await irAProgreso(page);
    await page.locator("#btnInformePDF").click();
    await page.locator("#infPeriodo button", { hasText: "7 días" }).click();
    await page.locator("#infDescargar").click();
    await expect(page.locator("#infEstado")).toContainText("No hay sesiones en ese periodo");
  });

  test("en Android usa Filesystem + Share del sistema", async ({ page }) => {
    await abrirApp(page);
    await sembrar(page, 4);
    await irAProgreso(page);
    await page.evaluate(() => {
      window.__llamadas = [];
      window.Capacitor = window.Capacitor || {};
      window.Capacitor.isNativePlatform = () => true;
      window.Capacitor.Plugins = window.Capacitor.Plugins || {};
      window.Capacitor.Plugins.Filesystem = { writeFile: async (o) => (window.__llamadas.push(["fs", o.path, o.directory, o.data.slice(0, 8)]), { uri: "file:///cache/" + o.path }) };
      window.Capacitor.Plugins.Share = { share: async (o) => (window.__llamadas.push(["share", o.url]), {}) };
    });
    await page.locator("#btnInformePDF").click();
    await page.locator("#infCompartir").click();
    await expect(page.locator("#infEstado")).toContainText("compartido");
    const llamadas = await page.evaluate(() => window.__llamadas);
    expect(llamadas[0][0]).toBe("fs");
    expect(llamadas[0][2]).toBe("CACHE");
    expect(llamadas[0][3]).toBe("JVBERi0x"); // "%PDF-1" en base64
    expect(llamadas[1][1]).toMatch(/^file:\/\/\/cache\/Informe-RehabPod-.*\.pdf$/);
  });
});
