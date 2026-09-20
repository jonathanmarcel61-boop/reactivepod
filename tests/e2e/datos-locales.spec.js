// Renderizado con datos guardados en localStorage: ejercita los helpers compartidos
// (escaparHTML, formatoDuracionLarga, leerLista/guardarJSON) dentro de la app real.
const { test, expect } = require("@playwright/test");
const { vigilarErrores, abrirApp } = require("./helpers");

const XSS = `<img src=x onerror="window.__xss=1">`;

test("Mis rutinas: muestra las rutinas guardadas y escapa el HTML del nombre", async ({ page }) => {
  const errores = vigilarErrores(page);
  await abrirApp(page);
  await page.evaluate((xss) => {
    localStorage.setItem(
      "rehabpodRutinas",
      JSON.stringify([
        { id: "r1", nombre: "Rutina rodilla", categoria: "fisioterapia", ejercicios: [] },
        { id: "r2", nombre: xss, categoria: "deportista", ejercicios: [] },
      ])
    );
  }, XSS);
  await page.click("#rehabV23BtnRutinas");
  const contenido = page.locator("#rehabV23Overlay");
  await expect(contenido).toContainText("Rutina rodilla");
  await expect(contenido).toContainText("onerror"); // se ve como texto, no se ejecuta
  expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  expect(await page.locator("#rehabV23Overlay img[src='x']").count()).toBe(0);
  expect(errores).toEqual([]);
});

test("Historial de rutinas: suma tiempos y da formato de duración", async ({ page }) => {
  const errores = vigilarErrores(page);
  await abrirApp(page);
  await page.evaluate(() => {
    const perfil = obtenerPerfilActivo();
    localStorage.setItem(
      "rehabpodHistorialRutinas",
      JSON.stringify([
        { id: "s1", timestamp: 2000, fecha: "hoy", perfilId: perfil.id, rutinaNombre: "Rutina A",
          duracionSeg: 125, precision: 80, porcentajeCompletado: 100, totalEjercicios: 2, ejerciciosCompletados: 2 },
        { id: "s2", timestamp: 1000, fecha: "ayer", perfilId: perfil.id, rutinaNombre: "<b>B</b>",
          duracionSeg: 60, precision: 90, porcentajeCompletado: 50, totalEjercicios: 2, ejerciciosCompletados: 1 },
        { id: "s3", timestamp: 500, fecha: "otro", perfilId: "otro_perfil", rutinaNombre: "No debe verse",
          duracionSeg: 999, precision: 10, porcentajeCompletado: 0 },
      ])
    );
    document.getElementById("rehabV24Overlay").hidden = false;
    window.rehabV24AbrirHistorial();
  });
  const cont = page.locator("#rehabV24Contenido");
  await expect(cont).toContainText("Sesiones registradas");
  await expect(cont).toContainText("3 min 05 s"); // 125 s + 60 s
  await expect(cont).toContainText("85.0%"); // precisión media (80 + 90) / 2
  await expect(cont).toContainText("Rutina A");
  await expect(cont).not.toContainText("No debe verse");
  await expect(cont).toContainText("<b>B</b>"); // escapado: visible como texto
  expect(errores).toEqual([]);
});

test("datos dañados en localStorage no rompen las pantallas", async ({ page }) => {
  await abrirApp(page);
  await page.evaluate(() => {
    localStorage.setItem("rehabpodRutinas", "{esto no es json");
    localStorage.setItem("rehabpodHistorialRutinas", '{"no":"es lista"}');
  });
  await page.click("#rehabV23BtnRutinas");
  await expect(page.locator("#rehabV23Overlay")).toBeVisible();
  await page.evaluate(() => {
    document.getElementById("rehabV24Overlay").hidden = false;
    window.rehabV24AbrirHistorial();
  });
  await expect(page.locator("#rehabV24Contenido")).toContainText("Sesiones registradas");
});
