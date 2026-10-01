const { test, expect } = require('@playwright/test');
const { abrirApp, elegirModo, comenzarEntrenamiento } = require('./helpers');

for (const dificultad of ['facil', 'media', 'dificil']) {
  test(`colores conserva pista visual y cambia objetivo: ${dificultad}`, async ({ page }) => {
    await abrirApp(page, { ajustes: { dificultad } });
    await elegirModo(page, 'colores');
    await comenzarEntrenamiento(page);
    await expect(page.locator('#textoFase')).toHaveText('PISTA VISUAL', { timeout: 10000 });
    const colores = await page.evaluate(async () => {
      const lista = [coloresActuales[objetivoCorrecto].comando];
      for (let i = 0; i < 6; i++) {
        await activarColores();
        lista.push(coloresActuales[objetivoCorrecto].comando);
      }
      return lista;
    });
    expect(colores.every((c, i) => !i || c !== colores[i - 1])).toBe(true);
    await expect(page.locator('#nombreColor')).toHaveText('OBSERVA EL CÍRCULO');
  });

  test(`Stroop siempre valida tinta, incluso con interferencia: ${dificultad}`, async ({ page }) => {
    await abrirApp(page, { ajustes: { dificultad } });
    await elegirModo(page, 'stroop');
    await comenzarEntrenamiento(page);
    await expect(page.locator('#textoFase')).toHaveText('¡STROOP!', { timeout: 10000 });
    const rondas = await page.evaluate(async () => {
      const lista = [];
      for (let i = 0; i < 6; i++) {
        await rehabV20ActivarStroop();
        lista.push({regla: rehabReglaStroopActual, tinta: rehabColorVisualStroop.comando,
          palabra: rehabColorSemanticoStroop.comando, objetivo: coloresActuales[rehabObjetivoStroop].comando});
      }
      return lista;
    });
    expect(rondas.every(r => r.regla === 'visual' && r.objetivo === r.tinta)).toBe(true);
    if (dificultad === 'facil') expect(rondas.every(r => r.palabra === r.tinta)).toBe(true);
    if (dificultad === 'dificil') expect(rondas.every(r => r.palabra !== r.tinta)).toBe(true);
  });

  test(`Caza conserva color elegido y mueve posición: ${dificultad}`, async ({ page }) => {
    await abrirApp(page, { ajustes: { dificultad } });
    await elegirModo(page, 'cazaColor');
    await comenzarEntrenamiento(page);
    await expect(page.locator('#textoFase')).toHaveText('¡BUSCA!', { timeout: 10000 });
    const rondas = await page.evaluate(async () => {
      const elegido = rehabColorCaza;
      const lista = [];
      for (let i = 0; i < 6; i++) {
        rondaActual = i + 1;
        await rehabV19ActivarCazaColor();
        lista.push({elegido: rehabColorCaza, objetivo: coloresActuales[objetivoCorrecto].comando, pod: objetivoCorrecto});
      }
      return {elegido, lista};
    });
    expect(rondas.lista.every(r => r.elegido === rondas.elegido && r.objetivo === rondas.elegido)).toBe(true);
    expect(rondas.lista.every((r,i) => !i || r.pod !== rondas.lista[i-1].pod)).toBe(true);
  });
}

test('menú principal no ofrece Libre ni Persecución', async ({ page }) => {
  await abrirApp(page);
  const modos = await page.evaluate(() => window.REHAB_V22_CATEGORIAS.flatMap(c => c.modos));
  expect(modos).not.toContain('libre');
  expect(modos).not.toContain('persecucion');
});

test('Caza termina cinco aciertos sin cambiar el color elegido', async ({ page }) => {
  await abrirApp(page, { ajustes: { dificultad: 'dificil' } });
  await elegirModo(page, 'cazaColor');
  await comenzarEntrenamiento(page);
  for (let i = 0; i < 5; i++) {
    await page.waitForFunction(() => entrenamientoActivo && esperandoRespuesta && fase === 'cazaColorRespuesta');
    const objetivo = await page.evaluate(() => objetivoCorrecto);
    await page.locator('.pod').nth(objetivo).click({ force: true });
    await page.waitForFunction(n => aciertos >= n, i + 1);
  }
  await expect(page.locator('#pantallaResultados')).toHaveClass(/activa/, { timeout: 10000 });
});

test('Entrenador no ofrece niveles de dificultad ficticios', async ({ page }) => {
  await abrirApp(page);
  await elegirModo(page, 'entrenador');
  await expect(page.locator('#bloqueDificultadReactiPod')).toBeHidden();
});
