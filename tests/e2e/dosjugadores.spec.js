const { test, expect } = require("@playwright/test");
const { abrirApp, vigilarErrores } = require("./helpers");

// Tiempos rápidos para no esperar segundos de más en las pruebas.
async function tiemposRapidos(page, extra = {}) {
  await page.addInitScript((e) => {
    window.__rehabDueloTiempos = Object.assign({ cuenta: 60, esperaMin: 40, esperaMax: 80, pausa: 60, avisoCambio: 120, limite: 400 }, e);
  }, extra);
}

async function abrirAjustes(page) {
  // La entrada está en Entrenamientos (INICIAR ENTRENAMIENTO), no en Inicio.
  await page.evaluate(() => mostrarPantalla(pantallaInicio));
  await page.locator("#btnEntrenamiento").click();
  await page.locator("#btnDosJugadores").click();
  await expect(page.locator("#dosJugadoresOverlay")).toBeVisible();
}

/** Espera a que la ronda esté abierta y golpea el Pod de `quien` desde su mitad. */
async function ganarRonda(page, quien) {
  await page.waitForFunction(() => rehabDosJugadores.estado && rehabDosJugadores.estado.ronda && rehabDosJugadores.estado.ronda.abierta, null, { timeout: 8000 });
  const pod = await page.evaluate((q) => rehabDosJugadores.estado.ronda.pods[q], quien);
  await page.locator(`#dueloMitad${quien} .duelo__pod[data-pod="${pod}"]`).dispatchEvent("pointerdown");
}

