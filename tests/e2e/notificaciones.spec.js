const { test, expect } = require("@playwright/test");
const { abrirApp } = require("./helpers");
test("Ajustes conserva recordatorios locales sin avisos de asignaciones", async ({ page }) => {
  await abrirApp(page);
  await page.click("#btnAjustesMenu");
  await expect(page.locator("#ajusteRecordatorio")).toBeVisible();
  await expect(page.locator("#btnAjusteNotificaciones")).toHaveCount(0);
  await expect(page.locator("#rehabV41Bell")).toHaveCount(0);
});
