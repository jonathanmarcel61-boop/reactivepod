const { test, expect } = require('@playwright/test');
const { abrirApp, elegirModo, comenzarEntrenamiento } = require('./helpers');

for (const dificultad of ['facil', 'media', 'dificil']) {
  test(`Stroop ${dificultad}: círculo distractor y respuesta por las letras`, async ({ page }) => {
    await abrirApp(page, { ajustes: { dificultad } });
    await elegirModo(page, 'stroop');
    await comenzarEntrenamiento(page);
    await page.waitForFunction(() => fase === 'stroopRespuesta' && esperandoRespuesta);
    const colores = await page.evaluate(() => ({
      circulo: getComputedStyle(colorObjetivo).backgroundColor,
      letras: getComputedStyle(nombreColor).color,
      correcto: document.getElementById('luzPod' + (objetivoCorrecto + 1)).style.background,
      tamano: parseFloat(getComputedStyle(nombreColor).fontSize),
      indice: objetivoCorrecto,
    }));
    expect(colores.circulo).not.toBe(colores.letras);
    expect(colores.correcto).toBe(colores.letras);
    expect(colores.tamano).toBeGreaterThanOrEqual(44);
    await page.click('#btnPantallaCompletaEstimulo');
    await expect(page.locator('#rehabPantallaEstimuloColor')).toHaveCSS('color', colores.letras);
    await expect(page.locator('#rehabPantallaEstimuloCirculo')).toHaveCSS('background-color', colores.circulo);
    await page.locator(`.rehabPodPantallaCompleta[data-indice-pod="${colores.indice}"]`).click();
    await page.waitForFunction(() => aciertos === 1);
  });
}
