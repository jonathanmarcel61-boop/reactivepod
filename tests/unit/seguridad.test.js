const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const raiz = path.resolve(__dirname, "../..");
const leer = (archivo) => fs.readFileSync(path.join(raiz, archivo), "utf8");

test("la app no descarga Supabase desde un CDN", () => {
  const app = leer("public/app.js");
  const html = leer("public/index.html");
  assert.doesNotMatch(app + html, /cdn\.jsdelivr\.net\/npm\/@supabase/i);
  assert.match(html, /vendor\/supabase-2\.57\.4\.js/);
});

test("la política CSP bloquea scripts y objetos externos por defecto", () => {
  const html = leer("public/index.html");
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /script-src 'self'/);
  assert.match(html, /object-src 'none'/);
});

test("el cliente no permite elegir ni modificar el rol profesional", () => {
  const app = leer("public/app.js");
  assert.doesNotMatch(app, /id="rehabV27RegRol"/);
  assert.doesNotMatch(app, /id="rehabV40Rol"/);
  assert.doesNotMatch(app, /\.update\(\{\s*full_name:\s*nombre,\s*role:/s);
});

test("Android bloquea texto claro y copias de seguridad", () => {
  const manifest = leer("android/app/src/main/AndroidManifest.xml");
  assert.match(manifest, /android:usesCleartextTraffic="false"/);
  assert.match(manifest, /android:allowBackup="false"/);
});

test("el servidor exige token al exponerse fuera de localhost", () => {
  const servidor = leer("server.js");
  assert.match(servidor, /REHABPOD_WS_TOKEN/);
  assert.match(servidor, /HOST !== "127\.0\.0\.1"/);
  assert.match(servidor, /MAX_MESSAGES_PER_10S/);
});
