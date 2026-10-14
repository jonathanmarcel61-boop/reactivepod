const { test, expect } = require('@playwright/test');
const { abrirApp } = require('./helpers');
test('cinco perfiles: rechaza un sexto sin modificar los existentes', async ({page}) => {
  await abrirApp(page);
  await page.evaluate(() => {
    datosApp.perfiles = Array.from({length:5}, (_,i) => ({id:String(i),nombre:'Persona '+i,historial:[],consentimiento:{otorgado:true}}));
    datosApp.perfilActivoId = '0';
    guardarDatos();
    mostrarPerfiles();
    mostrarPantalla(pantallaPerfiles);
  });
  await page.click('#btnNuevoPerfil');
  await expect(page.locator('.rp-aviso')).toContainText('hasta 5 perfiles');
  expect(await page.evaluate(() => datosApp.perfiles.length)).toBe(5);
  await page.keyboard.press('Escape');
  await page.click('#btnVolverPerfiles');
  await page.click('#btnCuentaMenu');
  await expect(page.locator('.rehabV46PerfilesTitulo')).toContainText('5 / 5');
});
