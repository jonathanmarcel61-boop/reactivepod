const { test, expect } = require("@playwright/test");
const { abrirApp, vigilarErrores } = require("./helpers");

const animacion = (page, selector) =>
  page.locator(selector).evaluate((el) => {
    const c = getComputedStyle(el);
    return { nombre: c.animationName, duracion: parseFloat(c.animationDuration) };
  });

test.describe("Animaciones", () => {
  test("las pantallas entran con deslizamiento: adelante desde la derecha, Inicio desde la izquierda", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);

    await page.evaluate(() => mostrarPantalla(pantallaAjustes));
    let a = await animacion(page, "#pantallaAjustes");
    expect(a.nombre).toBe("entradaPantalla");
    expect(a.duracion).toBeGreaterThan(0.1);
    expect(a.duracion).toBeLessThan(0.4);

    await page.evaluate(() => mostrarPantalla(pantallaInicio));
    a = await animacion(page, "#pantallaInicio");
    expect(a.nombre).toBe("entradaPantallaAtras");

    // No queda transform permanente al terminar (rompería elementos fixed/sticky).
    await page.waitForTimeout(500);
    const t = await page.locator("#pantallaInicio").evaluate((el) => getComputedStyle(el).transform);
    expect(t).toBe("none");

    // El deslizamiento no genera scroll horizontal.
    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(desborde).toBe(false);
    expect(errores).toEqual([]);
  });

  test("las ventanas se abren con animación y los diálogos con zoom", async ({ page }) => {
    await abrirApp(page);

    await page.evaluate(() => window.rehabV24AbrirHistorial());
    const ov = page.locator(".rp-overlay:not([hidden])").first();
    await expect(ov).toBeVisible();
    const fondo = await ov.evaluate((el) => getComputedStyle(el).animationName);
    const modal = await ov.locator(".rp-modal").first().evaluate((el) => getComputedStyle(el).animationName);
    expect(fondo).toBe("rp-fondo-entra");
    expect(modal).toBe("rp-modal-entra");

    const dialogo = await page.evaluate(() => {
      confirmarRehab({ titulo: "Prueba", mensaje: "¿Seguro?" });
      const el = document.querySelector(".rp-overlay--dialogo:not([hidden]) > .rp-modal");
      return getComputedStyle(el).animationName;
    });
    expect(dialogo).toBe("rp-dialogo-entra");
  });

  test("con 'reducir movimiento' las animaciones se anulan", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrirApp(page);
    await page.evaluate(() => mostrarPantalla(pantallaAjustes));
    const a = await animacion(page, "#pantallaAjustes");
    expect(a.duracion).toBeLessThan(0.01);
  });
});
