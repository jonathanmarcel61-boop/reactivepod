const { test, expect } = require("@playwright/test");
const { abrirApp, elegirModo, comenzarEntrenamiento } = require("./helpers");

test("Reacción por colores usa pista visual en fácil", async ({ page }) => {
  await abrirApp(page, { ajustes: { dificultad: "facil" } });
  expect(await elegirModo(page, "colores")).toBe(true);
  await comenzarEntrenamiento(page);

  await expect(page.locator("#textoFase")).toHaveText("PISTA VISUAL", {
    timeout: 10000,
  });
  await expect(page.locator("#textoObjetivo")).toHaveText("TOCA ESTE COLOR");
  await expect(page.locator("#nombreColor")).toHaveText("OBSERVA EL CÍRCULO");
});

test("Reacción por colores usa la palabra en dificultad media", async ({ page }) => {
  await abrirApp(page, { ajustes: { dificultad: "media" } });
  expect(await elegirModo(page, "colores")).toBe(true);
  await comenzarEntrenamiento(page);

  await expect(page.locator("#textoFase")).toHaveText("PISTA DE PALABRA", {
    timeout: 10000,
  });
  await expect(page.locator("#textoObjetivo")).toHaveText("TOCA EL COLOR ESCRITO");
  await expect(page.locator("#nombreColor")).toHaveText(
    /ROJO|VERDE|AZUL|AMARILLO|BLANCO|MORADO|CIAN|NARANJA|ROSADO/
  );
});

test("la selección simultánea evita pares de colores confundibles", async ({ page }) => {
  await abrirApp(page);
  const resultado = await page.evaluate(() => {
    const elegidos = window.rehabV44Colores.elegirContrastantes(
      4,
      ["red", "pink", "purple", "orange", "blue", "cyan", "green", "yellow", "white"]
    );
    const pares = [];
    for (let i = 0; i < elegidos.length; i++) {
      for (let j = i + 1; j < elegidos.length; j++) {
        pares.push({
          colores: [elegidos[i], elegidos[j]],
          confundibles: window.rehabV44Colores.sonConfundibles(elegidos[i], elegidos[j]),
        });
      }
    }
    return { elegidos, pares };
  });

  expect(resultado.elegidos).toHaveLength(4);
  expect(resultado.pares.every((par) => !par.confundibles), resultado).toBe(true);
});

test("Doble estímulo divide el círculo con un color arriba y otro abajo", async ({ page }) => {
  await abrirApp(page);
  expect(await elegirModo(page, "doble")).toBe(true);
  await comenzarEntrenamiento(page);

  await expect
    .poll(
      () => page.locator("#colorObjetivo").evaluate((elemento) => elemento.style.background),
      { timeout: 10000 }
    )
    .toMatch(/linear-gradient\(.+50%.+50%.+100%/);
});
