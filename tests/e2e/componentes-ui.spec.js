// Componentes compartidos de js/ui.js: modal, aviso (toast), confirmación y entrada de texto.
const { test, expect } = require("@playwright/test");
const { vigilarErrores, abrirApp } = require("./helpers");

const visible = (page, sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    return !!(el && !el.hidden && el.offsetWidth > 0);
  }, sel);

const MODALES = [
  { nombre: "Mis rutinas", abrir: "#rehabV23BtnRutinas", overlay: "#rehabV23Overlay", titulo: /Mis rutinas/ },
  { nombre: "Historial", abrir: null, abrirJS: "rehabV24AbrirHistorial()", overlay: "#rehabV24Overlay", titulo: /Historial/ },
  { nombre: "Rutinas asignadas", abrir: "#rehabV28HomeBtn", overlay: "#rehabV28Overlay", titulo: /Rutinas asignadas/ },
];

const abrirModal = (page, m) =>
  m.abrir ? page.click(m.abrir) : page.evaluate((js) => new Function(js)(), `window.${m.abrirJS}`);

for (const m of MODALES) {
  test.describe(`Modal "${m.nombre}"`, () => {
    test("es un diálogo accesible con título, foco y cierre con Esc", async ({ page }) => {
      const errores = vigilarErrores(page);
      await abrirApp(page);

      await abrirModal(page, m);
      await expect.poll(() => visible(page, m.overlay)).toBe(true);

      // role, aria-modal y título asociado
      const dlg = page.locator(`${m.overlay} [role="dialog"]`);
      await expect(dlg).toHaveAttribute("aria-modal", "true");
      const idTitulo = await dlg.getAttribute("aria-labelledby");
      await expect(page.locator(`#${idTitulo}`)).toHaveText(m.titulo);

      // el foco entra en el diálogo
      await expect
        .poll(() => page.evaluate((s) => document.querySelector(s).contains(document.activeElement), m.overlay))
        .toBe(true);

      // Esc cierra y el foco vuelve al botón que lo abrió
      await page.keyboard.press("Escape");
      await expect.poll(() => visible(page, m.overlay)).toBe(false);
      if (m.abrir) {
        await expect
          .poll(() => page.evaluate((s) => document.activeElement === document.querySelector(s), m.abrir))
          .toBe(true);
      }
      expect(errores).toEqual([]);
    });

    test("el Tab no se escapa del diálogo y el botón cerrar mide 44 px", async ({ page }) => {
      await abrirApp(page);
      await abrirModal(page, m);
      await expect.poll(() => visible(page, m.overlay)).toBe(true);

      for (let i = 0; i < 12; i++) {
        await page.keyboard.press("Tab");
        const dentro = await page.evaluate(
          (s) => document.querySelector(s).contains(document.activeElement),
          m.overlay
        );
        expect(dentro, `Tab #${i + 1} salió del diálogo`).toBe(true);
      }
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press("Shift+Tab");
        const dentro = await page.evaluate(
          (s) => document.querySelector(s).contains(document.activeElement),
          m.overlay
        );
        expect(dentro, `Shift+Tab #${i + 1} salió del diálogo`).toBe(true);
      }

      // La ventana entra con una animación de zoom: se mide ya asentada.
      await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
      const caja = await page.locator(`${m.overlay} .rp-modal__cerrar`).boundingBox();
      expect(caja.width).toBeGreaterThanOrEqual(44);
      expect(caja.height).toBeGreaterThanOrEqual(44);
    });

    test("se cierra al pulsar fuera del cuadro", async ({ page }) => {
      await abrirApp(page);
      await abrirModal(page, m);
      await expect.poll(() => visible(page, m.overlay)).toBe(true);
      // clic en el propio overlay (fuera del .rp-modal)
      await page.locator(m.overlay).dispatchEvent("click");
      await expect.poll(() => visible(page, m.overlay)).toBe(false);
    });
  });
}

test.describe("avisarRehab", () => {
  test("muestra un aviso con role=status, uno de error con role=alert y se retira solo", async ({ page }) => {
    await abrirApp(page);
    await page.evaluate(() => {
      avisarRehab("Guardado", { tipo: "exito", duracion: 400 });
      avisarRehab("Falló", { tipo: "error", duracion: 400 });
    });
    await expect(page.locator('.rp-aviso[role="status"]')).toHaveText(/Guardado/);
    await expect(page.locator('.rp-aviso[role="alert"]')).toHaveText(/Falló/);
    await expect(page.locator(".rp-aviso")).toHaveCount(0, { timeout: 3000 });
  });

  test("el mensaje se inserta como texto, no como HTML", async ({ page }) => {
    await abrirApp(page);
    await page.evaluate(() => avisarRehab('<img src=x onerror="window.__xss=1">', { duracion: 0 }));
    await expect(page.locator(".rp-aviso")).toContainText("<img");
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  });
});

