// =====================================================
// REHABPOD — UTILIDADES COMPARTIDAS
//
// Antes cada bloque de versión (V23, V24, V25, V27, V31, V41…) traía su
// propia copia de estas funciones. Aquí hay una sola implementación, cargada
// antes de app.js como script clásico (sin módulos: las funciones quedan
// disponibles como globales, igual que el resto de la app, y también se
// exportan para las pruebas unitarias en Node).
// =====================================================

/**
 * Escapa texto para insertarlo de forma segura dentro de HTML (contenido o
 * atributos con comillas). null/undefined se convierten en cadena vacía.
 */
function escaparHTML(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Convierte a número finito; si no lo es devuelve `defecto`. */
function numeroSeguro(valor, defecto = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : defecto;
}

/** Duración en formato largo: "45 s" o "3 min 05 s". */
function formatoDuracionLarga(segundos) {
  const total = Math.max(0, Number(segundos || 0));
  const min = Math.floor(total / 60);
  const seg = Math.floor(total % 60);

  if (min <= 0) return seg + " s";
  return min + " min " + String(seg).padStart(2, "0") + " s";
}

/** Duración en formato reloj: "3:05". */
function formatoDuracionReloj(segundos) {
  const s = Math.max(0, Math.round(numeroSeguro(segundos)));
  const min = Math.floor(s / 60);
  const seg = s % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

/** Porcentaje con un decimal: 87.5 -> "87.5%". */
function formatoPrecision(valor) {
  return `${numeroSeguro(valor).toFixed(1)}%`;
}

/**
 * Fecha y hora locales.
 * @param {*} valor      fecha (ISO, timestamp o Date)
 * @param {string} vacio texto si no hay valor
 * @param {string|null} invalido texto si el valor no es una fecha; null = devolver el valor tal cual
 */
function formatoFecha(valor, vacio = "Sin fecha", invalido = null) {
  if (!valor) return vacio;
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return invalido === null ? String(valor) : invalido;
  return d.toLocaleString();
}

/**
 * Fecha (solo día) a partir de "AAAA-MM-DD". Se fija a las 12:00 para que el
 * cambio de zona horaria no la mueva al día anterior o siguiente.
 */
function formatoFechaDia(fecha, vacio = "Sin fecha") {
  if (!fecha) return vacio;
  const d = new Date(fecha + "T12:00:00");
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString();
}

/** Hora "HH:MM" a partir de "HH:MM:SS". */
function formatoHora(hora) {
  if (!hora) return "";
  return String(hora).slice(0, 5);
}

// -----------------------------------------------------
// Almacenamiento local (localStorage) con tolerancia a errores
// -----------------------------------------------------

/**
 * Lee de localStorage una lista JSON. Devuelve [] si no existe, no es una
 * lista o el contenido está dañado.
 */
function leerLista(clave, etiqueta = "RehabPod") {
  try {
    const raw = localStorage.getItem(clave);
    if (!raw) return [];
    const valor = JSON.parse(raw);
    return Array.isArray(valor) ? valor : [];
  } catch (error) {
    console.warn(`${etiqueta}: no se pudo leer "${clave}".`, error);
    return [];
  }
}

/** Guarda un valor como JSON en localStorage. Devuelve false si falla (cuota, modo privado…). */
function guardarJSON(clave, valor, etiqueta = "RehabPod") {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.warn(`${etiqueta}: no se pudo guardar "${clave}".`, error);
    return false;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    escaparHTML,
    numeroSeguro,
    formatoDuracionLarga,
    formatoDuracionReloj,
    formatoPrecision,
    formatoFecha,
    formatoFechaDia,
    formatoHora,
    leerLista,
    guardarJSON,
  };
}
