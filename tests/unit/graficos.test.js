const test = require("node:test");
const assert = require("node:assert/strict");
const G = require("../../public/js/graficos.js");

// Sábado 19/09/2026 10:00 local.
const AHORA = new Date(2026, 8, 19, 10, 0, 0);
function ses(diasAtras, promedio, aciertos = 9, errores = 1, modo = "Reacción aleatoria") {
  const d = new Date(AHORA);
  d.setDate(d.getDate() - diasAtras);
  d.setHours(12, 0, 0, 0);
  return { timestamp: d.getTime(), modo, promedio, mejor: promedio - 0.1, aciertos, errores };
}

test("marcasBonitas devuelve marcas redondas que cubren el rango", () => {
  const m = G.marcasBonitas(0.42, 0.83, 4);
  assert.ok(m[0] <= 0.42 && m[m.length - 1] >= 0.83);
  m.forEach((v) => assert.ok(Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, `marca fea: ${v}`));
  assert.deepEqual(G.marcasBonitas(0, 100, 4), [0, 25, 50, 75, 100]);
});

test("marcasBonitas con un solo valor no se rompe", () => {
  const m = G.marcasBonitas(0.5, 0.5, 4);
  assert.ok(m.length >= 2 && m[0] < 0.5 && m[m.length - 1] > 0.5);
});

test("filtrar por periodo y por modo", () => {
  const h = [ses(0, 0.5), ses(6, 0.6), ses(7, 0.7), ses(2, 0.4, 9, 1, "Secuencia")];
  assert.equal(G.filtrar(h, { dias: 7, ahora: AHORA }).length, 3);
  assert.equal(G.filtrar(h, { dias: null, ahora: AHORA }).length, 4);
  assert.equal(G.filtrar(h, { dias: 30, modo: "Secuencia", ahora: AHORA }).length, 1);
});

test("porDia promedia sesiones del mismo día", () => {
  const dias = G.porDia([ses(0, 0.4), ses(0, 0.6), ses(1, 0.5)]);
  assert.equal(dias.length, 2);
  assert.ok(Math.abs(dias[1].promedio - 0.5) < 1e-9);
  assert.equal(dias[1].sesiones, 2);
});

test("comparar: mejora, baja, estable y sin datos", () => {
  // Periodo actual (7 días): 0.5 s. Anterior: 0.8 s → mejora de ~37 %.
  const mejora = G.comparar([ses(1, 0.5), ses(9, 0.8)], { dias: 7, ahora: AHORA });
  assert.equal(mejora.tendencia, "mejora");
  assert.match(mejora.mensaje, /mejoró 38 %|mejoró 37 %/);

  const baja = G.comparar([ses(1, 0.8), ses(9, 0.5)], { dias: 7, ahora: AHORA });
  assert.equal(baja.tendencia, "baja");
  assert.match(baja.mensaje, /subió/);

  const estable = G.comparar([ses(1, 0.5), ses(9, 0.51)], { dias: 7, ahora: AHORA });
  assert.equal(estable.tendencia, "estable");

  const vacio = G.comparar([ses(20, 0.5)], { dias: 7, ahora: AHORA });
  assert.equal(vacio.tendencia, "sin-datos");
  assert.match(vacio.mensaje, /Todavía no hay/);

  const nuevo = G.comparar([ses(1, 0.5)], { dias: 7, ahora: AHORA });
  assert.equal(nuevo.tendencia, "nuevo");
  assert.match(nuevo.mensaje, /1 entrenamiento /);
});

test("comparar: menciona el cambio de precisión si es notable", () => {
  const r = G.comparar([ses(1, 0.5, 10, 0), ses(9, 0.5, 6, 4)], { dias: 7, ahora: AHORA });
  assert.match(r.mensaje, /precisión subió 40 puntos/);
});

test("semanas cuenta días distintos y marca la actual", () => {
  const s = G.semanas([ses(0, 0.5), ses(0, 0.5), ses(2, 0.5), ses(8, 0.5)], { n: 3, ahora: AHORA });
  assert.equal(s.length, 3);
  assert.equal(s[2].actual, true);
  assert.equal(s[2].dias, 2); // sábado y jueves de esta semana
  assert.equal(s[1].dias, 1); // 11/09 cae en la semana anterior
});

