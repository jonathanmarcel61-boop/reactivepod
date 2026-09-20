const { test, expect } = require("@playwright/test");
const { abrirApp, vigilarErrores } = require("./helpers");

async function sembrar(page, filas) {
  await page.evaluate((f) => {
    const perfil = obtenerPerfilActivo();
    f.forEach(([dias, prom, a, e, modo]) => {
      const d = new Date();
      d.setDate(d.getDate() - dias);
      d.setHours(12, 0, 0, 0);
      perfil.historial.push({ timestamp: d.getTime(), fecha: d.toLocaleString(), modo, rondas: a + e, aciertos: a, errores: e, promedio: prom, mejor: prom - 0.1, peor: prom + 0.2, dificultad: "media" });
    });
    guardarDatos();
  }, filas);
}

test.describe("Progreso: gráficos claros", () => {
  test("sin datos muestra un mensaje amable y ningún gráfico", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await page.evaluate(() => mostrarPantalla(pantallaProgreso) || mostrarProgreso());
    await page.evaluate(() => mostrarProgreso());
    await expect(page.locator("#progresoFrase")).toContainText("Todavía no hay entrenamientos");
    await expect(page.locator("#progresoClaro svg.grafico")).toHaveCount(0);
    expect(errores).toEqual([]);
  });

  test("con datos: frase de mejora, tres gráficos con título y filtros", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await sembrar(page, [
      [2, 0.55, 9, 1, "Reacción aleatoria"],
      [4, 0.6, 8, 2, "Reacción aleatoria"],
      [12, 0.9, 6, 4, "Reacción aleatoria"],
      [15, 0.95, 6, 4, "Secuencia / memoria"],
    ]);
    await page.evaluate(() => {
      mostrarPantalla(pantallaProgreso);
      mostrarProgreso();
    });
    // Periodo por defecto: 30 días → 3 gráficos.
    await expect(page.locator("#progresoClaro svg.grafico")).toHaveCount(3);
    await expect(page.locator("#progresoFrase")).toContainText(/mejoró|Hiciste/);
    for (const svg of await page.locator("#progresoClaro svg.grafico").all()) {
      await expect(svg.locator("title")).not.toBeEmpty();
      await expect(svg.locator("desc")).not.toBeEmpty();
    }

    await page.locator('#progresoPeriodo button[data-dias="7"]').click();
    await expect(page.locator('#progresoPeriodo button[data-dias="7"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#progresoFrase")).toContainText(/mejor|Hiciste|estable|subió/);

    // Filtro por ejercicio: solo un modo, sin gráfico de semanas.
    await page.locator("#progresoModo").selectOption("Secuencia / memoria");
    await page.locator('#progresoPeriodo button[data-dias="0"]').click();
    await expect(page.locator("#progresoFigSemanas")).toBeHidden();
    await expect(page.locator("#progresoClaro svg.grafico")).toHaveCount(2);
    expect(errores).toEqual([]);
  });

  test("los gráficos caben en pantalla y sus textos son legibles en ambos temas", async ({ page }) => {
    for (const tema of ["oscuro", "claro"]) {
      await abrirApp(page, { tema });
      await sembrar(page, [[1, 0.6, 9, 1, "Reacción aleatoria"], [3, 0.7, 8, 2, "Reacción aleatoria"], [5, 0.8, 7, 3, "Reacción aleatoria"]]);
      await page.evaluate(() => {
        mostrarPantalla(pantallaProgreso);
        mostrarProgreso();
      });
      const svg = page.locator("#progresoFigReaccion svg");
      await svg.scrollIntoViewIfNeeded();
      const caja = await svg.boundingBox();
      expect(caja.width).toBeLessThanOrEqual(390);
      const info = await page.evaluate(() => {
        const t = document.querySelector("#progresoFigReaccion .grafico__texto");
        const c = getComputedStyle(t);
        return { size: parseFloat(c.fontSize), color: c.fill };
      });
      expect(info.size).toBeGreaterThanOrEqual(12);
      await page.goto("about:blank");
    }
  });
});
