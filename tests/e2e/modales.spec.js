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
