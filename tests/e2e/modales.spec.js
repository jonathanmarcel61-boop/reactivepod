// Los modales de RehabPod (rutinas, asignadas, notificaciones…) se abren y se cierran.
const { test, expect } = require("@playwright/test");
const { vigilarErrores, abrirApp } = require("./helpers");

const VISIBLE = (page, sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    return !!(el && !el.hidden && el.offsetWidth > 0);
  }, sel);

test("Mis rutinas: se abre y se cierra con el botón ×", async ({ page }) => {
  const errores = vigilarErrores(page);
  await abrirApp(page);
  await page.evaluate(() => rehabV23AbrirRutinas());
  await expect.poll(() => VISIBLE(page, "#rehabV23Overlay")).toBe(true);
  await page.click("#rehabV23Cerrar");
  await expect.poll(() => VISIBLE(page, "#rehabV23Overlay")).toBe(false);
  expect(errores).toEqual([]);
});

test("Rutinas asignadas: se abre y se cierra con el botón ×", async ({ page }) => {
  const errores = vigilarErrores(page);
  await abrirApp(page);
  await page.evaluate(() => window.rehabV28Abrir());
  await expect.poll(() => VISIBLE(page, "#rehabV28Overlay")).toBe(true);
  await page.click("#rehabV28Cerrar");
  await expect.poll(() => VISIBLE(page, "#rehabV28Overlay")).toBe(false);
  expect(errores).toEqual([]);
});

test("Notificaciones (campana): se abre y se cierra", async ({ page }) => {
  const errores = vigilarErrores(page);
  await abrirApp(page);
  const campana = page.locator("#rehabV41Bell");
  if (await campana.count() === 0 || !(await campana.isVisible())) {
    test.skip(true, "la campana solo aparece con sesión en la nube");
  }
  await campana.click();
  await expect.poll(() => VISIBLE(page, "#rehabV41Overlay")).toBe(true);
  await page.click("#rehabV41Cerrar");
  await expect.poll(() => VISIBLE(page, "#rehabV41Overlay")).toBe(false);
  expect(errores).toEqual([]);
});
