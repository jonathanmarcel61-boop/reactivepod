const { test, expect } = require('@playwright/test');
const { abrirApp, elegirModo, comenzarEntrenamiento, vigilarErrores } = require('./helpers');

test('pods del simulador en pantalla completa registran el acierto y reflejan las luces', async ({page}) => {
  const errores = vigilarErrores(page);
  await abrirApp(page, { ajustes: { dificultad:'dificil' } });
  await elegirModo(page,'simple');
  await comenzarEntrenamiento(page);
  await page.click('#btnPantallaCompletaEstimulo');
  await expect(page.locator('#rehabSimuladorPantallaCompleta')).toBeVisible();
  await expect(page.locator('.rehabPodPantallaCompleta:visible')).toHaveCount(4);
  await page.waitForFunction(() => esperandoRespuesta && fase === 'respuesta');
  const indice = await page.evaluate(() => objetivoCorrecto);
  const original = await page.locator('#luzPod'+(indice+1)).evaluate(e => e.style.background);
  const boton = page.locator(`.rehabPodPantallaCompleta[data-indice-pod="${indice}"]`);
  await expect.poll(() => boton.locator('span').evaluate(e=>e.style.background)).toBe(original);
  expect(original).not.toBe('rgb(55, 65, 81)');
  const geometria = await page.evaluate(() => {
    const objetivo = document.getElementById('rehabPantallaEstimuloCirculo').getBoundingClientRect();
    const grid = document.getElementById('rehabPodsPantallaCompleta').getBoundingClientRect();
    const luz = document.querySelector('.rehabLuzPodPantallaCompleta').getBoundingClientRect();
    return {objetivo:objetivo.width,luz:luz.width,abajo:grid.top>objetivo.bottom};
  });
  expect(geometria.objetivo).toBeGreaterThan(geometria.luz*2);
  expect(geometria.abajo).toBe(true);
  await boton.click();
  await page.waitForFunction(() => aciertos === 1);
  await expect(page.locator('#rehabPantallaEstimulo')).toBeVisible();
  expect(errores).toEqual([]);
});

test('sin simulación la pantalla completa no muestra pods táctiles', async ({page}) => {
  await abrirApp(page, {virtual:false});
  await page.evaluate(() => {
    mostrarPantalla(pantallaEntrenamiento);
    document.getElementById('btnPantallaCompletaEstimulo').click();
  });
  await expect(page.locator('#rehabPantallaEstimulo')).toBeVisible();
  await expect(page.locator('#rehabSimuladorPantallaCompleta')).toBeHidden();
});

test('muestra solo los pods seleccionados y admite pantalla horizontal', async ({page}) => {
  await page.setViewportSize({width:844,height:390});
  await abrirApp(page, {ajustes:{dificultad:'dificil'}});
  await elegirModo(page,'simple');
  await page.selectOption('#cantidadPodsEntrenamientoRehabPod','2');
  await comenzarEntrenamiento(page);
  await page.click('#btnPantallaCompletaEstimulo');
  await expect(page.locator('.rehabPodPantallaCompleta:visible')).toHaveCount(2);
  const cabe = await page.locator('#rehabPodsPantallaCompleta').evaluate(e => {
    const r=e.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight && r.right<=innerWidth;
  });
  expect(cabe).toBe(true);
});
