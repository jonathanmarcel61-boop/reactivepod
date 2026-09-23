const { test, expect } = require("@playwright/test");
const { abrirApp, vigilarErrores } = require("./helpers");

// Voz y compartir simulados: el navegador de pruebas no tiene voz ni menú de compartir.
async function simularApisDelTelefono(page) {
  await page.addInitScript(() => {
    window.__dichas = [];
    window.__compartidos = [];
    // speechSynthesis es un accesor de solo lectura: hay que redefinirlo.
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        speak: (u) => window.__dichas.push(u.text),
        cancel: () => {},
        getVoices: () => [{ lang: "es-MX", name: "prueba" }],
      },
    });
    window.SpeechSynthesisUtterance = function (t) {
      this.text = t;
    };
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (d) => {
        window.__compartidos.push(d.text);
      },
    });
  });
}

/** Guarda sesiones "hace N días" en el perfil activo (0 = hoy). */
async function sembrarSesiones(page, diasAtras) {
  await page.evaluate((dias) => {
    const perfil = obtenerPerfilActivo();
    dias.forEach((n) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      d.setHours(12, 0, 0, 0);
      perfil.historial.push({ timestamp: d.getTime(), fecha: d.toLocaleString(), modo: "Reacción aleatoria", rondas: 10, aciertos: 9, errores: 1, promedio: 0.6, mejor: 0.4, peor: 0.9, dificultad: "media" });
    });
    guardarDatos();
    actualizarResumenInicio();
  }, diasAtras);
}

test.describe("Bienvenida animada y personalizada", () => {
  test("al abrir la app aparece un saludo con la hora y un mensaje, y se puede saltar tocando", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page, { terminos: false });
    const splash = page.locator("#splashReactiPod");
    await expect(splash).toBeVisible();
    await expect(splash.locator(".apertura__saludo")).toContainText(/Buen(os días|as tardes|as noches)/);
    await expect(splash.locator(".apertura__mensaje")).not.toBeEmpty();
    await expect(splash.locator(".apertura__pod")).toHaveCount(4);
    // En el primer uso los términos van encima; se toca la bienvenida directamente.
    await splash.dispatchEvent("click");
    await expect(splash).toHaveCount(0, { timeout: 2000 });
    expect(errores).toEqual([]);
  });

  test("el mensaje cambia según la situación: racha, meta y regreso", async ({ page }) => {
    await abrirApp(page);
    const mensaje = () =>
      page.evaluate(() => {
        RehabBienvenida.mostrar(obtenerPerfilActivo(), { duracion: 60000 });
        const t = document.querySelector("#splashReactiPod .apertura__mensaje").textContent;
        document.getElementById("splashReactiPod").remove();
        return t;
      });

    expect(await mensaje()).toContain("primera vez");
    await sembrarSesiones(page, [0, 1, 2]);
    await page.evaluate(() => RehabMetas.guardarMeta(3));
    expect(await mensaje()).toContain("Meta semanal cumplida");
    await page.evaluate(() => RehabMetas.guardarMeta(7));
    expect(await mensaje()).toContain("3 días seguidos");
  });

  test("con 'reducir movimiento' la bienvenida sigue mostrando el mensaje", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await abrirApp(page, { terminos: false });
    await expect(page.locator("#splashReactiPod .apertura__mensaje")).toBeVisible();
    await ctx.close();
  });
});

test.describe("Meta semanal y racha", () => {
  test("la tarjeta de Inicio muestra los días entrenados y se actualiza con la meta de Ajustes", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await page.evaluate(() => mostrarPantalla(pantallaInicio));
    await expect(page.locator("#metaSemanalTitulo")).toHaveText("0 de 3 días esta semana");
    await expect(page.locator(".metaDia")).toHaveCount(7);

    await sembrarSesiones(page, [0, 0]); // dos sesiones el mismo día = 1 día
    await expect(page.locator("#metaSemanalTitulo")).toHaveText("1 de 3 días esta semana");
    await expect(page.locator(".metaDia--hecho")).toHaveCount(1);
    await expect(page.locator(".metaDia--hoy")).toHaveCount(1);

    await page.evaluate(() => {
      const s = document.getElementById("ajusteMetaSemanal");
      s.value = "1";
      s.dispatchEvent(new Event("change"));
    });
    await expect(page.locator("#metaSemanalTitulo")).toHaveText("1 de 1 día esta semana");
    await expect(page.locator("#metaSemanalSub")).toContainText("Meta cumplida");
    expect(await page.evaluate(() => localStorage.getItem("rehabpodMetaSemanal"))).toBe("1");
    expect(errores).toEqual([]);
  });

  test("la racha de Inicio cuenta días seguidos", async ({ page }) => {
    await abrirApp(page);
    await sembrarSesiones(page, [0, 1, 2]);
    await expect(page.locator("#inicioRacha")).toHaveText("3");
  });

  test("al cumplir la meta se avisa una sola vez por semana", async ({ page }) => {
    await abrirApp(page);
    await page.evaluate(() => RehabMetas.guardarMeta(1));
    const guardar = () => page.evaluate(() => guardarEntrenamiento(0.5, 0.3, 0.9));
    await guardar();
    await expect(page.locator(".rp-aviso", { hasText: "Cumpliste tu meta semanal" })).toBeVisible({ timeout: 4000 });
    await page.locator(".rp-aviso__cerrar").first().click();
    await guardar();
    await page.waitForTimeout(1800);
    await expect(page.locator(".rp-aviso", { hasText: "Cumpliste tu meta semanal" })).toHaveCount(0);
  });
});

