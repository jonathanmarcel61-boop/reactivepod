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

test("la introducción permite iniciar en pantalla completa y salir con un botón visible", async ({ page }) => {
  await abrirApp(page);
  expect(await elegirModo(page, "simple")).toBe(true);
  await page.click("#btnComenzar");

  const opcion = page.locator("#rehabV48ElegirPantalla");
  await expect(opcion).toBeVisible();
  await expect(opcion).toContainText("Pantalla completa");
  await opcion.click();
  await expect(opcion).toHaveAttribute("aria-pressed", "true");

  await page.click("#btnComenzarIntroReactiPod");
  const pantallaCompleta = page.locator("#rehabPantallaEstimulo");
  await expect(pantallaCompleta).toBeVisible();
  await expect(pantallaCompleta).toHaveClass(/rehabPantallaPreparando/);
  await expect(page.locator("#rehabPantallaEstimuloAccion")).toHaveCSS("color", "rgb(248, 250, 252)");
  await expect(page.locator("#rehabPantallaEstimuloColor")).toHaveCSS("color", "rgb(134, 239, 172)");
  await expect(page.locator("#rehabCerrarPantallaEstimulo")).toBeVisible();
  await expect(page.locator("#rehabCerrarPantallaEstimulo")).toContainText("SALIR");

  await page.click("#rehabCerrarPantallaEstimulo");
  await expect(page.locator("#rehabPantallaEstimulo")).toBeHidden();
});

test("el nombre largo del color cabe en pantalla completa horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 1365, height: 768 });
  await abrirApp(page);
  expect(await elegirModo(page, "simple")).toBe(true);
  await comenzarEntrenamiento(page);
  await page.click("#btnPantallaCompletaEstimulo");
  await page.locator("#rehabPantallaEstimuloColor").evaluate((elemento) => {
    elemento.textContent = "AMARILLO";
  });

  const caja = await page.locator("#rehabPantallaEstimuloColor").boundingBox();
  expect(caja.x).toBeGreaterThanOrEqual(0);
  expect(caja.x + caja.width).toBeLessThanOrEqual(1365);
});
