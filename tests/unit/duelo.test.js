const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../../public/js/duelo.js");

function semilla(s) {
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const nueva = (o = {}) => D.crearPartida({ rondas: 6, colores: ["red", "blue"], nombres: ["Ana", "Luis"], podsDisponibles: [0, 1, 2, 3], rng: semilla(7), ...o });

test("necesita al menos 2 Pods", () => {
  assert.throws(() => nueva({ podsDisponibles: [0] }), /al menos 2 Pods/);
  assert.throws(() => nueva({ podsDisponibles: [2, 2] }), /al menos 2 Pods/);
});

test("valores por defecto y colores repetidos se corrigen", () => {
  const e = D.crearPartida({ podsDisponibles: [0, 1], colores: ["red", "red"], rondas: 7, nombres: ["  ", null] });
  assert.equal(e.rondas, 10);
  assert.notEqual(e.colores[0], e.colores[1]);
  assert.deepEqual(e.nombres, ["Jugador 1", "Jugador 2"]);
});

test("cada ronda enciende dos Pods distintos con los colores de cada jugador", () => {
  const e = nueva();
  for (let i = 0; i < 6; i++) {
    const s = D.siguienteRonda(e);
    assert.equal(s.fin, false);
    assert.notEqual(e.ronda.pods[0], e.ronda.pods[1]);
    assert.ok(e.pods.includes(e.ronda.pods[0]) && e.pods.includes(e.ronda.pods[1]));
    D.abrirRonda(e, 0);
    D.cerrarSinPunto(e);
  }
  assert.equal(D.siguienteRonda(e).fin, true);
  assert.equal(e.terminada, true);
});

test("los colores se intercambian en la segunda mitad y solo entonces se avisa", () => {
  const e = nueva();
  const cambios = [];
  const colores = [];
  for (let i = 0; i < 6; i++) {
    cambios.push(D.siguienteRonda(e).cambioColor);
    colores.push(e.ronda.colores.join("/"));
    D.abrirRonda(e, 0);
    D.cerrarSinPunto(e);
  }
  assert.deepEqual(cambios, [false, false, false, true, false, false]);
  assert.deepEqual(colores, ["red/blue", "red/blue", "red/blue", "blue/red", "blue/red", "blue/red"]);
});

test("gana el punto quien golpea antes su propio Pod; el tiempo se mide desde el encendido", () => {
  const e = nueva();
  D.siguienteRonda(e);
  D.abrirRonda(e, 1000);
  const [p1, p2] = e.ronda.pods;
  const r = D.registrarGolpe(e, p2, 1450);
  assert.deepEqual([r.valido, r.ganador], [true, 1]);
  assert.ok(Math.abs(r.tiempo - 0.45) < 1e-9);
  // Ya no se acepta otro golpe en la misma ronda.
  assert.equal(D.registrarGolpe(e, p1, 1460).valido, false);
});

test("golpes a un Pod apagado o al Pod del rival desde la pantalla propia no cuentan", () => {
  const e = nueva();
  D.siguienteRonda(e);
  const [p1, p2] = e.ronda.pods;
  assert.equal(D.registrarGolpe(e, p1, 5).valido, false); // aún no está abierta
  D.abrirRonda(e, 0);
  const apagado = [0, 1, 2, 3].find((p) => p !== p1 && p !== p2);
  assert.equal(D.registrarGolpe(e, apagado, 100).motivo, "no-encendido");
  // El jugador 1 toca desde su mitad de pantalla el Pod del jugador 2.
  assert.equal(D.registrarGolpe(e, p2, 100, 0).motivo, "pod-ajeno");
  // Ronda sigue abierta: su propio Pod sí cuenta.
  assert.equal(D.registrarGolpe(e, p1, 200, 0).ganador, 0);
});

test("sin golpes la ronda no da punto", () => {
  const e = nueva();
  D.siguienteRonda(e);
  D.abrirRonda(e, 0);
  assert.equal(D.cerrarSinPunto(e), true);
  assert.equal(D.cerrarSinPunto(e), false);
  assert.equal(D.resumen(e).sinPunto, 1);
});

test("resumen: puntos, mitades, promedios, ganador y empate", () => {
  const e = nueva();
  const jugar = (quien, ms) => {
    D.siguienteRonda(e);
    D.abrirRonda(e, 0);
    if (quien === null) D.cerrarSinPunto(e);
    else D.registrarGolpe(e, e.ronda.pods[quien], ms);
  };
  [[0, 400], [0, 500], [1, 600], [1, 300], [0, 450], [null]].forEach(([q, ms]) => jugar(q, ms));
  D.siguienteRonda(e);
  const r = D.resumen(e);
  assert.deepEqual(r.jugadores.map((j) => j.puntos), [3, 2]);
  assert.deepEqual(r.jugadores[0].porMitad, [2, 1]);
  assert.ok(Math.abs(r.jugadores[0].promedio - 0.45) < 1e-9);
  assert.equal(r.jugadores[1].mejor, 0.3);
  assert.equal(r.ganador, 0);
  assert.equal(r.empate, false);
  assert.equal(r.sinPunto, 1);

  const e2 = nueva();
  for (const q of [0, 1, 0, 1, 0, 1]) {
    D.siguienteRonda(e2);
    D.abrirRonda(e2, 0);
    D.registrarGolpe(e2, e2.ronda.pods[q], 100);
  }
  D.siguienteRonda(e2);
  assert.equal(D.resumen(e2).empate, true);
  assert.equal(D.resumen(e2).ganador, null);
});
