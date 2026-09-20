const { test, expect } = require("@playwright/test");
const { abrirApp, vigilarErrores } = require("./helpers");

function planPrueba(modos = ["simple", "colores"], segundos = 30) {
  return {
    minutos: 1,
    objetivos: ["reaccion"],
    nivel: "intermedio",
    descanso: 10,
    totalSegundos: 0,
    bloques: modos.map((modo, i) => ({ modo, rol: i === 0 ? "calentamiento" : "principal", objetivo: "reaccion", dificultad: "media", segundos })),
  };
}

async function irAInicio(page) {
  await page.evaluate(() => mostrarPantalla(pantallaInicio));
}

test.describe("Rutinas guardadas y favoritas", () => {
  test("estado vacío en Inicio y guardado desde la vista previa del asistente", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await irAInicio(page);
    await expect(page.locator("#misRutinasVacio")).toBeVisible();
    await expect(page.locator("#listaMisRutinasInicio li")).toHaveCount(0);

    await page.locator("#btnAbrirAsistenteRutinas").click();
    await page.locator('label:has(input[value="memoria"])').click();
    await page.locator("#asisArmar").click();
    await expect(page.locator("#asisGuardar")).toHaveText("Guardar rutina");
    await page.locator("#asisGuardar").click();

    // Diálogo de nombre con sugerencia.
    const campo = page.locator('input[id^="rpDlgCampo"]');
    await expect(campo).toHaveValue(/5 min · Memoria/);
    await campo.fill("Mi memoria");
    await page.locator('[data-rp="aceptar"]').click();
    await expect(page.locator(".rp-aviso", { hasText: "guardada" })).toBeVisible();
    await expect(page.locator("#asisGuardar")).toHaveText("Rutina guardada ✓");
    await expect(page.locator("#asisGuardar")).toBeDisabled();

    await page.locator("#asistenteOverlay .rp-modal__cerrar, #asistenteOverlay [aria-label='Cerrar']").first().click();
    await expect(page.locator("#listaMisRutinasInicio li")).toHaveCount(1);
    await expect(page.locator("#listaMisRutinasInicio")).toContainText("Mi memoria");
    await expect(page.locator("#misRutinasVacio")).toBeHidden();
    expect(errores).toEqual([]);
  });

  test("favorita: la estrella sube la rutina, persiste y se recupera al recargar", async ({ page }) => {
    await abrirApp(page);
    await page.evaluate(() => {
      const id = obtenerPerfilActivo().id;
      const { lista: l1 } = RehabRutinas.agregar([], { nombre: "Uno", plan: (() => { const p = RehabRutinas.planManual({ bloques: [{ modo: "simple", segundos: 60 }] }); return p; })() });
      const { lista } = RehabRutinas.agregar(l1, { nombre: "Dos", plan: RehabRutinas.planManual({ bloques: [{ modo: "colores", segundos: 60 }] }), ahora: Date.now() + 1000 });
      RehabRutinas.guardar(id, lista);
      rehabRutinas.pintarInicio();
    });
    await irAInicio(page);
    await expect(page.locator("#listaMisRutinasInicio li").first()).toContainText("Dos");
    await page.locator("#btnVerMisRutinas").click();
    await expect(page.locator("#misRutinasOverlay")).toBeVisible();
    await page.locator('#misRutinasOverlay .rut-item:has-text("Uno") [data-accion="favorita"]').click();
    await expect(page.locator('#misRutinasOverlay .rut-item').first()).toContainText("Uno");
    await expect(page.locator('#misRutinasOverlay .rut-item').first().locator('[data-accion="favorita"]')).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await page.evaluate(() => mostrarPantalla(pantallaInicio));
    await expect(page.locator("#listaMisRutinasInicio li").first()).toContainText("Uno");
    await expect(page.locator("#listaMisRutinasInicio li").first().locator(".rut-estrella-fija")).toHaveText("★");
  });

  test("constructor manual: valida, calcula el total, guarda y permite editar, duplicar y eliminar", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await irAInicio(page);
    await page.locator("#btnCrearRutina").click();
    await expect(page.locator("#rutinaManualOverlay")).toBeVisible();

    await page.locator("#rutGuardar").click();
    await expect(page.locator("#rutError")).toContainText("nombre");

    await page.locator("#rutNombre").fill("Mañanas suaves");
    await page.locator("#rutAnadir").click();
    await page.locator(".rut-fila").nth(1).locator('select[data-campo="modo"]').selectOption("secuencia");
    await page.locator(".rut-fila").nth(1).locator('select[data-campo="segundos"]').selectOption("120");
    await page.locator("#rutDescanso").selectOption("10");
    // 60 + 120 + 10 de descanso = 3 min 10 s
    await expect(page.locator("#rutTotal")).toContainText("3 min 10 s");
    await page.locator("#rutGuardar").click();
    await expect(page.locator(".rp-aviso", { hasText: "Mañanas suaves" })).toBeVisible();

    // Aparece en la lista.
    await expect(page.locator("#misRutinasOverlay")).toBeVisible();
    await expect(page.locator("#misRutinasOverlay .rut-item")).toHaveCount(1);
    await expect(page.locator("#misRutinasOverlay .rut-item")).toContainText("2 ejercicios · 3 min 10 s");

    // Editar: quitar el segundo ejercicio.
    await page.locator('#misRutinasOverlay [data-accion="editar"]').click();
    await page.locator('.rut-fila').nth(1).locator('[data-mov="quita"]').click();
    await page.locator("#rutGuardar").click();
    await expect(page.locator("#misRutinasOverlay .rut-item")).toContainText("1 ejercicio · 1 min");

    // Duplicar y eliminar.
    await page.locator('#misRutinasOverlay [data-accion="duplicar"]').click();
    await expect(page.locator("#misRutinasOverlay .rut-item")).toHaveCount(2);
    await expect(page.locator('#misRutinasOverlay .rut-item:has-text("(copia)")')).toHaveCount(1);
    await page.locator('#misRutinasOverlay .rut-item:has-text("(copia)") [data-accion="eliminar"]').click();
    await page.getByRole("button", { name: "Eliminar", exact: true }).last().click();
    await expect(page.locator("#misRutinasOverlay .rut-item")).toHaveCount(1);
    expect(errores).toEqual([]);
  });

  test("iniciar una rutina guardada usa Pods simulados, cuenta el uso y muestra opción de guardar al terminar solo si es nueva", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page, { virtual: false });
    await page.evaluate((plan) => {
      const id = obtenerPerfilActivo().id;
      const { lista } = RehabRutinas.agregar([], { nombre: "Corta", plan: RehabRutinas.sanearPlan(plan), origen: "manual" });
      RehabRutinas.guardar(id, lista);
      rehabRutinas.pintarInicio();
      mostrarPantalla(pantallaInicio);
    }, planPrueba(["simple"], 30));
    await page.locator('#listaMisRutinasInicio [data-accion="iniciar"]').click();

    // Vista previa fija: sin "Otra propuesta", con volver a mis rutinas.
    await expect(page.locator("#asistenteTitulo")).toHaveText("Corta");
    await expect(page.locator("#asisOtra")).toHaveCount(0);
    await expect(page.locator("#asisVolver")).toHaveText("Volver a mis rutinas");
    await expect(page.locator("#asisVirtual")).toBeChecked();
    await page.locator("#asisComenzar").click();
    await expect(page.locator("#asisEjecTitulo")).toHaveText("Prepárate");
    expect(await page.evaluate(() => rehabRutinas.leer()[0].usos)).toBe(1);
    await page.evaluate(() => window.rehabAsistente.cancelar());
    expect(errores).toEqual([]);
  });

  test("datos dañados en el almacenamiento no rompen la app", async ({ page }) => {
    const errores = vigilarErrores(page);
    await abrirApp(page);
    await page.evaluate(() => {
      localStorage.setItem("rehabpodRutinas:" + obtenerPerfilActivo().id, "{esto no es json");
      rehabRutinas.pintarInicio();
    });
    await expect(page.locator("#misRutinasVacio")).toBeVisible();
    await page.evaluate(() => {
      localStorage.setItem("rehabpodRutinas:" + obtenerPerfilActivo().id, JSON.stringify([{ plan: 5 }, null, { nombre: "x", plan: { bloques: [{ modo: "simple", segundos: 60 }] } }]));
      rehabRutinas.pintarInicio();
    });
    await expect(page.locator("#listaMisRutinasInicio li")).toHaveCount(1);
    expect(errores).toEqual([]);
  });
});
