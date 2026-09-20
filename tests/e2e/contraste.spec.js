// Contraste WCAG AA (4.5:1 texto normal, 3:1 grande) en las pantallas principales,
// en tema oscuro y claro. Los textos sobre degradados/imágenes y los emojis no se miden.
const { test, expect } = require("@playwright/test");
const { abrirApp } = require("./helpers");
const { medirContraste } = require("../helpers/contraste");

const PANTALLAS = [
  ["Inicio", async () => {}],
  ["Tipos", async (p) => { await p.click("#btnEntrenamiento"); await p.waitForSelector(".rehabV22Categoria"); }],
  ["Modos", async (p) => { await p.locator(".rehabV22Categoria").first().click(); await p.waitForSelector(".rehabV22Modo"); }],
  ["Configuración", async (p) => { await p.locator(".rehabV22Modo").first().click(); }],
  ["Progreso", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaProgreso)); }],
  ["Resultados", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaResultados)); }],
  ["Ajustes", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaAjustes)); }],
  ["Perfiles", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaPerfiles)); }],
  ["Pods", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaPods)); }],
];

for (const tema of ["oscuro", "claro"]) {
  test(`contraste AA en las pantallas principales (tema ${tema})`, async ({ page }) => {
    await abrirApp(page, { tema });
    const fallos = [];
    for (const [nombre, ir] of PANTALLAS) {
      await ir(page);
      await page.waitForTimeout(350);
      (await medirContraste(page)).forEach((f) => fallos.push(`${nombre}: ${f}`));
    }
    expect(fallos).toEqual([]);
  });
}