test.describe("Voz en español", () => {
  test("dice la cuenta atrás y respeta el interruptor de Ajustes", async ({ page }) => {
    await simularApisDelTelefono(page);
    await abrirApp(page);
    const cuenta = (t) => page.evaluate((x) => (document.getElementById("numeroCuenta").textContent = x), t);

    await cuenta("3");
    await cuenta("2");
    await cuenta("¡VAMOS!");
    await expect.poll(() => page.evaluate(() => window.__dichas)).toEqual(["tres", "dos", "¡Vamos!"]);

    await page.evaluate(() => {
      const c = document.getElementById("ajusteVoz");
      c.checked = false;
      c.dispatchEvent(new Event("change"));
    });
    await cuenta("1");
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.__dichas.length)).toBe(3);
    expect(await page.evaluate(() => localStorage.getItem("rehabpodVoz"))).toBe("false");
  });

  test("sin voz en el dispositivo el ajuste queda desactivado y nada falla", async ({ page }) => {
    const errores = vigilarErrores(page);
    await page.addInitScript(() => {
      delete window.speechSynthesis;
      window.SpeechSynthesisUtterance = undefined;
    });
    await abrirApp(page);
    await expect(page.locator("#ajusteVoz")).toBeDisabled();
    await page.evaluate(() => (document.getElementById("numeroCuenta").textContent = "3"));
    expect(errores).toEqual([]);
  });
});

test.describe("Compartir por WhatsApp", () => {
  test("el botón de Resultados comparte el último entrenamiento", async ({ page }) => {
    const errores = vigilarErrores(page);
    await simularApisDelTelefono(page);
    await abrirApp(page);
    await sembrarSesiones(page, [0]);
    await page.evaluate(() => mostrarPantalla(pantallaResultados));
    await page.locator("#btnCompartirResultado").click();
    await expect(page.locator(".rp-aviso", { hasText: "Resultado compartido" })).toBeVisible();
    const texto = await page.evaluate(() => window.__compartidos[0]);
    expect(texto).toContain("RehabPod");
    expect(texto).toContain("9 aciertos");
    expect(texto).toContain("Reacción aleatoria");
    expect(errores).toEqual([]);
  });

  test("sin resultados avisa amablemente", async ({ page }) => {
    await simularApisDelTelefono(page);
    await abrirApp(page);
    await page.evaluate(() => mostrarPantalla(pantallaResultados));
    await page.locator("#btnCompartirResultado").click();
    await expect(page.locator(".rp-aviso", { hasText: "Todavía no hay un resultado" })).toBeVisible();
  });

  test("rutina guiada: voz en las transiciones y botón de compartir en el resumen", async ({ page }) => {
    const errores = vigilarErrores(page);
    await simularApisDelTelefono(page);
    await abrirApp(page);
    await page.evaluate(() =>
      window.rehabAsistente.iniciarPlan({
        minutos: 5,
        objetivos: ["reaccion"],
        nivel: "intermedio",
        descanso: 1,
        totalSegundos: 0,
        bloques: [{ modo: "simple", rol: "calentamiento", objetivo: "reaccion", dificultad: "facil", segundos: 3 }],
      })
    );
    await expect.poll(() => page.evaluate(() => window.__dichas.some((t) => /^Prepárate\. Ejercicio 1 de 1/.test(t)))).toBe(true);
    await page.locator("#asisYa").click();
    await expect(page.locator("#asisEjecTitulo")).toHaveText("¡Rutina completada!", { timeout: 20000 });
    await page.locator("#asisCompartir").click();
    await expect(page.locator(".rp-aviso", { hasText: "Resultado compartido" })).toBeVisible();
    const texto = await page.evaluate(() => window.__compartidos[0]);
    expect(texto).toContain("completó una rutina de 5 min");
    expect(await page.evaluate(() => window.__dichas.some((t) => /Rutina completada/.test(t)))).toBe(true);
    expect(errores).toEqual([]);
  });
});
