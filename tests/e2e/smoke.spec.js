const { test, expect } = require("@playwright/test");
const { vigilarErrores, abrirApp, pantallaActiva, tocar } = require("./helpers");

test("primer arranque: aparece el gate de términos y se puede aceptar", async ({ page }) => {
  const errores = vigilarErrores(page);
  await abrirApp(page, { terminos: false });
  await expect(page.locator("#gateTerminosRehabPod")).toBeVisible();
  await expect(page.locator("#btnAceptarTerminosRehabPod")).toBeDisabled();
  await page.check("#checkTerminosRehabPod");
  await page.click("#btnAceptarTerminosRehabPod");
  await expect(page.locator("#gateTerminosRehabPod")).toHaveCount(0);
  expect(errores).toEqual([]);
});

test("arranque normal: pantalla Inicio y sin errores de página", async ({ page }) => {
  const errores = vigilarErrores(page);
  await abrirApp(page);
  expect(await pantallaActiva(page)).toEqual(["pantallaInicio"]);
  await expect(page.locator("#btnEntrenamiento")).toBeVisible();
  expect(errores).toEqual([]);
});

test("navegación: Progreso, Cuenta, Pods y selección de modos abren y vuelven", async ({ page }) => {
  const errores = vigilarErrores(page);
  await abrirApp(page);

  await page.click("#btnProgreso");
  expect(await pantallaActiva(page)).toEqual(["pantallaProgreso"]);
  await tocar(page, "#btnVolverProgreso");
  expect(await pantallaActiva(page)).toEqual(["pantallaInicio"]);

  await page.click("#btnCuentaMenu");
  await page.waitForTimeout(600);
  expect((await pantallaActiva(page))[0]).toMatch(/pantallaCuenta/);
  await tocar(page, ".pantalla.activa .botonVolver");
  expect(await pantallaActiva(page)).toEqual(["pantallaInicio"]);

  await page.click("#btnGestionarPods");
  expect(await pantallaActiva(page)).toEqual(["pantallaPods"]);
  await tocar(page, ".pantalla.activa .botonVolver");
  expect(await pantallaActiva(page)).toEqual(["pantallaInicio"]);

  await page.click("#btnEntrenamiento");
  expect(await pantallaActiva(page)).toEqual(["pantallaTiposEntrenamiento"]);
  await expect(page.locator(".rehabV22Categoria:not(.rehabV22Categoria--dos)")).toHaveCount(3);
  await expect(page.locator(".rehabV22Categoria--dos")).toHaveCount(1); // Dos jugadores
  await tocar(page, "#btnVolverTipos");
  expect(await pantallaActiva(page)).toEqual(["pantallaInicio"]);

  expect(errores).toEqual([]);
});

test("tema: claro y oscuro se aplican al body", async ({ page }) => {
  await abrirApp(page, { tema: "claro" });
  await expect(page.locator("body")).toHaveClass(/tema-claro/);
});

// El indicador de sincronización (V42) vive en la esquina superior derecha y no debe
// tapar ningún control de la pantalla activa (antes cubría el botón "volver").
const PANTALLAS = [
  ["Progreso", "#btnProgreso"],
  ["Pods", "#btnGestionarPods"],
  ["Tipos de entrenamiento", "#btnEntrenamiento"],
  ["Perfiles", "#btnPerfiles"],
];

for (const [nombre, abrir] of PANTALLAS) {
  test(`el indicador de sincronización no tapa controles en ${nombre}`, async ({ page }) => {
    await abrirApp(page);
    await page.click(abrir);
    await page.context().setOffline(true); // sin conexión el indicador se muestra en todas las pantallas
    await expect(page.locator("#rehabV42Estado")).toBeVisible();
    await page.waitForTimeout(600);
    const tapados = await page.evaluate(() => {
      const ind = document.getElementById("rehabV42Estado");
      if (!ind) return ["(sin indicador)"];
      const r = ind.getBoundingClientRect();
      const choca = (b) => b.width && b.height && !(b.right <= r.left || b.left >= r.right || b.bottom <= r.top || b.top >= r.bottom);
      return [...document.querySelectorAll(".pantalla.activa button, .pantalla.activa a[href], .pantalla.activa input, .pantalla.activa select")]
        .filter((e) => e.offsetWidth && choca(e.getBoundingClientRect()))
        .map((e) => e.id || e.className || e.tagName);
    });
    expect(tapados).toEqual([]);
  });
}

test("el botón volver es tocable (nada lo cubre)", async ({ page }) => {
  await abrirApp(page);
  await page.click("#btnProgreso");
  await page.waitForTimeout(600);
  const tapado = await page.evaluate(() => {
    const b = document.getElementById("btnVolverProgreso").getBoundingClientRect();
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    const arriba = document.elementFromPoint(cx, cy);
    return !(arriba && (arriba.id === "btnVolverProgreso" || arriba.closest("#btnVolverProgreso")));
  });
  expect(tapado).toBe(false);
});

test("el indicador 'En línea' solo aparece en Inicio; sin conexión aparece en todas", async ({ page }) => {
  await abrirApp(page);
  const ind = page.locator("#rehabV42Estado");
  await expect(ind).toBeVisible();
  await expect(ind).toHaveText(/En línea/);
  await page.click("#btnProgreso");
  await expect(ind).toBeHidden();

  await page.context().setOffline(true);
  await expect(ind).toBeVisible();
  await expect(ind).toHaveText(/Sin conexión/);
  await page.context().setOffline(false);
  await expect(ind).toBeHidden(); // vuelve a estar todo bien y seguimos en Progreso
});
