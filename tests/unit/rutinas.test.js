const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../../public/js/plan.js");
const R = require("../../public/js/rutinas.js");

const planIA = () => P.generarPlan({ minutos: 10, objetivos: ["memoria"], nivel: "intermedio", rng: () => 0.3 });

test("sanearPlan acepta un plan del generador sin cambiar su duración", () => {
  const p = planIA();
  const s = R.sanearPlan(p);
  assert.equal(s.bloques.length, p.bloques.length);
  assert.equal(s.totalSegundos, p.bloques.reduce((t, b) => t + b.segundos, 0) + (p.bloques.length - 1) * p.descanso);
  assert.ok(s.objetivos.length >= 1);
});

test("sanearPlan descarta modos inventados, limita duraciones y rechaza planes vacíos", () => {
  const s = R.sanearPlan({ descanso: 99, bloques: [{ modo: "inventado", segundos: 60 }, { modo: "simple", segundos: 5 }, { modo: "colores", segundos: 99999, dificultad: "rara" }] });
  assert.equal(s.bloques.length, 2);
  assert.equal(s.bloques[0].segundos, R.SEG_MIN);
  assert.equal(s.bloques[1].segundos, R.SEG_MAX);
  assert.equal(s.bloques[1].dificultad, "media");
  assert.equal(s.descanso, 15);
  assert.equal(R.sanearPlan({ bloques: [{ modo: "nada" }] }), null);
  assert.equal(R.sanearPlan(null), null);
  assert.equal(R.sanearPlan({}), null);
});

test("planManual arma minutos, objetivos y descansos a partir de los ejercicios", () => {
  const p = R.planManual({ descanso: 10, bloques: [{ modo: "simple", segundos: 60, dificultad: "facil" }, { modo: "secuencia", segundos: 120, dificultad: "media" }] });
  assert.equal(p.totalSegundos, 60 + 120 + 10);
  assert.equal(p.minutos, 3);
  assert.deepEqual(p.objetivos, ["reaccion", "memoria"]);
});

test("resumen en texto claro", () => {
  const p = R.planManual({ descanso: 10, bloques: [{ modo: "simple", segundos: 60 }, { modo: "colores", segundos: 60 }] });
  assert.equal(R.resumen(p).texto, "2 ejercicios · 2 min 10 s");
  const uno = R.planManual({ descanso: 10, bloques: [{ modo: "simple", segundos: 60 }] });
  assert.equal(R.resumen(uno).texto, "1 ejercicio · 1 min");
});

test("agregar: nombre sugerido, sin duplicados y con límite", () => {
  let { lista, rutina } = R.agregar([], { plan: planIA() });
  assert.match(rutina.nombre, /^10 min · Memoria$/);
  const otra = R.agregar(lista, { plan: planIA() });
  assert.equal(otra.repetida, true);
  assert.equal(otra.lista.length, 1);

  const distinto = R.agregar(lista, { plan: R.planManual({ bloques: [{ modo: "simple", segundos: 60 }] }), nombre: "10 min · Memoria", origen: "manual" });
  assert.equal(distinto.rutina.nombre, "10 min · Memoria (2)");
  assert.equal(distinto.rutina.origen, "manual");

  let llena = [];
  for (let i = 0; i < R.MAX_RUTINAS; i++) llena = R.agregar(llena, { plan: R.planManual({ bloques: [{ modo: "simple", segundos: 30 + i }] }) }).lista;
  assert.equal(llena.length, R.MAX_RUTINAS);
  const r = R.agregar(llena, { plan: R.planManual({ bloques: [{ modo: "simple", segundos: 599 }] }) });
  assert.equal(r.llena, true);
});

test("favoritas primero y luego lo más reciente", () => {
  let l = [];
  ["A", "B", "C"].forEach((n, i) => {
    l = R.agregar(l, { nombre: n, plan: R.planManual({ bloques: [{ modo: "simple", segundos: 60 + i * 10 }] }), ahora: 1000 + i }).lista;
  });
  const idA = l.find((r) => r.nombre === "A").id;
  assert.deepEqual(R.ordenar(l).map((r) => r.nombre), ["C", "B", "A"]);
  l = R.alternarFavorita(l, idA);
  assert.deepEqual(R.ordenar(l).map((r) => r.nombre), ["A", "C", "B"]);
  l = R.registrarUso(l, l.find((r) => r.nombre === "B").id, 5000);
  assert.deepEqual(R.ordenar(l).map((r) => r.nombre), ["A", "B", "C"]);
  assert.equal(l.find((r) => r.nombre === "B").usos, 1);
});

test("renombrar evita repetir otro nombre y eliminar quita la rutina", () => {
  let l = [];
  l = R.agregar(l, { nombre: "Uno", plan: R.planManual({ bloques: [{ modo: "simple", segundos: 60 }] }) }).lista;
  l = R.agregar(l, { nombre: "Dos", plan: R.planManual({ bloques: [{ modo: "colores", segundos: 60 }] }) }).lista;
  const dos = l.find((r) => r.nombre === "Dos");
  l = R.renombrar(l, dos.id, "  uno ");
  assert.equal(l.find((r) => r.id === dos.id).nombre, "uno (2)");
  l = R.renombrar(l, dos.id, "Dos");
  assert.equal(l.find((r) => r.id === dos.id).nombre, "Dos");
  assert.equal(R.eliminar(l, dos.id).length, 1);
});

test("normalizarLista tolera datos dañados", () => {
  assert.deepEqual(R.normalizarLista("basura"), []);
  assert.deepEqual(R.normalizarLista([null, 3, {}, { plan: { bloques: [] } }]), []);
  const l = R.normalizarLista([
    { id: "x", nombre: "  Buena  ", favorita: 1, plan: { bloques: [{ modo: "simple", segundos: 60 }] } },
    { id: "x", plan: { bloques: [{ modo: "colores", segundos: 60 }] } },
  ]);
  assert.equal(l.length, 2);
  assert.equal(l[0].nombre, "Buena");
  assert.equal(l[0].favorita, true);
  assert.notEqual(l[0].id, l[1].id);
  assert.match(l[1].nombre, /min/);
});

test("nombres largos se recortan", () => {
  assert.equal(R.limpiarNombre("x".repeat(100)).length, R.MAX_NOMBRE);
  assert.equal(R.limpiarNombre("  a   b  "), "a b");
});
