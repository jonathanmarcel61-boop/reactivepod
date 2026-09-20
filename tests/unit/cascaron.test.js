const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const publico = path.join(__dirname, "../../public");
const html = fs.readFileSync(path.join(publico, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(publico, "sw-rehabpod.js"), "utf8");

const scriptsLocales = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !/^https?:/.test(s));
const enCascaron = [...sw.matchAll(/^\s+"\.\/([^"]+)",?$/gm)].map((m) => m[1]);

test("todo script local de index.html está en el caché sin conexión", () => {
  const faltan = scriptsLocales.filter((s) => !enCascaron.includes(s));
  assert.deepEqual(faltan, [], `Faltan en sw-rehabpod.js: ${faltan.join(", ")}`);
});

test("todo archivo del caché existe (si no, la instalación del SW falla)", () => {
  const faltan = enCascaron.filter((f) => f && !fs.existsSync(path.join(publico, f)));
  assert.deepEqual(faltan, []);
});

test("los scripts se cargan en un orden que respeta sus dependencias", () => {
  const i = (n) => scriptsLocales.indexOf(n);
  const antes = (a, b) => assert.ok(i(a) >= 0 && i(b) >= 0 && i(a) < i(b), `${a} debe cargarse antes que ${b}`);
  antes("js/utils.js", "js/ui.js");
  antes("js/metas.js", "js/graficos.js");
  antes("js/graficos.js", "js/informe.js");
  antes("js/pdf.js", "js/informe.js");
  antes("js/metas.js", "js/recordatorios.js");
  antes("js/informe.js", "app.js");
  antes("app.js", "js/asistente.js");
  antes("js/asistente.js", "js/misrutinas.js");
  antes("js/asistente.js", "js/dosjugadores.js");
  antes("js/motivacion.js", "js/recordatorios-ui.js");
  antes("js/progreso.js", "js/informe-ui.js");
});
