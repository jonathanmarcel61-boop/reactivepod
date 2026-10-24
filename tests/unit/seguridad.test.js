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

test("la cuenta se usa como respaldo y no carga la interfaz profesional", () => {
  const html = leer("public/index.html");
  const respaldo = leer("public/js/cuenta-respaldo.js");
  assert.doesNotMatch(html, /<script src="js\/profesional\.js"/);
  assert.match(html, /js\/cuenta-respaldo\.js/);
  assert.match(respaldo, /rehab_user_backups/);
  assert.match(respaldo, /RESTAURAR EN ESTE TELÉFONO/);
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

// Ejecuta los mensajes reales sin cargar la interfaz ni realizar peticiones.
function mensajesRed(enLinea) {
  const vm = require("node:vm");
  const app = leer("public/app.js");
  const inicio = app.indexOf("function rehabEsErrorDeRed(");
  const fin = app.indexOf("function rehabValidarEmail(", inicio);
  const contexto = { navigator: { onLine: enLinea } };
  vm.createContext(contexto);
  vm.runInContext(app.slice(inicio, fin), contexto);
  return contexto.rehabMensajeError;
}

test("fallo de nube con conexión no afirma que el teléfono está sin internet", () => {
  const mensaje = mensajesRed(true)(new Error("Failed to fetch"));
  assert.match(mensaje, /cuenta en la nube/);
  assert.doesNotMatch(mensaje, /Sin conexión a internet|Tus datos se cargarán/);
});

test("dispositivo desconectado muestra instrucciones de conexión", () => {
  assert.match(mensajesRed(false)(new Error("Failed to fetch")), /dispositivo indica que está sin conexión/);
});

test("tiempo agotado se distingue de errores de cuenta", () => {
  const mensaje = mensajesRed(true);
  assert.match(mensaje(new Error("Tiempo de espera agotado al conectar con la nube.")), /cuenta en la nube/);
  assert.equal(mensaje(new Error("Invalid login credentials")), "Invalid login credentials");
});
