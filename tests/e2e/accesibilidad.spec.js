// Estructura accesible básica: puntos de referencia, nombres de botones, regiones dinámicas.
const { test, expect } = require("@playwright/test");
const { vigilarErrores, abrirApp } = require("./helpers");

test("hay un único <main> y una navegación con nombre", async ({ page }) => {
  const errores = vigilarErrores(page);
  await abrirApp(page);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("nav[aria-label='Navegación principal']")).toHaveCount(1);
  // todas las pantallas viven dentro de <main>
  expect(await page.locator("main > section.pantalla").count()).toBe(await page.locator("section.pantalla").count());
  expect(errores).toEqual([]);
});

test("todo botón de la app tiene nombre accesible", async ({ page }) => {
  await abrirApp(page);
  const sinNombre = await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .filter((b) => {
        const nombre = (b.getAttribute("aria-label") || b.getAttribute("title") || b.textContent || "")
          .replace(/[\s←→×✕✖]/g, "");
        return !nombre;
      })
      .map((b) => b.id || b.className)
  );
  expect(sinNombre).toEqual([]);
});

test("los botones 'volver' se anuncian como Volver", async ({ page }) => {
  await abrirApp(page);
  const botones = page.locator("button.botonVolver");
  const n = await botones.count();
  expect(n).toBeGreaterThan(5);
  for (let i = 0; i < n; i++) await expect(botones.nth(i)).toHaveAttribute("aria-label", "Volver");
});

test("los controles de Ajustes tienen etiqueta", async ({ page }) => {
  await abrirApp(page);
  await page.evaluate(() => mostrarPantalla(pantallaAjustes));
  await expect(page.getByRole("combobox", { name: "Tema de la app" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Sonidos" }).first()).toBeVisible();
});

test("el estado de los pods y los resultados son regiones aria-live", async ({ page }) => {
  await abrirApp(page);
  for (const id of ["textoEstadoPods", "mensajeResultado", "mensajeProgreso"]) {
    await expect(page.locator(`#${id}`)).toHaveAttribute("aria-live", "polite");
  }
});

test("los iconos del menú y de volver son SVG decorativos que existen en el sprite", async ({ page }) => {
  await abrirApp(page);
  await expect(page.locator("#btnInicioMenu")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("nav.menuPrincipal svg.ic[aria-hidden='true']")).toHaveCount(3);
  const rotos = await page.evaluate(() =>
    [...document.querySelectorAll("svg.ic use")]
      .map((u) => u.getAttribute("href"))
      .filter((h) => !document.querySelector(h))
  );
  expect(rotos).toEqual([]);
  expect(await page.locator("svg.ic use").count()).toBeGreaterThanOrEqual(11); // 3 menú + 8 volver
  // el icono se pinta (tiene trazo visible), no queda vacío
  const caja = await page.locator("#btnProgreso svg.ic").boundingBox();
  expect(caja.width).toBeGreaterThan(16);
});

test("el zoom del navegador no está bloqueado", async ({ page }) => {
  await abrirApp(page);
  const viewport = await page.locator("meta[name=viewport]").getAttribute("content");
  expect(viewport).not.toMatch(/user-scalable\s*=\s*(no|0)/);
  expect(viewport).not.toMatch(/maximum-scale\s*=\s*1(\.0)?\b/);
});

// Objetivos táctiles >= 44 px (casillas >= 28 px, por encima del mínimo AA de WCAG 2.2: 24 px)
// y texto >= 12 px en las pantallas principales.

const PANTALLAS_MEDIDAS = [
  ["Inicio", async () => {}],
  ["Tipos", async (p) => { await p.click("#btnEntrenamiento"); await p.waitForSelector(".rehabV22Categoria"); }],
  ["Modos", async (p) => { await p.locator(".rehabV22Categoria").first().click(); await p.waitForSelector(".rehabV22Modo"); }],
  ["Configuración", async (p) => { await p.locator(".rehabV22Modo").first().click(); }],
  ["Progreso", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaProgreso)); }],
  ["Ajustes", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaAjustes)); }],
  ["Perfiles", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaPerfiles)); }],
  ["Pods", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaPods)); }],
];

test("objetivos táctiles y tamaño de texto mínimos en las pantallas principales", async ({ page }) => {
  await abrirApp(page);
  const fallos = [];
  for (const [nombre, ir] of PANTALLAS_MEDIDAS) {
    await ir(page);
    await page.waitForTimeout(350);
    const r = await page.evaluate(() => {
      const vis = (e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== "hidden"; };
      const raiz = document.querySelector(".pantalla.activa");
      const chicos = [...raiz.querySelectorAll("button,a[href],input,select,textarea,[role=button]")]
        .filter(vis)
        .map((e) => { const b = e.getBoundingClientRect(); return { id: e.id || e.className || e.tagName, w: Math.round(b.width), h: Math.round(b.height), check: e.type === "checkbox" }; })
        .filter((x) => (x.check ? x.w < 28 || x.h < 28 : x.w < 44 || x.h < 44));
      const textos = [];
      const it = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
      while (it.nextNode()) {
        const t = it.currentNode, e = t.parentElement;
        if (!t.textContent.trim() || !vis(e)) continue;
        const fs = parseFloat(getComputedStyle(e).fontSize);
        if (fs < 12) textos.push(`${fs}px "${t.textContent.trim().slice(0, 25)}"`);
      }
      return { chicos, textos };
    });
    r.chicos.forEach((x) => fallos.push(`${nombre}: objetivo ${x.w}x${x.h} ${x.id}`));
    r.textos.forEach((x) => fallos.push(`${nombre}: texto ${x}`));
  }
  expect(fallos).toEqual([]);
});
