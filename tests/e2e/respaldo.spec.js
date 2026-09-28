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

test("el acceso permite iniciar sesión o abrir el registro completo", async ({ page }) => {
  await abrirApp(page);
  await page.click("#btnCuentaMenu");
  await page.click("#rehabV45Entrar");
  await expect(page.locator("#rehabV45Login")).toBeVisible();
  await expect(page.locator("#rehabV45Email")).toBeVisible();
  await expect(page.locator("#rehabV45Password")).toBeVisible();
  await expect(page.locator("#rehabV45Login")).not.toContainText("Profesional");
  await expect(page.locator("#rehabV47CamposRegistro")).toBeHidden();
  await page.click("#rehabV47TabCrear");
  await expect(page.locator("#rehabV47CamposRegistro")).toBeVisible();
  await expect(page.locator("#rehabV47TipoUso")).toContainText("Deportista");
  await expect(page.locator("#rehabV47TipoUso")).toContainText("Rehabilitación / fisioterapia");
  await expect(page.locator("#rehabV47Edad")).toBeVisible();
  await expect(page.locator("#rehabV47Peso")).toBeVisible();
  await expect(page.locator("#rehabV47Altura")).toBeVisible();
  const caja = await page.locator(".rehabV45LoginCard").boundingBox();
  const vista = page.viewportSize();
  expect(caja).not.toBeNull();
  expect(caja.x).toBeGreaterThanOrEqual(0);
  expect(caja.y).toBeGreaterThanOrEqual(0);
  expect(caja.x + caja.width).toBeLessThanOrEqual(vista.width);
  expect(caja.y + caja.height).toBeLessThanOrEqual(vista.height);
});

test("edad, peso y altura son opcionales pero se validan si se escriben", async ({ page }) => {
  await abrirApp(page);
  await page.click("#btnCuentaMenu");
  await page.click("#rehabV45Entrar");
  await page.click("#rehabV47TabCrear");
  await page.fill("#rehabV45Email", "prueba@example.com");
  await page.fill("#rehabV45Password", "ClaveSegura123");
  await page.fill("#rehabV47Edad", "3");
  await page.click("#rehabV47Enviar");
  await expect(page.locator("#rehabV45LoginMensaje")).toContainText("La edad debe estar entre 5 y 100");
});
