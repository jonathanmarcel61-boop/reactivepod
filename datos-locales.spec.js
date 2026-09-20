// Mide el contraste de cada texto visible contra su fondo efectivo (primer ancestro con
// fondo opaco; mezcla los translúcidos).  Uso: node tests/visual/contraste.js [oscuro|claro]
const { chromium } = require("@playwright/test");
const { crearServidor } = require("../helpers/static-server.js");
const { medirContraste } = require("../helpers/contraste.js");
const tema = process.argv[2] || "claro";
const PASOS = [
  ["inicio", async () => {}],
  ["tipos", async (p) => { await p.click("#btnEntrenamiento"); await p.waitForSelector(".rehabV22Categoria"); }],
  ["modos", async (p) => { await p.locator(".rehabV22Categoria").first().click(); await p.waitForSelector(".rehabV22Modo"); }],
  ["config", async (p) => { await p.locator(".rehabV22Modo").first().click(); await p.waitForTimeout(500); }],
  ["progreso", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaProgreso)); }],
  ["resultados", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaResultados)); }],
  ["ajustes", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaAjustes)); }],
  ["perfiles", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaPerfiles)); }],
  ["pods", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaPods)); }],
];
(async () => {
  const srv = await crearServidor(4306); const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block", reducedMotion: "reduce" });
  await ctx.route(/cdn\.jsdelivr\.net/, (r) => r.abort());
  await ctx.addInitScript((tema) => { localStorage.setItem("rehabpodModoVirtual", "true"); localStorage.setItem("reactipodAjustes", JSON.stringify({ tema, terminosAceptados: { otorgado: true, fecha: "2026-01-01T00:00:00.000Z", version: "v1" } })); }, tema);
  const p = await ctx.newPage(); await p.goto("http://127.0.0.1:4306/"); await p.waitForTimeout(3500);
  let total = 0;
  for (const [n, f] of PASOS) {
    await f(p); await p.waitForTimeout(350);
    const fallos = await medirContraste(p);
    total += fallos.length;
    console.log(`== ${n}: ${fallos.length} textos bajo AA`);
    fallos.slice(0, 12).forEach((x) => console.log("   " + x));
  }
  console.log(`TOTAL ${tema}: ${total}`);
  await b.close(); srv.close(); process.exit(0);
})();
