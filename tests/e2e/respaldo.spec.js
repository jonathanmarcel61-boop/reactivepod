const { test, expect } = require("@playwright/test");
const { abrirApp } = require("./helpers");

test("Cuenta explica el respaldo y no muestra funciones profesionales", async ({ page }) => {
  await abrirApp(page);
  await page.click("#btnCuentaMenu");
  await expect(page.locator("#contenidoCuentaCloud")).toContainText("RESPALDO EN LA NUBE");
  await expect(page.locator("#contenidoCuentaCloud")).toContainText("recuperar tus datos si cambias de teléfono");
  await expect(page.locator(".rehabV46CuentaHero")).toContainText("PERFILES DE ESTE TELÉFONO");
  await expect(page.locator(".rehabV46Perfil").first()).toContainText("Jugador 1");
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
  const caja = await page.locator(".rehabV45LoginCard").boundingBox();
  const vista = page.viewportSize();
  expect(caja).not.toBeNull();
  expect(caja.x).toBeGreaterThanOrEqual(0);
  expect(caja.y).toBeGreaterThanOrEqual(0);
  expect(caja.x + caja.width).toBeLessThanOrEqual(vista.width);
  expect(caja.y + caja.height).toBeLessThanOrEqual(vista.height);
});
