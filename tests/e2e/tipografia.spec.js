// Las fuentes están empaquetadas con la app (sin depender de Internet) y se aplican.
const { test, expect } = require("@playwright/test");
const { abrirApp } = require("./helpers");

test("Inter, Barlow Condensed y JetBrains Mono se cargan desde /fonts", async ({ page }) => {
  const descargadas = [];
  page.on("response", (r) => { if (/\/fonts\/.*\.woff2$/.test(r.url())) descargadas.push(r.url().split("/").pop()); });
  await abrirApp(page);
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 16px "Inter"'),
      document.fonts.load('800 24px "Barlow Condensed"'),
      document.fonts.load('400 16px "JetBrains Mono"'),
    ]);
  });
  const ok = await page.evaluate(() =>
    [["400", "Inter"], ["800", "Barlow Condensed"], ["400", "JetBrains Mono"]].map(([w, f]) =>
      document.fonts.check(`${w} 16px "${f}"`) &&
      [...document.fonts].some((x) => x.family.replace(/"/g, "") === f && x.status === "loaded")
    )
  );
  expect(ok).toEqual([true, true, true]);
  expect(descargadas.join(" ")).toMatch(/inter-latin-wght/);
  expect(descargadas.join(" ")).toMatch(/barlow-condensed-latin-800/);
  expect(descargadas.join(" ")).toMatch(/jetbrains-mono-latin-wght/);
});

test("el texto usa Inter y los títulos la fuente display", async ({ page }) => {
  await abrirApp(page);
  const f = await page.evaluate(() => ({
    cuerpo: getComputedStyle(document.body).fontFamily,
    titulo: getComputedStyle(document.querySelector("h1, h2")).fontFamily,
  }));
  expect(f.cuerpo).toMatch(/^"?Inter/);
  expect(f.titulo).toMatch(/Barlow Condensed/);
});

test("todas las fuentes existen y pesan menos de 200 KB en total", async ({ request }) => {
  const nombres = [
    "inter-latin-wght-normal.woff2",
    "jetbrains-mono-latin-wght-normal.woff2",
    "barlow-condensed-latin-700-normal.woff2",
    "barlow-condensed-latin-800-normal.woff2",
  ];
  let total = 0;
  for (const n of nombres) {
    const r = await request.get(`/fonts/${n}`);
    expect(r.status(), n).toBe(200);
    total += (await r.body()).length;
  }
  expect(total).toBeLessThan(200 * 1024);
});
