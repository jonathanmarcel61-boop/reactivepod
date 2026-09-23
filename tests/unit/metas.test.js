const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../public/js/metas.js");

// Sábado 19 de septiembre de 2026, 10:00 hora local.
const AHORA = new Date(2026, 8, 19, 10, 0, 0);
const dia = (dY, h = 12) => {
  const d = new Date(AHORA);
  d.setDate(d.getDate() - dY);
  d.setHours(h, 0, 0, 0);
  return { timestamp: d.getTime() };
};

test("claveDia usa mes 1-12 en hora local", () => {
  assert.equal(M.claveDia(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(M.claveDia(AHORA), "2026-09-19");
});

test("racha: sin historial es 0", () => {
  const r = M.calcularRacha([], AHORA);
  assert.deepEqual([r.racha, r.entrenoHoy, r.enRiesgo, r.mejor], [0, false, false, 0]);
});

test("racha: cuenta hoy y días anteriores seguidos", () => {
  const r = M.calcularRacha([dia(0), dia(1), dia(2), dia(4)], AHORA);
  assert.equal(r.racha, 3);
  assert.equal(r.entrenoHoy, true);
  assert.equal(r.enRiesgo, false);
});

test("racha: sigue viva si solo falta hoy, y queda en riesgo", () => {
  const r = M.calcularRacha([dia(1), dia(2)], AHORA);
  assert.equal(r.racha, 2);
  assert.equal(r.enRiesgo, true);
});

test("racha: se rompe si falta ayer y hoy", () => {
  const r = M.calcularRacha([dia(2), dia(3)], AHORA);
  assert.equal(r.racha, 0);
});

test("racha: varias sesiones el mismo día cuentan como un día", () => {
  assert.equal(M.calcularRacha([dia(0, 8), dia(0, 9), dia(0, 20)], AHORA).racha, 1);
});

test("mejor racha histórica", () => {
  const r = M.calcularRacha([dia(0), dia(10), dia(11), dia(12), dia(13)], AHORA);
  assert.equal(r.racha, 1);
  assert.equal(r.mejor, 4);
});

test("semana: empieza el lunes y la meta cuenta días, no sesiones", () => {
  // 19/09/2026 es sábado: lunes = 14/09.
  const s = M.estadoSemana([dia(0, 8), dia(0, 9), dia(2)], 3, AHORA);
  assert.equal(s.claveSemana, "2026-09-14");
  assert.equal(s.hechos, 2);
  assert.equal(s.restantes, 1);
  assert.equal(s.cumplida, false);
  assert.equal(s.dias.length, 7);
  assert.equal(s.dias[0].etiqueta, "L");
  assert.equal(s.dias[5].esHoy, true);
  assert.equal(s.dias[6].futuro, true);
});

test("semana: una sesión del domingo anterior no cuenta", () => {
  const s = M.estadoSemana([dia(6)], 3, AHORA); // domingo 13
  assert.equal(s.hechos, 0);
});

test("semana: meta cumplida", () => {
  assert.equal(M.estadoSemana([dia(0), dia(1), dia(2)], 3, AHORA).cumplida, true);
});

test("normalizarMeta acota 1..7 y usa 3 por defecto", () => {
  assert.equal(M.normalizarMeta(0), 3);
  assert.equal(M.normalizarMeta(8), 3);
  assert.equal(M.normalizarMeta("abc"), 3);
  assert.equal(M.normalizarMeta("5"), 5);
});

test("saludo según la hora", () => {
  assert.equal(M.saludoHora(new Date(2026, 8, 19, 8)), "Buenos días");
  assert.equal(M.saludoHora(new Date(2026, 8, 19, 15)), "Buenas tardes");
  assert.equal(M.saludoHora(new Date(2026, 8, 19, 21)), "Buenas noches");
});

test("bienvenida: primera vez, con nombre", () => {
  const m = M.mensajeBienvenida({ nombre: "Ana", historial: [], ahora: AHORA });
  assert.equal(m.tipo, "primera");
  assert.equal(m.saludo, "Buenos días, Ana");
});

test("bienvenida: regreso tras 7+ días", () => {
  const m = M.mensajeBienvenida({ historial: [dia(9)], ahora: AHORA });
  assert.equal(m.tipo, "regreso");
  assert.match(m.mensaje, /9 días/);
});

test("bienvenida: meta cumplida, racha, avance y frase", () => {
  assert.equal(M.mensajeBienvenida({ historial: [dia(0), dia(1), dia(2)], meta: 3, ahora: AHORA }).tipo, "meta");
  assert.equal(M.mensajeBienvenida({ historial: [dia(1), dia(2)], meta: 5, ahora: AHORA }).tipo, "racha-riesgo");
  assert.equal(M.mensajeBienvenida({ historial: [dia(0), dia(1)], meta: 5, ahora: AHORA }).tipo, "racha");
  const av = M.mensajeBienvenida({ historial: [dia(2)], meta: 3, ahora: AHORA });
  assert.equal(av.tipo, "avance");
  assert.match(av.mensaje, /Te faltan 2 días/);
  // Entrenó la semana pasada (3 días atrás lunes-1) pero nada esta semana → frase.
  const hoyLunes = new Date(2026, 8, 14, 9); // lunes
  const f = M.mensajeBienvenida({ historial: [{ timestamp: new Date(2026, 8, 12).getTime() }], ahora: hoyLunes, rng: () => 0 });
  assert.equal(f.tipo, "frase");
});

test("bienvenida: singular 'Te falta 1 día'", () => {
  const m = M.mensajeBienvenida({ historial: [dia(2), dia(4)], meta: 3, ahora: AHORA });
  assert.match(m.mensaje, /Te falta 1 día /);
});
