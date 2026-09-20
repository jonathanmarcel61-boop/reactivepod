const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../../public/js/compartir.js");

// En Node 21+ `navigator` es un getter de solo lectura: se redefine para cada prueba.
function fijarNavigator(valor) {
  Object.defineProperty(globalThis, "navigator", { value: valor, configurable: true, writable: true });
}

test("porcentaje", () => {
  assert.equal(C.porcentaje(3, 1), 75);
  assert.equal(C.porcentaje(0, 0), null);
});

test("textoResultado incluye nombre, modo, aciertos y tiempos", () => {
  const t = C.textoResultado({ nombre: "Ana", modo: "Reacción por colores", aciertos: 18, errores: 2, mejor: 0.412, promedio: 0.6 });
  assert.match(t, /Ana terminó Reacción por colores/);
  assert.match(t, /18 aciertos/);
  assert.match(t, /\(90 %\)/);
  assert.match(t, /0\.412 s/);
});

test("textoResultado sin nombre ni tiempos no rompe", () => {
  const t = C.textoResultado({ aciertos: 0, errores: 0 });
  assert.match(t, /Un deportista/);
  assert.doesNotMatch(t, /NaN|undefined/);
});

test("textoRutina muestra la racha solo desde 2 días", () => {
  const base = { nombre: "Luis", minutos: 10, objetivos: "Memoria", aciertos: 10, errores: 0, ejercicios: 4 };
  assert.doesNotMatch(C.textoRutina({ ...base, racha: 1 }), /Racha/);
  assert.match(C.textoRutina({ ...base, racha: 3 }), /Racha: 3 días/);
});

test("compartir usa navigator.share cuando existe", async () => {
  fijarNavigator({ share: async () => {} });
  assert.equal(await C.compartir("hola"), "compartido");
});

test("compartir: cancelar no cae a otros métodos", async () => {
  fijarNavigator({ share: async () => { const e = new Error("x"); e.name = "AbortError"; throw e; } });
  assert.equal(await C.compartir("hola"), "cancelado");
});

test("compartir copia el texto si no hay share ni ventana", async () => {
  let copiado = null;
  fijarNavigator({ clipboard: { writeText: async (t) => { copiado = t; } } });
  assert.equal(await C.compartir("hola"), "copiado");
  assert.equal(copiado, "hola");
});

test("compartir devuelve error si nada funciona", async () => {
  fijarNavigator({});
  assert.equal(await C.compartir("hola"), "error");
});