test("disenoLinea: puntos dentro del área, eje Y con las marcas y mejor punto", () => {
  const pts = [
    { t: new Date(2026, 8, 10).getTime(), v: 0.8 },
    { t: new Date(2026, 8, 14).getTime(), v: 0.5 },
    { t: new Date(2026, 8, 18).getTime(), v: 0.65 },
  ];
  const d = G.disenoLinea(pts, { formato: (v) => v.toFixed(2), mejor: "min" });
  d.puntos.forEach((p) => {
    assert.ok(p.x >= d.area.x && p.x <= d.area.x + d.area.w);
    assert.ok(p.y >= d.area.y - 1e-6 && p.y <= d.area.y + d.area.h + 1e-6);
  });
  assert.equal(d.mejor, 1);
  // Menos segundos = más abajo... el valor menor tiene la y mayor (más cerca del eje X).
  assert.ok(d.puntos[1].y > d.puntos[0].y);
  assert.ok(d.ejeY.length >= 3);
});

test("disenoLinea con un único punto lo centra", () => {
  const d = G.disenoLinea([{ t: 1, v: 0.5 }], {});
  assert.equal(d.puntos.length, 1);
  assert.ok(Math.abs(d.puntos[0].x - (d.area.x + d.area.w / 2)) < 1e-9);
});

test("paquete + SVG: accesible, sin NaN y con las tres gráficas", () => {
  const h = [ses(0, 0.5), ses(1, 0.55), ses(3, 0.7), ses(9, 0.9)];
  const p = G.paquete(h, { dias: 30, meta: 3, ahora: AHORA });
  assert.ok(p.reaccion && p.precision && p.semanas);
  for (const [k, id] of [["reaccion", "r"], ["precision", "p"], ["semanas", "s"]]) {
    const svg = G.svgDe(p[k], id);
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title id="/);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
  }
  assert.match(G.svgDe(p.reaccion, "r"), /grafico__punto--mejor/);
  assert.match(p.reaccion.descripcion, /Mejor valor: 0\.500 s/);
  // Si el mejor día no es el último, se rotula directamente en el gráfico.
  const q = G.paquete([ses(0, 0.7), ses(1, 0.45), ses(3, 0.9)], { dias: 30, ahora: AHORA });
  assert.match(G.svgDe(q.reaccion, "q"), /Mejor 0\.450 s/);
  assert.match(p.semanas.descripcion, /Tu meta es 3 días/);
});

test("paquete sin historial no genera gráficos y no falla", () => {
  const p = G.paquete([], { dias: 7, ahora: AHORA });
  assert.equal(p.reaccion, null);
  assert.equal(p.precision, null);
  assert.equal(p.semanas, null);
  assert.equal(G.svgDe(null, "x"), "");
});

test("disenoBarras: todas las barras caben dentro del área y el eje las cubre", () => {
  const barras = [7, 6, 0, 3, 5, 7, 2, 4].map((v, i) => ({ t: i * 86400000 * 7, v, actual: i === 7 }));
  const d = G.disenoBarras(barras, { meta: 3 });
  const arriba = d.area.y;
  d.barras.forEach((b) => {
    assert.ok(b.y >= arriba - 1e-6, `barra ${b.v} sale por arriba (y=${b.y})`);
    assert.ok(b.h >= 0 && b.y + b.h <= d.area.y + d.area.h + 1e-6);
  });
  assert.ok(d.ejeY.length >= 3);
  const maxMarca = Math.max(...d.ejeY.map((m) => Number(m.texto)));
  assert.ok(maxMarca >= 7, `el eje llega a ${maxMarca}`);
  // Sin datos: no se rompe.
  const vacio = G.disenoBarras([{ t: 0, v: 0 }, { t: 1, v: 0 }], {});
  assert.ok(vacio.ejeY.length >= 2);
});
