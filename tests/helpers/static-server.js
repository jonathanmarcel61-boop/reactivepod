// Servidor estático mínimo (sin dependencias) para las pruebas E2E.
// Sirve /public igual que lo hace Capacitor: sin CSP ni cabeceras extra.
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "../../public");
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function crearServidor(puerto = 4173) {
  const servidor = http.createServer((req, res) => {
    let ruta = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (ruta.endsWith("/")) ruta += "index.html";
    const archivo = path.join(RAIZ, path.normalize(ruta));
    if (!archivo.startsWith(RAIZ)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(archivo, (err, datos) => {
      if (err) {
        res.writeHead(404).end("no encontrado");
        return;
      }
      res.writeHead(200, {
        "Content-Type": TIPOS[path.extname(archivo)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(datos);
    });
  });
  return new Promise((ok) => servidor.listen(puerto, "127.0.0.1", () => ok(servidor)));
}

module.exports = { crearServidor };

if (require.main === module) {
  crearServidor(Number(process.env.PORT) || 4173).then((s) =>
    console.log("Sirviendo public/ en http://127.0.0.1:" + s.address().port)
  );
}
