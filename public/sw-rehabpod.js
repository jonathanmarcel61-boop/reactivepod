// =====================================================
// SERVICE WORKER - REHABPOD
//
// Cachea el "cascarón" de la app (HTML/CSS/JS/logos) para que
// RehabPod pueda ABRIR sin conexión a internet.
//
// Lo que esto NO hace (a propósito):
// - No cachea llamadas a Supabase (autenticación, rutinas, notificaciones).
//   Esas siguen necesitando internet; si fallan, la cola de sincronización
//   de app.js (V42) se encarga de guardarlas localmente y reintentarlas.
// - No intercepta peticiones que no sean GET (no cachea envíos de datos).
//
// Cuando cambies app.js/index.html/style.css de forma importante, sube el
// número de CACHE_VERSION para que los celulares descarguen la versión
// nueva en vez de seguir usando la vieja del caché.
// =====================================================

const CACHE_VERSION = "rehabpod-v14";

const ARCHIVOS_DEL_CASCARON = [
  "./",
  "./index.html",
  "./style.css",
  "./js/utils.js",
  "./js/ui.js",
  "./js/plan.js",
  "./js/metas.js",
  "./js/voz.js",
  "./js/compartir.js",
  "./js/bienvenida.js",
  "./js/motivacion.js",
  "./js/asistente.js",
  "./fonts/inter-latin-wght-normal.woff2",
  "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  "./fonts/barlow-condensed-latin-700-normal.woff2",
  "./fonts/barlow-condensed-latin-800-normal.woff2",
  "./app.js",
  "./supabase-config.js",
  "./logo-icon.png",
  "./logo-full.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(ARCHIVOS_DEL_CASCARON))
      .catch((error) => {
        console.warn("SW RehabPod: no se pudo precachear todo:", error);
      })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((nombre) => nombre !== CACHE_VERSION)
            .map((nombre) => caches.delete(nombre))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const solicitud = evento.request;

  // Solo nos interesa cachear peticiones GET propias de la app.
  // Todo lo demás (Supabase, llamadas POST, etc.) va directo a la red,
  // sin pasar por el caché.
  if (solicitud.method !== "GET") {
    return;
  }

  const url = new URL(solicitud.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  // Solo cacheamos el cascarón conocido de la app (HTML/CSS/JS/logos).
  // Cualquier otra petición del mismo origen (por ejemplo, con parámetros
  // de consulta o rutas no previstas) va directa a la red sin guardarse
  // en caché, para no almacenar contenido inesperado ni dejar crecer el
  // caché sin control.
  const rutaRelativa = "./" + url.pathname.replace(/^\//, "");
  const esArchivoDelCascaron =
    ARCHIVOS_DEL_CASCARON.includes(rutaRelativa) ||
    ARCHIVOS_DEL_CASCARON.includes(url.pathname);

  if (!esArchivoDelCascaron) {
    return;
  }

  evento.respondWith(
    caches.match(solicitud).then((respuestaCacheada) => {
      const respuestaDeRed = fetch(solicitud)
        .then((respuestaFresca) => {
          // Actualiza el caché en segundo plano con la versión más
          // reciente, para que la próxima vez sin conexión ya esté al día.
          if (respuestaFresca && respuestaFresca.ok) {
            const copia = respuestaFresca.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(solicitud, copia));
          }
          return respuestaFresca;
        })
        .catch(() => respuestaCacheada);

      // Si ya la teníamos en caché, respondemos de inmediato (rápido y
      // funciona offline) y actualizamos en segundo plano. Si no la
      // teníamos, esperamos a la red.
      return respuestaCacheada || respuestaDeRed;
    })
  );
});