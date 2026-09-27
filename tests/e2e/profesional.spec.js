const { test, expect } = require("@playwright/test");
const { abrirApp } = require("./helpers");

test("la interfaz ya no ofrece cuentas ni funciones profesionales", async ({ page }) => {
  await abrirApp(page);
  await expect(page.locator('#rehabV28HomeBtn')).toBeHidden();
  await page.evaluate(() => window.rehabRutinas.abrirLista());
  await expect(page.locator('#misRutinasOverlay [data-accion="compartir"]')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.click("#btnCuentaMenu");
  await expect(page.locator("#contenidoCuentaCloud")).not.toContainText("Profesional");
  await expect(page.locator("#contenidoCuentaCloud")).not.toContainText("Vincular");
});