test.describe("confirmarRehab", () => {
  const lanzar = (page, opciones = {}) =>
    page.evaluate((o) => {
      window.__resp = "pendiente";
      confirmarRehab(o).then((v) => (window.__resp = v));
    }, opciones);
  const respuesta = (page) => page.evaluate(() => window.__resp);

  test("Aceptar resuelve true", async ({ page }) => {
    await abrirApp(page);
    await lanzar(page, { titulo: "¿Borrar?", mensaje: "No se puede deshacer" });
    const dlg = page.locator('[role="alertdialog"]');
    await expect(dlg).toBeVisible();
    await expect(dlg).toHaveAttribute("aria-modal", "true");
    await expect(dlg.locator(".rp-modal__titulo")).toHaveText("¿Borrar?");
    await page.click('[data-rp="aceptar"]');
    await expect.poll(() => respuesta(page)).toBe(true);
    await expect(dlg).toHaveCount(0);
  });

  test("Cancelar y Esc resuelven false", async ({ page }) => {
    await abrirApp(page);
    await lanzar(page);
    await page.click('[data-rp="cancelar"]');
    await expect.poll(() => respuesta(page)).toBe(false);
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0); // se retira del DOM

    await lanzar(page);
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect.poll(() => respuesta(page)).toBe(false);
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
  });

  test("en acciones destructivas el foco inicial va a Cancelar", async ({ page }) => {
    await abrirApp(page);
    await lanzar(page, { peligro: true, aceptar: "Eliminar" });
    await expect(page.locator('[data-rp="cancelar"]')).toBeFocused();
    await page.keyboard.press("Escape");
  });

  test("Desvincular cuenta (V36) usa el mismo diálogo", async ({ page }) => {
    await abrirApp(page);
    await page.evaluate(() => {
      window.__resp = "pendiente";
      window.v36ConfirmarDesvinculacion("Ana <b>Pérez</b>").then((v) => (window.__resp = v));
    });
    const dlg = page.locator('[role="alertdialog"]');
    await expect(dlg).toContainText("Ana <b>Pérez</b>"); // escapado
    await expect(dlg).toContainText("no se eliminan automáticamente");
    await page.click('[data-rp="aceptar"]');
    await expect.poll(() => respuesta(page)).toBe(true);
  });
});

test.describe("pedirTextoRehab", () => {
  const lanzar = (page, opciones = {}) =>
    page.evaluate((o) => {
      window.__resp = "pendiente";
      const validar = o.soloNumeros
        ? (t) => (/^\d+$/.test(t) ? null : "Escribe solo números")
        : undefined;
      pedirTextoRehab({ ...o, validar }).then((v) => (window.__resp = v));
    }, opciones);
  const respuesta = (page) => page.evaluate(() => window.__resp);

  test("devuelve el texto recortado y enfoca el campo con etiqueta", async ({ page }) => {
    await abrirApp(page);
    await lanzar(page, { titulo: "Nombre", etiqueta: "Tu nombre" });
    const campo = page.getByRole("textbox", { name: "Tu nombre" });
    await expect(campo).toBeFocused();
    await campo.fill("  Marta  ");
    await page.keyboard.press("Enter");
    await expect.poll(() => respuesta(page)).toBe("Marta");
  });

  test("valida, explica el error y solo entonces acepta", async ({ page }) => {
    await abrirApp(page);
    await lanzar(page, { titulo: "Edad", etiqueta: "Edad", soloNumeros: true });
    const campo = page.getByRole("textbox", { name: "Edad" });
    await campo.fill("abc");
    await page.click('[data-rp="aceptar"]');
    await expect(page.locator(".rp-campo__error")).toHaveText("Escribe solo números");
    await expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(await respuesta(page)).toBe("pendiente");
    await campo.fill("42");
    await page.click('[data-rp="aceptar"]');
    await expect.poll(() => respuesta(page)).toBe("42");
  });

  test("Cancelar y Esc resuelven null", async ({ page }) => {
    await abrirApp(page);
    await lanzar(page, { etiqueta: "x" });
    await page.click('[data-rp="cancelar"]');
    await expect.poll(() => respuesta(page)).toBe(null);
    await expect(page.locator("form.rp-modal")).toHaveCount(0); // se retira del DOM
    await lanzar(page, { etiqueta: "x" });
    await expect(page.locator("form.rp-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect.poll(() => respuesta(page)).toBe(null);
  });
});
