const { test, expect } = require("@playwright/test");
const { abrirApp, vigilarErrores } = require("./helpers");

test.describe("Notificaciones", () => {
  test("la barra inferior ofrece Ajustes (y ya no hay un botón de Avisos duplicado)", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);

    await expect(page.locator("#btnNotificacionesMenu")).toHaveCount(0);
    const boton = page.locator("#btnAjustesMenu");
    await expect(boton).toBeVisible();
    await expect(boton).toContainText("Ajustes");
    expect((await boton.boundingBox()).height).toBeGreaterThanOrEqual(44);

    await boton.click();
    await expect(page.locator("#pantallaAjustes")).toHaveClass(/activa/);
    // Desde ahí se llega a los recordatorios y a las notificaciones.
    await expect(page.locator("#ajusteRecordatorio")).toBeVisible();
    await expect(page.locator("#btnAjusteNotificaciones")).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("Ajustes tiene la fila Notificaciones con su estado", async ({ page }) => {
    await abrirApp(page);
    await page.evaluate(() => mostrarPantalla(pantallaAjustes));

    await expect(page.locator("#ajusteNotificacionesEstado")).toContainText("Inicia sesión");
    await page.locator("#btnAjusteNotificaciones").click();
    await expect(page.locator(".rp-aviso")).toContainText("Inicia sesión");
  });

  test("con sesión, la campana muestra el contador de no leídas y abre el centro", async ({ page }) => {
    await abrirApp(page);

    // Simula sesión de la nube y notificaciones (sin red).
    await page.evaluate(async () => {
      const filas = [
        { id: 1, title: "Nueva rutina", message: "Tienes una rutina", read_at: null, created_at: new Date().toISOString() },
        { id: 2, title: "Otra", message: "Completada", read_at: null, created_at: new Date().toISOString() },
        { id: 3, title: "Vieja", message: "Leída", read_at: "2026-01-01T00:00:00Z", created_at: "2026-01-01T00:00:00Z" },
      ];
      const consulta = {
        select: () => consulta,
        eq: () => consulta,
        order: () => consulta,
        limit: () => Promise.resolve({ data: filas, error: null }),
      };
      window.rehabGetSupabaseClient = async () => ({
        auth: {
          getSession: async () => ({ data: { session: { user: { id: "u1" } } } }),
          onAuthStateChange: () => {},
        },
        from: () => consulta,
      });
      await window.rehabV41ActualizarNotificaciones(false);
    });

    await expect(page.locator("#rehabV41Badge")).toHaveText("2");
    await expect(page.locator("#ajusteNotificacionesEstado")).toContainText("2 sin leer");

    await page.locator("#rehabV41Bell").click();
    await expect(page.locator("#rehabV41Overlay")).toBeVisible();
    await expect(page.locator("#rehabV41Lista")).toContainText("Nueva rutina");
  });
});
