const test = require("node:test");
const assert = require("node:assert/strict");
const R = require("../../public/js/recordatorios.js");

// Sábado 19 de septiembre de 2026, 10:00
const SAB = new Date(2026, 8, 19, 10, 0, 0);
const mem = (v) => ({ v, getItem() { return this.v; }, setItem(_, x) { this.v = x; } });

test("sanear: valores inválidos vuelven a valores seguros", () => {
  assert.deepEqual(R.sanear(null), { activo: false, dias: [1, 3, 5], hora: "18:00" });
  assert.deepEqual(R.sanear({ activo: "sí", dias: [7, 1, 1, 9, 0, "3", "x"], hora: "25:00" }), { activo: false, dias: [1, 3, 7], hora: "18:00" });
  assert.equal(R.sanear({ activo: true, dias: [], hora: "07:05" }).dias.length, 0);
});

test("leer/guardar redondea con almacén y tolera JSON roto", () => {
  const a = mem(null);
  R.guardar({ activo: true, dias: [2, 4], hora: "07:30" }, a);
  assert.deepEqual(R.leer(a), { activo: true, dias: [2, 4], hora: "07:30" });
  assert.deepEqual(R.leer(mem("{roto")), R.sanear(null));
  assert.doesNotThrow(() => R.leer({ getItem() { throw new Error("x"); } }));
});

test("describir en español natural", () => {
  assert.equal(R.describir({ dias: [1, 3, 5], hora: "18:00" }), "lunes, miércoles y viernes a las 18:00");
  assert.equal(R.describir({ dias: [2], hora: "07:00" }), "martes a las 07:00");
  assert.equal(R.describir({ dias: [1, 2, 3, 4, 5, 6, 7], hora: "09:15" }), "todos los días a las 09:15");
  assert.equal(R.describir({ dias: [], hora: "09:15" }), "Elige al menos un día");
});

test("proximas: desactivado o sin días no programa nada", () => {
  assert.deepEqual(R.proximas({ activo: false, dias: [1], hora: "18:00" }, { ahora: SAB }), []);
  assert.deepEqual(R.proximas({ activo: true, dias: [], hora: "18:00" }, { ahora: SAB }), []);
});

test("proximas: respeta días y hora, en orden, con ids únicos reservados", () => {
  const l = R.proximas({ activo: true, dias: [1, 3, 5], hora: "18:30" }, { ahora: SAB, nombre: "María José", horizonte: 14 });
  // Desde el sábado 19: lun 21, mié 23, vie 25, lun 28, mié 30, vie 2 oct, lun 5 oct, mié 7 oct(dentro de 14 días)
  assert.deepEqual(l.map((x) => [x.at.getMonth(), x.at.getDate()]), [[8, 21], [8, 23], [8, 25], [8, 28], [8, 30], [9, 2]]);
  l.forEach((x) => { assert.equal(x.at.getHours(), 18); assert.equal(x.at.getMinutes(), 30); assert.ok(R.esNuestro(x.id)); });
  assert.equal(new Set(l.map((x) => x.id)).size, l.length);
  assert.match(l[0].title, /^María, es hora/);
  assert.notEqual(l[0].body, l[1].body);
});

test("proximas: hoy solo si la hora aún no pasó", () => {
  const cfg = { activo: true, dias: [6], hora: "18:00" }; // sábado
  assert.equal(R.proximas(cfg, { ahora: SAB, horizonte: 1 }).length, 1);
  assert.equal(R.proximas(cfg, { ahora: new Date(2026, 8, 19, 18, 0, 0), horizonte: 1 }).length, 0);
  assert.equal(R.proximas(cfg, { ahora: new Date(2026, 8, 19, 19, 0, 0), horizonte: 1 }).length, 0);
});

test("proximas: si ya entrenó hoy no avisa hoy, pero sí mañana", () => {
  const cfg = { activo: true, dias: [6, 7], hora: "18:00" };
  const hist = [{ timestamp: new Date(2026, 8, 19, 8, 0).getTime() }];
  const l = R.proximas(cfg, { ahora: SAB, historial: hist, horizonte: 3 });
  assert.deepEqual(l.map((x) => x.at.getDate()), [20]);
  const sin = R.proximas(cfg, { ahora: SAB, historial: [], horizonte: 3 });
  assert.deepEqual(sin.map((x) => x.at.getDate()), [19, 20]);
});

test("proximas: nunca excede los ids reservados", () => {
  const l = R.proximas({ activo: true, dias: [1, 2, 3, 4, 5, 6, 7], hora: "23:59" }, { ahora: SAB, horizonte: 9999 });
  assert.ok(l.length <= 100);
  assert.ok(l.every((x) => R.esNuestro(x.id)));
});

test("cruza el fin de año sin romper las fechas", () => {
  const l = R.proximas({ activo: true, dias: [1, 2, 3, 4, 5, 6, 7], hora: "18:00" }, { ahora: new Date(2026, 11, 28, 12, 0), horizonte: 10 });
  assert.equal(l.length, 10);
  assert.deepEqual([l[0], l[4], l[9]].map((x) => [x.at.getFullYear(), x.at.getMonth(), x.at.getDate()]), [[2026, 11, 28], [2027, 0, 1], [2027, 0, 6]]);
});
