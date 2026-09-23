const { test, expect } = require("@playwright/test");
const { abrirApp, vigilarErrores } = require("./helpers");

/** Nube falsa en memoria (con las reglas de lectura: profesional ve todo, usuario solo lo suyo). */
async function instalarNube(page, { rol = "user", userId = "u1", nombre = "Ana Pérez", filas = [], sinTabla = false } = {}) {
  await page.evaluate(
    ({ rol, userId, nombre, filas, sinTabla }) => {
      const db = { rehab_shared_routines: filas.map((f) => ({ ...f })) };
      window.__db = db;
      const perfil = { role: rol, full_name: nombre };
      const from = (tabla) => {
        let modo = "select";
        const filtros = [];
        let fila = null;
        const ejecutar = () => {
          if (sinTabla && tabla === "rehab_shared_routines") return { data: null, error: { code: "42P01", message: 'relation "rehab_shared_routines" does not exist' } };
          if (modo === "delete") {
            db[tabla] = db[tabla].filter((f) => !filtros.every(([c, v]) => f[c] === v));
            return { error: null };
          }
          let filas = db[tabla].slice();
          if (rol !== "professional") filas = filas.filter((f) => f.author_id === userId);
          return { data: filas, error: null };
        };
        const q = {
          select: () => q,
          eq: (c, v) => (filtros.push([c, v]), q),
          order: () => q,
          limit: () => Promise.resolve(ejecutar()),
          single: () => Promise.resolve({ data: perfil, error: null }),
          upsert: (f) => {
            if (sinTabla) return Promise.resolve({ error: { code: "42P01", message: "does not exist" } });
            const i = db[tabla].findIndex((x) => x.author_id === f.author_id && x.local_id === f.local_id);
            const nueva = { id: i >= 0 ? db[tabla][i].id : "n" + (db[tabla].length + 1), created_at: new Date().toISOString(), ...f };
            if (i >= 0) db[tabla][i] = nueva;
            else db[tabla].push(nueva);
            return Promise.resolve({ error: null });
          },
          delete: () => ((modo = "delete"), q),
          then: (res, rej) => Promise.resolve(ejecutar()).then(res, rej),
        };
        return q;
      };
      window.rehabGetSupabaseClient = async () => ({
        auth: { getSession: async () => ({ data: { session: { user: { id: userId } } } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
        from,
      });
    },
    { rol, userId, nombre, filas, sinTabla }
  );
}

async function sembrarRutina(page, nombre = "Mi rutina", bloques) {
  return page.evaluate(
    ({ nombre, bloques }) => {
      const b = bloques || [{ modo: "simple", segundos: 60, dificultad: "media" }, { modo: "secuencia", segundos: 90, dificultad: "facil" }];
      const r = RehabRutinas.agregar([], { plan: RehabRutinas.planManual({ descanso: 15, bloques: b }), nombre, origen: "manual" });
      rehabRutinas.guardar(r.lista);
      rehabRutinas.pintarInicio();
      return r.rutina.id;
    },
    { nombre, bloques }
  );
}

const planFila = (modo, seg = 60) => ({ descanso: 15, nivel: "intermedio", bloques: [{ modo, segundos: seg, dificultad: "media", rol: "principal" }] });

test.describe("Compartir rutinas con profesionales (usuarios)", () => {
  test("sin sesión avisa que hay que iniciar sesión y no marca nada como compartido", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await sembrarRutina(page);
    await page.evaluate(() => rehabRutinas.abrirLista());
    await page.locator('#misRutinasOverlay [data-accion="compartir"]').click();
    await expect(page.locator(".rp-aviso").last()).toContainText("Inicia sesión");
    await expect(page.locator("#misRutinasOverlay")).not.toContainText("Compartida con profesionales");
    expect(errores).toEqual([]);
  });

  test("comparte (con nombre visible), se actualiza al editar y se deja de compartir", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await instalarNube(page);
    const id = await sembrarRutina(page);
    await page.evaluate(() => rehabRutinas.abrirLista());

    await page.locator('#misRutinasOverlay [data-accion="compartir"]').click();
    const dlg = page.locator('[role="alertdialog"]');
    await expect(dlg).toContainText("No se comparten tus resultados");
    await page.screenshot({ path: "test-results/compartir-dialogo.png" });
    await dlg.locator("#cmpMostrarNombre").check();
    await dlg.locator('[data-rp="aceptar"]').click();

    await expect.poll(() => page.evaluate(() => window.__db.rehab_shared_routines.length)).toBe(1);
    const fila = await page.evaluate(() => window.__db.rehab_shared_routines[0]);
    expect(fila.author_id).toBe("u1");
    expect(fila.author_name).toBe("Ana Pérez");
    expect(fila.local_id).toBe(id);
    expect(fila.plan.bloques).toHaveLength(2);
    expect(Object.keys(fila).sort()).toEqual(["author_id", "author_name", "created_at", "id", "level", "local_id", "minutes", "name", "objectives", "plan"]);
    await expect(page.locator("#misRutinasOverlay")).toContainText("Compartida con profesionales");
    const boton = page.locator('#misRutinasOverlay [data-accion="compartir"]');
    await expect(boton).toHaveText("Dejar de compartir");

    // Editar → la copia compartida se actualiza (una sola fila).
    await page.locator('#misRutinasOverlay [data-accion="editar"]').click();
    await page.locator("#rutinaManualOverlay #rutGuardar").click();
    await expect.poll(() => page.evaluate(() => window.__db.rehab_shared_routines.length)).toBe(1);

    // Dejar de compartir → se borra de la nube y se desmarca.
    await page.locator('#misRutinasOverlay [data-accion="compartir"]').click();
    await expect.poll(() => page.evaluate(() => window.__db.rehab_shared_routines.length)).toBe(0);
    await expect(page.locator("#misRutinasOverlay")).not.toContainText("Compartida con profesionales");
    expect(errores).toEqual([]);
  });

  test("por defecto es anónimo, y al eliminar la rutina también desaparece de la biblioteca", async ({ page }) => {
    await abrirApp(page);
    await instalarNube(page);
    await sembrarRutina(page);
    await page.evaluate(() => rehabRutinas.abrirLista());
    await page.locator('#misRutinasOverlay [data-accion="compartir"]').click();
    await page.locator('[role="alertdialog"] [data-rp="aceptar"]').click();
    await expect.poll(() => page.evaluate(() => window.__db.rehab_shared_routines.length)).toBe(1);
    expect(await page.evaluate(() => window.__db.rehab_shared_routines[0].author_name)).toBeNull();

    await page.locator('#misRutinasOverlay [data-accion="eliminar"]').click();
    await page.locator('[role="alertdialog"] [data-rp="aceptar"]').click();
    await expect.poll(() => page.evaluate(() => window.__db.rehab_shared_routines.length)).toBe(0);
  });

  test("si la biblioteca aún no existe en el servidor, lo explica y no marca la rutina", async ({ page }) => {
    await abrirApp(page);
    await instalarNube(page, { sinTabla: true });
    await sembrarRutina(page);
    await page.evaluate(() => rehabRutinas.abrirLista());
    await page.locator('#misRutinasOverlay [data-accion="compartir"]').click();
    await page.locator('[role="alertdialog"] [data-rp="aceptar"]').click();
    await expect(page.locator(".rp-aviso--error")).toContainText("todavía no está activada");
    await expect(page.locator("#misRutinasOverlay")).not.toContainText("Compartida con profesionales");
  });
});

test.describe("Profesionales: Mis rutinas y biblioteca", () => {
  const filas = [
    { id: "f1", author_id: "otro", author_name: "Luis", name: "Rodilla ágil", minutes: 3, level: "intermedio", objectives: ["reaccion"], plan: planFila("simple", 90), created_at: "2026-09-10T10:00:00Z" },
    { id: "f2", author_id: "otro2", author_name: null, name: "Memoria fuerte", minutes: 2, level: "intermedio", objectives: ["memoria"], plan: planFila("secuencia", 120), created_at: "2026-09-11T10:00:00Z" },
    { id: "f3", author_id: "malo", author_name: '<img src=x onerror="window.__xss=1">', name: '<script>window.__xss=1</script>', minutes: 1, level: "intermedio", objectives: [], plan: planFila("simple", 60), created_at: "2026-09-12T10:00:00Z" },
    { id: "f4", author_id: "roto", author_name: "X", name: "Sin ejercicios válidos", minutes: 1, level: "intermedio", objectives: [], plan: { bloques: [{ modo: "hackeo", segundos: 60 }] }, created_at: "2026-09-13T10:00:00Z" },
  ];

  test("un usuario común no ve «Mis rutinas» en Inicio ni puede abrir la biblioteca", async ({ page }) => {
    await abrirApp(page);
    await instalarNube(page, { rol: "user", filas });
    await page.evaluate(() => rehabRutinasNube.actualizarInicio());
    await expect(page.locator("#btnMisRutinasPro")).toBeHidden();
    await page.evaluate(() => rehabRutinasNube.abrirBiblioteca());
    await expect(page.locator(".rp-aviso").last()).toContainText("solo para profesionales");
    await expect(page.locator("#bibliotecaRutinasOverlay")).toHaveCount(0);
  });

  test("sin sesión tampoco aparece", async ({ page }) => {
    await abrirApp(page);
    await page.evaluate(() => rehabRutinasNube.actualizarInicio());
    await expect(page.locator("#btnMisRutinasPro")).toBeHidden();
  });

  test("el profesional ve Mis rutinas, abre la biblioteca, busca y copia a sus rutinas", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await instalarNube(page, { rol: "professional", userId: "pro1", nombre: "Dra. Mora", filas });
    await page.evaluate(() => rehabRutinasNube.actualizarInicio());
    const btn = page.locator("#btnMisRutinasPro");
    await expect(btn).toBeVisible();
    expect((await btn.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: "test-results/profesional-inicio.png", fullPage: true });

    await btn.click();
    await expect(page.locator("#rehabV23Overlay")).toBeVisible();
    const abrirBib = page.locator("#rehabV23Biblioteca");
    await expect(abrirBib).toBeVisible();
    await abrirBib.click();

    const bib = page.locator("#bibliotecaRutinasOverlay");
    await expect(bib).toBeVisible();
    // Inválidas descartadas (3 de 4), textos ajenos escapados, nombre anónimo por defecto.
    await expect(page.locator(".bib-item")).toHaveCount(3);
    await expect(bib).toContainText("Rodilla ágil");
    await expect(bib).toContainText("Luis");
    await expect(bib).toContainText("Usuario de RehabPod");
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    await expect(page.locator("#bibEstado")).toContainText("3 rutinas");
    await page.screenshot({ path: "test-results/biblioteca.png" });

    await page.locator("#bibTexto").fill("memoria");
    await expect(page.locator(".bib-item")).toHaveCount(1);
    await page.locator("#bibTexto").fill("");
    await page.locator("#bibObjetivo").selectOption("memoria");
    await expect(page.locator(".bib-item")).toHaveCount(1);
    await page.locator("#bibObjetivo").selectOption("");

    // Copiar → aparece en el editor de rutinas (formato para asignar) y no se duplica.
    await page.locator('.bib-item[data-id="f2"] [data-bib="copiar"]').click();
    await expect(page.locator(".rp-aviso").last()).toContainText("se copió a Mis rutinas");
    const guardadas = await page.evaluate(() => JSON.parse(localStorage.getItem("rehabpodRutinas")));
    expect(guardadas).toHaveLength(1);
    expect(guardadas[0].nombre).toBe("Memoria fuerte");
    expect(guardadas[0].categoria).toBe("neurologia");
    expect(guardadas[0].ejercicios[0]).toMatchObject({ modo: "secuencia", finalizarPor: "tiempo", valor: 120, dificultad: "media" });
    await page.locator('.bib-item[data-id="f2"] [data-bib="copiar"]').click();
    await expect(page.locator(".rp-aviso").last()).toContainText("Ya tienes esta rutina");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("rehabpodRutinas")).length)).toBe(1);

    await page.locator("#bibIrMisRutinas").click();
    await expect(page.locator("#rehabV23Overlay")).toContainText("Memoria fuerte");
    expect(errores).toEqual([]);
  });

  test("biblioteca vacía o servidor sin la tabla: mensajes claros", async ({ page }) => {
    await abrirApp(page);
    await instalarNube(page, { rol: "professional", userId: "pro1", filas: [] });
    await page.evaluate(() => rehabRutinasNube.abrirBiblioteca());
    await expect(page.locator("#bibEstado")).toContainText("Todavía nadie ha compartido");
    await instalarNube(page, { rol: "professional", userId: "pro1", sinTabla: true });
    await page.locator("#bibActualizar").click();
    await expect(page.locator("#bibEstado")).toContainText("todavía no está activada");
  });
});

