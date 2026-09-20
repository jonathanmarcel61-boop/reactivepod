// Configuración de las pruebas E2E de RehabPod (Playwright + Chromium).
// Requiere:  npx playwright install chromium   (solo la primera vez)
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 390, height: 844 }, // móvil (Android)
    locale: "es-EC",
    colorScheme: "dark", // el tema "automático" sigue al sistema; se fija para que las pruebas sean deterministas
    timezoneId: "America/Guayaquil",
    serviceWorkers: "block", // el SW cachea el cascarón y falsearía las pruebas
  },
  webServer: {
    command: "node tests/helpers/static-server.js",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
