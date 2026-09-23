const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const I = require("../../public/js/informe.js");

const AHORA = new Date(2026, 8, 19, 10, 0, 0);
function historial(n = 12) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(AHORA);
    d.setDate(d.getDate() - i * 2);
    return { timestamp: d.getTime(), fecha: d.toLocaleString(), modo: i % 2 ? "Secuencia / memoria" : "Reacción aleatoria", aciertos: 8, errores: 2, promedio: 0.9 - i * 0.02, mejor: 0.5, dificultad: "media" };
  });
}
const pdftotext = (bytes) => {
  const f = path.join(os.tmpdir(), `inf-${process.pid}-${Date.now()}.pdf`);
  fs.writeFileSync(f, bytes);
  const r = spawnSync("pdftotext", ["-layout", f, "-"], { encoding: "utf8" });
  fs.unlinkSync(f);
  return r.status === 0 ? r.stdout : null;
};

test("slug quita acentos y símbolos", () => {
  assert.equal(I.slug("María José Ñandú"), "Maria-Jose-Nandu");
  assert.ok(I.slug("") .length > 0);
});

test("construir devuelve un PDF válido con nombre de archivo y resumen", () => {
  const r = I.construir({ perfil: { nombre: "Ana", historial: historial() }, dias: 30, meta: 3, ahora: AHORA });
  assert.equal(Buffer.from(r.bytes.slice(0, 5)).toString(), "%PDF-");
  assert.match(r.nombreArchivo, /^Informe-RehabPod-Ana-2026-09-19\.pdf$/);
  assert.ok(r.paginas >= 2);
  assert.equal(r.resumen.sesiones, 12);
});

test("el texto del PDF incluye paciente, cifras y observaciones", (t) => {
  const r = I.construir({ perfil: { nombre: "Ana Ñandú", historial: historial() }, dias: 30, profesional: "Lic. Pérez", observaciones: "Buen avance en la mano derecha.", ahora: AHORA });
  const txt = pdftotext(r.bytes);
  if (txt === null) return t.skip("pdftotext no disponible");
  assert.match(txt, /Ana Ñandú/);
  assert.match(txt, /Lic\. Pérez/);
  assert.match(txt, /Buen avance en la mano derecha/);
  assert.match(txt, /Sesiones/);
  assert.match(txt, /Observaciones del profesional/);
});

test("filtra por ejercicio y omite la tabla de sesiones si se pide", (t) => {
  const h = historial();
  const a = I.construir({ perfil: { nombre: "Ana", historial: h }, dias: null, modo: "Secuencia / memoria", ahora: AHORA });
  assert.equal(a.resumen.sesiones, 6);
  const con = I.construir({ perfil: { nombre: "Ana", historial: h }, dias: null, incluirTabla: true, ahora: AHORA });
  const sin = I.construir({ perfil: { nombre: "Ana", historial: h }, dias: null, incluirTabla: false, ahora: AHORA });
  assert.ok(sin.bytes.length < con.bytes.length);
  const txt = pdftotext(sin.bytes);
  if (txt !== null) assert.doesNotMatch(txt, /Sesiones registradas/);
});

test("historial vacío y muchísimas sesiones no rompen", () => {
  const vacio = I.construir({ perfil: { nombre: "", historial: [] }, dias: 30, ahora: AHORA });
  assert.equal(vacio.resumen.sesiones, 0);
  const grande = I.construir({ perfil: { nombre: "Ana", historial: historial(400) }, dias: null, ahora: AHORA });
  assert.ok(grande.paginas >= 3 && grande.paginas < 15);
});

test("texto con caracteres raros no rompe el PDF", () => {
  const r = I.construir({ perfil: { nombre: "Ana (☺) \\ ) ( 😀", historial: historial(3) }, dias: 30, observaciones: "línea 1\nlínea 2 → ok", ahora: AHORA });
  assert.equal(Buffer.from(r.bytes.slice(0, 5)).toString(), "%PDF-");
});
