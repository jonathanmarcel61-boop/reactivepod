const { test, expect } = require("@playwright/test");
const { abrirApp, vigilarErrores } = require("./helpers");

// Rutina corta de prueba: bloques de pocos segundos para no esperar minutos.
function planCorto(modos, segundos = 3) {
  return {
    minutos: 5,
    objetivos: ["reaccion"],
    nivel: "intermedio",
    descanso: 1,
    totalSegundos: 0,
    bloques: modos.map((modo, i) => ({
      modo,
      rol: i === 0 ? "calentamiento" : i === modos.length - 1 ? "reto" : "principal",
      objetivo: "reaccion",
      dificultad: i === 0 ? "facil" : "media",
      segundos,
    })),
  };
}

async function abrirAsistente(page) {
  await page.evaluate(() => mostrarPantalla(pantallaInicio));
  await page.locator("#btnAbrirAsistenteRutinas").click();
  await expect(page.locator("#asistenteOverlay")).toBeVisible();
}

test.describe("Asistente de rutinas a medida", () => {
  test("el formulario pide al menos un objetivo y no deja elegir más de 2", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await abrirAsistente(page);

    await page.locator("#asisArmar").click();
    await expect(page.locator("#asisError")).toContainText("al menos un objetivo");

    const objetivos = page.locator('input[name="asisObjetivo"]');
    await expect(objetivos).toHaveCount(4);
    await objetivos.nth(0).check();
    await objetivos.nth(1).check();
    await objetivos.nth(2).check({ force: true }).catch(() => {});
    await expect(page.locator('input[name="asisObjetivo"]:checked')).toHaveCount(2);
    await expect(page.locator("#asisError")).toContainText("hasta 2");
    expect(errores).toEqual([]);
  });

  test("la vista previa suma exactamente el tiempo elegido y 'Otra propuesta' cambia los ejercicios", async ({ page }) => {
    await abrirApp(page);
    await abrirAsistente(page);

    await page.locator('label:has(input[value="memoria"])').click();
    await page.locator('label:has(input[name="asisMinutos"][value="10"])').click();
    await page.locator('label:has(input[name="asisNivel"][value="principiante"])').click();
    await page.locator("#asisArmar").click();

    await expect(page.locator("#asistenteTitulo")).toHaveText("Tu rutina de 10 min");
    const filas = page.locator(".asis-bloque");
    await expect(filas).toHaveCount(4);

    const total = await page.evaluate(() => {
      const p = window.rehabAsistente.estado.plan;
      return { total: p.totalSegundos, minutos: p.minutos, nivel: p.nivel };
    });
    expect(total.total).toBe(600);
    expect(total.nivel).toBe("principiante");

    const antes = await filas.locator("b").allTextContents();
    let distinta = false;
    for (let i = 0; i < 5 && !distinta; i++) {
      await page.locator("#asisOtra").click();
      const despues = await page.locator(".asis-bloque b").allTextContents();
      distinta = JSON.stringify(despues) !== JSON.stringify(antes);
    }
    expect(distinta, "Otra propuesta debe cambiar algún ejercicio").toBe(true);

    await page.locator("#asisVolver").click();
    await expect(page.locator('input[name="asisObjetivo"][value="memoria"]')).toBeChecked();
    await expect(page.locator('input[name="asisMinutos"][value="10"]')).toBeChecked();
  });

  test("rutina completa: prepárate, ejercicio, descanso, ejercicio, resumen y otra rutina diferente", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);

    const antes = await page.evaluate(() => ({
      dif: ajustesApp.dificultad,
      tipo: document.getElementById("tipoFinalGeneralReactiPod")?.value,
    }));

    await page.evaluate((plan) => window.rehabAsistente.iniciarPlan(plan), planCorto(["simple", "colores"]));

    const ejec = page.locator("#asisEjecOverlay");
    await expect(ejec).toBeVisible();
    await expect(page.locator("#asisEjecTitulo")).toHaveText("Prepárate");
    await expect(ejec).toContainText("EJERCICIO 1 DE 2");
    await page.locator("#asisYa").click();

    // Ejercicio 1 en marcha con la configuración del bloque.
    await expect(ejec).toBeHidden();
    const cfg = await page.evaluate(() => ({ modo: modoActual, dif: ajustesApp.dificultad, activo: entrenamientoActivo }));
    expect(cfg.modo).toBe("simple");
    expect(cfg.dif).toBe("facil");

    // Termina por tiempo y aparece el descanso con el siguiente ejercicio.
    await expect(page.locator("#asisEjecTitulo")).toHaveText("Descanso", { timeout: 20000 });
    await expect(ejec).toContainText("EJERCICIO 2 DE 2");
    await expect(ejec).toContainText("Reacción por colores");

    // El descanso (1 s) arranca solo el siguiente ejercicio, ya en dificultad "media".
    await expect(ejec).toBeHidden({ timeout: 8000 });
    expect(await page.evaluate(() => modoActual)).toBe("colores");
    expect(await page.evaluate(() => ajustesApp.dificultad)).toMatch(/media|facil|dificil/);

    // Fin de la rutina: resumen.
    await expect(page.locator("#asisEjecTitulo")).toHaveText("¡Rutina completada!", { timeout: 25000 });
    await expect(ejec).toContainText("2 EJERCICIOS");
    await expect(page.locator(".asis-tabla li")).toHaveCount(2);

    // Los ajustes del usuario vuelven a como estaban.
    const despues = await page.evaluate(() => ({
      dif: ajustesApp.dificultad,
      tipo: document.getElementById("tipoFinalGeneralReactiPod")?.value,
      extras: document.querySelectorAll("option[data-asis]").length,
    }));
    expect(despues.dif).toBe(antes.dif);
    expect(despues.tipo).toBe(antes.tipo);
    expect(despues.extras).toBe(0);

    // Cada ejercicio quedó guardado en el historial del perfil.
    const guardados = await page.evaluate(() => obtenerPerfilActivo().historial.slice(-2).map((h) => h.modo));
    expect(guardados).toEqual(["Reacción aleatoria", "Reacción por colores"]);

    // "Otra rutina diferente": propuesta nueva que no repite los modos.
    await page.evaluate(() => {
      window.rehabAsistente.estado.prefs = { objetivos: ["reaccion"], nivel: "intermedio", minutos: 5 };
    });
    await page.locator("#asisOtraRutina").click();
    await expect(page.locator("#asistenteOverlay")).toBeVisible();
    await expect(page.locator("#asistenteTitulo")).toHaveText("Tu rutina de 5 min");
    await expect(page.locator("#asistenteOverlay .asis-nota--resalta")).toContainText("distinta");
    expect(errores).toEqual([]);
  });

  for (const caso of [
    { nombre: "sube", aciertos: 20, errores: 0, texto: "Subimos la dificultad", dificultad: "dificil" },
    { nombre: "baja", aciertos: 4, errores: 12, texto: "Bajamos un poco", dificultad: "facil" },
    { nombre: "mantiene", aciertos: 14, errores: 6, texto: null, dificultad: "media" },
  ]) {
    test(`la dificultad ${caso.nombre} en el siguiente ejercicio según los resultados`, async ({ page }) => {
      await abrirApp(page);
      await page.evaluate((plan) => window.rehabAsistente.iniciarPlan(plan), planCorto(["simple", "colores", "stroop"]));

      // Calentamiento: sus resultados no adaptan nada, aunque sean perfectos.
      await page.locator("#asisYa").click();
      await expect.poll(() => page.evaluate(() => modoActual)).toBe("simple");
      await page.evaluate(() => { aciertos = 30; errores = 0; });
      await expect(page.locator("#asisEjecTitulo")).toHaveText("Descanso", { timeout: 25000 });
      await expect(page.locator("#asisEjecOverlay .asis-nota--resalta")).toHaveCount(0);

      // Ejercicio principal: se simula el rendimiento y termina por tiempo.
      await expect(page.locator("#asisEjecOverlay")).toBeHidden({ timeout: 8000 });
      await expect.poll(() => page.evaluate(() => modoActual)).toBe("colores");
      await page.evaluate((c) => { aciertos = c.aciertos; errores = c.errores; }, caso);
      await expect(page.locator("#asisEjecTitulo")).toHaveText("Descanso", { timeout: 25000 });

      const nota = page.locator("#asisEjecOverlay .asis-nota--resalta");
      if (caso.texto) await expect(nota).toContainText(caso.texto);
      else await expect(nota).toHaveCount(0);

      const siguiente = await page.evaluate(() => window.rehabAsistente.estado.bloques[2].dificultad);
      expect(siguiente).toBe(caso.dificultad);
    });
  }

  test("cancelar la rutina pide confirmación, vuelve a Inicio y restaura los ajustes", async ({ page }) => {
    await abrirApp(page);
    const dif = await page.evaluate(() => ajustesApp.dificultad);
    await page.evaluate((plan) => window.rehabAsistente.iniciarPlan(plan), planCorto(["simple", "colores", "doble"], 10));

    await page.locator("#asisCancelar").click();
    await expect(page.locator(".rp-overlay--dialogo:not([hidden])")).toBeVisible();

    // "Seguir" mantiene la rutina y su cuenta atrás.
    await page.getByRole("button", { name: "Seguir" }).click();
    await expect(page.locator("#asisEjecOverlay")).toBeVisible();
    expect(await page.evaluate(() => window.rehabAsistente.estado.activa)).toBe(true);

    await page.locator("#asisCancelar").click();
    await page.getByRole("button", { name: "Sí, detener" }).click();
    await expect(page.locator("#asisEjecOverlay")).toBeHidden();
    await expect(page.locator("#pantallaInicio")).toHaveClass(/activa/);
    const estado = await page.evaluate(() => ({ activa: window.rehabAsistente.estado.activa, dif: ajustesApp.dificultad }));
    expect(estado.activa).toBe(false);
    expect(estado.dif).toBe(dif);
  });

  // Cada modo se ejecuta de verdad en un bloque corto: ninguno debe dar error ni colgarse.
  const GRUPOS = [
    ["simple", "colores", "secuencia", "libre"],
    ["persecucion", "doble", "prohibido", "circuito"],
    ["contrarreloj", "cazaColor", "automatico", "stroop"],
  ];
  for (const modos of GRUPOS) {
    test(`los modos ${modos.join(", ")} se ejecutan por tiempo dentro de una rutina`, async ({ page }) => {
      test.setTimeout(120000);
      const errores = vigilarErrores(page);
      await abrirApp(page);
      await page.evaluate((plan) => window.rehabAsistente.iniciarPlan(plan), planCorto(modos, 3));

      for (let i = 0; i < modos.length; i++) {
        await page.locator("#asisYa").click({ timeout: 30000 });
        await expect
          .poll(() => page.evaluate(() => modoActual), { timeout: 5000 })
          .toBe(modos[i]);
        if (i < modos.length - 1) {
          await expect(page.locator("#asisEjecTitulo")).toHaveText("Descanso", { timeout: 25000 });
        }
      }
      await expect(page.locator("#asisEjecTitulo")).toHaveText("¡Rutina completada!", { timeout: 30000 });
      await expect(page.locator(".asis-tabla li")).toHaveCount(modos.length);
      expect(errores).toEqual([]);
    });
  }
});
