// Los avisos, confirmaciones y entradas de texto ya no usan alert()/confirm()/prompt():
// se ven con los componentes de js/ui.js y se pueden probar como cualquier otro elemento.
const { test, expect } = require("@playwright/test");
const { vigilarErrores, abrirApp, tocar, elegirModo, pantallaActiva } = require("./helpers");

/** Registra (y descarta) cualquier diálogo nativo que se abra. */
function vigilarNativos(page) {
  const nativos = [];
  page.on("dialog", (d) => {
    nativos.push(`${d.type()}: ${d.message()}`);
    d.dismiss().catch(() => {});
  });
  return nativos;
}

test("Nuevo deportista: valida el nombre dentro del diálogo y continúa con el consentimiento", async ({ page }) => {
  const errores = vigilarErrores(page);
  const nativos = vigilarNativos(page);
  await abrirApp(page);

  await page.click("#btnPerfiles");
  await page.click("#btnNuevoPerfil");
  const campo = page.getByRole("textbox", { name: "Nombre del deportista" });
  await expect(campo).toBeFocused();

  await campo.fill("A");
  await page.keyboard.press("Enter");
  await expect(page.locator(".rp-campo__error")).toHaveText(/entre 2 y 30/);

  await campo.fill("Ana");
  await page.keyboard.press("Enter");
  await expect(page.locator("form.rp-modal")).toHaveCount(0);
  // sigue el flujo existente: modal de consentimiento del nuevo perfil
  await expect(page.getByText("Uso de tus datos en RehabPod")).toBeVisible();

  expect(nativos).toEqual([]);
  expect(errores).toEqual([]);
});

test("Nuevo deportista: rechaza un nombre repetido", async ({ page }) => {
  const nativos = vigilarNativos(page);
  await abrirApp(page);
  const existente = await page.evaluate(() => obtenerPerfilActivo().nombre);
  await page.click("#btnPerfiles");
  await page.click("#btnNuevoPerfil");
  await page.getByRole("textbox", { name: "Nombre del deportista" }).fill(existente.toUpperCase());
  await page.keyboard.press("Enter");
  await expect(page.locator(".rp-campo__error")).toHaveText(/Ya existe/);
  expect(nativos).toEqual([]);
});

test("Objetivo: se edita con validación en el diálogo y acepta coma decimal", async ({ page }) => {
  const nativos = vigilarNativos(page);
  await abrirApp(page);
  await page.click("#btnProgreso");
  await page.click("#btnEditarObjetivo");
  const campo = page.getByRole("textbox", { name: /Objetivo/ });
  await expect(campo).toHaveValue("0.500");

  await campo.fill("abc");
  await page.keyboard.press("Enter");
  await expect(page.locator(".rp-campo__error")).toHaveText(/tiempo válido/);

  await campo.fill("0,42");
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => obtenerPerfilActivo().objetivo)).toBe(0.42);
  expect(nativos).toEqual([]);
});

test("Borrar historial: pide confirmación, cancelar conserva y aceptar borra", async ({ page }) => {
  const nativos = vigilarNativos(page);
  await abrirApp(page);
  await page.evaluate(() => {
    const p = obtenerPerfilActivo();
    p.historial = [{ fecha: new Date().toISOString(), modo: "simple", mejorTiempo: 0.4, promedio: 0.5, aciertos: 5, errores: 0, precision: 100 }];
    guardarDatos();
  });
  await page.click("#btnProgreso");

  await tocar(page, "#btnBorrarHistorial");
  const dlg = page.locator('[role="alertdialog"]');
  await expect(dlg).toContainText(/Borrar todo el historial/);
  await page.click('[data-rp="cancelar"]');
  await expect(dlg).toHaveCount(0);
  expect(await page.evaluate(() => obtenerPerfilActivo().historial.length)).toBe(1);

  await tocar(page, "#btnBorrarHistorial");
  await page.click('[data-rp="aceptar"]');
  await expect.poll(() => page.evaluate(() => obtenerPerfilActivo().historial.length)).toBe(0);
  expect(nativos).toEqual([]);
});

test("Mis rutinas: borrar una rutina pide confirmación", async ({ page }) => {
  const nativos = vigilarNativos(page);
  await abrirApp(page);
  await page.evaluate(() =>
    localStorage.setItem(
      "rehabpodRutinas",
      JSON.stringify([{ id: "r1", nombre: "Rutina rodilla", categoria: "fisioterapia", ejercicios: [] }])
    )
  );
  await page.click("#rehabV23BtnRutinas");
  await page.locator("[data-borrar]").first().click();
  await expect(page.locator('[role="alertdialog"]')).toContainText('¿Borrar la rutina "Rutina rodilla"?');

  await page.click('[data-rp="cancelar"]');
  await expect(page.locator("#rehabV23Overlay")).toContainText("Rutina rodilla");

  await page.locator("[data-borrar]").first().click();
  await page.click('[data-rp="aceptar"]');
  await expect(page.locator("#rehabV23Overlay")).not.toContainText("Rutina rodilla");
  expect(nativos).toEqual([]);
});

test("Sin pods conectados: el aviso sale como toast, no como alert()", async ({ page }) => {
  const nativos = vigilarNativos(page);
  await abrirApp(page, { virtual: false });
  expect(await elegirModo(page, "simple")).toBe(true);
  await page.click("#btnComenzar");
  await expect(page.locator('.rp-aviso[role="alert"]')).toContainText(/Pod/);
  expect(await pantallaActiva(page)).not.toContain("pantallaEntrenamiento");
  expect(nativos).toEqual([]);
});
