// Captura de pantallas clave (móvil 390x844, tema oscuro y claro) para comparar antes/después
// de cambios de CSS.   Uso:  node tests/visual/capturar.js <carpeta-salida> [puerto]
// Compara con:               python3 tests/visual/comparar.py <carpetaA> <carpetaB>
const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");
const { crearServidor } = require("../helpers/static-server.js");

const salida = path.resolve(process.argv[2] || "capturas");
const puerto = Number(process.argv[3]) || 4295;

const ESTADOS = [
  ["inicio", async () => {}],
  ["tipos", async (p) => { await p.click("#btnEntrenamiento"); await p.waitForSelector(".rehabV22Categoria"); }],
  ["modos", async (p) => { await p.click("#btnEntrenamiento"); await p.locator(".rehabV22Categoria").first().click(); await p.waitForSelector(".rehabV22Modo"); }],
  ["config-modo", async (p) => {
    await p.click("#btnEntrenamiento"); await p.locator(".rehabV22Categoria").first().click();
    await p.locator(".rehabV22Modo").first().click(); await p.waitForTimeout(500);
  }],
  ["pods", async (p) => { await p.click("#btnGestionarPods"); }],
  ["progreso", async (p) => { await p.click("#btnProgreso"); }],
  ["ajustes", async (p) => { await p.evaluate(() => mostrarPantalla(pantallaAjustes)); }],
  ["perfiles", async (p) => { await p.click("#btnPerfiles"); }],
  ["mis-rutinas", async (p) => { await p.evaluate(() => rehabV23AbrirRutinas()); await p.waitForTimeout(300); }],
  ["confirmar", async (p) => {
    await p.evaluate(() => { confirmarRehab({ titulo: "Borrar", mensaje: "¿Seguro?", peligro: true, icono: "⚠️" }); avisarRehab("Guardado", { tipo: "exito", duracion: 0 }); });
    await p.waitForTimeout(300);
  }],
];

(async () => {
  fs.mkdirSync(salida, { recursive: true });
  const servidor = await crearServidor(puerto);
  const navegador = await chromium.launch();
  for (const tema of ["oscuro", "claro"]) {
    for (const [nombre, preparar] of ESTADOS) {
      const ctx = await navegador.newContext({
        viewport: { width: 390, height: 844 }, locale: "es-EC", timezoneId: "America/Guayaquil",
        serviceWorkers: "block", reducedMotion: "reduce", colorScheme: "dark",
      });
      await ctx.route(/cdn\.jsdelivr\.net/, (r) => r.abort());
      await ctx.addInitScript((tema) => {
        localStorage.setItem("rehabpodModoVirtual", "true");
        localStorage.setItem("reactipodAjustes", JSON.stringify({
          tema, terminosAceptados: { otorgado: true, fecha: "2026-01-01T00:00:00.000Z", version: "v1" },
        }));
      }, tema);
      const p = await ctx.newPage();
      await p.goto(`http://127.0.0.1:${puerto}/`);
      await p.waitForFunction(() => !document.getElementById("splashReactiPod") || !document.getElementById("splashReactiPod").offsetWidth, null, { timeout: 15000 });
      await p.waitForTimeout(800);
      try { await preparar(p); await p.waitForTimeout(400); } catch (e) { console.log("!", nombre, tema, e.message.split("\n")[0]); }
      await p.screenshot({ path: path.join(salida, `${nombre}-${tema}.png`) });
      await ctx.close();
    }
  }
  await navegador.close();
  servidor.close();
  console.log("capturas en", salida);
})();
