const { test, expect } = require("@playwright/test");
const { abrirApp } = require("./helpers");

test("Progreso ya no muestra la descarga de informe PDF", async ({ page }) => {
  await abrirApp(page);
  await page.click("#btnProgreso");
  await expect(page.locator("#btnInformePDF")).toHaveCount(0);
  await expect(page.locator("#progresoClaro")).not.toContainText("Informe profesional");
});
