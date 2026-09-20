const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const PDF = require("../../public/js/pdf.js");

const texto = (bytes) => Buffer.from(bytes).toString("latin1");

test("anchoDe usa métricas reales de Helvetica", () => {
  // "Hola" a 12 pt: H=722 o=556 l=222 a=556 → 2056 * 12 / 1000
  assert.ok(Math.abs(PDF.anchoDe("Hola", 12, false) - 24.672) < 1e-9);
  // La negrita es más ancha.
  assert.ok(PDF.anchoDe("Reacción", 12, true) > PDF.anchoDe("Reacción", 12, false));
  // Las vocales acentuadas miden como su letra base.
  assert.equal(PDF.anchoDe("é", 10, false), PDF.anchoDe("e", 10, false));
});

test("codificar: Latin-1 y cp1252 se conservan; emojis se omiten; lo demás pasa a '?'", () => {
  assert.deepEqual(PDF.codificar("ñ¡¿"), [0xf1, 0xa1, 0xbf]);
  assert.deepEqual(PDF.codificar("–•"), [150, 149]);
  assert.deepEqual(PDF.codificar("a😀b"), [97, 98]);
  assert.deepEqual(PDF.codificar("a→b"), [97, 63, 98]);
  assert.deepEqual(PDF.codificar(null), []);
});

test("partirTexto ajusta a la línea, respeta saltos y corta palabras enormes", () => {
  const l = PDF.partirTexto("uno dos tres cuatro cinco seis siete", 10, 60, false);
  assert.ok(l.length > 1);
  l.forEach((x) => assert.ok(PDF.anchoDe(x, 10, false) <= 60 + 1e-9, x));
  assert.deepEqual(PDF.partirTexto("a\nb", 10, 100, false), ["a", "b"]);
  const largo = PDF.partirTexto("x".repeat(200), 10, 50, false);
  assert.ok(largo.length > 1);
  largo.forEach((x) => assert.ok(PDF.anchoDe(x, 10, false) <= 50 + 1e-9));
});

test("el PDF tiene cabecera, xref con desplazamientos exactos y una página por nuevaPagina", () => {
  const d = new PDF.Documento({ titulo: "Informe" });
  d.texto("Hola (mundo) \\ áé", 50, 100);
  d.nuevaPagina();
  d.texto("Dos", 50, 100, { negrita: true });
  assert.equal(d.pagina, 2);
  const s = texto(d.salida());
  assert.ok(s.startsWith("%PDF-1.4"));
  assert.ok(s.trimEnd().endsWith("%%EOF"));
  assert.match(s, /\/Count 2/);

  // Cada entrada de la tabla xref apunta exactamente al "N 0 obj" correspondiente.
  const inicioXref = Number(/startxref\n(\d+)/.exec(s)[1]);
  assert.ok(s.slice(inicioXref).startsWith("xref"));
  const entradas = [...s.slice(inicioXref).matchAll(/(\d{10}) 00000 n /g)].map((m) => Number(m[1]));
  entradas.forEach((desp, i) => assert.ok(s.slice(desp).startsWith(`${i + 1} 0 obj`), `objeto ${i + 1}`));

  // Escapes de paréntesis y barra invertida.
  assert.ok(s.includes("(Hola \\(mundo\\) \\\\ "));
});

test("enPagina dibuja sobre una página anterior", () => {
  const d = new PDF.Documento();
  d.nuevaPagina();
  d.enPagina(1, () => d.texto("Pie", 10, 10));
  d.texto("Segunda", 10, 10);
  assert.equal(d.paginas[0].length, 1);
  assert.equal(d.paginas[1].length, 1);
  assert.match(d.paginas[0][0], /Pie/);
});

test("un lector real (pdftotext) puede abrir el PDF y leer el texto", { skip: spawnSync("which", ["pdftotext"]).status !== 0 }, () => {
  const d = new PDF.Documento({ titulo: "Prueba" });
  d.texto("Precisión: 93 % · Reacción", 50, 100, { tam: 14 });
  d.rect(50, 120, 100, 40, { relleno: "#c6ff4d", borde: "#000000", radio: 6 });
  d.circulo(200, 140, 10, { relleno: "#3b82f6" });
  d.poli([{ x: 10, y: 300 }, { x: 60, y: 260 }], { color: "#ef4444" });
  const tmp = path.join(os.tmpdir(), `rehabpod-${process.pid}.pdf`);
  fs.writeFileSync(tmp, d.salida());
  const salida = execFileSync("pdftotext", [tmp, "-"]).toString("utf8");
  fs.unlinkSync(tmp);
  assert.match(salida, /Precisión: 93 %/);
});
