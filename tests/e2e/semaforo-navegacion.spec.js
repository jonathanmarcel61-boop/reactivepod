const { test, expect } = require("@playwright/test");
const { abrirApp, elegirModo, comenzarEntrenamiento } = require("./helpers");

test("Semáforo muestra las tres instrucciones y abre la vista completa", async ({ page }) => {
  await abrirApp(page);
  expect(await elegirModo(page, "semaforoMarcha")).toBe(true);

  await page.selectOption("#tipoFinalGeneralReactiPod", "rondas");
  await page.selectOption("#rondasGeneralReactiPod", "5");
  await comenzarEntrenamiento(page);

  await expect(page.locator("#textoObjetivo")).toHaveText(/CAMINA|DESPACIO|DETENTE/);
  await page.click("#btnPantallaCompletaEstimulo");
  await expect(page.locator("#rehabPantallaEstimulo")).toBeVisible();
  await expect(page.locator("#rehabPantallaEstimuloAccion")).toHaveText(
    /CAMINA|DESPACIO|DETENTE/
  );

  await page.evaluate(() => window.rehabV43Retroceder());
  await expect(page.locator("#rehabPantallaEstimulo")).toBeHidden();
});

test("Atrás vuelve a la pantalla anterior sin salir de la aplicación", async ({ page }) => {
  await abrirApp(page);
  await page.click("#btnEntrenamiento");
  await expect(page.locator("#pantallaTiposEntrenamiento")).toHaveClass(/activa/);

  await page.evaluate(() => window.rehabV43Retroceder());
  await expect(page.locator("#pantallaInicio")).toHaveClass(/activa/);
  await expect(page.locator("#contenidoApp")).toBeVisible();
});
