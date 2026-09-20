const test = require("node:test");
const assert = require("node:assert");
const U = require("../../public/js/utils.js");

test("escaparHTML escapa los cinco caracteres peligrosos", () => {
  assert.strictEqual(
    U.escaparHTML(`<img src="x" onerror='alert(1)'> & más`),
    "&lt;img src=&quot;x&quot; onerror=&#039;alert(1)&#039;&gt; &amp; más"
  );
});

test("escaparHTML trata null/undefined como vacío y convierte números", () => {
  assert.strictEqual(U.escaparHTML(null), "");
  assert.strictEqual(U.escaparHTML(undefined), "");
  assert.strictEqual(U.escaparHTML(42), "42");
  assert.strictEqual(U.escaparHTML(0), "0");
});

test("escaparHTML no doble-escapa un texto ya seguro más de una vez por llamada", () => {
  assert.strictEqual(U.escaparHTML("&amp;"), "&amp;amp;");
});

test("numeroSeguro", () => {
  assert.strictEqual(U.numeroSeguro("12.5"), 12.5);
  assert.strictEqual(U.numeroSeguro("abc"), 0);
  assert.strictEqual(U.numeroSeguro(undefined, 7), 7);
  assert.strictEqual(U.numeroSeguro(Infinity, 3), 3);
  assert.strictEqual(U.numeroSeguro(null), 0);
});

test("formatoDuracionLarga", () => {
  assert.strictEqual(U.formatoDuracionLarga(0), "0 s");
  assert.strictEqual(U.formatoDuracionLarga(45), "45 s");
  assert.strictEqual(U.formatoDuracionLarga(60), "1 min 00 s");
  assert.strictEqual(U.formatoDuracionLarga(185), "3 min 05 s");
  assert.strictEqual(U.formatoDuracionLarga(-5), "0 s");
  assert.strictEqual(U.formatoDuracionLarga(undefined), "0 s");
});

test("formatoDuracionReloj", () => {
  assert.strictEqual(U.formatoDuracionReloj(0), "0:00");
  assert.strictEqual(U.formatoDuracionReloj(65), "1:05");
  assert.strictEqual(U.formatoDuracionReloj(3599), "59:59");
  assert.strictEqual(U.formatoDuracionReloj(59.6), "1:00");
  assert.strictEqual(U.formatoDuracionReloj("x"), "0:00");
});

test("formatoPrecision", () => {
  assert.strictEqual(U.formatoPrecision(87.5), "87.5%");
  assert.strictEqual(U.formatoPrecision("62.25"), (62.25).toFixed(1) + "%");
  assert.strictEqual(U.formatoPrecision(100), "100.0%");
  assert.strictEqual(U.formatoPrecision(null), "0.0%");
});

test("formatoFecha: vacío, inválido y válido", () => {
  assert.strictEqual(U.formatoFecha(""), "Sin fecha");
  assert.strictEqual(U.formatoFecha(null, ""), "");
  assert.strictEqual(U.formatoFecha("no-es-fecha"), "no-es-fecha");
  assert.strictEqual(U.formatoFecha("no-es-fecha", "", ""), "");
  assert.strictEqual(
    U.formatoFecha("2026-09-19T10:00:00Z"),
    new Date("2026-09-19T10:00:00Z").toLocaleString()
  );
});

test("formatoFechaDia usa las 12:00 para no cambiar de día por la zona horaria", () => {
  const esperado = new Date("2026-09-19T12:00:00").toLocaleDateString();
  assert.strictEqual(U.formatoFechaDia("2026-09-19"), esperado);
  assert.strictEqual(U.formatoFechaDia(""), "Sin fecha");
  assert.strictEqual(U.formatoFechaDia("xx"), "xx");
});

test("formatoHora recorta a HH:MM", () => {
  assert.strictEqual(U.formatoHora("14:30:00"), "14:30");
  assert.strictEqual(U.formatoHora(""), "");
  assert.strictEqual(U.formatoHora(null), "");
});

// --- almacenamiento con localStorage simulado ---
function simularLocalStorage(inicial = {}, { fallaAlGuardar = false } = {}) {
  const datos = new Map(Object.entries(inicial));
  globalThis.localStorage = {
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => {
      if (fallaAlGuardar) throw new Error("QuotaExceededError");
      datos.set(k, String(v));
    },
  };
  return datos;
}

test("leerLista: inexistente, dañada y no-lista devuelven []", () => {
  const silenciar = console.warn;
  console.warn = () => {};
  try {
    simularLocalStorage({ a: "{no json", b: '{"x":1}' });
    assert.deepStrictEqual(U.leerLista("nada"), []);
    assert.deepStrictEqual(U.leerLista("a"), []);
    assert.deepStrictEqual(U.leerLista("b"), []);
  } finally {
    console.warn = silenciar;
  }
});

test("leerLista devuelve la lista guardada y guardarJSON la escribe", () => {
  const datos = simularLocalStorage();
  assert.strictEqual(U.guardarJSON("r", [{ id: 1 }]), true);
  assert.strictEqual(datos.get("r"), '[{"id":1}]');
  assert.deepStrictEqual(U.leerLista("r"), [{ id: 1 }]);
});

test("guardarJSON devuelve false (sin lanzar) si localStorage falla", () => {
  const silenciar = console.warn;
  console.warn = () => {};
  try {
    simularLocalStorage({}, { fallaAlGuardar: true });
    assert.strictEqual(U.guardarJSON("r", [1]), false);
  } finally {
    console.warn = silenciar;
  }
});
