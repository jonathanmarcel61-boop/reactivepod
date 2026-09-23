// Humo de los 13 modos de entrenamiento con pods virtuales (sin hardware BLE).
const { test, expect } = require("@playwright/test");
const {
  vigilarErrores, abrirApp, elegirModo, comenzarEntrenamiento, jugarHastaResultados,
} = require("./helpers");

const MODOS = [
  "simple", "persecucion", "doble", "circuito", "contrarreloj", "colores",
  "cazaColor", "automatico", "libre", "entrenador", "secuencia", "prohibido", "stroop",
];

for (const modo of MODOS) {
  test(`modo ${modo}: se puede iniciar sin errores`, async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    expect(await elegirModo(page, modo), `no se encontró el modo ${modo}`).toBe(true);
    await comenzarEntrenamiento(page);
    await page.waitForTimeout(2500);
    expect(errores).toEqual([]);
  });
}

// Modos que terminan solos al pulsar pods (se confirmó en la línea base sobre dev).
// "entrenador" queda fuera: lo termina el profesional manualmente.
const AUTOCOMPLETAN = process.env.MODOS_COMPLETAN
  ? process.env.MODOS_COMPLETAN.split(",")
  : MODOS.filter((m) => m !== "entrenador");

for (const modo of AUTOCOMPLETAN) {
  test(`modo ${modo}: se completa y muestra resultados`, async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await elegirModo(page, modo);
    await comenzarEntrenamiento(page);
    expect(await jugarHastaResultados(page, 70000)).toBe(true);
    expect(errores).toEqual([]);
  });
}