test.describe("Dos jugadores", () => {
  test("no ocupa lugar en Inicio: se encuentra dentro de Iniciar entrenamiento", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await expect(page.locator("#tarjetaDosJugadores")).toHaveCount(0);
    await expect(page.locator("#pantallaInicio #btnDosJugadores")).toHaveCount(0);
    await page.locator("#btnEntrenamiento").click();
    const entrada = page.locator("#pantallaTiposEntrenamiento #btnDosJugadores");
    await expect(entrada).toBeVisible();
    await expect(entrada).toContainText("Dos jugadores");
    await page.screenshot({ path: "test-results/dos-en-entrenamientos.png", fullPage: true });
    // Entrar en una categoría oculta la entrada; volver la muestra otra vez.
    await page.locator(".rehabV22Categoria").first().click();
    await expect(entrada).toBeHidden();
    await page.locator("#rehabV22Volver").click();
    await expect(entrada).toBeVisible();
    expect(errores).toEqual([]);
  });

  test("ajustes: cambia entre duelo y turnos, evita colores repetidos y avisa si faltan Pods", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page, { virtual: false });
    await abrirAjustes(page);
    await expect(page.locator("#dosDueloOpc")).toBeVisible();
    await expect(page.locator("#dosTurnosOpc")).toBeHidden();
    await page.locator('label:has(input[value="turnos"])').click();
    await expect(page.locator("#dosTurnosOpc")).toBeVisible();
    await expect(page.locator("#dosDueloOpc")).toBeHidden();
    await page.locator('label:has(input[value="duelo"])').click();

    await page.locator("#dosColor1").selectOption("red");
    await expect(page.locator("#dosColor0")).not.toHaveValue("red");
    await page.locator("#dosColor0").selectOption("red");
    await expect(page.locator("#dosColor1")).not.toHaveValue("red");

    // Sin Pods físicos y sin simulación: mensaje útil y no arranca.
    await page.locator("#dosVirtual").uncheck();
    await page.locator("#dosEmpezar").click();
    await expect(page.locator("#dosError")).toContainText("Enciéndelos");
    await expect(page.locator("#dueloOverlay")).toHaveCount(0);
    expect(errores).toEqual([]);
  });

  test("duelo completo con Pods simulados: puntos, cambio de color, ganador y estado restaurado", async ({ page }) => {
    const errores = vigilarErrores(page);
    await tiemposRapidos(page);
    await abrirApp(page, { virtual: false });
    await abrirAjustes(page);
    await page.locator("#dosNombre0").fill("Ana");
    await page.locator("#dosNombre1").fill("Luis");
    await page.locator("#dosRondas").selectOption("6");
    await page.locator("#dosColor0").selectOption("red");
    await page.locator("#dosColor1").selectOption("blue");
    await expect(page.locator("#dosVirtual")).toBeChecked();
    await page.locator("#dosEmpezar").click();

    await expect(page.locator("#dueloOverlay")).toBeVisible();
    expect(await page.evaluate(() => rehabModoVirtual)).toBe(true);
    await expect(page.locator("#dueloMitad0 .duelo__nombre")).toHaveText("Ana");
    await expect(page.locator("#dueloMitad1 .duelo__nombre")).toHaveText("Luis");

    // Ronda 1: el jugador 1 toca desde SU mitad el Pod del rival: no cuenta; luego el suyo: cuenta.
    await page.waitForFunction(() => rehabDosJugadores.estado.ronda && rehabDosJugadores.estado.ronda.abierta);
    const [p1, p2] = await page.evaluate(() => rehabDosJugadores.estado.ronda.pods);
    await page.locator(`#dueloMitad0 .duelo__pod[data-pod="${p2}"]`).dispatchEvent("pointerdown");
    expect(await page.evaluate(() => rehabDosJugadores.estado.ronda.abierta)).toBe(true);
    await page.locator(`#dueloMitad0 .duelo__pod[data-pod="${p1}"]`).dispatchEvent("pointerdown");
    await expect(page.locator("#dueloMitad0 .duelo__puntos")).toHaveText("1");

    // Rondas 2-6: gana el jugador 1 tres más (4 en total) y el jugador 2 dos.
    for (const q of [1, 0, 0, 1, 0]) await ganarRonda(page, q);
    await expect(page.locator("#dosFinalOverlay")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#dosFinalTitulo, #dosFinalOverlay h2").first()).toContainText("¡Ganó Ana!");
    await expect(page.locator("#dosFinalOverlay .dos-col--gana h3")).toContainText("Ana");
    await expect(page.locator("#dosFinalOverlay .dos-puntos").first()).toHaveText("4");
    await expect(page.locator("#dosFinalOverlay .dos-puntos").nth(1)).toHaveText("2");

    // Los colores se intercambiaron en la segunda mitad (ronda 4 en adelante).
    const cols = await page.evaluate(() => rehabDosJugadores.estado.historial.map((h) => h.colores.join("/")));
    expect(cols.slice(0, 3)).toEqual(["red/blue", "red/blue", "red/blue"]);
    expect(cols.slice(3)).toEqual(["blue/red", "blue/red", "blue/red"]);

    // Nada de esta partida entra al historial y se restaura la simulación.
    expect(await page.evaluate(() => obtenerPerfilActivo().historial.length)).toBe(0);
    await page.locator("#dosCerrar").click();
    await expect(page.locator("#dueloOverlay")).toHaveCount(0);
    expect(await page.evaluate(() => rehabModoVirtual)).toBe(false);
    expect(await page.evaluate(() => rehabDosJugadores.activo)).toBe(false);
    expect(errores).toEqual([]);
  });

  test("si nadie golpea a tiempo la ronda no da punto y el duelo sigue", async ({ page }) => {
    await tiemposRapidos(page, { limite: 150 });
    await abrirApp(page, { virtual: false });
    await abrirAjustes(page);
    await page.locator("#dosRondas").selectOption("6");
    await page.locator("#dosEmpezar").click();
    await expect(page.locator("#dosFinalOverlay")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#dosFinalOverlay h2").first()).toContainText("Empate");
    await expect(page.locator("#dosFinalOverlay")).toContainText("6 rondas sin punto");
  });

  test("con Pods físicos los golpes llegan por procesarPulsacion y cada Pod es de un jugador", async ({ page }) => {
    const errores = vigilarErrores(page);
    await tiemposRapidos(page);
    await abrirApp(page, { virtual: false });
    // Simula 2 Pods físicos conectados (sin hardware).
    await page.evaluate(() => {
      podsBLE[0].conectado = true;
      podsBLE[1].conectado = true;
    });
    await abrirAjustes(page);
    await page.locator("#dosRondas").selectOption("6");
    await page.locator("#dosVirtual").uncheck();
    await page.locator("#dosEmpezar").click();
    await expect(page.locator("#dueloOverlay")).toBeVisible();
    expect(await page.evaluate(() => rehabModoVirtual)).toBe(false);
    await expect(page.locator("#dueloMitad0 .duelo__pods")).toBeHidden();

    for (let i = 0; i < 6; i++) {
      await page.waitForFunction(() => rehabDosJugadores.estado.ronda && rehabDosJugadores.estado.ronda.abierta);
      await page.evaluate((q) => procesarPulsacion(rehabDosJugadores.estado.ronda.pods[q]), i % 2 === 0 ? 0 : 1);
    }
    await expect(page.locator("#dosFinalOverlay")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#dosFinalOverlay h2").first()).toContainText("Empate"); // 3 a 3
    await page.locator("#dosCerrar").click();
    await page.evaluate(() => { podsBLE[0].conectado = false; podsBLE[1].conectado = false; });
    expect(errores).toEqual([]);
  });

  test("salir del duelo pide confirmación y limpia todo", async ({ page }) => {
    await tiemposRapidos(page, { limite: 5000 });
    await abrirApp(page, { virtual: false });
    await abrirAjustes(page);
    await page.locator("#dosEmpezar").click();
    await expect(page.locator("#dueloOverlay")).toBeVisible();
    await page.locator("#dueloSalir").click();
    await page.getByRole("button", { name: "Seguir jugando" }).click();
    await expect(page.locator("#dueloOverlay")).toBeVisible();
    await page.locator("#dueloSalir").click();
    await page.getByRole("button", { name: "Salir", exact: true }).last().click();
    await expect(page.locator("#dueloOverlay")).toHaveCount(0);
    expect(await page.evaluate(() => rehabModoVirtual)).toBe(false);
    expect(await page.evaluate(() => rehabDosJugadores.activo)).toBe(false);
  });

  test("por turnos: cada jugador hace el ejercicio, se comparan y no se guarda en el historial", async ({ page }) => {
    const errores = vigilarErrores(page);
    await tiemposRapidos(page, { segundosTurno: 3 });
    await abrirApp(page, { virtual: false });
    await abrirAjustes(page);
    await page.locator('label:has(input[value="turnos"])').click();
    await page.locator("#dosNombre0").fill("Ana");
    await page.locator("#dosNombre1").fill("Luis");
    await page.locator("#dosEmpezar").click();

    await expect(page.locator("#dosTurnoTitulo, #dosTurnoOverlay h2").first()).toContainText("Turno de Ana");
    await page.locator("#dosTurnoIr").click();
    await expect(page.locator("#asisEjecTitulo")).toHaveText("Prepárate");
    await page.locator("#asisYa").click();

    // Al terminar el turno de Ana no se ve el resumen de rutina, sino el turno de Luis.
    await expect(page.locator("#dosTurnoOverlay h2").first()).toContainText("Turno de Luis", { timeout: 20000 });
    await expect(page.locator("#asisEjecOverlay")).toBeHidden();
    await page.locator("#dosTurnoIr").click();
    await page.locator("#asisYa").click();

    await expect(page.locator("#dosFinalOverlay")).toBeVisible({ timeout: 20000 });
    await expect(page.locator("#dosFinalOverlay .dos-col")).toHaveCount(2);
    expect(await page.evaluate(() => obtenerPerfilActivo().historial.length)).toBe(0);
    await page.locator("#dosCerrar").click();
    expect(await page.evaluate(() => rehabDosJugadores.activo)).toBe(false);
    expect(await page.evaluate(() => rehabModoVirtual)).toBe(false);
    expect(errores).toEqual([]);
  });

  test("por turnos: quien acierta más gana; si empatan decide el tiempo", async ({ page }) => {
    await abrirApp(page);
    const r = await page.evaluate(() => {
      const c = rehabDosJugadores.compararTurnos;
      return [
        c({ aciertos: 5, promedio: 0.9 }, { aciertos: 4, promedio: 0.3 }),
        c({ aciertos: 3, promedio: 0.5 }, { aciertos: 4, promedio: 0.9 }),
        c({ aciertos: 4, promedio: 0.7 }, { aciertos: 4, promedio: 0.5 }),
        c({ aciertos: 4, promedio: 0.5 }, { aciertos: 4, promedio: 0.5 }),
        c({ aciertos: 4, promedio: null }, { aciertos: 4, promedio: 0.5 }),
      ];
    });
    expect(r).toEqual([0, 1, 1, null, null]);
  });
});