test.describe("Ajustes y Cuenta sin opciones repetidas", () => {
  test("Cuenta ya no repite sonido, tema, privacidad ni acerca de; enlaza a Ajustes", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await page.locator("#btnCuentaMenu").click();
    await expect(page.locator("#contenidoCuentaCloud .rehabV40Wrap")).toBeVisible();
    const txt = await page.locator("#contenidoCuentaCloud").innerText();
    for (const repetido of ["PREFERENCIAS", "PRIVACIDAD Y DATOS", "COLORES DEL ENTRENAMIENTO", "ACERCA DE REHABPOD", "Descargar mis datos"]) {
      expect(txt).not.toContain(repetido);
    }
    await expect(page.locator("#contenidoCuentaCloud")).toContainText("AJUSTES DE LA APP");
    await page.locator("#rehabV40AbrirAjustes").click();
    await expect(page.locator("#pantallaAjustes")).toHaveClass(/activa/);
    expect(errores).toEqual([]);
  });

  test("Ajustes reúne colores, privacidad y datos; los colores se guardan y respetan el mínimo", async ({ page }) => {
    await abrirApp(page);
    await page.evaluate(() => mostrarPantalla(pantallaAjustes));
    await expect(page.locator("#tarjetaColoresAjustes")).toBeVisible();
    await expect(page.locator("#btnDescargarMisDatos")).toBeVisible();
    const checks = page.locator("#ajusteColoresGrid input");
    await expect(checks).toHaveCount(9);
    await expect(page.locator("#ajusteColoresGrid input:checked")).toHaveCount(9);
    expect((await checks.first().boundingBox()).height).toBeGreaterThanOrEqual(28);
    await page.locator("#ajusteColoresGrid label", { hasText: "Rosado" }).click();
    await expect.poll(() => page.evaluate(() => ajustesApp.coloresActivos.includes("pink"))).toBe(false);

    // No deja bajar de 4 colores activos.
    for (const nombre of ["Rojo", "Verde", "Azul", "Amarillo", "Blanco"]) await page.locator("#ajusteColoresGrid label", { hasText: nombre }).click();
    await expect(page.locator("#ajusteColoresAviso")).toContainText("al menos 4");
    expect(await page.evaluate(() => ajustesApp.coloresActivos.length)).toBeGreaterThanOrEqual(4);
    await page.screenshot({ path: "test-results/ajustes-colores.png", fullPage: true });
  });
});
