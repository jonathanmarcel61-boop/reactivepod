const test = require("node:test");
const assert = require("node:assert/strict");
const R = require("../../public/js/rutinas.js");
const C = require("../../public/js/compartidas.js");

const plan = () => R.planManual({ descanso: 15, bloques: [{ modo: "simple", segundos: 60, dificultad: "media" }, { modo: "secuencia", segundos: 90, dificultad: "facil" }] });
const rutina = () => R.agregar([], { plan: plan(), nombre: "Mi rutina", origen: "manual" }).rutina;

test("marcarCompartida guarda y quita la marca, y sobrevive a normalizar", () => {
  const r = rutina();
  assert.equal(r.compartida, null);
  let lista = R.marcarCompartida([r], r.id, { en: 1000, mostrarNombre: true });
  assert.deepEqual(lista[0].compartida, { en: 1000, mostrarNombre: true });
  lista = R.normalizarLista(JSON.parse(JSON.stringify(lista)));
  assert.deepEqual(lista[0].compartida, { en: 1000, mostrarNombre: true });
  assert.equal(R.marcarCompartida(lista, r.id, null)[0].compartida, null);
  // Un valor dañado no rompe la lectura.
  const rota = R.normalizarLista([{ ...r, compartida: "sí" }]);
  assert.equal(rota[0].compartida, null);
});

test("paraNube solo envía ejercicios: nada de usos, favoritas ni datos personales", () => {
  const r = { ...rutina(), favorita: true, usos: 12 };
  const fila = C.paraNube(r, { mostrarNombre: false, nombreAutor: "María Pérez" });
  assert.deepEqual(Object.keys(fila).sort(), ["author_name", "level", "local_id", "minutes", "name", "objectives", "plan"]);
  assert.equal(fila.author_name, null);
  assert.equal(fila.local_id, r.id);
  assert.equal(fila.plan.bloques.length, 2);
  assert.equal(fila.minutes, Math.round(fila.plan.totalSegundos / 60));
  assert.ok(!JSON.stringify(fila).includes("usos"));
});

test("paraNube con nombre visible lo limpia y limita", () => {
  const fila = C.paraNube(rutina(), { mostrarNombre: true, nombreAutor: "  <b>Ana</b>   " + "x".repeat(100) });
  assert.ok(fila.author_name.length <= C.MAX_AUTOR);
  assert.ok(!/[<>]/.test(fila.author_name));
  assert.equal(C.paraNube(null), null);
  assert.equal(C.paraNube({ id: "x", nombre: "x", plan: { bloques: [] } }), null);
});

test("desdeNube desconfía de todo: plan inválido, modos raros, textos enormes", () => {
  assert.equal(C.desdeNube(null), null);
  assert.equal(C.desdeNube({ id: "1", plan: { bloques: [{ modo: "hackeo", segundos: 60 }] } }), null);
  const it = C.desdeNube({
    id: "abc", name: "N".repeat(500), author_name: "<img src=x onerror=alert(1)>", created_at: "2026-09-01T10:00:00Z",
    plan: { descanso: 999, nivel: "dios", bloques: [{ modo: "simple", segundos: 99999, dificultad: "imposible", rol: "x" }, { modo: "nada", segundos: 1 }] },
  });
  assert.equal(it.plan.bloques.length, 1);
  assert.equal(it.plan.bloques[0].segundos, R.SEG_MAX);
  assert.equal(it.plan.bloques[0].dificultad, "media");
  assert.equal(it.plan.nivel, "intermedio");
  assert.equal(it.plan.descanso, 15);
  assert.ok(it.nombre.length <= R.MAX_NOMBRE);
  assert.ok(!/[<>]/.test(it.autor));
  assert.equal(C.desdeNube({ id: "z", plan: plan() }).autor, C.ANONIMO);
});

test("aRutinaV23 crea el formato del editor de profesionales (por tiempo) y elige categoría", () => {
  const it = C.desdeNube({ id: "1", name: "Memoria", plan: plan() });
  const v = C.aRutinaV23(it, { ahora: 5000 });
  assert.equal(v.nombre, "Memoria");
  assert.equal(v.descansoSeg, 15);
  assert.deepEqual(v.ejercicios.map((e) => [e.modo, e.dificultad, e.finalizarPor, e.valor]), [["simple", "media", "tiempo", 60], ["secuencia", "facil", "tiempo", 90]]);
  assert.equal(new Set(v.ejercicios.map((e) => e.id)).size, 2);
  assert.equal(v.creadaEn, 5000);
  const cog = R.planManual({ descanso: 15, bloques: [{ modo: "secuencia", segundos: 120, dificultad: "media" }, { modo: "stroop", segundos: 90, dificultad: "media" }] });
  assert.equal(C.categoriaV23(cog), "neurologia");
  const mot = R.planManual({ descanso: 15, bloques: [{ modo: "circuito", segundos: 120, dificultad: "media" }] });
  assert.equal(C.categoriaV23(mot), "deportista");
});

test("filtrar por texto (sin acentos), objetivo y nivel", () => {
  const a = C.desdeNube({ id: "1", name: "Rodilla rápida", author_name: "Ana", plan: R.planManual({ descanso: 15, bloques: [{ modo: "simple", segundos: 60, dificultad: "media" }] }) });
  const b = C.desdeNube({ id: "2", name: "Cabeza fría", plan: R.planManual({ descanso: 15, nivel: "avanzado", bloques: [{ modo: "stroop", segundos: 60, dificultad: "media" }] }) });
  const lista = [a, b];
  assert.deepEqual(C.filtrar(lista, { texto: "RAPIDA" }).map((x) => x.id), ["1"]);
  assert.deepEqual(C.filtrar(lista, { texto: "ana" }).map((x) => x.id), ["1"]);
  assert.deepEqual(C.filtrar(lista, { texto: "atencion" }).map((x) => x.id), ["2"]);
  assert.deepEqual(C.filtrar(lista, { objetivo: "reaccion" }).map((x) => x.id), ["1"]);
  assert.deepEqual(C.filtrar(lista, { nivel: "avanzado" }).map((x) => x.id), ["2"]);
  assert.equal(C.filtrar(lista, {}).length, 2);
});

test("yaCopiada detecta una rutina del profesional con los mismos ejercicios", () => {
  const it = C.desdeNube({ id: "1", name: "X", plan: plan() });
  const v = C.aRutinaV23(it);
  assert.equal(C.yaCopiada([v], it), v);
  assert.equal(C.yaCopiada([{ ...v, descansoSeg: 30 }], it), null);
  assert.equal(C.yaCopiada([], it), null);
  assert.equal(C.yaCopiada([{ id: "x" }], it), null);
});
