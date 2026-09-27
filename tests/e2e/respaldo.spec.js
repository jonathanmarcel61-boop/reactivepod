const { test, expect } = require("@playwright/test");
const { abrirApp } = require("./helpers");

test("Cuenta explica el respaldo y no muestra funciones profesionales", async ({ page }) => {
  await abrirApp(page);
  await page.click("#btnCuentaMenu");
  await expect(page.locator("#contenidoCuentaCloud")).toContainText("RESPALDO EN LA NUBE");
  await expect(page.locator("#contenidoCuentaCloud")).toContainText("recuperarlos si cambias o pierdes el teléfono");
  await expect(page.locator("#rehabV45Entrar")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("USUARIOS VINCULADOS");
  await expect(page.locator("body")).not.toContainText("PROFESIONALES VINCULADOS");
});

test("el acceso de respaldo pide solo correo y contraseña", async ({ page }) => {
  await abrirApp(page);
  await page.click("#btnCuentaMenu");
  await page.click("#rehabV45Entrar");
  await expect(page.locator("#rehabV45Login")).toBeVisible();
  await expect(page.locator("#rehabV45Email")).toBeVisible();
  await expect(page.locator("#rehabV45Password")).toBeVisible();
  await expect(page.locator("#rehabV45Login")).not.toContainText("Profesional");
  await expect(page.locator("#rehabV45Login")).not.toContainText("Tipo de uso");
});
