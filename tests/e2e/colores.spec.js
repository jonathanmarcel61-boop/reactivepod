// El catálogo de colores de los pods es único; el resto de listas se deriva de él.
const { test, expect } = require("@playwright/test");
const { abrirApp } = require("./helpers");

test("catálogo único de colores: claves, Memoria (sin rojo/verde) y Caza", async ({ page }) => {
  await abrirApp(page);
  const r = await page.evaluate(() => ({
    claves: CLAVES_COLORES_REACTIPOD,
    catalogo: Object.keys(catalogoColoresPersonalizados),
    memoria: REHABPOD_COLORES_MEMORIA,
    caza: REHABPOD_COLORES_CAZA,
    verde: REHAB_V21_VERDE,
    rojo: REHAB_V21_ROJO,
    verdeCat: catalogoColoresPersonalizados.green.css,
    rojoCat: catalogoColoresPersonalizados.red.css,
  }));
  const todos = ["red", "green", "blue", "yellow", "white", "purple", "cyan", "orange", "pink"];
  expect(r.claves).toEqual(todos);
  expect(r.catalogo).toEqual(todos);
  expect(r.caza).toEqual(todos);
  expect(r.memoria).toEqual(["blue", "yellow", "white", "purple", "cyan", "orange", "pink"]);
  expect(r.verde).toBe(r.verdeCat);
  expect(r.rojo).toBe(r.rojoCat);
});
