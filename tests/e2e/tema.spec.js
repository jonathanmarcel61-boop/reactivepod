// Tema: "automático" (por defecto) sigue al teléfono; "claro"/"oscuro" lo fijan a mano.
const { test, expect } = require("@playwright/test");
const { abrirApp } = require("./helpers");

const esClaro = (page) => page.evaluate(() => document.body.classList.contains("tema-claro"));

test("automático: con el teléfono en modo claro la app se ve clara", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await abrirApp(page);
  expect(await esClaro(page)).toBe(true);
  expect(await page.evaluate(() => ajustesApp.tema)).toBe("auto");
});

test("automático: con el teléfono en modo oscuro la app se ve oscura", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await abrirApp(page);
  expect(await esClaro(page)).toBe(false);
});

test("automático: sigue el cambio del teléfono sin recargar", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await abrirApp(page);
  expect(await esClaro(page)).toBe(false);
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => esClaro(page)).toBe(true);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => esClaro(page)).toBe(false);
});

test("manual: 'oscuro' se mantiene aunque el teléfono esté en modo claro", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await abrirApp(page, { tema: "oscuro" });
  expect(await esClaro(page)).toBe(false);
});

test("manual: 'claro' se mantiene aunque el teléfono esté en modo oscuro", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await abrirApp(page, { tema: "claro" });
  expect(await esClaro(page)).toBe(true);
});

test("Ajustes ofrece Automático, Oscuro y Claro, y al elegir se guarda", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await abrirApp(page);
  await page.evaluate(() => mostrarPantalla(pantallaAjustes));
  const opciones = await page.locator("#ajusteTema option").evaluateAll((o) => o.map((x) => x.value));
  expect(opciones).toEqual(["auto", "oscuro", "claro"]);
  await page.selectOption("#ajusteTema", "claro");
  expect(await esClaro(page)).toBe(true);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("reactipodAjustes")).tema)).toBe("claro");
  await page.selectOption("#ajusteTema", "auto");
  expect(await esClaro(page)).toBe(false); // vuelve a seguir al teléfono (oscuro)
});
