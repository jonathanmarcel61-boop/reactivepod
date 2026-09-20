const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../../public/js/plan.js");

// Generador pseudoaleatorio con semilla para que las pruebas sean repetibles.
function semilla(s) {
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const MIN_PODS = { colores: 2, secuencia: 2, persecucion: 2, doble: 2, prohibido: 2, circuito: 2 };
const minPods = (m) => MIN_PODS[m] || 1;
const OBJ = Object.keys(P.OBJETIVOS);

function todosLosPlanes(fn) {
  for (const minutos of P.MINUTOS_VALIDOS)
    for (const nivel of P.NIVELES)
      for (const a of OBJ)
        for (const b of [null, ...OBJ.filter((x) => x !== a)])
          for (let s = 1; s <= 4; s++)
            fn(
              P.generarPlan({ minutos, nivel, objetivos: b ? [a, b] : [a], minPods, rng: semilla(s * 7919) }),
              { minutos, nivel, objetivos: b ? [a, b] : [a] }
            );
}

test("la duración total coincide exactamente con los minutos elegidos", () => {
  todosLosPlanes((plan, o) => {
    assert.equal(plan.totalSegundos, o.minutos * 60, JSON.stringify(o));
    const suma = plan.bloques.reduce((s, b) => s + b.segundos, 0) + (plan.bloques.length - 1) * plan.descanso;
    assert.equal(suma, o.minutos * 60);
  });
});

test("ningún bloque dura menos de 30 s y todos son múltiplos de 5 s salvo el último", () => {
  todosLosPlanes((plan) => {
    plan.bloques.forEach((b, i) => {
      assert.ok(b.segundos >= 30, `bloque ${i} dura ${b.segundos}`);
      if (i < plan.bloques.length - 1) assert.equal(b.segundos % 5, 0);
    });
  });
});

test("5 min = calentamiento + 1 principal + reto; más minutos, más bloques", () => {
  const p5 = P.generarPlan({ minutos: 5, objetivos: ["reaccion"], nivel: "intermedio", rng: semilla(1) });
  assert.deepEqual(p5.bloques.map((b) => b.rol), ["calentamiento", "principal", "reto"]);
  const largo = P.generarPlan({ minutos: 30, objetivos: ["reaccion"], nivel: "intermedio", rng: semilla(1) });
  assert.equal(largo.bloques.length, 8);
  assert.equal(largo.bloques[0].rol, "calentamiento");
  assert.equal(largo.bloques.at(-1).rol, "reto");
});

test("el calentamiento es una dificultad más baja y el resto usa el nivel elegido", () => {
  const p = P.generarPlan({ minutos: 15, objetivos: ["coordinacion"], nivel: "avanzado", rng: semilla(3) });
  assert.equal(p.bloques[0].dificultad, "media");
  assert.ok(p.bloques.slice(1).every((b) => b.dificultad === "dificil"));
  const facil = P.generarPlan({ minutos: 10, objetivos: ["memoria"], nivel: "principiante", rng: semilla(3) });
  assert.ok(facil.bloques.every((b) => b.dificultad === "facil"), "nunca por debajo de fácil");
});

test("los bloques principales trabajan los objetivos elegidos", () => {
  todosLosPlanes((plan, o) => {
    for (const b of plan.bloques.filter((x) => x.rol !== "calentamiento")) {
      assert.ok(P.APTITUD[b.modo][b.objetivo] >= 0.3, `${b.modo} no entrena ${b.objetivo}`);
      assert.ok(o.objetivos.includes(b.objetivo));
    }
  });
});

test("con dos objetivos se alternan en los bloques principales", () => {
  const p = P.generarPlan({ minutos: 20, objetivos: ["memoria", "reaccion"], nivel: "intermedio", minPods, rng: semilla(5) });
  const principales = p.bloques.filter((b) => b.rol === "principal").map((b) => b.objetivo);
  assert.deepEqual(principales.slice(0, 4), ["memoria", "reaccion", "memoria", "reaccion"]);
});

test("cada objetivo incluye su modo ancla (el que más lo trabaja) si no se pide evitarlo", () => {
  const ancla = { reaccion: "simple", coordinacion: "circuito", memoria: "secuencia", atencion: "prohibido" };
  // atencion: prohibido y stroop valen 1.0; basta con que aparezca alguno de los dos
  const validos = { ...Object.fromEntries(Object.entries(ancla).map(([k, v]) => [k, [v]])), atencion: ["prohibido", "stroop"] };
  // simple es calentamiento de reacción: cuenta como ancla también si sale ahí
  for (let s = 1; s <= 30; s++) {
    for (const obj of OBJ) {
      const p = P.generarPlan({ minutos: 15, objetivos: [obj], nivel: "intermedio", minPods, rng: semilla(s) });
      const modos = p.bloques.map((b) => b.modo);
      assert.ok(validos[obj].some((m) => modos.includes(m)), `${obj}: ${modos}`);
    }
  }
});

test("si el reto final es de reacción, contrarreloj queda solo para el reto", () => {
  for (let s = 1; s <= 30; s++) {
    const p = P.generarPlan({ minutos: 30, objetivos: ["reaccion", "atencion"], nivel: "intermedio", minPods, rng: semilla(s) });
    assert.equal(p.bloques.at(-1).objetivo, "reaccion");
    const idx = p.bloques.map((b, i) => (b.modo === "contrarreloj" ? i : -1)).filter((i) => i >= 0);
    assert.deepEqual(idx, [p.bloques.length - 1], `contrarreloj en ${idx}`);
  }
});

test("con dos objetivos, ambos se trabajan siempre (incluso en 5 min)", () => {
  for (const minutos of P.MINUTOS_VALIDOS) {
    for (let s = 1; s <= 10; s++) {
      const p = P.generarPlan({ minutos, objetivos: ["memoria", "coordinacion"], nivel: "intermedio", minPods, rng: semilla(s) });
      const trabajados = new Set(p.bloques.filter((b) => b.rol !== "calentamiento").map((b) => b.objetivo));
      assert.deepEqual([...trabajados].sort(), ["coordinacion", "memoria"], `${minutos} min: ${JSON.stringify(p.bloques.map((b) => [b.modo, b.objetivo]))}`);
    }
  }
});

test("nunca repite el mismo modo en bloques seguidos", () => {
  todosLosPlanes((plan) => {
    for (let i = 1; i < plan.bloques.length; i++) {
      assert.notEqual(plan.bloques[i].modo, plan.bloques[i - 1].modo);
    }
  });
});

test("nunca incluye el modo entrenador ni modos que exijan más Pods de los disponibles", () => {
  for (let s = 1; s <= 30; s++) {
    const p = P.generarPlan({ minutos: 30, objetivos: ["coordinacion", "atencion"], nivel: "intermedio", minPods, podsDisponibles: 1, rng: semilla(s) });
    for (const b of p.bloques) {
      assert.notEqual(b.modo, "entrenador");
      assert.ok(minPods(b.modo) <= 1, `${b.modo} pide ${minPods(b.modo)} Pods`);
    }
  }
});

test("'otra rutina diferente' evita los modos de la anterior cuando hay alternativas", () => {
  for (let s = 1; s <= 25; s++) {
    const a = P.generarPlan({ minutos: 10, objetivos: ["reaccion", "coordinacion"], nivel: "intermedio", minPods, rng: semilla(s) });
    const modosA = a.bloques.map((b) => b.modo);
    const b = P.generarPlan({ minutos: 10, objetivos: ["reaccion", "coordinacion"], nivel: "intermedio", minPods, evitar: modosA, rng: semilla(s + 100) });
    const repetidos = b.bloques.filter((x) => modosA.includes(x.modo));
    assert.equal(repetidos.length, 0, `repitió ${repetidos.map((x) => x.modo)} (a=${modosA}, b=${b.bloques.map((x) => x.modo)})`);
  }
});

test("dos rutinas seguidas con la misma semilla base son distintas al evitar", () => {
  const a = P.generarPlan({ minutos: 15, objetivos: ["atencion"], nivel: "intermedio", minPods, rng: semilla(9) });
  const b = P.generarPlan({ minutos: 15, objetivos: ["atencion"], nivel: "intermedio", minPods, evitar: a.bloques.map((x) => x.modo), rng: semilla(9) });
  assert.notDeepEqual(a.bloques.map((x) => x.modo), b.bloques.map((x) => x.modo));
});

test("reacción termina con contrarreloj como reto final", () => {
  const p = P.generarPlan({ minutos: 5, objetivos: ["reaccion"], nivel: "intermedio", minPods, rng: semilla(2) });
  assert.equal(p.bloques.at(-1).modo, "contrarreloj");
});

test("entradas inválidas usan valores razonables", () => {
  const p = P.generarPlan({ minutos: 7, objetivos: ["nada"], nivel: "experto", rng: semilla(1) });
  assert.equal(p.minutos, 5);
  assert.deepEqual(p.objetivos, ["reaccion"]);
  assert.equal(p.nivel, "intermedio");
  const tres = P.generarPlan({ minutos: 5, objetivos: ["memoria", "atencion", "reaccion"], nivel: "intermedio", rng: semilla(1) });
  assert.equal(tres.objetivos.length, 2);
});

// ---- adaptación ----
test("deltaNivel: sube con ≥92 %, baja con <60 %, y no juzga con pocos datos", () => {
  assert.equal(P.deltaNivel(19, 1), 1);
  assert.equal(P.deltaNivel(10, 10), -1);
  assert.equal(P.deltaNivel(8, 4), 0);
  assert.equal(P.deltaNivel(3, 0), 0);
  assert.equal(P.deltaNivel(0, 0), 0);
});

test("moverDificultad respeta los extremos", () => {
  assert.equal(P.moverDificultad("facil", -1), "facil");
  assert.equal(P.moverDificultad("dificil", 1), "dificil");
  assert.equal(P.moverDificultad("media", 1), "dificil");
  assert.equal(P.moverDificultad("media", -1), "facil");
});

test("nivelSugerido usa las últimas sesiones con dificultad conocida", () => {
  const s = (dificultad, aciertos, errores) => ({ dificultad, aciertos, errores });
  assert.equal(P.nivelSugerido([]), null);
  assert.equal(P.nivelSugerido([s("media", 19, 1)]), null, "una sola sesión no basta");
  assert.equal(P.nivelSugerido([s("media", 19, 1), s("media", 20, 0)]), "avanzado");
  assert.equal(P.nivelSugerido([s("media", 10, 10), s("media", 9, 11)]), "principiante");
  assert.equal(P.nivelSugerido([s("media", 15, 5), s("media", 16, 4)]), "intermedio");
  assert.equal(P.nivelSugerido([s(undefined, 19, 1), s("media", 20, 0)]), null, "ignora las que no guardan dificultad");
});

test("deltaNivelDeBloque no adapta en modos donde no se puede fallar", () => {
  assert.equal(P.deltaNivelDeBloque("libre", 30, 0), 0);
  assert.equal(P.deltaNivelDeBloque("automatico", 30, 0), 0);
  assert.equal(P.deltaNivelDeBloque("colores", 30, 0), 1);
  assert.equal(P.deltaNivelDeBloque("stroop", 5, 15), -1);
});
