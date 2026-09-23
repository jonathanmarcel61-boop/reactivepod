const test = require("node:test");
const assert = require("node:assert/strict");
const V = require("../../public/js/voz.js");

test("elegirVozDe prefiere español latino y descarta otros idiomas", () => {
  const voces = [{ lang: "en-US" }, { lang: "es-ES" }, { lang: "es-MX" }, { lang: "fr-FR" }];
  assert.equal(V.elegirVozDe(voces).lang, "es-MX");
});

test("elegirVozDe acepta es_ES con guion bajo y cae al primero en español", () => {
  assert.equal(V.elegirVozDe([{ lang: "en" }, { lang: "es_ES" }]).lang, "es_ES");
});

test("elegirVozDe sin español devuelve null", () => {
  assert.equal(V.elegirVozDe([{ lang: "en-US" }]), null);
  assert.equal(V.elegirVozDe([]), null);
  assert.equal(V.elegirVozDe(undefined), null);
});

test("numeroEnPalabras", () => {
  assert.equal(V.numeroEnPalabras(3), "tres");
  assert.equal(V.numeroEnPalabras(9), "9");
});

test("sin speechSynthesis no hace nada y no lanza", () => {
  assert.equal(V.disponible(), false);
  assert.equal(V.hablar("hola"), false);
  assert.doesNotThrow(() => V.callar());
});
