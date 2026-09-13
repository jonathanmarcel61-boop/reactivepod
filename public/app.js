// =====================================================
// REACTIPOD APP V13 - TIEMPO/RONDAS + DIFICULTAD ABAJO + FIX MODO LIBRE V10
// 4 PODS BLE + PERFILES + PROGRESO + COLORES DINAMICOS + MODO ENTRENADOR
// =====================================================

// =====================================================
// BLE
// =====================================================

const SERVICE_UUID = "12345678-1234-1234-1234-123456789000";

const COMMAND_UUID = "12345678-1234-1234-1234-123456789001";

const BUTTON_UUID = "12345678-1234-1234-1234-123456789002";

const podsBLE = [
  crearPodBLE("ReactiPod-1"),

  crearPodBLE("ReactiPod-2"),

  crearPodBLE("ReactiPod-3"),

  crearPodBLE("ReactiPod-4"),
];

function crearPodBLE(nombre) {
  return {
    nombre,

    // Web Bluetooth
    device: null,
    commandChar: null,
    buttonChar: null,

    // Capacitor / Android
    deviceId: null,
    notificationListener: null,
    disconnectListener: null,

    conectado: false,
  };
}

// =====================================================
// ALMACENAMIENTO
// =====================================================

const CLAVE_DATOS = "reactipodDatos";

const CLAVE_AJUSTES = "reactipodAjustes";

// Versión del texto de consentimiento (LOPDP Ecuador). Si el texto legal
// cambia de forma relevante, sube este número: los perfiles con una
// versión anterior deberán volver a aceptar.
const VERSION_CONSENTIMIENTO = "v1";

// Versión del texto de Términos y Política de Privacidad general de la app
// (el gate que se muestra una sola vez al abrir RehabPod por primera vez).
const VERSION_TERMINOS = "v1";

// =====================================================
// MENSAJES DE ERROR AMIGABLES (red / offline)
//
// Muchas pantallas que dependen de la nube (Progreso, Cuenta,
// Notificaciones) mostraban el error técnico crudo del navegador
// cuando no había conexión (ej. "Failed to fetch"). Esto lo reemplaza
// por un mensaje claro para la persona que usa la app.
// =====================================================

function rehabEsErrorDeRed(error) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }

  const texto = String(error?.message || error || "").toLowerCase();

  return (
    texto.includes("failed to fetch") ||
    texto.includes("networkerror") ||
    texto.includes("network request failed") ||
    texto.includes("load failed") ||
    texto.includes("timeout") ||
    texto.includes("err_internet_disconnected")
  );
}

function rehabMensajeError(error) {
  if (rehabEsErrorDeRed(error)) {
    return "Sin conexión a internet. Tus datos se cargarán cuando vuelvas a conectarte.";
  }

  return String(error?.message || error || "Ocurrió un error inesperado.");
}

let datosApp = null;

let ajustesApp = {
  sonidos: true,

  dificultad: "media",

  coloresPods: ["red", "green", "blue", "yellow"],

  tema: "oscuro",

  // Aceptación general de Términos y Política de Privacidad (una vez por
  // dispositivo). El consentimiento específico por deportista/perfil se
  // sigue pidiendo aparte, en mostrarModalConsentimiento().
  terminosAceptados: null,
};

// =====================================================
// PANTALLAS
// =====================================================

const pantallaInicio = document.getElementById("pantallaInicio");

const pantallaPods = document.getElementById("pantallaPods");

const pantallaPerfiles = document.getElementById("pantallaPerfiles");

const pantallaTiposEntrenamiento = document.getElementById("pantallaTiposEntrenamiento");

const pantallaConfiguracion = document.getElementById("pantallaConfiguracion");

const pantallaCuenta = document.getElementById("pantallaCuenta");

const pantallaEntrenamiento = document.getElementById("pantallaEntrenamiento");

const pantallaResultados = document.getElementById("pantallaResultados");

const pantallaProgreso = document.getElementById("pantallaProgreso");

const pantallaEstadisticas = document.getElementById("pantallaEstadisticas");

const pantallaAjustes = document.getElementById("pantallaAjustes");

// =====================================================
// INICIO
// =====================================================

const nombrePerfilInicio = document.getElementById("nombrePerfilInicio");

const inicioMejorTiempo = document.getElementById("inicioMejorTiempo");

const inicioPrecision = document.getElementById("inicioPrecision");

const inicioSesiones = document.getElementById("inicioSesiones");

const inicioRacha = document.getElementById("inicioRacha");

const btnPerfiles = document.getElementById("btnPerfiles");

const btnGestionarPods = document.getElementById("btnGestionarPods");

const btnEntrenamiento = document.getElementById("btnEntrenamiento");

const btnProgreso = document.getElementById("btnProgreso");

const btnEstadisticas = document.getElementById("btnEstadisticas");

const btnAjustes = document.getElementById("btnAjustes");

const ajusteTema = document.getElementById("ajusteTema");

const indicadorPods = document.getElementById("indicadorPods");

const textoEstadoPods = document.getElementById("textoEstadoPods");

// =====================================================
// PODS
// =====================================================

const botonesConexion = document.querySelectorAll(".botonConexionPod");

const estadosConexion = [
  document.getElementById("estadoConexionPod1"),

  document.getElementById("estadoConexionPod2"),

  document.getElementById("estadoConexionPod3"),

  document.getElementById("estadoConexionPod4"),
];

const cantidadPodsConectados = document.getElementById("cantidadPodsConectados");

const btnApagarTodos = document.getElementById("btnApagarTodos");

const btnVolverDesdePods = document.getElementById("btnVolverDesdePods");

// =====================================================
// PERFILES
// =====================================================

const listaPerfiles = document.getElementById("listaPerfiles");

const btnNuevoPerfil = document.getElementById("btnNuevoPerfil");

const btnVolverPerfiles = document.getElementById("btnVolverPerfiles");

// =====================================================
// TIPOS ENTRENAMIENTO
// =====================================================

const tarjetasModos = document.querySelectorAll(".tarjetaEntrenamientoModo");

const nombrePerfilTipos = document.getElementById("nombrePerfilTipos");

const btnVolverTipos = document.getElementById("btnVolverTipos");

// =====================================================
// CONFIGURACION
// =====================================================

const tituloConfiguracion = document.getElementById("tituloConfiguracion");

const iconoConfiguracion = document.getElementById("iconoConfiguracion");

const nombrePerfilConfiguracion = document.getElementById("nombrePerfilConfiguracion");

const descripcionModo = document.getElementById("descripcionModo");

const numeroRondas = document.getElementById("numeroRondas");

const esperaAleatoria = document.getElementById("esperaAleatoria");

const pausaEntreRondas = document.getElementById("pausaEntreRondas");

const contenedorEspera = document.getElementById("contenedorEspera");

const contenedorPausa = document.getElementById("contenedorPausa");

const sonidosActivados = document.getElementById("sonidosActivados");

const podsListosConfiguracion = document.getElementById("podsListosConfiguracion");

const btnComenzar = document.getElementById("btnComenzar");

const btnVolverEntrenamientos = document.getElementById("btnVolverEntrenamientos");

function sonidoSecuenciaCorrecta() {
  if (!ajustesApp.sonidos) {
    return;
  }

  prepararAudio();

  tono(660, 110);

  setTimeout(() => tono(880, 130), 130);

  setTimeout(() => tono(1100, 180), 280);
}

function sonidoSecuenciaIncorrecta() {
  if (!ajustesApp.sonidos) {
    return;
  }

  prepararAudio();

  tono(260, 180);

  setTimeout(() => tono(180, 260), 190);
}

// =====================================================
// ENTRENAMIENTO
// =====================================================

const nombreModoActivo = document.getElementById("nombreModoActivo");

const nombrePerfilEntrenamiento = document.getElementById("nombrePerfilEntrenamiento");

const estadoEntrenamiento = document.getElementById("estadoEntrenamiento");

const textoRonda = document.getElementById("textoRonda");

const textoFase = document.getElementById("textoFase");

const cronometro = document.getElementById("cronometro");

const textoObjetivo = document.getElementById("textoObjetivo");

const colorObjetivo = document.getElementById("colorObjetivo");

const nombreColor = document.getElementById("nombreColor");

const contadorAciertos = document.getElementById("contadorAciertos");

const contadorErrores = document.getElementById("contadorErrores");

const ultimoTiempo = document.getElementById("ultimoTiempo");

const mensajeResultado = document.getElementById("mensajeResultado");

const btnPausar = document.getElementById("btnPausar");

const btnCancelar = document.getElementById("btnCancelar");

const lucesPods = [
  document.getElementById("luzPod1"),

  document.getElementById("luzPod2"),

  document.getElementById("luzPod3"),

  document.getElementById("luzPod4"),
];

// =====================================================
// V7 - MEJORAS VISUALES + INTRO DEL ENTRENAMIENTO
// =====================================================

function aplicarMejorasVisualesV7() {
  if (document.getElementById("estilosReactiPodV7")) {
    return;
  }

  const estilo = document.createElement("style");
  estilo.id = "estilosReactiPodV7";
  estilo.textContent = `
        /* Transiciones suaves entre pantallas */
        .pantalla.activa {
            animation: entradaPantallaV7 .28s ease both;
        }
 
        @keyframes entradaPantallaV7 {
            from { opacity:0; transform:translateY(8px); }
            to { opacity:1; transform:translateY(0); }
        }
 
        /* Tarjetas de modos más modernas */
        .tarjetaEntrenamientoModo {
            position:relative;
            overflow:hidden;
            border-radius:20px !important;
            border:1px solid rgba(148,163,184,.18) !important;
            background:linear-gradient(145deg,#111b2e,#0a1220) !important;
            padding:18px !important;
            min-height:132px;
            box-shadow:0 12px 28px rgba(0,0,0,.18);

            transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
        }
 
        .tarjetaEntrenamientoModo::before {
            content:"";
            position:absolute;
            left:0;
            top:0;
            width:4px;
            height:100%;
            background:linear-gradient(#22c55e,#16a34a);
            opacity:.9;
        }
 
        .tarjetaEntrenamientoModo:active {
            transform:scale(.985);
            border-color:rgba(34,197,94,.55) !important;
            box-shadow:0 8px 20px rgba(0,0,0,.22);
        }
 
        /* Configuración con mejor separación visual */
        #pantallaConfiguracion input,
        #pantallaConfiguracion select {
            min-height:46px;
        }
 
        #panelExperienciaReactiPod {
            border-color:rgba(34,197,94,.35) !important;
            box-shadow:0 16px 38px rgba(0,0,0,.24) !important;
        }
 
        /* Objetivo central más protagonista */
        #colorObjetivo {
            width:168px !important;
            height:168px !important;
            min-width:168px !important;
            min-height:168px !important;
            border-width:6px !important;
            box-shadow:0 0 52px rgba(255,255,255,.18),0 14px 38px rgba(0,0,0,.28) !important;
            animation: objetivoRespiraV7 1.4s ease-in-out infinite alternate;
        }
 
        @keyframes objetivoRespiraV7 {
            from { transform:scale(.985); }
            to { transform:scale(1.025); }
        }
 
        #textoFase {
            letter-spacing:1.2px;
            font-weight:800 !important;
            color:#94a3b8 !important;

        }
 
        #textoObjetivo {
            font-size:32px !important;
            text-shadow:0 3px 18px rgba(0,0,0,.25);
        }
 
        #nombreColor {
            font-size:34px !important;
            text-shadow:0 3px 18px rgba(0,0,0,.22);
        }
 
        #luzPod1,#luzPod2,#luzPod3,#luzPod4 {
            width:42px !important;
            height:42px !important;
            min-width:42px !important;
            min-height:42px !important;
            border:2px solid rgba(255,255,255,.22) !important;
        }
 
        #btnPausar {
            border-radius:14px !important;
            min-height:48px;
            font-weight:900 !important;
        }
 
        /* Resultados: acciones claras */
        #btnRepetirEntrenamientoReactiPod {
            min-height:52px;
            font-size:15px !important;
            letter-spacing:.3px;
        }
 
        #btnNuevoEntrenamiento,
        #btnResultadosInicio {
            min-height:48px;
            border-radius:14px !important;
            font-weight:800 !important;
        }
 
        /* Introducción previa al 3-2-1 */
        #introEntrenamientoReactiPod {
            position:fixed;
            inset:0;
            z-index:99997;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:22px;
            background:radial-gradient(circle at 50% 18%,rgba(34,197,94,.13),transparent 32%),#050b16;
            color:white;
            overflow:auto;
        }
 
        .introCardV7 {
            width:min(100%,440px);
            border-radius:28px;
            border:1px solid rgba(148,163,184,.20);
            background:linear-gradient(160deg,#101a2d,#080f1c 72%);
            box-shadow:0 24px 60px rgba(0,0,0,.38);
            padding:24px 20px 20px;
            text-align:center;
            animation:introCardEntradaV7 .42s cubic-bezier(.2,.8,.2,1) both;
        }
 
        @keyframes introCardEntradaV7 {
            from { opacity:0; transform:translateY(18px) scale(.96); }
            to { opacity:1; transform:translateY(0) scale(1); }
        }
 
        .introEtiquetaV7 {
            display:inline-flex;
            align-items:center;
            gap:7px;
            padding:7px 11px;
            border-radius:999px;
            border:1px solid rgba(34,197,94,.35);
            background:rgba(34,197,94,.09);
            color:#86efac;
            font-size:11px;
            font-weight:900;
            letter-spacing:1px;
            text-transform:uppercase;
        }
 
        .introIconoV7 {
            font-size:58px;
            line-height:1;
            margin:18px 0 10px;
            filter:drop-shadow(0 8px 22px rgba(0,0,0,.28));
            animation:introIconoV7 1.15s ease-in-out infinite alternate;
        }
 
        @keyframes introIconoV7 {
            from { transform:translateY(2px) scale(.96); }
            to { transform:translateY(-5px) scale(1.04); }
        }
 
        .introTituloV7 {
            font-size:27px;
            line-height:1.1;
            font-weight:950;
            margin:0;

        }
 
        .introDescripcionV7 {
            margin:12px auto 0;
            max-width:370px;
            color:#cbd5e1;
            font-size:14px;
            line-height:1.55;
        }
 
        .demoPodsV7 {
            display:flex;
            align-items:center;
            justify-content:center;
            gap:14px;
            margin:24px 0 20px;
            min-height:70px;
        }
 
        .demoPodV7 {
            width:52px;
            height:52px;
            border-radius:50%;
            background:#182235;
            border:3px solid #334155;
            box-shadow:inset 0 0 0 6px rgba(255,255,255,.02);
            position:relative;
        }
 
        .introPasosV7 {
            display:grid;
            gap:8px;
            margin:0 0 20px;
            text-align:left;
        }
 
        .introPasoV7 {
            display:flex;
            gap:10px;
            align-items:flex-start;
            padding:10px 12px;
            border-radius:13px;
            background:#0d1627;
            border:1px solid rgba(148,163,184,.12);
            color:#dbe4f0;
            font-size:13px;
            line-height:1.35;
        }
 
        .introPasoNumeroV7 {
            width:24px;
            height:24px;
            min-width:24px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#22c55e;
            color:#05200e;
            font-size:11px;
            font-weight:950;
        }
 
        .introAccionesV7 {
            display:grid;
            grid-template-columns:1fr 2fr;
            gap:10px;
        }
 
        .introBtnV7 {
            min-height:50px;
            border:none;
            border-radius:14px;
            font-size:13px;
            font-weight:900;
        }
 

        .introBtnVolverV7 {
            background:#182235;
            color:#cbd5e1;
            border:1px solid #334155;
        }
 
        .introBtnComenzarV7 {
            background:#22c55e;
            color:#05200e;
            box-shadow:0 10px 26px rgba(34,197,94,.22);
        }
 
        /* Animaciones según modo */
        .intro-simple .demoPodV7:nth-child(2),
        .intro-persecucion .demoPodV7:nth-child(1) {
            animation:podVerdeV7 1.1s ease-in-out infinite;
        }
 
        .intro-doble .demoPodV7:nth-child(1),
        .intro-doble .demoPodV7:nth-child(4) {
            animation:podVerdeV7 1.05s ease-in-out infinite;
        }
 
        .intro-secuencia .demoPodV7:nth-child(1){animation:podVerdeV7 2s .0s infinite;}
        .intro-secuencia .demoPodV7:nth-child(2){animation:podVerdeV7 2s .45s infinite;}
        .intro-secuencia .demoPodV7:nth-child(4){animation:podVerdeV7 2s .9s infinite;}
 
        .intro-circuito .demoPodV7:nth-child(3){animation:podVerdeV7 2.2s .0s infinite;}
        .intro-circuito .demoPodV7:nth-child(1){animation:podVerdeV7 2.2s .5s infinite;}
        .intro-circuito .demoPodV7:nth-child(4){animation:podVerdeV7 2.2s 1s infinite;}
        .intro-circuito .demoPodV7:nth-child(2){animation:podVerdeV7 2.2s 1.5s infinite;}
 
        .intro-contrarreloj .demoPodV7 {
            animation:podVerdeV7 1.3s ease-in-out infinite;
        }
        .intro-contrarreloj .demoPodV7:nth-child(2){animation-delay:.25s;}
        .intro-contrarreloj .demoPodV7:nth-child(3){animation-delay:.5s;}
        .intro-contrarreloj .demoPodV7:nth-child(4){animation-delay:.75s;}
 
        .intro-libre .demoPodV7:nth-child(1){animation:podVerdeV7 1.6s .0s infinite;}
        .intro-libre .demoPodV7:nth-child(2){animation:podVerdeV7 1.6s .3s infinite;}
        .intro-libre .demoPodV7:nth-child(3){animation:podVerdeV7 1.6s .6s infinite;}
        .intro-libre .demoPodV7:nth-child(4){animation:podVerdeV7 1.6s .9s infinite;}
 
        .intro-colores .demoPodV7:nth-child(1){background:#ef4444;border-color:#fecaca;box-shadow:0 0 24px rgba(239,68,68,.4);}
        .intro-colores .demoPodV7:nth-child(2){background:#22c55e;border-color:#bbf7d0;box-shadow:0 0 24px rgba(34,197,94,.4);}
        .intro-colores .demoPodV7:nth-child(3){background:#3b82f6;border-color:#bfdbfe;box-shadow:0 0 24px rgba(59,130,246,.4);}
        .intro-colores .demoPodV7:nth-child(4){background:#facc15;border-color:#fef08a;box-shadow:0 0 24px rgba(250,204,21,.4);}
 
        .intro-prohibido .demoPodV7:nth-child(1){background:#ef4444;border-color:#fecaca;}
        .intro-prohibido .demoPodV7:nth-child(2){background:#22c55e;border-color:#bbf7d0;}
        .intro-prohibido .demoPodV7:nth-child(3){background:#3b82f6;border-color:#bfdbfe;}
        .intro-prohibido .demoPodV7:nth-child(4){background:#facc15;border-color:#fef08a;}
        .intro-prohibido .demoPodV7:nth-child(1)::after {
            content:"×";
            position:absolute;
            inset:-10px;
            display:flex;
            align-items:center;
            justify-content:center;
            color:white;
            font-size:64px;
            font-weight:300;
            text-shadow:0 2px 6px rgba(0,0,0,.6);
        }
 
        @keyframes podVerdeV7 {
            0%,45%,100% { background:#182235;border-color:#334155;box-shadow:none;transform:scale(.92); }
            15%,30% { background:#22c55e;border-color:#bbf7d0;box-shadow:0 0 30px rgba(34,197,94,.58);transform:scale(1.08); }
        }
 
        @media(max-width:420px) {
            .introCardV7 { padding:20px 15px 16px; border-radius:22px; }
            .introIconoV7 { font-size:50px; margin-top:14px; }
            .introTituloV7 { font-size:24px; }
            .demoPodsV7 { gap:10px; margin:20px 0 16px; }
            .demoPodV7 { width:46px;height:46px; }

            .introAccionesV7 { grid-template-columns:1fr; }
        }
 
        @media (prefers-reduced-motion: reduce) {
            .pantalla.activa,
            #colorObjetivo,
            .introCardV7,
            .introIconoV7,
            .demoPodV7 {
                animation:none !important;
            }
        }
    `;

  document.head.appendChild(estilo);
}

function obtenerGuiaModoV7() {
  const guias = {
    simple: {
      icono: "⚡",
      titulo: "Reacción aleatoria",
      descripcion:
        "Un Pod se iluminará de forma aleatoria. Tu objetivo es reaccionar rápido y tocar únicamente el Pod activo.",
      pasos: [
        "Mantén la vista preparada para cualquiera de los cuatro Pods.",
        "Cuando uno se ilumine, presiónalo lo más rápido posible.",
        "Evita tocar Pods que no estén activos.",
      ],
    },
    colores: {
      icono: "🎨",
      titulo: "Reacción por colores",
      descripcion:
        "Los cuatro Pods muestran colores distintos. La pantalla te indicará qué color debes buscar y tocar.",
      pasos: [
        "Observa el color objetivo que aparece en grande en la pantalla.",
        "Localiza el Pod que tenga ese mismo color.",
        "Tócalo antes de que aumente tu tiempo de reacción.",
      ],
    },
    secuencia: {
      icono: "🧠",
      titulo: "Secuencia / memoria",
      descripcion:
        "Los Pods mostrarán una secuencia. Memorízala y luego repítela exactamente en el mismo orden.",
      pasos: [
        "Observa con atención el orden en que se iluminan los Pods.",
        "Espera a que termine la demostración.",
        "Repite la secuencia tocando los Pods en el mismo orden.",
      ],
    },
    doble: {
      icono: "⚡⚡",
      titulo: "Doble estímulo",
      descripcion:
        "Dos Pods se encenderán al mismo tiempo. Debes encontrar y tocar ambos para completar la ronda.",
      pasos: [
        "Identifica rápidamente los dos Pods iluminados.",
        "Toca cualquiera de los dos primero.",
        "La ronda termina cuando hayas tocado los dos correctos.",
      ],
    },
    prohibido: {
      icono: "🚫🎨",
      titulo: "Color prohibido",
      descripcion:
        "Todos los Pods se iluminan, pero existe un color que NO debes tocar. Elige cualquiera de los otros tres.",
      pasos: [
        "Lee el color prohibido que aparece en la pantalla.",
        "Busca rápidamente un Pod de cualquier otro color.",
        "No toques el color marcado como prohibido.",
      ],
    },
    circuito: {
      icono: "🔄",
      titulo: "Circuito 4 Pods",
      descripcion:
        "Completa los cuatro Pods en un orden aleatorio. Cada Pod aparece una sola vez dentro de cada circuito.",
      pasos: [
        "Toca el primer Pod que se ilumine.",
        "Muévete inmediatamente al siguiente objetivo.",
        "Completa los cuatro Pods para cerrar el circuito.",
      ],
    },
    contrarreloj: {
      icono: "⏱️",
      titulo: "Contrarreloj",
      descripcion: `Tienes ${duracionContrarrelojSeg} segundos para conseguir tantos aciertos como puedas. Cada acierto genera un nuevo objetivo.`,
      pasos: [
        "Reacciona al Pod iluminado sin detenerte.",
        "Después de cada acierto aparecerá otro objetivo inmediatamente.",
        "Consigue la mayor cantidad de aciertos antes de que el tiempo llegue a cero.",
      ],
    },
    persecucion: {
      icono: "🔥",
      titulo: "Persecución",
      descripcion:
        "Persigue el objetivo de un Pod a otro. Cada acierto activa inmediatamente un nuevo Pod y el color puede cambiar en cada estímulo.",
      pasos: [
        "Toca el Pod iluminado.",
        "Cambia de dirección tan pronto aparezca el siguiente objetivo.",

        "Mantén el ritmo y evita tocar un Pod incorrecto.",
      ],
    },
    entrenador: {
      icono: "🧑‍🏫",
      titulo: "Modo entrenador",
      descripcion:
        "El entrenador decide qué Pod activar desde el teléfono. Cada Pod conserva el color fijo configurado para esta sesión.",
      pasos: [
        "El entrenador selecciona uno de los cuatro Pods desde la pantalla.",
        "El deportista reacciona y toca únicamente el Pod activado.",
        "La sesión termina por número de rondas o por tiempo, según la configuración elegida.",
      ],
    },
    libre: {
      icono: "🏃",
      titulo: "Modo libre",
      descripcion:
        "Toca cualquiera de los cuatro Pods libremente. La app registrará tu ritmo y los intervalos entre golpes.",
      pasos: [
        "Muévete libremente entre los cuatro Pods.",
        "Cada toque válido quedará registrado.",
        "Úsalo para practicar desplazamientos, coordinación o ejercicios propios.",
      ],
    },
  };

  return guias[modoActual] || guias.simple;
}

function mostrarIntroduccionEntrenamiento() {
  const anterior = document.getElementById("introEntrenamientoReactiPod");
  if (anterior) {
    anterior.remove();
  }

  aplicarMejorasVisualesV7();

  const guia = obtenerGuiaModoV7();
  const overlay = document.createElement("div");
  overlay.id = "introEntrenamientoReactiPod";
  overlay.className = `intro-${modoActual}`;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", `Instrucciones: ${guia.titulo}`);

  overlay.innerHTML = `
        <div class="introCardV7">
            <div class="introEtiquetaV7">PREPARA TU ENTRENAMIENTO</div>
            <div class="introIconoV7">${guia.icono}</div>
            <h2 class="introTituloV7">${guia.titulo}</h2>

            <p class="introDescripcionV7">${guia.descripcion}</p>
 
            <div class="demoPodsV7" aria-hidden="true">
                <div class="demoPodV7"></div>
                <div class="demoPodV7"></div>
                <div class="demoPodV7"></div>
                <div class="demoPodV7"></div>
            </div>
 
            <div class="introPasosV7">
                ${guia.pasos
                  .map(
                    (paso, indice) => `
                    <div class="introPasoV7">
                        <span class="introPasoNumeroV7">${indice + 1}</span>
                        <span>${paso}</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
 
            <div class="introAccionesV7">
                <button type="button" id="btnVolverIntroReactiPod" class="introBtnV7 introBtnVolverV7">
                    VOLVER
                </button>
                <button type="button" id="btnComenzarIntroReactiPod" class="introBtnV7 introBtnComenzarV7">
                    COMENZAR · 3, 2, 1
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(overlay);

  const btnComenzarIntro = document.getElementById("btnComenzarIntroReactiPod");
  const btnVolverIntro = document.getElementById("btnVolverIntroReactiPod");

  btnComenzarIntro.onclick = () => {
    overlay.remove();
    iniciarCuenta();
  };

  btnVolverIntro.onclick = async () => {
    overlay.remove();
    entrenamientoActivo = false;
    esperandoRespuesta = false;
    fase = "idle";
    clearTimeout(temporizador);
    clearTimeout(temporizadorFinContrarreloj);
    clearInterval(intervaloContrarreloj);
    await apagarTodosLosPods();
    mostrarPantalla(pantallaConfiguracion);
  };

  setTimeout(() => {
    btnComenzarIntro.focus();
  }, 80);
}

// =====================================================
// CUENTA
// =====================================================

const numeroCuenta = document.getElementById("numeroCuenta");

// =====================================================
// RESULTADOS
// =====================================================

const nombrePerfilResultados = document.getElementById("nombrePerfilResultados");

const resultadoRondas = document.getElementById("resultadoRondas");

const resultadoAciertos = document.getElementById("resultadoAciertos");

const resultadoErrores = document.getElementById("resultadoErrores");

const resultadoMejor = document.getElementById("resultadoMejor");

const resultadoPromedio = document.getElementById("resultadoPromedio");

const resultadoPeor = document.getElementById("resultadoPeor");

const listaResultados = document.getElementById("listaResultados");

const btnNuevoEntrenamiento = document.getElementById("btnNuevoEntrenamiento");

const btnResultadosInicio = document.getElementById("btnResultadosInicio");

// =====================================================
// PROGRESO
// =====================================================

const nombrePerfilProgreso = document.getElementById("nombrePerfilProgreso");

const progresoMejorTiempo = document.getElementById("progresoMejorTiempo");

const progresoPromedio = document.getElementById("progresoPromedio");

const progresoPrecision = document.getElementById("progresoPrecision");

const progresoRacha = document.getElementById("progresoRacha");

const objetivoActual = document.getElementById("objetivoActual");

const objetivoMeta = document.getElementById("objetivoMeta");

const rellenoObjetivo = document.getElementById("rellenoObjetivo");

const textoObjetivoProgreso = document.getElementById("textoObjetivoProgreso");

const graficoProgreso = document.getElementById("graficoProgreso");

const mensajeProgreso = document.getElementById("mensajeProgreso");

const actividadReciente = document.getElementById("actividadReciente");

const btnEditarObjetivo = document.getElementById("btnEditarObjetivo");

const btnVolverProgreso = document.getElementById("btnVolverProgreso");

// =====================================================
// ESTADISTICAS
// =====================================================

const nombrePerfilEstadisticas = document.getElementById("nombrePerfilEstadisticas");

const totalEntrenamientos = document.getElementById("totalEntrenamientos");

const promedioGeneral = document.getElementById("promedioGeneral");

const mejorPromedio = document.getElementById("mejorPromedio");

const totalAciertos = document.getElementById("totalAciertos");

const totalErrores = document.getElementById("totalErrores");

const precisionGeneral = document.getElementById("precisionGeneral");

const historialEntrenamientos = document.getElementById("historialEntrenamientos");

const btnBorrarHistorial = document.getElementById("btnBorrarHistorial");

const btnEstadisticasInicio = document.getElementById("btnEstadisticasInicio");

// =====================================================
// AJUSTES
// =====================================================

const ajusteSonidos = document.getElementById("ajusteSonidos");

const btnVolverAjustes = document.getElementById("btnVolverAjustes");

// =====================================================
// COLORES
// =====================================================

const colores = [
  {
    nombre: "ROJO",

    comando: "red",

    css: "red",
  },

  {
    nombre: "VERDE",

    comando: "green",

    css: "limegreen",
  },

  {
    nombre: "AZUL",

    comando: "blue",

    css: "dodgerblue",
  },

  {
    nombre: "AMARILLO",

    comando: "yellow",

    css: "gold",
  },

  { nombre: "BLANCO", comando: "white", css: "#f8fafc" },
  { nombre: "MORADO", comando: "purple", css: "#a855f7" },
  { nombre: "CIAN", comando: "cyan", css: "#22d3ee" },
  { nombre: "NARANJA", comando: "orange", css: "#f97316" },
  { nombre: "ROSADO", comando: "pink", css: "#ec4899" },
];

// =====================================================
// VARIABLES ENTRENAMIENTO
// =====================================================

let modoActual = "simple";

let entrenamientoActivo = false;

// V12: evita cierres duplicados si llegan eventos BLE muy juntos al final.
let finalizacionEnCursoV12 = false;

let pausado = false;

let fase = "idle";

let rondaActual = 0;

let totalRondasActual = 5;

let aciertos = 0;

let errores = 0;

let resultados = [];

let esperaMinima = 1000;

let esperaMaxima = 3000;

let pausaRondasMs = 1200;

let dificultadActual = "media";

let duracionSecuenciaMs = 600;

let intervaloSecuenciaMs = 250;

let objetivoCorrecto = -1;

let objetivosDobles = [];

let objetivosDoblesPendientes = new Set();

let indiceColorProhibido = -1;

let circuitoOrden = [];

let circuitoPosicion = 0;

let circuitoTiempoInicio = 0;

// Modo contrarreloj
let duracionContrarrelojSeg = 30;

let finContrarrelojMs = 0;

let objetivoContrarreloj = -1;

let temporizadorFinContrarreloj = null;

let intervaloContrarreloj = null;

// Modo entrenador
let tipoFinalEntrenador = "rondas";
let rondasEntrenador = 10;
let duracionEntrenadorSeg = 60;
let finEntrenadorMs = 0;
let temporizadorFinEntrenador = null;
let intervaloEntrenador = null;
let objetivoEntrenador = -1;

// V13 - Finalización general por rondas o por tiempo
let tipoFinalGeneral = "rondas";
let duracionGeneralSeg = 60;
let finGeneralMs = 0;
let temporizadorFinGeneral = null;
let intervaloGeneral = null;

let esperandoRespuesta = false;

let tiempoInicio = 0;

let tiempoPausaInicio = 0;

let tiempoPausado = 0;

let animacionCronometro = null;

let temporizador = null;

let coloresActuales = [];

let secuencia = [];

let posicionSecuencia = 0;

let indiceMostrarSecuencia = 0;

let ultimoGolpeLibre = 0;

let contextoAudio = null;

// =====================================================
// PANTALLAS
// =====================================================

function mostrarPantalla(pantalla) {
  const pantallas = [
    pantallaInicio,

    pantallaPods,

    pantallaPerfiles,

    pantallaTiposEntrenamiento,

    pantallaConfiguracion,

    pantallaCuenta,

    pantallaEntrenamiento,

    pantallaResultados,

    pantallaProgreso,

    pantallaEstadisticas,

    pantallaAjustes,

    pantallaCuentaCloud,
  ];

  pantallas.forEach((p) => p && p.classList.remove("activa"));

  pantalla.classList.add("activa");
}

// =====================================================
// BLE
// Android (Capacitor) + navegador (Web Bluetooth)
// =====================================================

const BluetoothLe = window.Capacitor?.Plugins?.BluetoothLe || null;

let bleNativoInicializado = false;

// Identificador usado para recordar los Pods conocidos en este telefono.
const CLAVE_PODS_BLE = "reactipodPodsBLE";

// Control de la busqueda/reconexion automatica.
let reconexionAutomaticaEnCurso = false;

let temporizadorReconexionPods = null;

function usarBLENativo() {
  return !!BluetoothLe;
}

function textoAHex(texto) {
  const bytes = new TextEncoder().encode(texto);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexATexto(hex) {
  if (!hex) {
    return "";
  }

  const bytes = [];

  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

async function inicializarBLENativo() {
  if (!usarBLENativo()) {
    return false;
  }

  if (bleNativoInicializado) {
    return true;
  }

  await BluetoothLe.initialize({
    androidNeverForLocation: true,
  });

  const estado = await BluetoothLe.isEnabled();

  if (estado && estado.value === false) {
    await BluetoothLe.requestEnable();
  }

  bleNativoInicializado = true;

  return true;
}

async function conectarPod(indice) {
  if (usarBLENativo()) {
    await conectarPodNativo(indice);

    return;
  }

  await conectarPodWeb(indice);
}

// =====================================================
// CONEXION ANDROID / CAPACITOR
// =====================================================

async function conectarPodNativo(indice) {
  const pod = podsBLE[indice];

  try {
    await inicializarBLENativo();

    estadosConexion[indice].textContent = "Buscando...";

    const dispositivo = await BluetoothLe.requestDevice({
      name: pod.nombre,

      services: [SERVICE_UUID],

      optionalServices: [SERVICE_UUID],
    });

    if (!dispositivo || !dispositivo.deviceId) {
      throw new Error("No se obtuvo el identificador BLE.");
    }

    // Evita asociar por error el boton de un Pod con otro Pod.
    if (dispositivo.name && dispositivo.name !== pod.nombre) {
      alert(
        `Seleccionaste ${dispositivo.name}.\n\n` +
          `Para este boton debes seleccionar ${pod.nombre}.`
      );

      estadosConexion[indice].textContent = "Pod incorrecto";

      return;
    }

    pod.deviceId = dispositivo.deviceId;

    pod.device = dispositivo;

    // Guardamos el identificador por si Android lo mantiene entre sesiones.
    guardarPodRegistrado(indice, dispositivo);

    estadosConexion[indice].textContent = "Conectando...";

    await limpiarListenersPod(pod);

    // Android puede conservar una conexion BLE anterior en estado intermedio.
    try {
      await BluetoothLe.disconnect({
        deviceId: pod.deviceId,
      });
    } catch (error) {
      // Es normal si no estaba conectado.
    }

    pod.disconnectListener = await BluetoothLe.addListener(
      `disconnected|${pod.deviceId}`,

      () => {
        console.log(`${pod.nombre} desconectado`);

        podDesconectado(indice);
      }
    );

    await BluetoothLe.connect({
      deviceId: pod.deviceId,
    });

    await prepararNotificacionesPod(indice);

    marcarPodConectado(indice);

    await enviarComandoPod(indice, "off");

    console.log(`✅ ${pod.nombre} conectado manualmente`);
  } catch (error) {
    console.error(`Error conectando ${pod.nombre}:`, error);

    marcarPodNoConectado(indice, "No conectado");

    alert(`No se pudo conectar ${pod.nombre}.`);
  }
}

// =====================================================
// CONEXION EN NAVEGADOR / WEB BLUETOOTH
// Se conserva para poder seguir probando desde PC.
// =====================================================

async function conectarPodWeb(indice) {
  if (!navigator.bluetooth) {
    alert("Web Bluetooth no está disponible. Usa Chrome o Edge.");

    return;
  }

  const pod = podsBLE[indice];

  try {
    estadosConexion[indice].textContent = "Buscando...";

    const device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          name: pod.nombre,
        },
      ],

      optionalServices: [SERVICE_UUID],
    });

    pod.device = device;

    device.addEventListener(
      "gattserverdisconnected",

      () => {
        podDesconectado(indice);
      }
    );

    const servidor = await device.gatt.connect();

    const servicio = await servidor.getPrimaryService(SERVICE_UUID);

    pod.commandChar = await servicio.getCharacteristic(COMMAND_UUID);

    pod.buttonChar = await servicio.getCharacteristic(BUTTON_UUID);

    await pod.buttonChar.startNotifications();

    pod.buttonChar.addEventListener(
      "characteristicvaluechanged",

      (evento) => {
        recibirBotonFisicoWeb(indice, evento);
      }
    );

    pod.conectado = true;

    estadosConexion[indice].textContent = "Conectado";

    estadosConexion[indice].classList.add("conectadoTexto");

    botonesConexion[indice].textContent = "CONECTADO";

    botonesConexion[indice].classList.add("conectado");

    await enviarComandoPod(indice, "off");

    actualizarEstadoGeneralPods();
  } catch (error) {
    console.error(error);

    estadosConexion[indice].textContent = "No conectado";

    actualizarEstadoGeneralPods();
  }
}

async function podDesconectado(indice) {
  const pod = podsBLE[indice];

  pod.conectado = false;

  pod.commandChar = null;

  pod.buttonChar = null;

  pod.device = null;

  // Quitamos los listeners activos, pero conservamos deviceId.
  // Ese identificador puede servir para una reconexion posterior.
  await limpiarListenersPod(pod);

  estadosConexion[indice].textContent = "Desconectado";

  estadosConexion[indice].classList.remove("conectadoTexto");

  botonesConexion[indice].textContent = "CONECTAR";

  botonesConexion[indice].classList.remove("conectado");

  actualizarEstadoGeneralPods();

  console.log(`${pod.nombre}: conexion perdida`);

  // Hacemos una busqueda pronto. Si el Pod esta apagado no pasa nada;
  // el temporizador periodico volvera a intentarlo mas tarde.
  if (usarBLENativo()) {
    setTimeout(buscarPodsParaReconectar, 1500);
  }
}

// =====================================================
// APOYO BLE NATIVO
// =====================================================

async function limpiarListenersPod(pod) {
  if (pod.notificationListener) {
    try {
      await pod.notificationListener.remove();
    } catch (error) {
      console.warn(error);
    }

    pod.notificationListener = null;
  }

  if (pod.disconnectListener) {
    try {
      await pod.disconnectListener.remove();
    } catch (error) {
      console.warn(error);
    }

    pod.disconnectListener = null;
  }
}

async function prepararNotificacionesPod(indice) {
  const pod = podsBLE[indice];

  if (!pod.deviceId) {
    throw new Error(`No existe deviceId para ${pod.nombre}`);
  }

  const claveNotificacion = `notification|${pod.deviceId}|${SERVICE_UUID}|${BUTTON_UUID}`;

  if (pod.notificationListener) {
    try {
      await pod.notificationListener.remove();
    } catch (error) {
      console.warn(error);
    }

    pod.notificationListener = null;
  }

  pod.notificationListener = await BluetoothLe.addListener(
    claveNotificacion,

    (evento) => {
      recibirBotonFisicoNativo(indice, evento);
    }
  );

  await BluetoothLe.startNotifications({
    deviceId: pod.deviceId,

    service: SERVICE_UUID,

    characteristic: BUTTON_UUID,
  });
}

function marcarPodConectado(indice) {
  const pod = podsBLE[indice];

  pod.conectado = true;

  estadosConexion[indice].textContent = "Conectado";

  estadosConexion[indice].classList.add("conectadoTexto");

  botonesConexion[indice].textContent = "CONECTADO";

  botonesConexion[indice].classList.add("conectado");

  actualizarEstadoGeneralPods();
}

function marcarPodNoConectado(indice, texto = "No disponible") {
  const pod = podsBLE[indice];

  pod.conectado = false;

  estadosConexion[indice].textContent = texto;

  estadosConexion[indice].classList.remove("conectadoTexto");

  botonesConexion[indice].textContent = "CONECTAR";

  botonesConexion[indice].classList.remove("conectado");

  actualizarEstadoGeneralPods();
}

// =====================================================
// RECORDAR PODS EN EL TELEFONO
// =====================================================

function guardarPodRegistrado(indice, dispositivo) {
  try {
    const guardados = JSON.parse(localStorage.getItem(CLAVE_PODS_BLE) || "{}");

    guardados[indice] = {
      nombre: podsBLE[indice].nombre,

      deviceId: dispositivo.deviceId,
    };

    localStorage.setItem(CLAVE_PODS_BLE, JSON.stringify(guardados));
  } catch (error) {
    console.error("Error guardando Pod:", error);
  }
}

function obtenerPodRegistrado(indice) {
  try {
    const guardados = JSON.parse(localStorage.getItem(CLAVE_PODS_BLE) || "{}");

    return guardados[indice] || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// =====================================================
// CONECTAR UN POD ENCONTRADO SIN MOSTRAR SELECTOR
// =====================================================

async function conectarPodEncontrado(indice, dispositivo) {
  const pod = podsBLE[indice];

  if (pod.conectado || !dispositivo || !dispositivo.deviceId) {
    return false;
  }

  try {
    estadosConexion[indice].textContent = "Reconectando...";

    pod.deviceId = dispositivo.deviceId;

    pod.device = dispositivo;

    guardarPodRegistrado(indice, dispositivo);

    await limpiarListenersPod(pod);

    try {
      await BluetoothLe.disconnect({
        deviceId: pod.deviceId,
      });
    } catch (error) {
      // Normal si Android no lo tenia conectado.
    }

    // Pequena pausa para que Android libere una conexion anterior.
    await new Promise((resolver) => setTimeout(resolver, 250));

    pod.disconnectListener = await BluetoothLe.addListener(
      `disconnected|${pod.deviceId}`,

      () => {
        podDesconectado(indice);
      }
    );

    await BluetoothLe.connect({
      deviceId: pod.deviceId,
    });

    await prepararNotificacionesPod(indice);

    marcarPodConectado(indice);

    await enviarComandoPod(indice, "off");

    console.log(`✅ ${pod.nombre} reconectado automaticamente`);

    return true;
  } catch (error) {
    console.error(`No se pudo reconectar ${pod.nombre}:`, error);

    await limpiarListenersPod(pod);

    marcarPodNoConectado(indice, "No disponible");

    return false;
  }
}

// =====================================================
// BUSCAR PODS ENCENDIDOS Y RECONECTARLOS
// =====================================================

async function buscarPodsParaReconectar() {
  if (!usarBLENativo() || reconexionAutomaticaEnCurso) {
    return;
  }

  if (cantidadConectados() >= podsBLE.length) {
    return;
  }

  reconexionAutomaticaEnCurso = true;

  let listenerEscaneo = null;

  try {
    await inicializarBLENativo();

    console.log("🔎 Buscando pods RehabPod...");

    const encontrados = new Map();

    listenerEscaneo = await BluetoothLe.addListener(
      "onScanResult",

      (resultado) => {
        const dispositivo = resultado?.device;

        if (!dispositivo || !dispositivo.deviceId) {
          return;
        }

        const nombre = resultado?.localName || dispositivo.name || "";

        const indice = podsBLE.findIndex((pod) => pod.nombre === nombre);

        if (indice === -1 || podsBLE[indice].conectado) {
          return;
        }

        encontrados.set(indice, {
          name: nombre,
          deviceId: dispositivo.deviceId,
        });

        console.log(`📡 Encontrado ${nombre}`);
      }
    );

    // El servicio limita el escaneo a nuestros ESP32 ReactiPod.
    await BluetoothLe.requestLEScan({
      services: [SERVICE_UUID],
    });

    // Ventana corta de escaneo. El ciclo se repite periodicamente.
    await new Promise((resolver) => setTimeout(resolver, 3000));

    try {
      await BluetoothLe.stopLEScan();
    } catch (error) {
      console.warn(error);
    }

    if (listenerEscaneo) {
      try {
        await listenerEscaneo.remove();
      } catch (error) {
        console.warn(error);
      }

      listenerEscaneo = null;
    }

    // Conectamos uno por uno para mantener estable la pila BLE de Android.
    for (const [indice, dispositivo] of encontrados) {
      if (podsBLE[indice].conectado) {
        continue;
      }

      await conectarPodEncontrado(indice, dispositivo);

      await new Promise((resolver) => setTimeout(resolver, 350));
    }
  } catch (error) {
    console.log("Escaneo automatico:", error);
  } finally {
    try {
      await BluetoothLe.stopLEScan();
    } catch (error) {
      // Puede no existir un escaneo activo.
    }

    if (listenerEscaneo) {
      try {
        await listenerEscaneo.remove();
      } catch (error) {
        console.warn(error);
      }
    }

    reconexionAutomaticaEnCurso = false;
  }
}

function iniciarReconexionAutomatica() {
  if (!usarBLENativo()) {
    return;
  }

  if (temporizadorReconexionPods) {
    clearInterval(temporizadorReconexionPods);
  }

  // Primer intento al abrir la app.
  setTimeout(buscarPodsParaReconectar, 1500);

  // Si un Pod se enciende despues, sera detectado en el siguiente ciclo.
  temporizadorReconexionPods = setInterval(buscarPodsParaReconectar, 7000);

  console.log("Reconexión automática activada");
}

function cantidadConectados() {
  return podsBLE.filter((pod) => pod.conectado).length;
}

function actualizarEstadoGeneralPods() {
  const cantidad = cantidadConectados();

  textoEstadoPods.textContent = `${cantidad} de 4`;

  cantidadPodsConectados.textContent = `${cantidad} / 4`;

  podsListosConfiguracion.textContent = `${cantidad} / 4`;

  indicadorPods.classList.remove("desconectado", "parcial", "conectado");

  if (cantidad === 0) {
    indicadorPods.classList.add("desconectado");
  } else if (cantidad < 4) {
    indicadorPods.classList.add("parcial");
  } else {
    indicadorPods.classList.add("conectado");
  }
}

async function enviarComandoPod(indice, comando) {
  const pod = podsBLE[indice];

  if (!pod.conectado) {
    return;
  }

  try {
    // ANDROID / CAPACITOR
    if (usarBLENativo() && pod.deviceId) {
      await BluetoothLe.write({
        deviceId: pod.deviceId,

        service: SERVICE_UUID,

        characteristic: COMMAND_UUID,

        value: textoAHex(comando),
      });

      return;
    }

    // NAVEGADOR / WEB BLUETOOTH
    if (pod.commandChar) {
      const datos = new TextEncoder().encode(comando);

      await pod.commandChar.writeValue(datos);
    }
  } catch (error) {
    console.error(`Error Pod ${indice + 1}`, error);
  }
}

async function apagarTodosLosPods() {
  await Promise.all(
    podsBLE.map((pod, indice) => {
      if (pod.conectado) {
        return enviarComandoPod(indice, "off");
      }
    })
  );

  apagarVisuales();
}

// =====================================================
// RECEPCION DE PRESS EN ANDROID
// =====================================================

function recibirBotonFisicoNativo(indice, evento) {
  let mensaje = "";

  try {
    mensaje = hexATexto(evento?.value || "");
  } catch (error) {
    console.error("Error leyendo PRESS:", error);

    return;
  }

  if (mensaje.trim() === "PRESS") {
    console.log(`PRESS recibido - Pod ${indice + 1}`);

    procesarPulsacion(indice);
  }
}

// =====================================================
// RECEPCION DE PRESS EN NAVEGADOR
// =====================================================

function recibirBotonFisicoWeb(indice, evento) {
  const mensaje = new TextDecoder().decode(evento.target.value);

  if (mensaje.trim() === "PRESS") {
    procesarPulsacion(indice);
  }
}

// =====================================================
// DATOS
// =====================================================

function cargarDatos() {
  try {
    const guardado = localStorage.getItem(CLAVE_DATOS);

    if (guardado) {
      datosApp = JSON.parse(guardado);

      if (datosApp && datosApp.perfiles && datosApp.perfiles.length) {
        prepararPerfilesViejos();

        return;
      }
    }
  } catch (error) {
    console.error(error);
  }

  const id = Date.now().toString();

  datosApp = {
    perfilActivoId: id,

    perfiles: [
      {
        id: id,

        nombre: "Jugador 1",

        historial: [],

        objetivo: 0.5,

        foto: "",

        // Este es el perfil de ejemplo creado automáticamente al instalar
        // la app; no se mostró el modal de consentimiento. Si la persona
        // sigue usando este perfil, se le debe pedir consentimiento la
        // primera vez que registre un entrenamiento real.
        consentimiento: {
          otorgado: false,

          motivo: "perfil_por_defecto",
        },
      },
    ],
  };

  guardarDatos();
}

function prepararPerfilesViejos() {
  datosApp.perfiles.forEach((perfil) => {
    if (!Array.isArray(perfil.historial)) {
      perfil.historial = [];
    }

    if (typeof perfil.objetivo !== "number") {
      perfil.objetivo = 0.5;
    }

    if (typeof perfil.foto !== "string") {
      perfil.foto = "";
    }

    // Perfiles creados antes de que existiera el modal de consentimiento:
    // se marcan honestamente como no capturados, no se les inventa un "sí".
    if (!perfil.consentimiento || typeof perfil.consentimiento !== "object") {
      perfil.consentimiento = {
        otorgado: false,

        motivo: "perfil_anterior_al_consentimiento",
      };
    }
  });

  guardarDatos();
}

function guardarDatos() {
  localStorage.setItem(
    CLAVE_DATOS,

    JSON.stringify(datosApp)
  );
}

function aplicarTema(tema) {
  if (tema === "claro") {
    document.body.classList.add("tema-claro");
  } else {
    document.body.classList.remove("tema-claro");
  }
}

function cargarAjustes() {
  try {
    const guardados = localStorage.getItem(CLAVE_AJUSTES);

    if (guardados) {
      ajustesApp = {
        ...ajustesApp,

        ...JSON.parse(guardados),
      };
    }
  } catch (error) {
    console.error(error);
  }

  ajusteSonidos.checked = ajustesApp.sonidos;

  sonidosActivados.checked = ajustesApp.sonidos;

  ajusteTema.value = ajustesApp.tema || "oscuro";

  aplicarTema(ajustesApp.tema || "oscuro");
}

function guardarAjustes() {
  localStorage.setItem(
    CLAVE_AJUSTES,

    JSON.stringify(ajustesApp)
  );
}

function obtenerPerfilActivo() {
  return datosApp.perfiles.find((perfil) => perfil.id === datosApp.perfilActivoId);
}

// =====================================================
// PERFILES
// =====================================================

function actualizarNombresPerfil() {
  const perfil = obtenerPerfilActivo();

  if (!perfil) {
    return;
  }

  nombrePerfilInicio.textContent = perfil.nombre;

  nombrePerfilTipos.textContent = perfil.nombre;

  nombrePerfilConfiguracion.textContent = perfil.nombre;

  nombrePerfilEntrenamiento.textContent = `👤 ${perfil.nombre}`;

  nombrePerfilResultados.textContent = perfil.nombre;

  nombrePerfilProgreso.textContent = perfil.nombre;

  nombrePerfilEstadisticas.textContent = perfil.nombre;
}

function mostrarPerfiles() {
  listaPerfiles.innerHTML = "";

  datosApp.perfiles.forEach((perfil) => {
    const activo = perfil.id === datosApp.perfilActivoId;

    const item = document.createElement("div");

    item.className = activo ? "perfilItem activo" : "perfilItem";

    item.innerHTML = `
 
                    <div
                        class="avatarPerfil"
                        style="
                            overflow:hidden;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                        "
                    >
                        ${
                          perfil.foto
                            ? `
                                <img
                                    src="${perfil.foto}"
                                    alt="Foto de ${escaparHTML(perfil.nombre)}"
                                    style="
                                        width:100%;
                                        height:100%;
                                        object-fit:cover;
                                        border-radius:50%;
                                    "
                                >
                                `
                            : "👤"
                        }
                    </div>
 
                    <div class="perfilInfo">
 
                        <strong>
                            ${escaparHTML(perfil.nombre)}
                        </strong>
 
                        <small>
                            ${perfil.historial.length}
                            entrenamientos

                        </small>
 
                    </div>
 
                    <div class="accionesPerfil">
 
                        ${
                          activo
                            ? `
                                <span class="etiquetaActivo">
                                    ACTIVO
                                </span>
                                `
                            : `
                                <button
                                    class="btnPerfilUsar"
                                    data-usar="${perfil.id}"
                                >
                                    USAR
                                </button>
                                `
                        }
 
                        <button
                            class="btnPerfilFoto"
                            data-foto="${perfil.id}"
                        >
                            📷 FOTO
                        </button>
 
                        ${
                          datosApp.perfiles.length > 1
                            ? `
                                <button
                                    class="btnPerfilEliminar"
                                    data-eliminar="${perfil.id}"
                                >
                                    ELIMINAR
                                </button>
                                `
                            : ""
                        }
 
                    </div>
                `;

    listaPerfiles.appendChild(item);
  });

  document.querySelectorAll("[data-usar]").forEach((boton) => {
    boton.onclick = () => {
      datosApp.perfilActivoId = boton.dataset.usar;

      guardarDatos();

      actualizarNombresPerfil();

      mostrarPerfiles();

      actualizarResumenInicio();
    };
  });

  document.querySelectorAll("[data-foto]").forEach((boton) => {
    boton.onclick = () => {
      seleccionarFotoPerfil(boton.dataset.foto);
    };
  });

  document.querySelectorAll("[data-eliminar]").forEach((boton) => {
    boton.onclick = () => {
      eliminarPerfil(boton.dataset.eliminar);
    };
  });
}

function seleccionarFotoPerfil(idPerfil) {
  const perfil = datosApp.perfiles.find((perfil) => perfil.id === idPerfil);

  if (!perfil) {
    return;
  }

  const input = document.createElement("input");

  input.type = "file";

  input.accept = "image/*";

  input.onchange = () => {
    const archivo = input.files && input.files[0];

    if (!archivo) {
      return;
    }

    const lector = new FileReader();

    lector.onload = (evento) => {
      const imagen = new Image();

      imagen.onload = () => {
        const canvas = document.createElement("canvas");

        const tamano = 320;

        canvas.width = tamano;

        canvas.height = tamano;

        const ctx = canvas.getContext("2d");

        const lado = Math.min(imagen.width, imagen.height);

        const origenX = (imagen.width - lado) / 2;

        const origenY = (imagen.height - lado) / 2;

        ctx.drawImage(imagen, origenX, origenY, lado, lado, 0, 0, tamano, tamano);

        perfil.foto = canvas.toDataURL("image/jpeg", 0.82);

        guardarDatos();

        mostrarPerfiles();

        actualizarNombresPerfil();

        actualizarFotoPerfilInicio();
      };

      imagen.src = evento.target.result;
    };

    lector.readAsDataURL(archivo);
  };

  input.click();
}

function actualizarFotoPerfilInicio() {
  const perfil = obtenerPerfilActivo();

  if (!perfil) {
    return;
  }

  let foto = document.getElementById("fotoPerfilInicioReactiPod");

  if (!foto) {
    foto = document.createElement("div");

    foto.id = "fotoPerfilInicioReactiPod";

    foto.style.cssText = `


            width:52px;
            height:52px;
            border-radius:50%;
            overflow:hidden;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#1f2937;
            font-size:26px;
            margin-bottom:8px;
            border:2px solid #22c55e;
            `;

    if (nombrePerfilInicio && nombrePerfilInicio.parentElement) {
      nombrePerfilInicio.parentElement.insertBefore(foto, nombrePerfilInicio);
    }
  }

  foto.innerHTML = perfil.foto
    ? `
            <img
                src="${perfil.foto}"
                alt="Foto de perfil"
                style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                "
            >
            `
    : "👤";
}

// =====================================================
// TÉRMINOS Y PRIVACIDAD GENERALES (una sola vez por dispositivo)
// =====================================================

function terminosVigentesAceptados() {
  const t = ajustesApp.terminosAceptados;

  return !!(t && t.otorgado && t.version === VERSION_TERMINOS);
}

function mostrarGateTerminos() {
  if (terminosVigentesAceptados()) {
    return;
  }

  let overlay = document.getElementById("gateTerminosRehabPod");

  if (overlay) {
    return;
  }

  overlay = document.createElement("div");

  overlay.id = "gateTerminosRehabPod";

  overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:999999;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:var(--fondo);
    `;

  overlay.innerHTML = `
        <div
            style="
                width:100%;
                max-width:460px;
                max-height:92vh;
                overflow-y:auto;
                padding:24px;
                border-radius:16px;
                background:var(--tarjeta);
                border:1px solid var(--borde);
                color:var(--texto);
            "
        >
            <img
                src="logo-icon.png"
                alt="RehabPod"
                style="width:56px;height:56px;border-radius:14px;margin-bottom:14px;"
            >

            <h3 style="margin:0 0 14px;font-size:20px;">
                Antes de usar RehabPod
            </h3>

            <p style="font-size:14px;line-height:1.55;color:var(--texto2);margin:0 0 10px;">
                RehabPod guarda en este dispositivo los perfiles que crees, tu progreso de
                entrenamiento (tiempos de reacción, aciertos, fecha de cada sesión) y tus
                preferencias de la app.
            </p>

            <p style="font-size:14px;line-height:1.55;color:var(--texto2);margin:0 0 10px;">
                Si usas RehabPod como parte de un tratamiento de rehabilitación o fisioterapia,
                ese historial se considera un dato de salud y se trata con la misma reserva.
            </p>

            <p style="font-size:14px;line-height:1.55;color:var(--texto2);margin:0 0 16px;">
                RehabPod también ofrece, de forma opcional, una cuenta en la nube para
                profesionales y usuarios que quieran vincularse y compartir rutinas. Si
                decides crear esa cuenta, tu correo, nombre y rutinas asignadas se guardan
                en nuestro proveedor de nube (Supabase), fuera de Ecuador, únicamente con tu
                autorización explícita al momento de registrarte.
            </p>

            <p style="font-size:13px;line-height:1.5;color:var(--texto2);margin:0 0 16px;">
                Puedes pedir acceso, corrección o eliminación de tus datos, y retirar tu
                autorización, cuando quieras desde Configuración → Privacidad y datos.
            </p>

            <label
                style="
                    display:flex;
                    gap:10px;
                    align-items:flex-start;
                    padding:12px;
                    border-radius:10px;
                    background:var(--tarjeta2);
                    border:1px solid var(--borde);
                    cursor:pointer;
                    margin-bottom:16px;
                "
            >
                <input
                    type="checkbox"
                    id="checkTerminosRehabPod"
                    style="width:20px;height:20px;flex-shrink:0;margin-top:2px;accent-color:var(--acento);"
                >
                <span style="font-size:13px;line-height:1.5;color:var(--texto);">
                    He leído y acepto los Términos de uso y la Política de Privacidad de
                    RehabPod descritos arriba.
                </span>
            </label>

            <button
                type="button"
                id="btnAceptarTerminosRehabPod"
                class="boton botonPrincipal"
                style="margin:0;opacity:.5;cursor:not-allowed;"
                disabled
            >
                Continuar
            </button>
        </div>
    `;

  document.body.appendChild(overlay);

  const check = document.getElementById("checkTerminosRehabPod");
  const btnContinuar = document.getElementById("btnAceptarTerminosRehabPod");

  check.addEventListener("change", () => {
    btnContinuar.disabled = !check.checked;
    btnContinuar.style.opacity = check.checked ? "1" : ".5";
    btnContinuar.style.cursor = check.checked ? "pointer" : "not-allowed";
  });

  btnContinuar.addEventListener("click", () => {
    if (!check.checked) {
      return;
    }

    ajustesApp.terminosAceptados = {
      otorgado: true,

      fecha: new Date().toISOString(),

      version: VERSION_TERMINOS,
    };

    guardarAjustes();

    overlay.remove();
  });
}

// =====================================================
// CONSENTIMIENTO DE DATOS (LOPDP Ecuador)
// =====================================================

function mostrarModalConsentimiento(nombre, alConfirmar, alCancelar) {
  let overlay = document.getElementById("modalConsentimientoRehabPod");

  if (overlay) {
    overlay.remove();
  }

  overlay = document.createElement("div");

  overlay.id = "modalConsentimientoRehabPod";

  overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99997;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(0,0,0,.6);
        opacity:0;
        transition:opacity .2s ease;
    `;

  overlay.innerHTML = `
        <div
            style="
                width:100%;
                max-width:440px;
                max-height:88vh;
                overflow-y:auto;
                padding:22px;
                border-radius:16px;
                background:var(--tarjeta);
                border:1px solid var(--borde);
                color:var(--texto);
            "
        >
            <div style="font-size:12px;letter-spacing:.06em;color:var(--texto2);">
                ANTES DE CONTINUAR
            </div>

            <h3 style="margin:8px 0 14px;font-size:19px;">
                Uso de tus datos en RehabPod
            </h3>

            <p style="font-size:14px;line-height:1.55;color:var(--texto2);margin:0 0 10px;">
                RehabPod va a guardar el nombre de <strong style="color:var(--texto);">${escaparHTML(nombre)}</strong>,
                su progreso de entrenamiento (tiempos de reacción, aciertos y fecha de cada sesión) y,
                si tú lo decides más adelante, una foto de perfil. Hoy estos datos se guardan
                únicamente en este celular, no se envían a ningún servidor.
            </p>

            <p style="font-size:14px;line-height:1.55;color:var(--texto2);margin:0 0 16px;">
                Si este perfil se usa como parte de un tratamiento de rehabilitación o fisioterapia,
                este historial se considera un dato de salud y requiere tu autorización explícita
                para poder registrarlo.
            </p>

            <label
                style="
                    display:flex;
                    gap:10px;
                    align-items:flex-start;
                    padding:12px;
                    border-radius:10px;
                    background:var(--tarjeta2);
                    border:1px solid var(--borde);
                    cursor:pointer;
                    margin-bottom:16px;
                "
            >
                <input
                    type="checkbox"
                    id="checkConsentimientoRehabPod"
                    style="width:20px;height:20px;flex-shrink:0;margin-top:2px;accent-color:var(--acento);"
                >
                <span style="font-size:13px;line-height:1.5;color:var(--texto);">
                    Autorizo el tratamiento de estos datos para llevar el historial y progreso
                    de este perfil en RehabPod. Sé que puedo retirar esta autorización cuando
                    quiera desde Configuración, y que en ese caso mis datos serán eliminados.
                </span>
            </label>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <button
                    type="button"
                    id="btnCancelarConsentimientoRehabPod"
                    class="boton botonOscuro"
                    style="margin:0;"
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    id="btnAceptarConsentimientoRehabPod"
                    class="boton botonPrincipal"
                    style="margin:0;opacity:.5;cursor:not-allowed;"
                    disabled
                >
                    Aceptar y crear
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
  });

  const check = document.getElementById("checkConsentimientoRehabPod");
  const btnAceptar = document.getElementById("btnAceptarConsentimientoRehabPod");
  const btnCancelar = document.getElementById("btnCancelarConsentimientoRehabPod");

  check.addEventListener("change", () => {
    btnAceptar.disabled = !check.checked;
    btnAceptar.style.opacity = check.checked ? "1" : ".5";
    btnAceptar.style.cursor = check.checked ? "pointer" : "not-allowed";
  });

  function cerrar() {
    overlay.style.opacity = "0";

    setTimeout(() => overlay.remove(), 200);
  }

  btnAceptar.addEventListener("click", () => {
    if (!check.checked) {
      return;
    }

    const consentimiento = {
      otorgado: true,

      fecha: new Date().toISOString(),

      version_texto: VERSION_CONSENTIMIENTO,
    };

    cerrar();

    alConfirmar(consentimiento);
  });

  btnCancelar.addEventListener("click", () => {
    cerrar();

    if (typeof alCancelar === "function") {
      alCancelar();
    }
  });
}

function crearPerfil() {
  let nombre = prompt("Nombre del deportista:");

  if (nombre === null) {
    return;
  }

  nombre = nombre.trim();

  if (nombre.length < 2 || nombre.length > 30) {
    alert("El nombre debe tener entre 2 y 30 caracteres.");

    return;
  }

  const repetido = datosApp.perfiles.some(
    (perfil) => perfil.nombre.toLowerCase() === nombre.toLowerCase()
  );

  if (repetido) {
    alert("Ya existe un deportista con ese nombre.");

    return;
  }

  mostrarModalConsentimiento(nombre, (consentimiento) => {
    const nuevo = {
      id: Date.now().toString(),

      nombre,

      historial: [],

      objetivo: 0.5,

      foto: "",

      consentimiento,
    };

    datosApp.perfiles.push(nuevo);

    datosApp.perfilActivoId = nuevo.id;

    guardarDatos();

    actualizarNombresPerfil();

    mostrarPerfiles();

    actualizarResumenInicio();
  });
}

function eliminarPerfil(id) {
  if (datosApp.perfiles.length <= 1) {
    return;
  }

  if (!confirm("¿Eliminar este deportista y todo su historial?")) {
    return;
  }

  datosApp.perfiles = datosApp.perfiles.filter((perfil) => perfil.id !== id);

  if (datosApp.perfilActivoId === id) {
    datosApp.perfilActivoId = datosApp.perfiles[0].id;
  }

  guardarDatos();

  actualizarNombresPerfil();

  mostrarPerfiles();

  actualizarResumenInicio();
}

function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =====================================================
// RESUMEN DEL DEPORTISTA
// =====================================================

function calcularResumenPerfil() {
  const perfil = obtenerPerfilActivo();

  const historial = perfil.historial;

  let aciertosTotal = 0;

  let erroresTotal = 0;

  historial.forEach((entrenamiento) => {
    aciertosTotal += Number(entrenamiento.aciertos || 0);

    erroresTotal += Number(entrenamiento.errores || 0);
  });

  const respuestas = aciertosTotal + erroresTotal;

  const precision = respuestas ? (aciertosTotal / respuestas) * 100 : 0;

  const mejores = historial
    .filter((entrenamiento) => typeof entrenamiento.mejor === "number")
    .map((entrenamiento) => entrenamiento.mejor);

  const promedios = historial
    .filter((entrenamiento) => typeof entrenamiento.promedio === "number")
    .map((entrenamiento) => entrenamiento.promedio);

  const mejorTiempo = mejores.length ? Math.min(...mejores) : null;

  const promedio = promedios.length
    ? promedios.reduce(
        (suma, valor) => suma + valor,

        0
      ) / promedios.length
    : null;

  const mejorPromedioValor = promedios.length ? Math.min(...promedios) : null;

  const racha = calcularRacha(historial);

  return {
    sesiones: historial.length,

    aciertos: aciertosTotal,

    errores: erroresTotal,

    precision,

    mejorTiempo,

    promedio,

    mejorPromedio: mejorPromedioValor,

    racha,
  };
}

function calcularRacha(historial) {
  if (historial.length === 0) {
    return 0;
  }

  const dias = new Set();

  historial.forEach((entrenamiento) => {
    let fecha;

    if (entrenamiento.timestamp) {
      fecha = new Date(entrenamiento.timestamp);
    } else {
      fecha = new Date(entrenamiento.fecha);
    }

    if (!Number.isNaN(fecha.getTime())) {
      const clave = [fecha.getFullYear(), fecha.getMonth(), fecha.getDate()].join("-");

      dias.add(clave);
    }
  });

  if (dias.size === 0) {
    return 0;
  }

  let racha = 0;

  const hoy = new Date();

  hoy.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const fecha = new Date(hoy);

    fecha.setDate(hoy.getDate() - i);

    const clave = [fecha.getFullYear(), fecha.getMonth(), fecha.getDate()].join("-");

    if (dias.has(clave)) {
      racha++;
    } else {
      if (i === 0) {
        continue;
      }

      break;
    }
  }

  return racha;
}

function actualizarResumenInicio() {
  actualizarNombresPerfil();

  const resumen = calcularResumenPerfil();

  inicioMejorTiempo.textContent =
    resumen.mejorTiempo === null ? "-- s" : `${resumen.mejorTiempo.toFixed(3)} s`;

  inicioPrecision.textContent = `${resumen.precision.toFixed(1)} %`;

  inicioSesiones.textContent = resumen.sesiones;

  inicioRacha.textContent = resumen.racha;
}

// =====================================================
// EXPERIENCIA DE ENTRENAMIENTO
// DIFICULTAD + COLORES PERSONALIZADOS + PERSECUCION
// =====================================================

const catalogoColoresPersonalizados = {
  red: {
    nombre: "ROJO",
    comando: "red",
    css: "#ef4444",
  },

  green: {
    nombre: "VERDE",
    comando: "green",
    css: "#22c55e",
  },

  blue: {
    nombre: "AZUL",
    comando: "blue",
    css: "#3b82f6",
  },

  yellow: {
    nombre: "AMARILLO",
    comando: "yellow",
    css: "#facc15",
  },

  white: {
    nombre: "BLANCO",
    comando: "white",
    css: "#f8fafc",
  },

  purple: {
    nombre: "MORADO",
    comando: "purple",
    css: "#a855f7",
  },

  cyan: {
    nombre: "CIAN",
    comando: "cyan",
    css: "#22d3ee",
  },

  orange: {
    nombre: "NARANJA",
    comando: "orange",
    css: "#f97316",
  },

  pink: {
    nombre: "ROSADO",
    comando: "pink",
    css: "#ec4899",
  },
};

function obtenerColorPod(indice) {
  const guardados = Array.isArray(ajustesApp.coloresPods)
    ? ajustesApp.coloresPods
    : ["red", "green", "blue", "yellow"];

  let clave = guardados[indice] || ["red", "green", "blue", "yellow"][indice];

  // V12: Plateado fue retirado porque visualmente se confunde con blanco.
  // Si quedó guardado en una instalación anterior, lo migramos a blanco.
  if (clave === "silver") {
    clave = "white";
    if (Array.isArray(ajustesApp.coloresPods)) {
      ajustesApp.coloresPods[indice] = "white";
    }
  }

  return catalogoColoresPersonalizados[clave] || catalogoColoresPersonalizados.red;
}

// =====================================================
// COLORES DINAMICOS V10
// En todos los modos normales los colores cambian entre estímulos.
// Los colores fijos por Pod se reservan para el Modo entrenador.
// =====================================================
const CLAVES_COLORES_REACTIPOD = [
  "red",
  "green",
  "blue",
  "yellow",
  "white",
  "purple",
  "cyan",
  "orange",
  "pink",
];

let ultimoColorAleatorioPorPod = [null, null, null, null];

function obtenerColorAleatorioParaPod(indice, excluidos = []) {
  const bloqueados = new Set(excluidos.filter(Boolean));
  const ultimo = ultimoColorAleatorioPorPod[indice];

  let disponibles = CLAVES_COLORES_REACTIPOD.filter(
    (clave) => !bloqueados.has(clave) && clave !== ultimo
  );

  if (!disponibles.length) {
    disponibles = CLAVES_COLORES_REACTIPOD.filter((clave) => !bloqueados.has(clave));
  }

  const clave = disponibles[Math.floor(Math.random() * disponibles.length)] || "red";

  ultimoColorAleatorioPorPod[indice] = clave;
  return catalogoColoresPersonalizados[clave];
}

function obtenerColoresAleatoriosUnicosPods() {
  const usados = [];

  return [0, 1, 2, 3].map((indice) => {
    const color = obtenerColorAleatorioParaPod(indice, usados);
    usados.push(color.comando);
    return color;
  });
}

function obtenerColorEstimulo(indice, excluidos = []) {
  if (modoActual === "entrenador") {
    return obtenerColorPod(indice);
  }

  return obtenerColorAleatorioParaPod(indice, excluidos);
}

function aplicarDificultadSeleccionada() {
  dificultadActual = ajustesApp.dificultad || "media";

  if (dificultadActual === "facil") {
    esperaMinima = 2000;
    esperaMaxima = 4000;
    pausaRondasMs = 1500;
    duracionSecuenciaMs = 850;
    intervaloSecuenciaMs = 400;
  } else if (dificultadActual === "dificil") {
    esperaMinima = 500;
    esperaMaxima = 1500;
    pausaRondasMs = 500;
    duracionSecuenciaMs = 380;
    intervaloSecuenciaMs = 140;
  } else if (dificultadActual === "personalizada") {
    const espera = esperaAleatoria.value.split(",").map(Number);

    esperaMinima = espera[0];
    esperaMaxima = espera[1];
    pausaRondasMs = Number(pausaEntreRondas.value);

    duracionSecuenciaMs = 600;
    intervaloSecuenciaMs = 250;
  } else {
    esperaMinima = 1000;
    esperaMaxima = 3000;
    pausaRondasMs = 1000;
    duracionSecuenciaMs = 600;
    intervaloSecuenciaMs = 250;
  }

  actualizarResumenDificultad();
}

function actualizarResumenDificultad() {
  const resumen = document.getElementById("resumenDificultadReactiPod");
  if (!resumen) return;

  const descripciones = {
    facil:
      "Fácil · El Pod tarda más en aparecer: espera aprox. 2–4 s y hay más pausa entre estímulos. Ideal para aprender el ejercicio.",
    media:
      "Media · Ritmo equilibrado: espera aprox. 1–3 s y pausas moderadas. Recomendado para entrenamiento normal.",
    dificil:
      "Difícil · El estímulo aparece mucho más rápido: espera aprox. 0.5–1.5 s y pausas cortas. Exige reacción y concentración.",
    personalizada:
      "Personal · Tú eliges manualmente la espera antes del estímulo y la pausa entre rondas cuando el modo lo permite.",
  };

  resumen.textContent = descripciones[dificultadActual] || descripciones.media;
}

function crearControlesExperienciaEntrenamiento() {
  if (document.getElementById("panelExperienciaReactiPod")) {
    return;
  }

  const panel = document.createElement("div");

  panel.id = "panelExperienciaReactiPod";

  panel.style.cssText = `
        margin:0 0 14px;
        padding:19px;
        border-radius:14px;
        background:var(--tarjeta);
        border:1px solid var(--borde);
    `;

  panel.innerHTML = `
 
        <div

            id="controlDuracionContrarrelojReactiPod"
            style="display:none;margin-bottom:16px;padding:14px;border-radius:12px;background:var(--tarjeta2);border:1px solid var(--borde);"
        >
            <div style="font-size:15px;font-weight:800;margin-bottom:8px;">⏱ Duración del desafío</div>
            <select id="duracionContrarrelojReactiPod" style="width:100%;padding:11px;border-radius:10px;border:1px solid var(--borde);background:var(--tarjeta3);color:var(--texto);font-weight:700;">
                <option value="15">15 segundos</option>
                <option value="30" selected>30 segundos</option>
                <option value="60">60 segundos</option>
                <option value="90">90 segundos</option>
            </select>
            <div style="font-size:12px;color:var(--texto2);margin-top:8px;">
                Consigue la mayor cantidad de aciertos antes de que termine el tiempo.
            </div>
        </div>
 
        <div
            id="controlFinalGeneralReactiPod"
            style="display:none;margin-bottom:16px;padding:14px;border-radius:12px;background:var(--tarjeta2);border:1px solid var(--borde);"
        >
            <div style="font-size:15px;font-weight:800;margin-bottom:10px;">⏱ Finalizar entrenamiento por</div>
            <select id="tipoFinalGeneralReactiPod" style="width:100%;padding:11px;border-radius:10px;border:1px solid var(--borde);background:var(--tarjeta3);color:var(--texto);font-weight:700;">
                <option value="rondas" selected>Número de rondas</option>
                <option value="tiempo">Tiempo</option>
            </select>
 
            <div id="controlRondasGeneralReactiPod" style="margin-top:12px;">
                <label style="display:block;font-size:12px;color:var(--texto2);margin-bottom:6px;">Rondas</label>
                <select id="rondasGeneralReactiPod" style="width:100%;padding:11px;border-radius:10px;border:1px solid var(--borde);background:var(--tarjeta3);color:var(--texto);font-weight:700;">
                    <option value="5" selected>5 rondas</option>
                    <option value="10">10 rondas</option>
                    <option value="15">15 rondas</option>
                    <option value="20">20 rondas</option>
                    <option value="30">30 rondas</option>
                </select>
            </div>
 
            <div id="controlTiempoGeneralReactiPod" style="display:none;margin-top:12px;">
                <label style="display:block;font-size:12px;color:var(--texto2);margin-bottom:6px;">Duración</label>
                <select id="duracionGeneralReactiPod" style="width:100%;padding:11px;border-radius:10px;border:1px solid var(--borde);background:var(--tarjeta3);color:var(--texto);font-weight:700;">
                    <option value="15">15 segundos</option>
                    <option value="30">30 segundos</option>
                    <option value="60" selected>60 segundos</option>
                    <option value="90">90 segundos</option>
                    <option value="120">2 minutos</option>
                    <option value="180">3 minutos</option>
                </select>
            </div>
        </div>
 
        <div
            id="controlEntrenadorReactiPod"
            style="display:none;margin-bottom:16px;padding:14px;border-radius:12px;background:var(--tarjeta2);border:1px solid var(--borde);"
        >
            <div style="font-size:15px;font-weight:800;margin-bottom:10px;">🧑‍🏫 Finalizar entrenamiento por</div>
            <select id="tipoFinalEntrenadorReactiPod" style="width:100%;padding:11px;border-radius:10px;border:1px solid var(--borde);background:var(--tarjeta3);color:var(--texto);font-weight:700;">
                <option value="rondas" selected>Número de rondas</option>
                <option value="tiempo">Tiempo</option>
            </select>
 
            <div id="controlRondasEntrenadorReactiPod" style="margin-top:12px;">
                <label style="display:block;font-size:12px;color:var(--texto2);margin-bottom:6px;">Rondas</label>
                <select id="rondasEntrenadorReactiPod" style="width:100%;padding:11px;border-radius:10px;border:1px solid var(--borde);background:var(--tarjeta3);color:var(--texto);font-weight:700;">
                    <option value="5">5 rondas</option>
                    <option value="10" selected>10 rondas</option>
                    <option value="15">15 rondas</option>
                    <option value="20">20 rondas</option>
                    <option value="30">30 rondas</option>
                </select>
            </div>
 
            <div id="controlTiempoEntrenadorReactiPod" style="display:none;margin-top:12px;">
                <label style="display:block;font-size:12px;color:var(--texto2);margin-bottom:6px;">Duración</label>
                <select id="duracionEntrenadorReactiPod" style="width:100%;padding:11px;border-radius:10px;border:1px solid var(--borde);background:var(--tarjeta3);color:var(--texto);font-weight:700;">
                    <option value="30">30 segundos</option>
                    <option value="60" selected>60 segundos</option>
                    <option value="90">90 segundos</option>
                    <option value="120">2 minutos</option>
                    <option value="180">3 minutos</option>
                </select>
            </div>
        </div>
 
        <div id="panelColoresFijosReactiPod" style="display:none;">
            <div style="font-size:17px;font-weight:800;margin-bottom:8px;">
                🎨 Colores fijos del entrenador
            </div>
 
            <div style="font-size:12px;color:var(--texto2);margin-bottom:12px;">
                Solo en este modo cada Pod mantiene el color que el entrenador configure.
            </div>
 
            <div id="coloresPodsReactiPod" style="display:grid;gap:10px;"></div>
 
            <button
                type="button"
                id="btnColoresAleatoriosReactiPod"
                style="margin-top:12px;width:100%;padding:11px;border-radius:10px;border:1px solid var(--borde);background:var(--tarjeta3);color:var(--texto);font-weight:700;"
            >
                🔀 ASIGNAR 4 COLORES FIJOS ALEATORIOS
            </button>
        </div>
 
        <div id="bloqueDificultadReactiPod" style="margin-top:18px;padding-top:18px;border-top:1px solid rgba(148,163,184,.18);">
            <div style="font-size:17px;font-weight:800;margin-bottom:12px;">
                🎯 Dificultad
            </div>
 
            <div
                id="selectorDificultadReactiPod"
                style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;"
            >
                <button type="button" data-dificultad="facil" class="btnDificultadReactiPod">FÁCIL</button>
                <button type="button" data-dificultad="media" class="btnDificultadReactiPod">MEDIA</button>
                <button type="button" data-dificultad="dificil" class="btnDificultadReactiPod">DIFÍCIL</button>
                <button type="button" data-dificultad="personalizada" class="btnDificultadReactiPod">PERSONAL</button>
            </div>
 
            <div
                id="resumenDificultadReactiPod"
                style="font-size:13px;color:var(--texto2);line-height:1.5;margin-bottom:2px;"
            ></div>
        </div>
    `;

  const referencia = btnComenzar.parentElement || pantallaConfiguracion;

  if (referencia === pantallaConfiguracion) {
    pantallaConfiguracion.appendChild(panel);
  } else {
    referencia.parentElement.insertBefore(panel, referencia);
  }

  const estilo = document.createElement("style");

  estilo.textContent = `
        .btnDificultadReactiPod {
            padding:10px 6px;
            border-radius:12px;
            border:1px solid var(--borde);
            background:var(--tarjeta3);
            color:var(--texto2);
            font-weight:800;
            font-size:11px;
        }
 
        .btnDificultadReactiPod.activa {
            background:var(--acento);
            color:var(--acento-tinta);
            border-color:var(--acento);
            box-shadow:0 0 16px rgba(198,255,77,.3);
        }
 
        .filaColorPodReactiPod {
            display:grid;

            grid-template-columns:80px 1fr 28px;
            gap:10px;
            align-items:center;
        }
 
        .selectColorPodReactiPod {
            width:100%;
            padding:10px;
            border-radius:10px;
            border:1px solid var(--borde);
            background:var(--tarjeta3);
            color:var(--texto);
        }
 
        .muestraColorPodReactiPod {
            width:24px;
            height:24px;
            border-radius:50%;
            box-shadow:0 0 14px rgba(255,255,255,.15);
        }
 
        #panelEntrenadorActivoReactiPod {
            margin:0 0 14px;
            padding:19px;
            border-radius:14px;
            background:var(--tarjeta);
            border:1px solid var(--borde);
        }
 
        #gridEntrenadorActivoReactiPod {
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:10px;
        }
 
        .btnPodEntrenadorActivo {
            min-height:62px;
            border-radius:12px;
            border:1px solid var(--borde);
            background:var(--tarjeta2);
            color:var(--texto);
            font-size:15px;
            font-weight:900;
        }
 
        .btnPodEntrenadorActivo:disabled {
            opacity:.42;
        }
 
        /* El objetivo principal domina visualmente durante el entrenamiento. */
        #colorObjetivo {
            width:150px !important;
            height:150px !important;
            min-width:150px !important;
            min-height:150px !important;
            border-radius:50% !important;
            box-shadow:0 0 42px rgba(255,255,255,.22) !important;
            margin:12px auto !important;
            border:5px solid rgba(255,255,255,.85) !important;
        }
 
        #textoObjetivo {
            font-size:30px !important;
            line-height:1.05 !important;
            font-weight:900 !important;
            text-align:center !important;
            letter-spacing:.4px !important;
        }
 
        #nombreColor {
            font-size:32px !important;
            line-height:1.05 !important;
            font-weight:900 !important;
            text-align:center !important;
            margin-top:8px !important;
        }
 
        #luzPod1, #luzPod2, #luzPod3, #luzPod4 {
            width:46px !important;
            height:46px !important;
            min-width:46px !important;
            min-height:46px !important;
            box-shadow:none;
        }
 
        @media(max-width:560px){
            #selectorDificultadReactiPod{
                grid-template-columns:repeat(2,1fr)!important;
            }
        }
    `;

  document.head.appendChild(estilo);

  const contenedor = document.getElementById("coloresPodsReactiPod");

  for (let i = 0; i < 4; i++) {
    const fila = document.createElement("div");

    fila.className = "filaColorPodReactiPod";

    fila.innerHTML = `
            <strong>Pod ${i + 1}</strong>
 
            <select class="selectColorPodReactiPod" data-color-pod="${i}">
                <option value="red">Rojo</option>
                <option value="green">Verde</option>
                <option value="blue">Azul</option>
                <option value="yellow">Amarillo</option>
                <option value="white">Blanco</option>
                <option value="purple">Morado</option>
                <option value="cyan">Cian</option>
                <option value="orange">Naranja</option>
                <option value="pink">Rosado</option>
            </select>
 
            <span class="muestraColorPodReactiPod" data-muestra-color="${i}"></span>
        `;

    contenedor.appendChild(fila);
  }

  document.querySelectorAll(".btnDificultadReactiPod").forEach((boton) => {
    boton.onclick = () => {
      ajustesApp.dificultad = boton.dataset.dificultad;

      dificultadActual = ajustesApp.dificultad;

      guardarAjustes();
      pintarControlesExperiencia();
    };
  });

  document.querySelectorAll(".selectColorPodReactiPod").forEach((select) => {
    select.onchange = () => {
      const indice = Number(select.dataset.colorPod);

      if (!Array.isArray(ajustesApp.coloresPods)) {
        ajustesApp.coloresPods = ["red", "green", "blue", "yellow"];
      }

      ajustesApp.coloresPods[indice] = select.value;

      guardarAjustes();
      pintarControlesExperiencia();
    };
  });

  document.getElementById("btnColoresAleatoriosReactiPod").onclick = () => {
    const claves = [
      "red",
      "green",
      "blue",
      "yellow",
      "white",

      "purple",
      "cyan",
      "orange",
      "pink",
    ];

    ajustesApp.coloresPods = mezclar([...claves]).slice(0, 4);

    guardarAjustes();
    pintarControlesExperiencia();
  };

  const selectorTipoEntrenador = document.getElementById("tipoFinalEntrenadorReactiPod");
  if (selectorTipoEntrenador) {
    selectorTipoEntrenador.onchange = () => pintarControlesExperiencia();
  }

  const selectorTipoGeneral = document.getElementById("tipoFinalGeneralReactiPod");
  if (selectorTipoGeneral) {
    selectorTipoGeneral.onchange = () => pintarControlesExperiencia();
  }

  // V13: colocamos este panel inmediatamente antes del botón INICIAR.
  // Así la dificultad queda abajo, justo antes de comenzar.
  const bloqueInicio = obtenerBloqueDirectoDePantallaV12(
    btnComenzar,
    pantallaConfiguracion
  );
  if (bloqueInicio && panel.parentElement === pantallaConfiguracion) {
    pantallaConfiguracion.insertBefore(panel, bloqueInicio);
  }

  pintarControlesExperiencia();
  crearTarjetaPersecucion();
  crearTarjetasNuevosModos();
  crearTarjetaCircuito();
  crearTarjetaContrarreloj();
  crearTarjetaEntrenador();
  crearBotonRepetirEntrenamiento();
}

function pintarControlesExperiencia() {
  dificultadActual = ajustesApp.dificultad || "media";

  document.querySelectorAll(".btnDificultadReactiPod").forEach((boton) => {
    boton.classList.toggle("activa", boton.dataset.dificultad === dificultadActual);
  });

  document.querySelectorAll(".selectColorPodReactiPod").forEach((select) => {
    const indice = Number(select.dataset.colorPod);

    const color = obtenerColorPod(indice);

    select.value = color.comando;

    const muestra = document.querySelector(`[data-muestra-color="${indice}"]`);

    if (muestra) {
      muestra.style.background = color.css;
    }
  });

  const panelColoresFijos = document.getElementById("panelColoresFijosReactiPod");
  if (panelColoresFijos) {
    panelColoresFijos.style.display = modoActual === "entrenador" ? "block" : "none";
  }

  const controlEntrenador = document.getElementById("controlEntrenadorReactiPod");
  if (controlEntrenador) {
    controlEntrenador.style.display = modoActual === "entrenador" ? "block" : "none";
  }

  const controlFinalGeneral = document.getElementById("controlFinalGeneralReactiPod");
  const selectorTipoGeneral = document.getElementById("tipoFinalGeneralReactiPod");
  const controlRondasGeneral = document.getElementById("controlRondasGeneralReactiPod");
  const controlTiempoGeneral = document.getElementById("controlTiempoGeneralReactiPod");
  const usaFinalGeneral = !["entrenador", "contrarreloj"].includes(modoActual);
  if (controlFinalGeneral) {
    controlFinalGeneral.style.display = usaFinalGeneral ? "block" : "none";
  }
  if (selectorTipoGeneral && controlRondasGeneral && controlTiempoGeneral) {
    controlRondasGeneral.style.display =
      selectorTipoGeneral.value === "rondas" ? "block" : "none";
    controlTiempoGeneral.style.display =
      selectorTipoGeneral.value === "tiempo" ? "block" : "none";
  }

  const selectorTipoEntrenador = document.getElementById("tipoFinalEntrenadorReactiPod");
  const controlRondasEntrenador = document.getElementById(
    "controlRondasEntrenadorReactiPod"
  );
  const controlTiempoEntrenador = document.getElementById(
    "controlTiempoEntrenadorReactiPod"
  );
  if (selectorTipoEntrenador && controlRondasEntrenador && controlTiempoEntrenador) {
    controlRondasEntrenador.style.display =
      selectorTipoEntrenador.value === "rondas" ? "block" : "none";
    controlTiempoEntrenador.style.display =
      selectorTipoEntrenador.value === "tiempo" ? "block" : "none";
  }

  const personalizada = dificultadActual === "personalizada";
  const usaEspera = ["simple", "colores", "doble", "prohibido"].includes(modoActual);
  const usaPausa = !["contrarreloj", "libre", "entrenador"].includes(modoActual);

  if (contenedorEspera) {
    contenedorEspera.style.display = personalizada && usaEspera ? "block" : "none";
  }

  if (contenedorPausa) {
    contenedorPausa.style.display = personalizada && usaPausa ? "block" : "none";
  }

  // V12: el Modo entrenador ya tiene su propio selector de rondas/tiempo.
  // Ocultamos el control general para evitar que aparezca dos veces.
  ajustarControlRondasBaseV12();

  actualizarResumenDificultad();
}

// =====================================================
// V14 - ORDEN VISUAL DE LA CONFIGURACIÓN
// Título -> descripción -> controles -> dificultad -> inicio
// =====================================================
function ordenarConfiguracionV14() {
  if (!pantallaConfiguracion) return;

  const bloqueCabecera = obtenerBloqueDirectoDePantallaV12(
    tituloConfiguracion || nombrePerfilConfiguracion || btnVolverEntrenamientos,
    pantallaConfiguracion
  );
  const bloqueDescripcion = obtenerBloqueDirectoDePantallaV12(
    descripcionModo,
    pantallaConfiguracion
  );
  const panel = document.getElementById("panelExperienciaReactiPod");
  const bloqueInicio = obtenerBloqueDirectoDePantallaV12(
    btnComenzar,
    pantallaConfiguracion
  );

  if (!bloqueCabecera || !bloqueDescripcion || !panel) return;

  // La cabecera del modo siempre debe ser lo primero que vea el usuario.
  pantallaConfiguracion.insertBefore(
    bloqueCabecera,
    pantallaConfiguracion.firstElementChild
  );

  // La explicación del ejercicio queda inmediatamente bajo el título.
  bloqueCabecera.insertAdjacentElement("afterend", bloqueDescripcion);

  // Los controles propios del ejercicio quedan debajo de la descripción.
  bloqueDescripcion.insertAdjacentElement("afterend", panel);

  // El botón de inicio permanece al final. La dificultad ya está al final del panel.
  if (bloqueInicio && bloqueInicio !== panel) {
    pantallaConfiguracion.appendChild(bloqueInicio);
  }
}
// =====================================================
// V12 - CONFIGURACIÓN LIMPIA DEL MODO ENTRENADOR
// =====================================================
let contenedorRondasBaseV12 = null;
let elementosRondasBaseOcultosV12 = [];

function localizarContenedorRondasBaseV12() {
  if (!numeroRondas) return null;
  if (contenedorRondasBaseV12 && document.contains(contenedorRondasBaseV12)) {
    return contenedorRondasBaseV12;
  }

  let nodo = numeroRondas.parentElement;
  while (nodo && nodo !== pantallaConfiguracion) {
    const texto = (nodo.innerText || nodo.textContent || "").trim().toLowerCase();
    const contieneRondas =
      texto.includes("número de rondas") || texto.includes("numero de rondas");
    const contieneOtrosCampos =
      texto.includes("sonidos") || texto.includes("pods disponibles");

    if (contieneRondas && !contieneOtrosCampos) {
      contenedorRondasBaseV12 = nodo;
      return nodo;
    }
    nodo = nodo.parentElement;
  }
  return null;
}

function ajustarControlRondasBaseV12() {
  if (!numeroRondas) return;
  // V13: el selector base se reemplaza por el control unificado Rondas/Tiempo.
  const ocultar = true;
  const bloque = localizarContenedorRondasBaseV12();

  if (bloque) {
    bloque.style.display = ocultar ? "none" : "";
    return;
  }

  // Respaldo para HTML donde el título y el selector no tienen contenedor exclusivo.
  numeroRondas.style.display = ocultar ? "none" : "";

  if (!elementosRondasBaseOcultosV12.length) {
    const candidatoLabel = document.querySelector('label[for="numeroRondas"]');
    const anterior = numeroRondas.previousElementSibling;
    [candidatoLabel, anterior].filter(Boolean).forEach((el) => {
      const texto = (el.textContent || "").trim().toLowerCase();
      if (texto.includes("rondas")) elementosRondasBaseOcultosV12.push(el);
    });
  }

  elementosRondasBaseOcultosV12.forEach((el) => {
    el.style.display = ocultar ? "none" : "";
  });
}

function obtenerBloqueDirectoDePantallaV12(elemento, pantalla) {
  if (!elemento || !pantalla) return null;
  let nodo = elemento;
  while (nodo && nodo.parentElement && nodo.parentElement !== pantalla) {
    nodo = nodo.parentElement;
  }
  return nodo && nodo.parentElement === pantalla ? nodo : null;
}

function crearTarjetaPersecucion() {
  if (document.querySelector('[data-modo="persecucion"]')) {
    return;
  }

  const primeraTarjeta = document.querySelector(".tarjetaEntrenamientoModo");

  if (!primeraTarjeta || !primeraTarjeta.parentElement) {
    return;
  }

  const tarjeta = primeraTarjeta.cloneNode(true);

  tarjeta.dataset.modo = "persecucion";

  tarjeta.innerHTML = `
        <div style="font-size:34px;margin-bottom:8px;">🔥</div>
        <strong style="display:block;font-size:17px;">Persecución</strong>
        <small style="display:block;margin-top:6px;color:#9ca3af;">
            Toca el Pod encendido y persigue el siguiente estímulo lo más rápido posible.
        </small>
    `;

  tarjeta.onclick = () => {
    seleccionarModo("persecucion");
  };

  primeraTarjeta.parentElement.appendChild(tarjeta);
}

function crearTarjetasNuevosModos() {
  const contenedor = document.querySelector(".tarjetaEntrenamientoModo")?.parentElement;

  if (!contenedor) {
    return;
  }

  if (!document.querySelector('[data-modo="doble"]')) {
    const base = document.querySelector(".tarjetaEntrenamientoModo");

    const tarjeta = base.cloneNode(true);

    tarjeta.dataset.modo = "doble";

    tarjeta.innerHTML = `
            <div style="font-size:34px;margin-bottom:8px;">⚡⚡</div>
            <strong style="display:block;font-size:17px;">Doble estímulo</strong>
            <small style="display:block;margin-top:6px;color:#9ca3af;">
                Se encienden dos Pods. Debes tocar los dos lo más rápido posible.
            </small>
        `;

    tarjeta.onclick = () => {
      seleccionarModo("doble");
    };

    contenedor.appendChild(tarjeta);
  }

  if (!document.querySelector('[data-modo="prohibido"]')) {
    const base = document.querySelector(".tarjetaEntrenamientoModo");

    const tarjeta = base.cloneNode(true);

    tarjeta.dataset.modo = "prohibido";

    tarjeta.innerHTML = `
            <div style="font-size:34px;margin-bottom:8px;">🚫🎨</div>
            <strong style="display:block;font-size:17px;">Color prohibido</strong>
            <small style="display:block;margin-top:6px;color:#9ca3af;">
                Evita el color indicado y toca cualquiera de los otros Pods.
            </small>
        `;

    tarjeta.onclick = () => {
      seleccionarModo("prohibido");
    };

    contenedor.appendChild(tarjeta);
  }
}

function crearTarjetaCircuito() {
  if (document.querySelector('[data-modo="circuito"]')) {
    return;
  }

  const contenedor = document.querySelector(".tarjetaEntrenamientoModo")?.parentElement;

  const base = document.querySelector(".tarjetaEntrenamientoModo");

  if (!contenedor || !base) {
    return;
  }

  const tarjeta = base.cloneNode(true);

  tarjeta.dataset.modo = "circuito";

  tarjeta.innerHTML = `
        <div style="font-size:34px;margin-bottom:8px;">🔄</div>
        <strong style="display:block;font-size:17px;">Circuito 4 Pods</strong>
        <small style="display:block;margin-top:6px;color:#9ca3af;">
            Completa los cuatro Pods en un orden aleatorio. El siguiente objetivo aparece al acertar.
        </small>
    `;

  tarjeta.onclick = () => {
    seleccionarModo("circuito");
  };

  contenedor.appendChild(tarjeta);
}

function crearTarjetaContrarreloj() {
  if (document.querySelector('[data-modo="contrarreloj"]')) return;
  const contenedor = document.querySelector(".tarjetaEntrenamientoModo")?.parentElement;
  const base = document.querySelector(".tarjetaEntrenamientoModo");
  if (!contenedor || !base) return;
  const tarjeta = base.cloneNode(true);
  tarjeta.dataset.modo = "contrarreloj";
  tarjeta.innerHTML = `
        <div style="font-size:34px;margin-bottom:8px;">⏱️</div>
        <strong style="display:block;font-size:17px;">Contrarreloj</strong>
        <small style="display:block;margin-top:6px;color:#9ca3af;">
            Toca tantos objetivos correctos como puedas antes de que se termine el tiempo.
        </small>
    `;
  tarjeta.onclick = () => seleccionarModo("contrarreloj");
  contenedor.appendChild(tarjeta);
}

function crearTarjetaEntrenador() {
  if (document.querySelector('[data-modo="entrenador"]')) return;

  const contenedor = document.querySelector(".tarjetaEntrenamientoModo")?.parentElement;
  const base = document.querySelector(".tarjetaEntrenamientoModo");
  if (!contenedor || !base) return;

  const tarjeta = base.cloneNode(true);
  tarjeta.dataset.modo = "entrenador";
  tarjeta.innerHTML = `
        <div style="font-size:34px;margin-bottom:8px;">🧑‍🏫</div>
        <strong style="display:block;font-size:17px;">Modo entrenador</strong>
        <small style="display:block;margin-top:6px;color:#9ca3af;">
            El entrenador activa manualmente cada Pod y decide colores fijos, rondas o duración.
        </small>
    `;
  tarjeta.onclick = () => seleccionarModo("entrenador");
  contenedor.appendChild(tarjeta);
}

function crearBotonRepetirEntrenamiento() {
  if (document.getElementById("btnRepetirEntrenamientoReactiPod")) return;
  if (!btnNuevoEntrenamiento || !btnNuevoEntrenamiento.parentElement) return;
  const boton = document.createElement("button");
  boton.id = "btnRepetirEntrenamientoReactiPod";
  boton.type = "button";
  boton.textContent = "🔁 REPETIR ESTE ENTRENAMIENTO";
  boton.style.cssText = `
        width:100%;padding:15px 14px;margin-bottom:10px;border:none;
        border-radius:14px;background:#22c55e;color:#07111f;
        font-size:14px;font-weight:900;box-shadow:0 10px 26px rgba(34,197,94,.22);
    `;
  boton.onclick = () => iniciarEntrenamiento();
  btnNuevoEntrenamiento.parentElement.insertBefore(boton, btnNuevoEntrenamiento);
}

// =====================================================
// MODOS
// =====================================================

function seleccionarModo(modo) {
  modoActual = modo;

  configurarModo();

  mostrarPantalla(pantallaConfiguracion);
}

function configurarModo() {
  const controlContrarreloj = document.getElementById(
    "controlDuracionContrarrelojReactiPod"
  );
  if (controlContrarreloj) {
    controlContrarreloj.style.display = modoActual === "contrarreloj" ? "block" : "none";
  }

  if (modoActual === "simple") {
    tituloConfiguracion.textContent = "Reacción aleatoria";

    iconoConfiguracion.textContent = "⚡";

    descripcionModo.textContent =
      "Uno de los cuatro Pods se encenderá aleatoriamente y cambiará de color entre estímulos. Golpea únicamente el Pod iluminado.";
  } else if (modoActual === "colores") {
    tituloConfiguracion.textContent = "Reacción por colores";

    iconoConfiguracion.textContent = "🎨";

    descripcionModo.textContent =
      "Los cuatro Pods mostrarán una combinación nueva de colores en cada ronda. Golpea el Pod que tenga el color indicado.";
  } else if (modoActual === "secuencia") {
    tituloConfiguracion.textContent = "Secuencia / memoria";

    iconoConfiguracion.textContent = "🧠";

    descripcionModo.textContent =
      "Memoriza la secuencia y repítela. Cada Pod correcto se iluminará cuando lo presiones.";

    contenedorEspera.style.display = "none";
  } else if (modoActual === "doble") {
    tituloConfiguracion.textContent = "Doble estímulo";

    iconoConfiguracion.textContent = "⚡⚡";

    descripcionModo.textContent =
      "Dos Pods se encenderán al mismo tiempo con colores que cambian entre rondas. Toca ambos; el tiempo termina cuando presiones el segundo Pod correcto.";
  } else if (modoActual === "prohibido") {
    tituloConfiguracion.textContent = "Color prohibido";

    iconoConfiguracion.textContent = "🚫🎨";

    descripcionModo.textContent =
      "Los cuatro Pods reciben colores diferentes y nuevos en cada ronda. NO toques el color prohibido indicado en grande; toca cualquiera de los otros tres.";
  } else if (modoActual === "circuito") {
    tituloConfiguracion.textContent = "Circuito 4 Pods";

    iconoConfiguracion.textContent = "🔄";

    descripcionModo.textContent =
      "En cada ronda debes completar los cuatro Pods. Se enciende uno a la vez en orden aleatorio y el siguiente aparece inmediatamente al acertar.";

    contenedorEspera.style.display = "none";
  } else if (modoActual === "contrarreloj") {
    tituloConfiguracion.textContent = "Contrarreloj";
    iconoConfiguracion.textContent = "⏱️";

    descripcionModo.textContent =
      "Tienes un tiempo limitado para conseguir tantos aciertos como puedas. Cada vez que tocas un objetivo aparece otro inmediatamente.";
    contenedorEspera.style.display = "none";
    contenedorPausa.style.display = "none";
  } else if (modoActual === "entrenador") {
    tituloConfiguracion.textContent = "Modo entrenador";

    iconoConfiguracion.textContent = "🧑‍🏫";

    descripcionModo.textContent =
      "El entrenador activa manualmente el Pod que desea desde el teléfono. En este modo puedes fijar un color para cada Pod y terminar por rondas o por tiempo.";
  } else if (modoActual === "persecucion") {
    tituloConfiguracion.textContent = "Persecución";

    iconoConfiguracion.textContent = "🔥";

    descripcionModo.textContent =
      "Toca el Pod iluminado. Al acertar, aparecerá inmediatamente un nuevo objetivo para mantenerte en movimiento.";

    contenedorEspera.style.display = "none";
  } else {
    tituloConfiguracion.textContent = "Modo libre";

    iconoConfiguracion.textContent = "🏃";

    descripcionModo.textContent =
      "Golpea cualquiera de los cuatro Pods. Cada Pod se iluminará brevemente y se registrará el intervalo.";

    contenedorEspera.style.display = "none";

    contenedorPausa.style.display = "none";
  }

  pintarControlesExperiencia();
}

// =====================================================
// AUDIO
// =====================================================

function prepararAudio() {
  if (contextoAudio) {
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (AudioContext) {
    contextoAudio = new AudioContext();
  }
}

function tono(frecuencia, duracion) {
  if (!sonidosActivados.checked || !contextoAudio) {
    return;
  }

  const osc = contextoAudio.createOscillator();

  const gain = contextoAudio.createGain();

  osc.frequency.value = frecuencia;

  gain.gain.value = 0.05;

  osc.connect(gain);

  gain.connect(contextoAudio.destination);

  osc.start();

  setTimeout(
    () => osc.stop(),

    duracion
  );
}

// =====================================================
// ENTRENAMIENTO
// =====================================================

function iniciarEntrenamiento() {
  if (cantidadConectados() < 4) {
    alert("Debes conectar los 4 Pods antes de iniciar.");

    return;
  }

  prepararAudio();

  totalRondasActual = Number(numeroRondas.value);

  // V13: para los modos normales se puede terminar por rondas o por tiempo.
  if (!["entrenador", "contrarreloj"].includes(modoActual)) {
    const tipoGeneral = document.getElementById("tipoFinalGeneralReactiPod");
    const selectorRondasGeneral = document.getElementById("rondasGeneralReactiPod");
    const selectorTiempoGeneral = document.getElementById("duracionGeneralReactiPod");

    tipoFinalGeneral = tipoGeneral?.value || "rondas";
    duracionGeneralSeg = Number(selectorTiempoGeneral?.value) || 60;

    if (tipoFinalGeneral === "rondas") {
      totalRondasActual = Number(selectorRondasGeneral?.value) || 5;
    } else {
      // Un valor alto evita que las comprobaciones por rondas detengan el modo.
      totalRondasActual = Number.MAX_SAFE_INTEGER;
    }
  }

  if (modoActual === "entrenador") {
    const tipo = document.getElementById("tipoFinalEntrenadorReactiPod");
    const selectorRondas = document.getElementById("rondasEntrenadorReactiPod");
    const selectorTiempo = document.getElementById("duracionEntrenadorReactiPod");

    tipoFinalEntrenador = tipo?.value || "rondas";
    rondasEntrenador = Number(selectorRondas?.value) || 10;
    duracionEntrenadorSeg = Number(selectorTiempo?.value) || 60;

    if (tipoFinalEntrenador === "rondas") {
      totalRondasActual = rondasEntrenador;
    }
  }

  const selectorDuracionContrarreloj = document.getElementById(
    "duracionContrarrelojReactiPod"
  );
  if (selectorDuracionContrarreloj) {
    duracionContrarrelojSeg = Number(selectorDuracionContrarreloj.value) || 30;
  }

  aplicarDificultadSeleccionada();

  // V10: los colores de los modos normales se generan dinámicamente en cada estímulo.

  rondaActual = 0;

  aciertos = 0;

  errores = 0;

  resultados = [];

  secuencia = [];

  entrenamientoActivo = true;

  finalizacionEnCursoV12 = false;

  pausado = false;

  fase = "idle";

  tiempoPausado = 0;

  contadorAciertos.textContent = "0";

  contadorErrores.textContent = "0";

  ultimoTiempo.textContent = "-- s";

  mensajeResultado.textContent = "";

  estadoEntrenamiento.textContent = "ACTIVO";

  estadoEntrenamiento.classList.remove("pausa");

  btnPausar.textContent = "⏸ PAUSAR";

  nombreModoActivo.textContent = obtenerNombreModo();

  ultimoColorAleatorioPorPod = [null, null, null, null];
  mostrarPanelEntrenadorActivo(false);

  mostrarIntroduccionEntrenamiento();
}

function obtenerNombreModo() {
  if (modoActual === "simple") {
    return "Reacción aleatoria";
  }

  if (modoActual === "colores") {
    return "Reacción por colores";
  }

  if (modoActual === "secuencia") {
    return "Secuencia / memoria";
  }

  if (modoActual === "doble") {
    return "Doble estímulo";
  }

  if (modoActual === "prohibido") {
    return "Color prohibido";
  }

  if (modoActual === "circuito") {
    return "Circuito 4 Pods";
  }

  if (modoActual === "contrarreloj") {
    return "Contrarreloj";
  }

  if (modoActual === "persecucion") {
    return "Persecución";
  }

  if (modoActual === "entrenador") {
    return "Modo entrenador";
  }

  return "Modo libre";
}

// =====================================================
// CUENTA
// =====================================================

function iniciarCuenta() {
  mostrarPantalla(pantallaCuenta);

  let numero = 3;

  numeroCuenta.textContent = numero;

  tono(500, 100);

  const intervalo = setInterval(
    () => {
      numero--;

      if (numero > 0) {
        numeroCuenta.textContent = numero;

        tono(500, 100);

        return;
      }

      clearInterval(intervalo);

      numeroCuenta.textContent = "¡VAMOS!";

      tono(900, 200);

      setTimeout(
        () => {
          mostrarPantalla(pantallaEntrenamiento);

          iniciarTemporizadorGeneralSiAplica();

          if (modoActual === "libre") {
            iniciarLibre();
          } else if (modoActual === "contrarreloj") {
            iniciarContrarreloj();
          } else if (modoActual === "entrenador") {
            iniciarEntrenador();
          } else {
            iniciarRonda();
          }
        },

        700
      );
    },

    800
  );
}

// =====================================================
// V13 - FINALIZACIÓN GENERAL POR TIEMPO
// =====================================================
function detenerTemporizadorGeneral() {
  clearTimeout(temporizadorFinGeneral);
  temporizadorFinGeneral = null;
  clearInterval(intervaloGeneral);
  intervaloGeneral = null;
}

function iniciarTemporizadorGeneralSiAplica() {
  detenerTemporizadorGeneral();

  if (
    !entrenamientoActivo ||
    tipoFinalGeneral !== "tiempo" ||
    ["entrenador", "contrarreloj"].includes(modoActual)
  ) {
    return;
  }

  finGeneralMs = performance.now() + duracionGeneralSeg * 1000;

  const actualizar = () => {
    if (!entrenamientoActivo) {
      detenerTemporizadorGeneral();
      return;
    }
    const restante = Math.max(0, finGeneralMs - performance.now());
    textoRonda.textContent = `Tiempo restante: ${(restante / 1000).toFixed(1)} s`;
  };

  actualizar();
  intervaloGeneral = setInterval(actualizar, 100);
  temporizadorFinGeneral = setTimeout(() => {
    if (!entrenamientoActivo) return;
    esperandoRespuesta = false;
    fase = "resultado";
    detenerCronometro();
    finalizarEntrenamiento();
  }, duracionGeneralSeg * 1000);
}

// =====================================================
// RONDAS
// =====================================================

async function iniciarRonda() {
  if (!entrenamientoActivo) {
    return;
  }

  rondaActual++;

  if (
    tipoFinalGeneral !== "tiempo" ||
    ["entrenador", "contrarreloj"].includes(modoActual)
  ) {
    textoRonda.textContent = `Ronda ${rondaActual} de ${totalRondasActual}`;
  }

  mensajeResultado.textContent = "";

  mensajeResultado.className = "mensajeResultado";

  cronometro.textContent = "0.000 s";

  ultimoTiempo.textContent = "-- s";

  tiempoPausado = 0;

  await apagarTodosLosPods();

  if (modoActual === "secuencia") {
    iniciarSecuencia();

    return;
  }

  if (modoActual === "circuito") {
    activarCircuito();

    return;
  }

  if (modoActual === "persecucion") {
    activarPersecucion();

    return;
  }

  fase = "espera";

  textoFase.textContent = "Esperando...";

  textoObjetivo.textContent = "ESPERA";

  nombreColor.textContent = "---";

  colorObjetivo.style.background = "#374151";

  esperandoRespuesta = false;

  const demora =
    Math.floor(Math.random() * (esperaMaxima - esperaMinima + 1)) + esperaMinima;

  temporizador = setTimeout(
    activarEstimulo,

    demora
  );
}

async function activarEstimulo() {
  if (!entrenamientoActivo || pausado) {
    return;
  }

  if (modoActual === "simple") {
    await activarSimple();
  } else if (modoActual === "doble") {
    await activarDobleEstimulo();
  } else if (modoActual === "prohibido") {
    await activarColorProhibido();
  } else {
    await activarColores();
  }
}

// =====================================================
// SIMPLE
// =====================================================

async function activarSimple() {
  fase = "respuesta";

  objetivoCorrecto = Math.floor(Math.random() * 4);

  const color = obtenerColorEstimulo(objetivoCorrecto);

  textoFase.textContent = "¡AHORA!";

  textoObjetivo.textContent = `TOCA POD ${objetivoCorrecto + 1}`;

  nombreColor.textContent = color.nombre;

  colorObjetivo.style.background = color.css;

  encenderVisual(objetivoCorrecto, color.css);

  await enviarComandoPod(objetivoCorrecto, color.comando);

  iniciarMedicion();
}

// =====================================================
// COLORES
// =====================================================

async function activarColores() {
  fase = "respuesta";

  coloresActuales = obtenerColoresAleatoriosUnicosPods();

  objetivoCorrecto = Math.floor(Math.random() * 4);

  const objetivo = coloresActuales[objetivoCorrecto];

  for (let i = 0; i < 4; i++) {
    encenderVisual(
      i,

      coloresActuales[i].css
    );
  }

  await Promise.all(
    coloresActuales.map((color, indice) =>
      enviarComandoPod(
        indice,

        color.comando
      )
    )
  );

  textoFase.textContent = "¡AHORA!";

  textoObjetivo.textContent = "TOCA EL COLOR";

  nombreColor.textContent = objetivo.nombre;

  colorObjetivo.style.background = objetivo.css;

  iniciarMedicion();
}

function mezclar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

// =====================================================
// DOBLE ESTIMULO
// =====================================================

async function activarDobleEstimulo() {
  fase = "dobleRespuesta";

  const primero = Math.floor(Math.random() * 4);

  let segundo = Math.floor(Math.random() * 4);

  while (segundo === primero) {
    segundo = Math.floor(Math.random() * 4);
  }

  objetivosDobles = [primero, segundo];

  objetivosDoblesPendientes = new Set(objetivosDobles);

  textoFase.textContent = "¡DOBLE!";

  textoObjetivo.textContent = `POD ${primero + 1} + POD ${segundo + 1}`;

  nombreColor.textContent = "TOCA LOS DOS";

  const colorPrimero = obtenerColorEstimulo(primero);

  const colorSegundo = obtenerColorEstimulo(segundo, [colorPrimero.comando]);

  colorObjetivo.style.background = `linear-gradient(135deg, ${colorPrimero.css} 0 48%, ${colorSegundo.css} 52% 100%)`;

  encenderVisual(primero, colorPrimero.css);

  encenderVisual(segundo, colorSegundo.css);

  await Promise.all([
    enviarComandoPod(primero, colorPrimero.comando),
    enviarComandoPod(segundo, colorSegundo.comando),
  ]);

  iniciarMedicion();
}

async function respuestaDobleEstimulo(indice) {
  if (!esperandoRespuesta) {
    return;
  }

  if (!objetivosDoblesPendientes.has(indice)) {
    errores++;

    contadorErrores.textContent = errores;

    mensajeResultado.textContent = `❌ Pod ${indice + 1} no era objetivo`;

    mensajeResultado.className = "mensajeResultado mensajeError";

    tono(220, 120);

    return;
  }

  objetivosDoblesPendientes.delete(indice);

  await enviarComandoPod(indice, "off");

  apagarVisualPod(indice);

  if (objetivosDoblesPendientes.size > 0) {
    mensajeResultado.textContent = "✅ Primero correcto · falta uno";

    mensajeResultado.className = "mensajeResultado mensajeCorrecto";

    tono(760, 70);

    return;
  }

  esperandoRespuesta = false;

  detenerCronometro();

  fase = "resultado";

  const tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;

  aciertos++;

  contadorAciertos.textContent = aciertos;

  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

  mensajeResultado.textContent = `✅ DOBLE COMPLETADO · ${tiempo.toFixed(3)} s`;

  mensajeResultado.className = "mensajeResultado mensajeCorrecto";

  tono(1000, 150);

  resultados.push({
    ronda: rondaActual,
    correcto: true,
    tiempo,
    estado: `Pods ${objetivosDobles[0] + 1} y ${objetivosDobles[1] + 1}`,
  });

  await apagarTodosLosPods();

  continuar();
}

// =====================================================
// COLOR PROHIBIDO
// =====================================================

async function activarColorProhibido() {
  fase = "prohibidoRespuesta";

  coloresActuales = obtenerColoresAleatoriosUnicosPods();

  indiceColorProhibido = Math.floor(Math.random() * 4);

  const prohibido = coloresActuales[indiceColorProhibido];

  for (let i = 0; i < 4; i++) {
    encenderVisual(i, coloresActuales[i].css);
  }

  await Promise.all(
    coloresActuales.map((color, indice) => enviarComandoPod(indice, color.comando))
  );

  textoFase.textContent = "¡CUIDADO!";

  textoObjetivo.textContent = "NO TOQUES";

  nombreColor.textContent = prohibido.nombre;

  colorObjetivo.style.background = prohibido.css;

  iniciarMedicion();
}

async function respuestaColorProhibido(indice) {
  if (!esperandoRespuesta) {
    return;
  }

  esperandoRespuesta = false;

  detenerCronometro();

  fase = "resultado";

  const tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;

  const correcto = indice !== indiceColorProhibido;

  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

  if (correcto) {
    aciertos++;

    contadorAciertos.textContent = aciertos;

    mensajeResultado.textContent = `✅ Evitaste ${coloresActuales[indiceColorProhibido].nombre}`;

    mensajeResultado.className = "mensajeResultado mensajeCorrecto";

    tono(1000, 130);
  } else {
    errores++;

    contadorErrores.textContent = errores;

    mensajeResultado.textContent = `❌ Tocaste el color prohibido`;

    mensajeResultado.className = "mensajeResultado mensajeError";

    tono(220, 240);
  }

  resultados.push({
    ronda: rondaActual,
    correcto,
    tiempo,
    estado: correcto
      ? `Evitó ${coloresActuales[indiceColorProhibido].nombre}`
      : `Tocó ${coloresActuales[indiceColorProhibido].nombre}`,
  });

  await apagarTodosLosPods();

  continuar();
}

// =====================================================
// CIRCUITO 4 PODS
// Cada ronda obliga a completar los cuatro Pods una vez.
// El orden cambia aleatoriamente y solo se muestra el
// siguiente objetivo después de acertar el actual.
// =====================================================

async function activarCircuito() {
  if (!entrenamientoActivo || pausado) {
    return;
  }

  circuitoOrden = mezclar([0, 1, 2, 3]);

  circuitoPosicion = 0;

  circuitoTiempoInicio = performance.now();

  fase = "circuitoRespuesta";

  esperandoRespuesta = true;

  textoFase.textContent = "¡CIRCUITO!";

  mensajeResultado.textContent = "Completa los 4 Pods";

  await mostrarObjetivoCircuito();

  iniciarMedicion();
}

async function mostrarObjetivoCircuito() {
  if (circuitoPosicion >= circuitoOrden.length) {
    return;
  }

  const indice = circuitoOrden[circuitoPosicion];

  objetivoCorrecto = indice;

  const color = obtenerColorEstimulo(indice);

  textoObjetivo.textContent = `TOCA POD ${indice + 1}`;

  nombreColor.textContent = `${color.nombre} · ${circuitoPosicion + 1}/4`;

  colorObjetivo.style.background = color.css;

  encenderVisual(indice, color.css);

  await enviarComandoPod(indice, color.comando);
}

async function respuestaCircuito(indice) {
  if (!esperandoRespuesta || circuitoPosicion >= circuitoOrden.length) {
    return;
  }

  const esperado = circuitoOrden[circuitoPosicion];

  if (indice !== esperado) {
    errores++;

    contadorErrores.textContent = errores;

    mensajeResultado.textContent = `❌ Pod ${indice + 1} incorrecto · busca Pod ${esperado + 1}`;

    mensajeResultado.className = "mensajeResultado mensajeError";

    tono(220, 120);

    return;
  }

  await enviarComandoPod(indice, "off");

  apagarVisualPod(indice);

  circuitoPosicion++;

  tono(820, 70);

  if (circuitoPosicion < circuitoOrden.length) {
    mensajeResultado.textContent = `✅ ${circuitoPosicion}/4 · siguiente`;

    mensajeResultado.className = "mensajeResultado mensajeCorrecto";

    await mostrarObjetivoCircuito();

    return;
  }

  esperandoRespuesta = false;

  detenerCronometro();

  fase = "resultado";

  const tiempo = (performance.now() - circuitoTiempoInicio - tiempoPausado) / 1000;

  aciertos++;

  contadorAciertos.textContent = aciertos;

  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

  mensajeResultado.textContent = `✅ CIRCUITO COMPLETO · ${tiempo.toFixed(3)} s`;

  mensajeResultado.className = "mensajeResultado mensajeCorrecto";

  tono(1050, 160);

  resultados.push({
    ronda: rondaActual,
    correcto: true,
    tiempo,
    estado: `Circuito ${circuitoOrden.map((i) => i + 1).join("-")}`,
  });

  await apagarTodosLosPods();

  continuar();
}

// =====================================================
// PERSECUCION
// =====================================================

async function activarPersecucion() {
  if (!entrenamientoActivo || pausado) {
    return;
  }

  fase = "respuesta";

  let nuevoObjetivo = Math.floor(Math.random() * 4);

  if (objetivoCorrecto >= 0 && nuevoObjetivo === objetivoCorrecto) {
    nuevoObjetivo = (nuevoObjetivo + 1 + Math.floor(Math.random() * 3)) % 4;
  }

  objetivoCorrecto = nuevoObjetivo;

  const color = obtenerColorEstimulo(objetivoCorrecto);

  textoFase.textContent = "¡PERSIGUE!";

  textoObjetivo.textContent = `TOCA POD ${objetivoCorrecto + 1}`;

  nombreColor.textContent = color.nombre;

  colorObjetivo.style.background = color.css;

  encenderVisual(objetivoCorrecto, color.css);

  await enviarComandoPod(objetivoCorrecto, color.comando);

  iniciarMedicion();
}

async function respuestaPersecucion(indice) {
  if (!esperandoRespuesta) {
    return;
  }

  const tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;

  if (indice !== objetivoCorrecto) {
    errores++;

    contadorErrores.textContent = errores;

    mensajeResultado.textContent = `❌ Pod ${indice + 1} incorrecto`;

    mensajeResultado.className = "mensajeResultado mensajeError";

    tono(220, 120);

    return;
  }

  esperandoRespuesta = false;

  detenerCronometro();

  aciertos++;
  rondaActual = Math.max(rondaActual, aciertos);

  contadorAciertos.textContent = aciertos;

  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

  mensajeResultado.textContent = `🔥 ${tiempo.toFixed(3)} s`;

  mensajeResultado.className = "mensajeResultado mensajeCorrecto";

  tono(900, 70);

  resultados.push({
    ronda: aciertos,
    correcto: true,
    tiempo,
    estado: `Pod ${indice + 1}`,
  });

  await apagarTodosLosPods();

  if (aciertos >= totalRondasActual) {
    fase = "resultado";

    temporizador = setTimeout(finalizarEntrenamiento, 350);

    return;
  }

  textoRonda.textContent = `Objetivo ${aciertos + 1} de ${totalRondasActual}`;

  const pausaPersecucion =
    dificultadActual === "dificil" ? 120 : dificultadActual === "facil" ? 450 : 250;

  temporizador = setTimeout(activarPersecucion, pausaPersecucion);
}

// =====================================================
// CRONOMETRO
// =====================================================

function iniciarMedicion() {
  esperandoRespuesta = true;

  tiempoInicio = performance.now();

  tiempoPausado = 0;

  actualizarCronometro();
}

function actualizarCronometro() {
  if (!esperandoRespuesta || pausado) {
    return;
  }

  const tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;

  cronometro.textContent = `${tiempo.toFixed(3)} s`;

  animacionCronometro = requestAnimationFrame(actualizarCronometro);
}

function detenerCronometro() {
  if (animacionCronometro) {
    cancelAnimationFrame(animacionCronometro);
  }

  animacionCronometro = null;
}

// =====================================================
// CONTRARRELOJ
// =====================================================
async function iniciarContrarreloj() {
  rondaActual = 0;
  textoFase.textContent = "¡MÁXIMA VELOCIDAD!";
  textoObjetivo.textContent = "TOCA EL OBJETIVO";
  mensajeResultado.textContent = "Consigue todos los aciertos que puedas.";
  finContrarrelojMs = performance.now() + duracionContrarrelojSeg * 1000;
  clearTimeout(temporizadorFinContrarreloj);
  clearInterval(intervaloContrarreloj);
  intervaloContrarreloj = setInterval(actualizarTiempoContrarreloj, 100);
  temporizadorFinContrarreloj = setTimeout(
    terminarContrarreloj,
    duracionContrarrelojSeg * 1000
  );
  actualizarTiempoContrarreloj();
  await activarObjetivoContrarreloj();
}

function actualizarTiempoContrarreloj() {
  if (!entrenamientoActivo || modoActual !== "contrarreloj") return;
  const restante = Math.max(0, (finContrarrelojMs - performance.now()) / 1000);
  textoRonda.textContent = `Tiempo restante: ${restante.toFixed(1)} s`;
}

async function activarObjetivoContrarreloj() {
  if (!entrenamientoActivo || modoActual !== "contrarreloj") return;
  await apagarTodosLosPods();
  let siguiente = Math.floor(Math.random() * 4);
  if (siguiente === objetivoContrarreloj) {
    siguiente = (siguiente + 1 + Math.floor(Math.random() * 3)) % 4;
  }
  objetivoContrarreloj = siguiente;
  const color = obtenerColorEstimulo(objetivoContrarreloj);
  fase = "contrarrelojRespuesta";
  rondaActual++;
  textoObjetivo.textContent = `POD ${objetivoContrarreloj + 1}`;
  nombreColor.textContent = color.nombre;
  colorObjetivo.style.background = color.css;
  encenderVisual(objetivoContrarreloj, color.css);
  await enviarComandoPod(objetivoContrarreloj, color.comando);
  iniciarMedicion();
}

async function respuestaContrarreloj(indice) {
  if (!entrenamientoActivo || modoActual !== "contrarreloj" || !esperandoRespuesta)
    return;
  esperandoRespuesta = false;
  detenerCronometro();
  const tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;
  const correcto = indice === objetivoContrarreloj;
  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;
  if (correcto) {
    aciertos++;
    contadorAciertos.textContent = aciertos;
    mensajeResultado.textContent = `✅ ${tiempo.toFixed(3)} s`;
    mensajeResultado.className = "mensajeResultado mensajeCorrecto";
    tono(980, 80);
  } else {
    errores++;
    contadorErrores.textContent = errores;
    mensajeResultado.textContent = `❌ Era el Pod ${objetivoContrarreloj + 1}`;
    mensajeResultado.className = "mensajeResultado mensajeError";
    tono(220, 100);
  }
  resultados.push({
    ronda: rondaActual,
    correcto,
    tiempo,
    estado: correcto
      ? `Pod ${objetivoContrarreloj + 1} correcto`
      : `Pod ${indice + 1}; objetivo Pod ${objetivoContrarreloj + 1}`,
  });
  if (performance.now() >= finContrarrelojMs) {
    terminarContrarreloj();
    return;
  }
  await activarObjetivoContrarreloj();
}

async function terminarContrarreloj() {
  if (!entrenamientoActivo || modoActual !== "contrarreloj") return;
  clearTimeout(temporizadorFinContrarreloj);
  temporizadorFinContrarreloj = null;
  clearInterval(intervaloContrarreloj);
  intervaloContrarreloj = null;
  esperandoRespuesta = false;
  mensajeResultado.textContent = `⏱️ ¡Tiempo! ${aciertos} aciertos`;
  await finalizarEntrenamiento();
}

// =====================================================
// MODO ENTRENADOR V10
// El entrenador selecciona manualmente el Pod desde la pantalla.
// Los colores de este modo sí son fijos por Pod.
// =====================================================
function crearPanelEntrenadorActivo() {
  let panel = document.getElementById("panelEntrenadorActivoReactiPod");
  if (panel) return panel;

  panel = document.createElement("section");
  panel.id = "panelEntrenadorActivoReactiPod";
  panel.innerHTML = `
        <div style="font-size:11px;letter-spacing:.04em;color:var(--texto2);margin-bottom:10px;">CONTROL DEL ENTRENADOR</div>
        <div id="gridEntrenadorActivoReactiPod">
            <button type="button" class="btnPodEntrenadorActivo" data-entrenador-pod="0">ACTIVAR POD 1</button>
            <button type="button" class="btnPodEntrenadorActivo" data-entrenador-pod="1">ACTIVAR POD 2</button>
            <button type="button" class="btnPodEntrenadorActivo" data-entrenador-pod="2">ACTIVAR POD 3</button>
            <button type="button" class="btnPodEntrenadorActivo" data-entrenador-pod="3">ACTIVAR POD 4</button>
        </div>
        <div style="font-size:12px;color:var(--texto2);margin-top:10px;line-height:1.4;">
            Pulsa un Pod para enviar el estímulo. Los botones vuelven a habilitarse cuando el deportista responde correctamente.
        </div>
    `;

  // El control del entrenador va justo después de "ELIGE UN POD" / círculo,
  // y antes de las métricas (Aciertos/Errores/Último).
  const zonaObjetivoRef = nombreColor ? nombreColor.closest(".zonaObjetivo") : null;

  if (zonaObjetivoRef) {
    zonaObjetivoRef.insertAdjacentElement("afterend", panel);
  } else if (pantallaEntrenamiento.children.length > 1) {
    pantallaEntrenamiento.insertBefore(panel, pantallaEntrenamiento.children[1]);
  } else {
    pantallaEntrenamiento.appendChild(panel);
  }

  panel.querySelectorAll("[data-entrenador-pod]").forEach((boton) => {
    boton.addEventListener("click", () => {
      activarPodEntrenador(Number(boton.dataset.entrenadorPod));
    });
  });

  return panel;
}

function mostrarPanelEntrenadorActivo(mostrar) {
  const panel = mostrar
    ? crearPanelEntrenadorActivo()
    : document.getElementById("panelEntrenadorActivoReactiPod");
  if (panel) panel.style.display = mostrar ? "block" : "none";
}

function habilitarBotonesEntrenador(habilitar) {
  const panel = document.getElementById("panelEntrenadorActivoReactiPod");
  if (!panel) return;
  panel.querySelectorAll(".btnPodEntrenadorActivo").forEach((boton) => {
    boton.disabled = !habilitar;
  });
}

async function iniciarEntrenador() {
  rondaActual = 0;
  objetivoEntrenador = -1;
  esperandoRespuesta = false;
  fase = "entrenadorListo";

  mostrarPanelEntrenadorActivo(true);
  habilitarBotonesEntrenador(true);
  await apagarTodosLosPods();

  textoFase.textContent = "ENTRENADOR";
  textoObjetivo.textContent = "ELIGE UN POD";
  nombreColor.textContent = "CONTROL MANUAL";
  colorObjetivo.style.background = "#374151";
  mensajeResultado.textContent = "Selecciona desde el teléfono el próximo estímulo.";

  clearTimeout(temporizadorFinEntrenador);
  clearInterval(intervaloEntrenador);

  if (tipoFinalEntrenador === "tiempo") {
    finEntrenadorMs = performance.now() + duracionEntrenadorSeg * 1000;
    actualizarTiempoEntrenador();
    intervaloEntrenador = setInterval(actualizarTiempoEntrenador, 100);
    temporizadorFinEntrenador = setTimeout(
      terminarEntrenadorTiempo,
      duracionEntrenadorSeg * 1000
    );
  } else {
    textoRonda.textContent = `Ronda 0 de ${totalRondasActual}`;
  }
}

function actualizarTiempoEntrenador() {
  if (
    !entrenamientoActivo ||
    modoActual !== "entrenador" ||
    tipoFinalEntrenador !== "tiempo"
  )
    return;
  const restante = Math.max(0, (finEntrenadorMs - performance.now()) / 1000);
  textoRonda.textContent = `Tiempo restante: ${restante.toFixed(1)} s`;
}

async function activarPodEntrenador(indice) {
  if (
    !entrenamientoActivo ||
    modoActual !== "entrenador" ||
    esperandoRespuesta ||
    pausado
  )
    return;
  if (tipoFinalEntrenador === "tiempo" && performance.now() >= finEntrenadorMs) return;

  await apagarTodosLosPods();

  objetivoEntrenador = indice;
  objetivoCorrecto = indice;
  const color = obtenerColorPod(indice);

  fase = "entrenadorRespuesta";
  esperandoRespuesta = true;
  habilitarBotonesEntrenador(false);

  textoFase.textContent = "¡AHORA!";
  textoObjetivo.textContent = `POD ${indice + 1}`;
  nombreColor.textContent = color.nombre;
  colorObjetivo.style.background = color.css;
  mensajeResultado.textContent = "Esperando respuesta del deportista...";
  mensajeResultado.className = "mensajeResultado";

  encenderVisual(indice, color.css);
  await enviarComandoPod(indice, color.comando);
  iniciarMedicion();
}

async function respuestaEntrenador(indice) {
  if (!entrenamientoActivo || modoActual !== "entrenador" || !esperandoRespuesta) return;

  if (indice !== objetivoEntrenador) {
    errores++;
    contadorErrores.textContent = errores;
    mensajeResultado.textContent = `❌ Pod ${indice + 1} incorrecto · objetivo Pod ${objetivoEntrenador + 1}`;
    mensajeResultado.className = "mensajeResultado mensajeError";
    tono(220, 120);
    return;
  }

  esperandoRespuesta = false;
  detenerCronometro();

  const tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;
  rondaActual++;
  aciertos++;

  contadorAciertos.textContent = aciertos;
  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;
  mensajeResultado.textContent = `✅ POD ${indice + 1} · ${tiempo.toFixed(3)} s`;
  mensajeResultado.className = "mensajeResultado mensajeCorrecto";
  tono(980, 90);

  resultados.push({
    ronda: rondaActual,
    correcto: true,
    tiempo,
    estado: `Entrenador - Pod ${indice + 1}`,
  });

  await apagarTodosLosPods();
  objetivoEntrenador = -1;

  if (tipoFinalEntrenador === "rondas") {
    textoRonda.textContent = `Ronda ${rondaActual} de ${totalRondasActual}`;
    if (rondaActual >= totalRondasActual) {
      habilitarBotonesEntrenador(false);
      temporizador = setTimeout(finalizarEntrenamiento, 400);
      return;
    }
  } else if (performance.now() >= finEntrenadorMs) {
    await terminarEntrenadorTiempo();
    return;
  }

  fase = "entrenadorListo";
  textoFase.textContent = "ENTRENADOR";
  textoObjetivo.textContent = "ELIGE EL SIGUIENTE POD";
  nombreColor.textContent = "CONTROL MANUAL";
  colorObjetivo.style.background = "#374151";
  habilitarBotonesEntrenador(true);
}

async function terminarEntrenadorTiempo() {
  if (!entrenamientoActivo || modoActual !== "entrenador") return;

  clearTimeout(temporizadorFinEntrenador);
  temporizadorFinEntrenador = null;
  clearInterval(intervaloEntrenador);
  intervaloEntrenador = null;

  esperandoRespuesta = false;
  habilitarBotonesEntrenador(false);
  detenerCronometro();
  await apagarTodosLosPods();

  mensajeResultado.textContent = `⏱️ ¡Tiempo! ${aciertos} respuestas correctas`;
  await finalizarEntrenamiento();
}

// =====================================================
// PULSACIONES
// =====================================================

function procesarPulsacion(indice) {
  if (!entrenamientoActivo || pausado) {
    return;
  }

  if (fase === "espera") {
    salidaAnticipada();

    return;
  }

  if (fase === "secuenciaRespuesta") {
    respuestaSecuencia(indice);

    return;
  }

  if (fase === "dobleRespuesta") {
    respuestaDobleEstimulo(indice);

    return;
  }

  if (fase === "prohibidoRespuesta") {
    respuestaColorProhibido(indice);

    return;
  }

  if (fase === "circuitoRespuesta") {
    respuestaCircuito(indice);
    return;
  }

  if (fase === "contrarrelojRespuesta") {
    respuestaContrarreloj(indice);
    return;
  }

  if (fase === "entrenadorRespuesta") {
    respuestaEntrenador(indice);
    return;
  }

  if (fase === "libre") {
    golpeLibre(indice);

    return;
  }

  if (fase === "respuesta") {
    respuestaNormal(indice);
  }
}

// =====================================================
// SALIDA ANTICIPADA
// =====================================================

async function salidaAnticipada() {
  clearTimeout(temporizador);

  fase = "resultado";

  errores++;

  contadorErrores.textContent = errores;

  mensajeResultado.textContent = "❌ SALIDA ANTICIPADA";

  mensajeResultado.className = "mensajeResultado mensajeError";

  tono(220, 250);

  resultados.push({
    ronda: rondaActual,

    correcto: false,

    tiempo: null,

    estado: "Salida anticipada",
  });

  await apagarTodosLosPods();

  continuar();
}

// =====================================================
// RESPUESTA NORMAL
// =====================================================

async function respuestaNormal(indice) {
  if (!esperandoRespuesta) {
    return;
  }

  if (modoActual === "persecucion") {
    await respuestaPersecucion(indice);

    return;
  }

  esperandoRespuesta = false;

  detenerCronometro();

  fase = "resultado";

  const tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;

  const correcto = indice === objetivoCorrecto;

  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

  if (correcto) {
    aciertos++;

    contadorAciertos.textContent = aciertos;

    mensajeResultado.textContent = `✅ POD ${indice + 1} CORRECTO`;

    mensajeResultado.className = "mensajeResultado mensajeCorrecto";

    tono(1000, 150);
  } else {
    errores++;

    contadorErrores.textContent = errores;

    mensajeResultado.textContent = `❌ POD ${indice + 1} INCORRECTO`;

    mensajeResultado.className = "mensajeResultado mensajeError";

    tono(220, 250);
  }

  resultados.push({
    ronda: rondaActual,

    correcto,

    tiempo,

    estado: `Pod ${indice + 1}`,
  });

  await apagarTodosLosPods();

  continuar();
}

// =====================================================
// CONTINUAR

// =====================================================

function continuar() {
  if (rondaActual >= totalRondasActual) {
    temporizador = setTimeout(
      finalizarEntrenamiento,

      900
    );

    return;
  }

  temporizador = setTimeout(
    iniciarRonda,

    pausaRondasMs
  );
}

// =====================================================
// SECUENCIA
// =====================================================

function iniciarSecuencia() {
  fase = "secuenciaMostrar";

  secuencia.push(Math.floor(Math.random() * 4));

  indiceMostrarSecuencia = 0;

  posicionSecuencia = 0;

  textoFase.textContent = "Memoriza";

  textoObjetivo.textContent = "MEMORIZA";

  nombreColor.textContent = `${secuencia.length} pasos`;

  colorObjetivo.style.background = "#374151";

  mostrarElementoSecuencia();
}

async function mostrarElementoSecuencia() {
  if (!entrenamientoActivo || pausado) {
    return;
  }

  if (indiceMostrarSecuencia >= secuencia.length) {
    prepararRespuestaSecuencia();

    return;
  }

  const pod = secuencia[indiceMostrarSecuencia];

  const color = obtenerColorEstimulo(pod);

  await apagarTodosLosPods();

  encenderVisual(pod, color.css);

  await enviarComandoPod(pod, color.comando);

  temporizador = setTimeout(
    async () => {
      await apagarTodosLosPods();

      indiceMostrarSecuencia++;

      temporizador = setTimeout(
        mostrarElementoSecuencia,

        intervaloSecuenciaMs
      );
    },

    duracionSecuenciaMs
  );
}

function prepararRespuestaSecuencia() {
  fase = "secuenciaRespuesta";

  esperandoRespuesta = true;

  posicionSecuencia = 0;

  tiempoPausado = 0;

  textoFase.textContent = "Tu turno";

  textoObjetivo.textContent = "REPITE LA SECUENCIA";

  nombreColor.textContent = `${secuencia.length} pasos`;

  tiempoInicio = performance.now();

  actualizarCronometro();
}

async function respuestaSecuencia(indice) {
  if (!esperandoRespuesta) {
    return;
  }

  const esperado = secuencia[posicionSecuencia];

  // =================================================
  // RESPUESTA INCORRECTA
  // =================================================
  if (indice !== esperado) {
    esperandoRespuesta = false;

    detenerCronometro();

    fase = "resultado";

    errores++;

    contadorErrores.textContent = errores;

    mensajeResultado.textContent = `❌ POD ${indice + 1} INCORRECTO`;

    mensajeResultado.className = "mensajeResultado mensajeError";

    sonidoSecuenciaIncorrecta();

    const tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;

    ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

    resultados.push({
      ronda: rondaActual,

      correcto: false,

      tiempo,

      estado: `Secuencia incorrecta - Pod ${indice + 1}`,
    });

    // NUEVO: todos los Pods se ponen rojos cuando hay un error.
    await feedbackTodosPods("red", "#ef4444", 800);

    if (rondaActual >= totalRondasActual) {
      temporizador = setTimeout(finalizarEntrenamiento, 500);

      return;
    }

    temporizador = setTimeout(iniciarRonda, pausaRondasMs);

    return;
  }

  posicionSecuencia++;

  // Si aun faltan pasos, solo iluminamos el Pod presionado.
  if (posicionSecuencia < secuencia.length) {
    iluminarPodPresionado(indice, 300);

    mensajeResultado.textContent = `✅ Paso ${posicionSecuencia} correcto`;

    mensajeResultado.className = "mensajeResultado mensajeCorrecto";

    return;
  }

  // =================================================
  // SECUENCIA COMPLETA CORRECTA
  // =================================================
  esperandoRespuesta = false;

  detenerCronometro();

  fase = "resultado";

  aciertos++;

  contadorAciertos.textContent = aciertos;

  const tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;

  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

  mensajeResultado.textContent = "✅ SECUENCIA CORRECTA";

  mensajeResultado.className = "mensajeResultado mensajeCorrecto";

  sonidoSecuenciaCorrecta();

  resultados.push({
    ronda: rondaActual,

    correcto: true,

    tiempo,

    estado: "Secuencia correcta",
  });

  // NUEVO: los 4 Pods se ponen verdes cuando se completa la secuencia.
  await feedbackTodosPods("green", "#22c55e", 800);

  if (rondaActual >= totalRondasActual) {
    temporizador = setTimeout(finalizarEntrenamiento, 500);

    return;
  }

  // Pasamos directamente a la siguiente ronda.
  // Esta forma conserva la correccion que ya habia funcionado
  // en el modo Secuencia.
  temporizador = setTimeout(iniciarRonda, pausaRondasMs);
}

// =====================================================
// LIBRE
// =====================================================

async function iniciarLibre() {
  fase = "libre";

  rondaActual = 0;

  textoRonda.textContent =
    tipoFinalGeneral === "tiempo"
      ? `Tiempo: ${duracionGeneralSeg} s`
      : `Golpes 0 de ${totalRondasActual}`;

  textoFase.textContent = "Libre";

  textoObjetivo.textContent = "GOLPEA CUALQUIER POD";

  nombreColor.textContent = "LIBRE";

  colorObjetivo.style.background = "#374151";

  mensajeResultado.textContent = "";

  await apagarTodosLosPods();

  ultimoGolpeLibre = performance.now();

  tiempoInicio = ultimoGolpeLibre;

  tiempoPausado = 0;

  esperandoRespuesta = true;

  actualizarCronometro();
}

async function golpeLibre(indice) {
  if (!esperandoRespuesta) {
    return;
  }

  const ahora = performance.now();

  const tiempo = (ahora - ultimoGolpeLibre - tiempoPausado) / 1000;

  // V13: el feedback BLE no debe bloquear el registro ni el cierre de la sesión.
  iluminarPodPresionado(indice, 220).catch((error) =>
    console.warn("Feedback de Modo libre omitido:", error)
  );

  rondaActual++;

  aciertos++;

  contadorAciertos.textContent = aciertos;

  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

  mensajeResultado.textContent = `✅ Pod ${indice + 1} - ${tiempo.toFixed(3)} s`;

  mensajeResultado.className = "mensajeResultado mensajeCorrecto";

  tono(900, 80);

  resultados.push({
    ronda: rondaActual,

    correcto: true,

    tiempo,

    estado: `Pod ${indice + 1}`,
  });

  if (tipoFinalGeneral !== "tiempo") {
    textoRonda.textContent = `Golpes ${rondaActual} de ${totalRondasActual}`;
  }

  ultimoGolpeLibre = ahora;

  tiempoInicio = ahora;

  tiempoPausado = 0;

  if (tipoFinalGeneral !== "tiempo" && rondaActual >= totalRondasActual) {
    // V13: en modo por rondas cerramos al alcanzar el objetivo.
    // En versiones anteriores el cierre quedaba pendiente en un timeout
    // mientras aún podía existir feedback visual del último golpe.

    esperandoRespuesta = false;
    detenerCronometro();

    fase = "resultado";

    // Cerramos de inmediato; no esperamos ninguna escritura BLE del último golpe.
    finalizarEntrenamiento();
    return;
  }
}

// =====================================================
// FEEDBACK POD
// =====================================================

async function iluminarPodPresionado(indice, duracion = 300) {
  const color = obtenerColorEstimulo(indice);

  encenderVisual(indice, color.css);

  await enviarComandoPod(indice, color.comando);

  setTimeout(
    async () => {
      await enviarComandoPod(indice, "off");

      apagarVisualPod(indice);
    },

    duracion
  );
}

// =====================================================
// FEEDBACK DE TODOS LOS PODS
// Verde = secuencia correcta / Rojo = secuencia incorrecta
// =====================================================

async function feedbackTodosPods(comando, colorCSS, duracion = 800) {
  // Feedback visual dentro de la app.
  for (let i = 0; i < podsBLE.length; i++) {
    encenderVisual(i, colorCSS);
  }

  // Feedback fisico en los Pods conectados.
  await Promise.all(
    podsBLE.map((pod, indice) => {
      if (pod.conectado) {
        return enviarComandoPod(indice, comando);
      }
    })
  );

  await new Promise((resolver) => setTimeout(resolver, duracion));

  await apagarTodosLosPods();
}

// =====================================================
// PAUSA
// =====================================================

async function alternarPausa() {
  if (!entrenamientoActivo) {
    return;
  }

  if (!pausado) {
    pausado = true;

    tiempoPausaInicio = performance.now();

    detenerCronometro();

    estadoEntrenamiento.textContent = "PAUSA";

    estadoEntrenamiento.classList.add("pausa");

    btnPausar.textContent = "▶ REANUDAR";

    await apagarTodosLosPods();
  } else {
    const duracion = performance.now() - tiempoPausaInicio;

    pausado = false;

    if (esperandoRespuesta) {
      tiempoPausado += duracion;
    }

    estadoEntrenamiento.textContent = "ACTIVO";

    estadoEntrenamiento.classList.remove("pausa");

    btnPausar.textContent = "⏸ PAUSAR";

    if (esperandoRespuesta) {
      actualizarCronometro();
    }
  }
}

// =====================================================
// CANCELAR
// =====================================================

async function cancelarEntrenamiento() {
  if (!confirm("¿Cancelar entrenamiento?")) {
    return;
  }

  entrenamientoActivo = false;

  esperandoRespuesta = false;

  clearTimeout(temporizador);

  detenerTemporizadorGeneral();

  clearTimeout(temporizadorFinContrarreloj);
  temporizadorFinContrarreloj = null;
  clearInterval(intervaloContrarreloj);
  intervaloContrarreloj = null;
  clearTimeout(temporizadorFinEntrenador);
  temporizadorFinEntrenador = null;
  clearInterval(intervaloEntrenador);
  intervaloEntrenador = null;
  mostrarPanelEntrenadorActivo(false);

  detenerCronometro();

  await apagarTodosLosPods();

  mostrarPantalla(pantallaTiposEntrenamiento);
}

// =====================================================
// CELEBRACION FINAL
// =====================================================

function obtenerFraseFinal() {
  const total = aciertos + errores;

  const precision = total > 0 ? aciertos / total : 0;

  if (precision >= 0.9) {
    return "¡Excelente trabajo!";
  }

  if (precision >= 0.7) {
    return "¡Muy buen trabajo!";
  }

  return "¡Bien hecho, sigue mejorando!";
}

async function mostrarCelebracionFinal() {
  let overlay = document.getElementById("celebracionReactiPod");

  if (overlay) {
    overlay.remove();
  }

  overlay = document.createElement("div");

  overlay.id = "celebracionReactiPod";

  overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99998;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:24px;
        background:radial-gradient(circle at center,rgba(38,25,10,.96),rgba(3,7,18,.98) 65%);
        color:white;
        text-align:center;
        opacity:0;
        transition:opacity .25s ease;
    `;

  const frase = obtenerFraseFinal();

  overlay.innerHTML = `
        <div style="position:relative;max-width:420px;width:100%;">
 
            <div class="fuegoReactiPod">🔥</div>
 
            <div
                style="font-size:31px;font-weight:900;margin-top:10px;letter-spacing:.3px;"
            >
                ${frase}
            </div>
 
            <div
                style="font-size:15px;color:#fbbf24;margin-top:10px;font-weight:700;"
            >
                ${aciertos} aciertos · ${errores} errores
            </div>
 
            <div
                style="font-size:14px;color:#cbd5e1;margin-top:10px;"
            >
                Cada reacción cuenta. Sigue superando tu marca.
            </div>
 
            <div class="chispasReactiPod">
                <span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span>
            </div>
        </div>
 
        <style>
            .fuegoReactiPod {
                font-size:96px;
                line-height:1;
                animation:fuegoReactiPod 0.72s ease-in-out infinite alternate;
                filter:drop-shadow(0 0 28px rgba(249,115,22,.65));
            }
 
            .chispasReactiPod span {
                position:absolute;
                color:#fbbf24;
                font-size:24px;
                animation:chispaReactiPod 1.2s ease-in-out infinite;
            }
 
            .chispasReactiPod span:nth-child(1){left:8%;top:20%;animation-delay:.1s;}
            .chispasReactiPod span:nth-child(2){right:8%;top:18%;animation-delay:.35s;}
            .chispasReactiPod span:nth-child(3){left:20%;bottom:8%;animation-delay:.55s;}
            .chispasReactiPod span:nth-child(4){right:20%;bottom:5%;animation-delay:.75s;}
            .chispasReactiPod span:nth-child(5){left:49%;top:-8%;animation-delay:.95s;}
 
            @keyframes fuegoReactiPod {
                from {transform:scale(.92) rotate(-2deg);}
                to {transform:scale(1.08) rotate(2deg);}
            }
 
            @keyframes chispaReactiPod {
                0%,100% {opacity:.15;transform:translateY(8px) scale(.7);}
                50% {opacity:1;transform:translateY(-16px) scale(1.25);}
            }
        </style>
    `;

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
  });

  sonidoCelebracionFinal();

  await new Promise((resolver) => setTimeout(resolver, 3900));

  overlay.style.opacity = "0";

  await new Promise((resolver) => setTimeout(resolver, 280));

  overlay.remove();
}

function sonidoCelebracionFinal() {
  if (!ajustesApp.sonidos) {
    return;
  }

  prepararAudio();

  tono(620, 90);
  setTimeout(() => tono(820, 90), 110);
  setTimeout(() => tono(1040, 150), 230);
}

// =====================================================
// FINALIZAR
// =====================================================

async function apagarTodosLosPodsConLimiteV13(limiteMs = 700) {
  try {
    await Promise.race([
      apagarTodosLosPods(),
      new Promise((resolve) => setTimeout(resolve, limiteMs)),
    ]);
  } catch (error) {
    console.warn(
      "ReactiPod V13: apagado BLE omitido para no bloquear la interfaz.",
      error
    );
  }
  apagarVisuales();
}

async function finalizarEntrenamiento() {
  // V12: un único cierre por sesión. Es especialmente importante en Modo libre,
  // donde el último golpe puede coincidir con feedback BLE/visual todavía activo.
  if (finalizacionEnCursoV12 || !entrenamientoActivo) {
    return;
  }

  finalizacionEnCursoV12 = true;
  entrenamientoActivo = false;
  esperandoRespuesta = false;
  fase = "idle";

  clearTimeout(temporizador);
  temporizador = null;
  detenerTemporizadorGeneral();

  clearTimeout(temporizadorFinContrarreloj);
  temporizadorFinContrarreloj = null;
  clearInterval(intervaloContrarreloj);

  intervaloContrarreloj = null;

  clearTimeout(temporizadorFinEntrenador);
  temporizadorFinEntrenador = null;
  clearInterval(intervaloEntrenador);
  intervaloEntrenador = null;

  mostrarPanelEntrenadorActivo(false);
  detenerCronometro();

  await apagarTodosLosPodsConLimiteV13(700);

  try {
    await mostrarCelebracionFinal();
  } catch (error) {
    // La celebración es visual; nunca debe impedir llegar a Resultados.
    console.warn("ReactiPod V13: se omitió la celebración final.", error);
  }

  try {
    mostrarResultados();
  } catch (error) {
    console.error("ReactiPod V13: error mostrando resultados.", error);
  }

  // Aunque falle un efecto visual o el guardado, la navegación no queda bloqueada.
  mostrarPantalla(pantallaResultados);

  try {
    actualizarResumenInicio();
  } catch (error) {
    console.warn("ReactiPod V13: no se pudo actualizar el resumen de inicio.", error);
  }

  finalizacionEnCursoV12 = false;
}

// =====================================================
// RESULTADOS
// =====================================================

function mostrarResultados() {
  const perfil = obtenerPerfilActivo();

  nombrePerfilResultados.textContent = perfil.nombre;

  resultadoRondas.textContent = resultados.length;

  resultadoAciertos.textContent = aciertos;

  resultadoErrores.textContent = errores;

  const tiempos = resultados
    .filter((resultado) => typeof resultado.tiempo === "number")
    .map((resultado) => resultado.tiempo);

  let mejor = null;

  let peor = null;

  let promedio = null;

  if (tiempos.length) {
    mejor = Math.min(...tiempos);

    peor = Math.max(...tiempos);

    promedio =
      tiempos.reduce(
        (suma, tiempo) => suma + tiempo,

        0
      ) / tiempos.length;
  }

  resultadoMejor.textContent = mejor === null ? "-- s" : `${mejor.toFixed(3)} s`;

  resultadoPeor.textContent = peor === null ? "-- s" : `${peor.toFixed(3)} s`;

  resultadoPromedio.textContent = promedio === null ? "-- s" : `${promedio.toFixed(3)} s`;

  listaResultados.innerHTML = "";

  resultados.forEach((resultado) => {
    const fila = document.createElement("div");

    fila.className = "resultadoFila";

    fila.innerHTML = `
 
                <span>
                    Ronda ${resultado.ronda}
                </span>
 
                <span>
                    ${
                      resultado.tiempo === null
                        ? "--"
                        : resultado.tiempo.toFixed(3) + " s"
                    }
                </span>
 
                <span>
                    ${escaparHTML(resultado.estado)}
                </span>
            `;

    listaResultados.appendChild(fila);
  });

  guardarEntrenamiento(promedio, mejor, peor);
}

function guardarEntrenamiento(promedio, mejor, peor) {
  const perfil = obtenerPerfilActivo();

  perfil.historial.push({
    timestamp: Date.now(),

    fecha: new Date().toLocaleString(),

    modo: obtenerNombreModo(),

    rondas: resultados.length,

    aciertos,

    errores,

    promedio,

    mejor,

    peor,
  });

  guardarDatos();
}

// =====================================================
// HISTORIAL
// =====================================================

function mostrarEstadisticas() {
  const perfil = obtenerPerfilActivo();

  const resumen = calcularResumenPerfil();

  nombrePerfilEstadisticas.textContent = perfil.nombre;

  totalEntrenamientos.textContent = resumen.sesiones;

  promedioGeneral.textContent =
    resumen.promedio === null ? "-- s" : `${resumen.promedio.toFixed(3)} s`;

  mejorPromedio.textContent =
    resumen.mejorPromedio === null ? "-- s" : `${resumen.mejorPromedio.toFixed(3)} s`;

  totalAciertos.textContent = resumen.aciertos;

  totalErrores.textContent = resumen.errores;

  precisionGeneral.textContent = `${resumen.precision.toFixed(1)} %`;

  mostrarHistorial();
}

function mostrarHistorial() {
  const historial = obtenerPerfilActivo().historial;

  historialEntrenamientos.innerHTML = "";

  if (historial.length === 0) {
    historialEntrenamientos.innerHTML = `
            <p class="textoSecundario">
                Todavía no existen entrenamientos guardados.
            </p>
            `;

    return;
  }

  [...historial].reverse().forEach((entrenamiento) => {
    const item = document.createElement("div");

    item.className = "historialItem";

    item.innerHTML = `
 
                    <div>
 
                        <strong>
                            ${escaparHTML(entrenamiento.modo)}
                        </strong>
 
                        <div class="historialFecha">
                            ${escaparHTML(entrenamiento.fecha)}
                        </div>
 
                    </div>
 
                    <div>
 
                        <div class="historialDato">
                            Promedio:
                            ${
                              typeof entrenamiento.promedio === "number"
                                ? entrenamiento.promedio.toFixed(3) + " s"
                                : "--"
                            }
                        </div>
 
                        <div class="historialDato">
                            Aciertos:
                            ${entrenamiento.aciertos || 0}
                        </div>
 
                        <div class="historialDato">
                            Errores:
                            ${entrenamiento.errores || 0}
                        </div>
 
                    </div>
                `;

    historialEntrenamientos.appendChild(item);
  });
}

// =====================================================
// PROGRESO
// =====================================================

function mostrarProgreso() {
  const perfil = obtenerPerfilActivo();

  const resumen = calcularResumenPerfil();

  nombrePerfilProgreso.textContent = perfil.nombre;

  progresoMejorTiempo.textContent =
    resumen.mejorTiempo === null ? "-- s" : `${resumen.mejorTiempo.toFixed(3)} s`;

  progresoPromedio.textContent =
    resumen.promedio === null ? "-- s" : `${resumen.promedio.toFixed(3)} s`;

  progresoPrecision.textContent = `${resumen.precision.toFixed(1)} %`;

  progresoRacha.textContent = resumen.racha;

  actualizarObjetivo();

  mostrarActividadReciente();

  setTimeout(
    () => {
      dibujarGrafico();
    },

    100
  );
}

function actualizarObjetivo() {
  const perfil = obtenerPerfilActivo();

  const resumen = calcularResumenPerfil();

  const meta = perfil.objetivo || 0.5;

  objetivoMeta.textContent = `${meta.toFixed(3)} s`;

  if (resumen.mejorTiempo === null) {
    objetivoActual.textContent = "-- s";

    rellenoObjetivo.style.width = "0%";

    textoObjetivoProgreso.textContent =
      "Realiza entrenamientos para comenzar a medir tu progreso.";

    return;
  }

  objetivoActual.textContent = `${resumen.mejorTiempo.toFixed(3)} s`;

  if (resumen.mejorTiempo <= meta) {
    rellenoObjetivo.style.width = "100%";

    textoObjetivoProgreso.textContent =
      "🏆 ¡Objetivo conseguido! Puedes establecer una nueva meta.";

    return;
  }

  const referenciaInicial = Math.max(meta * 2, resumen.mejorTiempo);

  let porcentaje =
    ((referenciaInicial - resumen.mejorTiempo) / (referenciaInicial - meta)) * 100;

  porcentaje = Math.max(5, Math.min(99, porcentaje));

  rellenoObjetivo.style.width = `${porcentaje}%`;

  const faltan = resumen.mejorTiempo - meta;

  textoObjetivoProgreso.textContent = `Te faltan ${faltan.toFixed(3)} s para alcanzar tu objetivo.`;
}

function editarObjetivo() {
  const perfil = obtenerPerfilActivo();

  const actual = perfil.objetivo || 0.5;

  const respuesta = prompt(
    "Ingresa tu objetivo en segundos.\nEjemplo: 0.450",

    actual.toFixed(3)
  );

  if (respuesta === null) {
    return;
  }

  const valor = Number(respuesta.replace(",", "."));

  if (!Number.isFinite(valor) || valor <= 0 || valor > 10) {
    alert("Ingresa un tiempo válido. Ejemplo: 0.450");

    return;
  }

  perfil.objetivo = valor;

  guardarDatos();

  actualizarObjetivo();
}

function mostrarActividadReciente() {
  const historial = obtenerPerfilActivo().historial;

  actividadReciente.innerHTML = "";

  if (historial.length === 0) {
    actividadReciente.innerHTML = `
            <p class="textoSecundario">
                Todavía no tienes actividad reciente.
            </p>
            `;

    return;
  }

  [...historial]
    .reverse()
    .slice(0, 5)
    .forEach((entrenamiento) => {
      const item = document.createElement("div");

      item.className = "actividadItem";

      item.innerHTML = `
 
                    <div>
 
                        <strong>
                            ${escaparHTML(entrenamiento.modo)}
                        </strong>
 
                        <small>
                            ${escaparHTML(entrenamiento.fecha)}
                        </small>
 
                    </div>
 
                    <div class="actividadTiempo">
 
                        <strong>
                            ${
                              typeof entrenamiento.promedio === "number"
                                ? entrenamiento.promedio.toFixed(3) + " s"
                                : "--"
                            }
                        </strong>
 
                        <small>
                            ${entrenamiento.aciertos || 0}
                            aciertos
                        </small>
 
                    </div>
                `;

      actividadReciente.appendChild(item);
    });
}

// =====================================================
// GRAFICA
// =====================================================

function dibujarGrafico() {
  const historial = obtenerPerfilActivo()
    .historial.filter((entrenamiento) => typeof entrenamiento.promedio === "number")
    .slice(-10);

  const ctx = graficoProgreso.getContext("2d");

  const ancho = graficoProgreso.clientWidth;

  const alto = 230;

  const escala = window.devicePixelRatio || 1;

  graficoProgreso.width = ancho * escala;

  graficoProgreso.height = alto * escala;

  ctx.scale(escala, escala);

  ctx.clearRect(0, 0, ancho, alto);

  if (historial.length === 0) {
    ctx.fillStyle = "#9ca3af";

    ctx.font = "14px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
      "Aún no hay suficientes datos",

      ancho / 2,

      alto / 2
    );

    mensajeProgreso.textContent = "Completa entrenamientos para ver tu evolución.";

    return;
  }

  const valores = historial.map((entrenamiento) => entrenamiento.promedio);

  let minimo = Math.min(...valores);

  let maximo = Math.max(...valores);

  if (minimo === maximo) {
    minimo -= 0.05;

    maximo += 0.05;
  }

  const margenIzquierda = 45;

  const margenDerecha = 20;

  const margenSuperior = 25;

  const margenInferior = 35;

  const areaAncho = ancho - margenIzquierda - margenDerecha;

  const areaAlto = alto - margenSuperior - margenInferior;

  ctx.strokeStyle = "#273449";

  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = margenSuperior + (areaAlto / 4) * i;

    ctx.beginPath();

    ctx.moveTo(margenIzquierda, y);

    ctx.lineTo(ancho - margenDerecha, y);

    ctx.stroke();
  }

  const puntos = valores.map((valor, indice) => {
    const x =
      valores.length === 1
        ? margenIzquierda + areaAncho / 2
        : margenIzquierda + (indice / (valores.length - 1)) * areaAncho;

    const y = margenSuperior + ((valor - minimo) / (maximo - minimo)) * areaAlto;

    return {
      x,

      y,

      valor,
    };
  });

  ctx.strokeStyle = "#22c55e";

  ctx.lineWidth = 3;

  ctx.beginPath();

  puntos.forEach((punto, indice) => {
    if (indice === 0) {
      ctx.moveTo(punto.x, punto.y);
    } else {
      ctx.lineTo(punto.x, punto.y);
    }
  });

  ctx.stroke();

  puntos.forEach((punto, indice) => {
    ctx.fillStyle = "#22c55e";

    ctx.beginPath();

    ctx.arc(punto.x, punto.y, 5, 0, Math.PI * 2);

    ctx.fill();

    ctx.fillStyle = "#9ca3af";

    ctx.font = "11px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
      `E${indice + 1}`,

      punto.x,

      alto - 10
    );
  });

  analizarProgreso(valores);
}

function analizarProgreso(valores) {
  if (valores.length < 2) {
    mensajeProgreso.textContent =
      "Completa más entrenamientos para analizar tu evolución.";

    return;
  }

  const anterior = valores[valores.length - 2];

  const actual = valores[valores.length - 1];

  const diferencia = anterior - actual;

  if (Math.abs(diferencia) < 0.005) {
    mensajeProgreso.textContent = "Tu rendimiento se mantiene estable.";
  } else if (diferencia > 0) {
    mensajeProgreso.textContent = `📈 Mejoraste ${diferencia.toFixed(3)} s respecto al entrenamiento anterior.`;
  } else {
    mensajeProgreso.textContent = `El último promedio fue ${Math.abs(diferencia).toFixed(3)} s más lento. La tendencia puede variar entre sesiones.`;
  }
}

// =====================================================
// VISUALES PODS
// =====================================================

function encenderVisual(indice, color) {
  lucesPods[indice].style.background = color;

  lucesPods[indice].style.boxShadow = `0 0 30px ${color}`;
}

function apagarVisualPod(indice) {
  lucesPods[indice].style.background = "#374151";

  lucesPods[indice].style.boxShadow = "none";
}

function apagarVisuales() {
  lucesPods.forEach((luz) => {
    luz.style.background = "#374151";

    luz.style.boxShadow = "none";
  });
}

// =====================================================
// EVENTOS BLE
// =====================================================

botonesConexion.forEach((boton) => {
  boton.addEventListener(
    "click",

    () => {
      conectarPod(Number(boton.dataset.pod));
    }
  );
});

// =====================================================
// MODOS
// =====================================================

tarjetasModos.forEach((tarjeta) => {
  tarjeta.addEventListener(
    "click",

    () => {
      seleccionarModo(tarjeta.dataset.modo);
    }
  );
});

// =====================================================

// NAVEGACION
// =====================================================

btnGestionarPods.onclick = () => {
  mostrarPantalla(pantallaPods);
};

btnVolverDesdePods.onclick = () => {
  actualizarResumenInicio();

  mostrarPantalla(pantallaInicio);
};

btnApagarTodos.onclick = apagarTodosLosPods;

btnEntrenamiento.onclick = () => {
  actualizarNombresPerfil();

  mostrarPantalla(pantallaTiposEntrenamiento);
};

btnVolverTipos.onclick = () => {
  actualizarResumenInicio();

  mostrarPantalla(pantallaInicio);
};

btnVolverEntrenamientos.onclick = () => {
  mostrarPantalla(pantallaTiposEntrenamiento);
};

btnComenzar.onclick = iniciarEntrenamiento;

btnPausar.onclick = alternarPausa;

btnCancelar.onclick = cancelarEntrenamiento;

btnPerfiles.onclick = () => {
  mostrarPerfiles();

  mostrarPantalla(pantallaPerfiles);
};

btnNuevoPerfil.onclick = crearPerfil;

btnVolverPerfiles.onclick = () => {
  actualizarResumenInicio();

  mostrarPantalla(pantallaInicio);
};

btnNuevoEntrenamiento.onclick = () => {
  mostrarPantalla(pantallaTiposEntrenamiento);
};

btnResultadosInicio.onclick = () => {
  actualizarResumenInicio();

  mostrarPantalla(pantallaInicio);
};

btnProgreso.onclick = () => {
  mostrarProgreso();

  mostrarPantalla(pantallaProgreso);
};

btnVolverProgreso.onclick = () => {
  actualizarResumenInicio();

  mostrarPantalla(pantallaInicio);
};

btnEditarObjetivo.onclick = editarObjetivo;

btnEstadisticas.onclick = () => {
  mostrarEstadisticas();

  mostrarPantalla(pantallaEstadisticas);
};

btnEstadisticasInicio.onclick = () => {
  actualizarResumenInicio();

  mostrarPantalla(pantallaInicio);
};

btnBorrarHistorial.onclick = () => {
  const perfil = obtenerPerfilActivo();

  if (confirm(`¿Borrar todo el historial de ${perfil.nombre}?`)) {
    perfil.historial = [];

    guardarDatos();

    mostrarEstadisticas();

    actualizarResumenInicio();
  }
};

btnAjustes.onclick = () => {
  mostrarPantalla(pantallaAjustes);
};

btnVolverAjustes.onclick = () => {
  mostrarPantalla(pantallaInicio);
};

// =====================================================
// AJUSTES
// =====================================================

ajusteSonidos.addEventListener(
  "change",

  () => {
    ajustesApp.sonidos = ajusteSonidos.checked;

    sonidosActivados.checked = ajusteSonidos.checked;

    guardarAjustes();
  }
);

ajusteTema.addEventListener(
  "change",

  () => {
    ajustesApp.tema = ajusteTema.value;

    aplicarTema(ajustesApp.tema);

    guardarAjustes();
  }
);

sonidosActivados.addEventListener(
  "change",

  () => {
    ajustesApp.sonidos = sonidosActivados.checked;

    ajusteSonidos.checked = sonidosActivados.checked;

    guardarAjustes();
  }
);

// =====================================================
// PRIVACIDAD Y DATOS (LOPDP Ecuador — acceso, portabilidad y eliminación)

// =====================================================

function construirExportacionPerfil(perfil) {
  return JSON.stringify(
    {
      exportado_el: new Date().toISOString(),

      app: "RehabPod",

      perfil: {
        nombre: perfil.nombre,

        foto: perfil.foto || null,

        objetivo: perfil.objetivo,

        consentimiento: perfil.consentimiento || null,

        historial: perfil.historial || [],
      },
    },

    null,

    2
  );
}

function intentarDescargaArchivo(contenido, nombreArchivo) {
  try {
    const blob = new Blob([contenido], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");

    enlace.href = url;

    enlace.download = nombreArchivo;

    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 4000);

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
}

function mostrarModalDatosPerfil(perfil) {
  const contenido = construirExportacionPerfil(perfil);

  const nombreArchivo = `rehabpod_${perfil.nombre
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")}.json`;

  let overlay = document.getElementById("modalDatosPerfilRehabPod");

  if (overlay) {
    overlay.remove();
  }

  overlay = document.createElement("div");

  overlay.id = "modalDatosPerfilRehabPod";

  overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99997;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(0,0,0,.6);
        opacity:0;
        transition:opacity .2s ease;
    `;

  overlay.innerHTML = `
        <div
            style="
                width:100%;
                max-width:460px;
                max-height:88vh;
                display:flex;
                flex-direction:column;
                padding:20px;
                border-radius:16px;
                background:var(--tarjeta);
                border:1px solid var(--borde);
                color:var(--texto);
            "
        >
            <div style="font-size:12px;letter-spacing:.06em;color:var(--texto2);">
                DATOS DE ${escaparHTML(perfil.nombre.toUpperCase())}
            </div>

            <h3 style="margin:8px 0 12px;font-size:18px;">
                Esto es todo lo que guardamos
            </h3>

            <textarea
                id="areaDatosPerfilRehabPod"
                readonly
                style="
                    flex:1;
                    min-height:220px;
                    padding:12px;
                    border-radius:10px;
                    background:var(--tarjeta2);
                    border:1px solid var(--borde);
                    color:var(--texto);
                    font-family:var(--fuente-dato);
                    font-size:12px;
                    line-height:1.5;
                    resize:vertical;
                "
            >${escaparHTML(contenido)}</textarea>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;">
                <button
                    type="button"
                    id="btnCopiarDatosPerfilRehabPod"
                    class="boton botonOscuro"
                    style="margin:0;"
                >
                    Copiar
                </button>

                <button
                    type="button"
                    id="btnDescargarArchivoPerfilRehabPod"
                    class="boton botonPrincipal"
                    style="margin:0;"
                >
                    Descargar .json
                </button>
            </div>

            <button
                type="button"
                id="btnCerrarDatosPerfilRehabPod"
                class="boton botonOscuro"
                style="margin-top:10px;"
            >
                Cerrar
            </button>
        </div>
    `;

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
  });

  function cerrar() {
    overlay.style.opacity = "0";

    setTimeout(() => overlay.remove(), 200);
  }

  document.getElementById("btnCopiarDatosPerfilRehabPod").addEventListener(
    "click",

    async () => {
      try {
        await navigator.clipboard.writeText(contenido);

        alert("Datos copiados al portapapeles.");
      } catch (error) {
        console.error(error);

        document.getElementById("areaDatosPerfilRehabPod").select();

        alert(
          "No se pudo copiar automáticamente. El texto quedó seleccionado, cópialo manualmente."
        );
      }
    }
  );

  document.getElementById("btnDescargarArchivoPerfilRehabPod").addEventListener(
    "click",

    () => {
      const exito = intentarDescargaArchivo(contenido, nombreArchivo);

      if (!exito) {
        alert(
          "No se pudo generar el archivo en este dispositivo. Usa el botón Copiar como alternativa."
        );
      }
    }
  );

  document.getElementById("btnCerrarDatosPerfilRehabPod").addEventListener(
    "click",

    cerrar
  );
}

function descargarMisDatos() {
  const perfil = obtenerPerfilActivo();

  if (!perfil) {
    alert("No hay un perfil activo.");

    return;
  }

  mostrarModalDatosPerfil(perfil);
}

function eliminarMiCuentaYDatos() {
  const perfil = obtenerPerfilActivo();

  if (!perfil) {
    return;
  }

  const confirmacion = confirm(
    `¿Eliminar el perfil de ${perfil.nombre} y todo su historial de este dispositivo? Esta acción no se puede deshacer.`
  );

  if (!confirmacion) {
    return;
  }

  const idAEliminar = perfil.id;

  datosApp.perfiles = datosApp.perfiles.filter((p) => p.id !== idAEliminar);

  if (datosApp.perfiles.length === 0) {
    // No dejamos la app sin ningún perfil: se crea uno nuevo y vacío,
    // sin ningún dato heredado del perfil que se acaba de eliminar.
    const nuevoId = Date.now().toString();

    datosApp.perfiles.push({
      id: nuevoId,

      nombre: "Jugador 1",

      historial: [],

      objetivo: 0.5,

      foto: "",

      consentimiento: {
        otorgado: false,

        motivo: "perfil_por_defecto",
      },
    });

    datosApp.perfilActivoId = nuevoId;
  } else {
    datosApp.perfilActivoId = datosApp.perfiles[0].id;
  }

  guardarDatos();

  actualizarNombresPerfil();

  actualizarResumenInicio();

  alert("Tus datos fueron eliminados de este dispositivo.");

  mostrarPantalla(pantallaInicio);
}

const btnDescargarMisDatos = document.getElementById("btnDescargarMisDatos");
const btnEliminarMiCuenta = document.getElementById("btnEliminarMiCuenta");

if (btnDescargarMisDatos) {
  btnDescargarMisDatos.onclick = descargarMisDatos;
}

if (btnEliminarMiCuenta) {
  btnEliminarMiCuenta.onclick = eliminarMiCuentaYDatos;
}

// =====================================================
// PANTALLA DE BIENVENIDA / SPLASH
// Se crea desde JavaScript para no obligarte a cambiar index.html.
// =====================================================

function crearPantallaInicioApp() {
  const splash = document.createElement("div");

  splash.id = "splashReactiPod";

  splash.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:14px;
        background:

            radial-gradient(circle at center, #123525 0%, #07111f 48%, #030712 100%);
        color:white;
        font-family:Arial, sans-serif;
        transition:opacity .45s ease;
        `;

  const perfil = obtenerPerfilActivo();

  const nombreBienvenida = perfil?.nombre || "deportista";

  splash.innerHTML = `
        <img
            src="logo-full.png"
            alt="RehabPod"
            style="
                width:220px;
                max-width:70vw;
                filter:drop-shadow(0 0 30px rgba(198,255,77,.18));
            "
        >
 
        <div
            style="
                margin-top:4px;
                font-size:20px;
                font-weight:800;
                color:#ffffff;
            "
        >
            ¡Bienvenido, ${escaparHTML(nombreBienvenida)}!
        </div>
 
        <div
            style="
                color:#9ca3af;
                font-size:14px;
            "
        >
            Prepárate para reaccionar más rápido.
        </div>
 
        <div
            style="
                margin-top:16px;
                width:38px;
                height:38px;
                border:4px solid rgba(255,255,255,.15);
                border-top-color:#22c55e;

                border-radius:50%;
                animation:reactiPodSpin .8s linear infinite;
            "
        ></div>
 
        <style>
            @keyframes reactiPodSpin {
                to { transform: rotate(360deg); }
            }
        </style>
        `;

  document.body.appendChild(splash);

  setTimeout(
    () => {
      splash.style.opacity = "0";

      setTimeout(() => splash.remove(), 500);
    },

    2400
  );
}

// =====================================================
// V9 - INTERFAZ MODERNA + NAVEGACION POR CATEGORIAS + FIX FEEDBACK
// =====================================================

function aplicarMejorasVisualesV8() {
  if (document.getElementById("estilosReactiPodV8")) return;

  const estilo = document.createElement("style");
  estilo.id = "estilosReactiPodV8";
  estilo.textContent = `
        :root {
            --rp-verde:#22c55e;
            --rp-verde-oscuro:#16a34a;
            --rp-panel:#0d1728;
            --rp-panel2:#111d31;
            --rp-borde:rgba(148,163,184,.16);
            --rp-texto:#f8fafc;
            --rp-muted:#94a3b8;
        }
 
        .pantalla.activa {
            animation: rpEntradaPantallaV8 .34s cubic-bezier(.2,.8,.2,1) both !important;
        }
 
        @keyframes rpEntradaPantallaV8 {
            from { opacity:0; transform:translateY(14px) scale(.992); }
            to { opacity:1; transform:translateY(0) scale(1); }
        }
 
        /* Encabezado de selección */
        #encabezadoModosV8 {
            margin:8px 0 20px;
            padding:18px;
            border-radius:22px;
            background:
                radial-gradient(circle at 12% 10%,rgba(34,197,94,.16),transparent 34%),
                linear-gradient(145deg,#101b2d,#09111f);
            border:1px solid rgba(34,197,94,.22);
        }
 
        #encabezadoModosV8 .rpEyebrow {
            color:#86efac;
            font-size:11px;
            font-weight:900;
            letter-spacing:1.4px;
            text-transform:uppercase;
        }
 
        #encabezadoModosV8 h2 {
            margin:6px 0 5px;
            font-size:26px;
            color:#f8fafc;
        }
 
        #encabezadoModosV8 p {
            margin:0;
            color:#94a3b8;
            line-height:1.45;
            font-size:13px;
        }
 
        .rpCategoriaModosV8 {
            margin:24px 0 10px;
        }
 
        .rpCategoriaCabeceraV8 {
            display:flex;
            align-items:center;
            gap:10px;
            margin-bottom:12px;
        }
 
        .rpCategoriaIconoV8 {
            width:38px;
            height:38px;
            border-radius:12px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#122038;
            border:1px solid rgba(148,163,184,.16);

            font-size:19px;
        }
 
        .rpCategoriaTituloV8 {
            font-size:18px;
            font-weight:900;
            color:#f8fafc;
        }
 
        .rpCategoriaSubtituloV8 {
            font-size:11px;
            color:#64748b;
            margin-top:2px;
        }
 
        .rpGridModosV8 {
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:12px;
        }
 
        .rpGridModosV8 .tarjetaEntrenamientoModo {
            min-height:164px !important;
            padding:20px !important;
            border-radius:22px !important;
            background:
                radial-gradient(circle at 88% 12%,rgba(34,197,94,.09),transparent 28%),
                linear-gradient(145deg,#111d31,#0a1322) !important;
            border:1px solid rgba(148,163,184,.16) !important;
            box-shadow:0 14px 32px rgba(0,0,0,.20) !important;
            display:flex !important;
            flex-direction:column;
            justify-content:center;
            align-items:flex-start;
            text-align:left;
            position:relative;
            overflow:hidden;
        }
 
        .rpGridModosV8 .tarjetaEntrenamientoModo::before {
            width:5px !important;
            background:linear-gradient(180deg,#4ade80,#16a34a) !important;
        }
 
        .rpGridModosV8 .tarjetaEntrenamientoModo > div:first-child {
            font-size:42px !important;
            line-height:1 !important;
            margin-bottom:14px !important;
            filter:drop-shadow(0 7px 14px rgba(0,0,0,.25));
        }
 
        .rpGridModosV8 .tarjetaEntrenamientoModo strong {
            font-size:18px !important;
            line-height:1.15;
            color:#f8fafc;
        }
 
        .rpGridModosV8 .tarjetaEntrenamientoModo small {
            font-size:12px !important;
            line-height:1.4 !important;
            color:#94a3b8 !important;
        }
 
        .rpGridModosV8 .tarjetaEntrenamientoModo:active {
            transform:scale(.975) !important;
            border-color:rgba(34,197,94,.6) !important;
        }
 
        /* Entrenamiento activo: objetivo enorme y Pods discretos */
        #pantallaEntrenamiento #colorObjetivo {
            width:min(58vw,220px) !important;
            height:min(58vw,220px) !important;
            min-width:min(58vw,220px) !important;
            min-height:min(58vw,220px) !important;

            border:7px solid rgba(255,255,255,.92) !important;
            box-shadow:
                0 0 0 10px rgba(255,255,255,.035),
                0 0 74px rgba(255,255,255,.20),
                0 22px 48px rgba(0,0,0,.30) !important;
            margin:18px auto !important;
            animation:rpObjetivoRespiraV8 1.1s ease-in-out infinite alternate !important;
        }
 
        @keyframes rpObjetivoRespiraV8 {
            from { transform:scale(.985); }
            to { transform:scale(1.035); }
        }
 
        #pantallaEntrenamiento #textoObjetivo {
            font-size:36px !important;
            font-weight:950 !important;
            line-height:1.02 !important;
            margin-top:10px !important;
        }
 
        #pantallaEntrenamiento #nombreColor {
            font-size:38px !important;
            font-weight:950 !important;
        }
 
        #pantallaEntrenamiento #cronometro {
            font-weight:900 !important;
            font-variant-numeric:tabular-nums;
        }
 
        .indicadoresPodsV8 {
            opacity:.72;
            transform:scale(.92);
            transition:opacity .2s ease;
        }
 
        .indicadoresPodsV8::before {
            content:"PODS";
            display:block;
            text-align:center;
            font-size:9px;
            font-weight:900;
            letter-spacing:1.6px;
            color:#64748b;
            margin-bottom:6px;
        }
 
        #luzPod1,#luzPod2,#luzPod3,#luzPod4 {
            width:34px !important;
            height:34px !important;
            min-width:34px !important;
            min-height:34px !important;
            border-width:2px !important;
            box-shadow:none;
        }
 
        /* Feedback de acierto/error */
        #pantallaEntrenamiento.rpFeedbackCorrectoV8 {
            animation:rpFeedbackCorrectoV8 .42s ease both;
        }
 
        #pantallaEntrenamiento.rpFeedbackErrorV8 {
            animation:rpFeedbackErrorV8 .46s ease both;
        }
 
        @keyframes rpFeedbackCorrectoV8 {
            0% { filter:none; }
            35% { filter:drop-shadow(0 0 18px rgba(34,197,94,.35)); }
            100% { filter:none; }
        }
 
        @keyframes rpFeedbackErrorV8 {
            0%,100% { transform:translateX(0); }
            25% { transform:translateX(-5px); }
            50% { transform:translateX(5px); }
            75% { transform:translateX(-3px); }
        }
 
        #mensajeResultado.rpMensajeCorrectoV8 {

            animation:rpMensajePopV8 .34s ease both;
        }
 
        #mensajeResultado.rpMensajeErrorV8 {
            animation:rpMensajeErrorV8 .38s ease both;
        }
 
        @keyframes rpMensajePopV8 {
            0% { opacity:.25; transform:scale(.88); }
            70% { transform:scale(1.06); }
            100% { opacity:1; transform:scale(1); }
        }
 
        @keyframes rpMensajeErrorV8 {
            0% { opacity:.25; transform:scale(.92); }
            45% { transform:scale(1.04); }
            100% { opacity:1; transform:scale(1); }
        }
 
        /* Resultados */
        #resumenResultadosV8 {
            margin:14px 0 20px;
            padding:20px;
            border-radius:24px;
            background:
                radial-gradient(circle at 84% 0%,rgba(34,197,94,.16),transparent 31%),
                linear-gradient(150deg,#111d31,#08111f);
            border:1px solid rgba(34,197,94,.24);
            box-shadow:0 18px 42px rgba(0,0,0,.26);
        }
 
        .rpResultadoSuperiorV8 {
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            gap:14px;
            margin-bottom:18px;
        }
 
        .rpResultadoSuperiorV8 .rpEyebrow {
            color:#86efac;
            font-size:10px;
            font-weight:900;
            letter-spacing:1.4px;
        }
 
        .rpResultadoSuperiorV8 h2 {
            margin:5px 0 0;
            color:#f8fafc;
            font-size:24px;
        }
 
        .rpResultadoBadgeV8 {
            flex:0 0 auto;
            padding:8px 11px;
            border-radius:999px;
            background:rgba(34,197,94,.12);
            border:1px solid rgba(34,197,94,.25);
            color:#86efac;
            font-size:11px;
            font-weight:900;
        }
 
        .rpMetricasV8 {
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:10px;
        }
 
        .rpMetricaV8 {
            padding:15px;
            border-radius:17px;
            background:rgba(15,23,42,.78);
            border:1px solid rgba(148,163,184,.13);
        }
 
        .rpMetricaV8 span {
            display:block;
            font-size:10px;
            color:#64748b;
            font-weight:900;
            letter-spacing:.8px;
            text-transform:uppercase;
        }
 
        .rpMetricaV8 strong {
            display:block;
            margin-top:5px;
            font-size:22px;
            color:#f8fafc;
            font-variant-numeric:tabular-nums;
        }
 
        .rpResultadoMensajeV8 {
            margin-top:14px;
            padding:12px 14px;
            border-radius:14px;
            background:rgba(34,197,94,.08);
            color:#bbf7d0;
            font-size:12px;

            line-height:1.45;
            border:1px solid rgba(34,197,94,.14);
        }
 
        #btnRepetirEntrenamientoReactiPod,
        #btnNuevoEntrenamiento {
            min-height:58px !important;
            border-radius:17px !important;
            font-size:15px !important;
            font-weight:950 !important;
            letter-spacing:.2px;
        }
 
        #btnNuevoEntrenamiento {
            background:#172033 !important;
            color:#f8fafc !important;
            border:1px solid #334155 !important;
        }
 
        #btnResultadosInicio {
            min-height:48px !important;
            opacity:.78;
        }
 
        @media (max-width:520px) {
            .rpGridModosV8 {
                grid-template-columns:1fr;
            }
 
            .rpGridModosV8 .tarjetaEntrenamientoModo {
                min-height:138px !important;
            }
 
            .rpResultadoSuperiorV8 {
                flex-direction:column;
            }
        }
 
        /* V9 - navegación de categorías en dos vistas */
        .rpVistaCategoriasV9 {
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:14px;
            margin-top:18px;
        }
 
        .rpCategoriaTarjetaV9 {
            width:100%;
            min-height:142px;
            border:1px solid rgba(148,163,184,.16);
            border-radius:24px;
            background:linear-gradient(145deg,rgba(20,31,48,.98),rgba(10,18,31,.98));
            color:#f8fafc;
            padding:20px;

            display:grid;
            grid-template-columns:auto 1fr auto;
            align-items:center;
            gap:16px;
            text-align:left;
            box-shadow:0 16px 34px rgba(0,0,0,.18);
            cursor:pointer;
            transition:transform .2s ease,border-color .2s ease;
        }
 
        .rpCategoriaTarjetaV9:active { transform:scale(.985); }
 
        .rpCategoriaIconoGrandeV9,
        .rpDetalleIconoV9 {
            width:62px;
            height:62px;
            border-radius:20px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:rgba(34,197,94,.1);
            border:1px solid rgba(34,197,94,.2);
            font-size:32px;
        }
 
        .rpCategoriaContenidoV9 {
            min-width:0;
            display:flex;
            flex-direction:column;
            gap:5px;
        }
 
        .rpCategoriaContenidoV9 strong { font-size:20px; line-height:1.05; }
        .rpCategoriaContenidoV9 span { color:#cbd5e1; font-size:13px; line-height:1.35; }
        .rpCategoriaContenidoV9 small {
            color:#22c55e;
            font-size:11px;
            font-weight:800;
            letter-spacing:.5px;
            text-transform:uppercase;
        }
        .rpCategoriaFlechaV9 { color:#64748b; font-size:34px; line-height:1; }
 
        .rpVistaDetalleCategoriaV9[hidden],
        .rpVistaCategoriasV9[hidden] { display:none !important; }
 
        .rpVolverCategoriaV9 {
            min-height:44px;
            border:1px solid rgba(148,163,184,.18);
            background:#0b1423;
            color:#cbd5e1;
            border-radius:14px;
            padding:10px 14px;
            font-weight:800;
            margin:14px 0;
        }
 
        .rpDetalleCabeceraV9 {
            display:flex;
            align-items:center;
            gap:16px;
            padding:18px;
            border-radius:22px;
            background:linear-gradient(145deg,#111d30,#091321);
            border:1px solid rgba(148,163,184,.14);
            margin-bottom:16px;
        }
 
        .rpDetalleTituloV9 { font-size:24px; font-weight:900; color:#f8fafc; margin-bottom:5px; }
        .rpDetalleDescripcionV9 { color:#94a3b8; font-size:13px; line-height:1.45; }
        .rpGridDetalleV9 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
 
        .rpEntraV9 { animation:rpEntraV9 .3s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes rpEntraV9 {
            from { opacity:0; transform:translateY(8px) scale(.99); }
            to { opacity:1; transform:translateY(0) scale(1); }
        }
 
        @media (max-width:640px) {
            .rpVistaCategoriasV9, .rpGridDetalleV9 { grid-template-columns:1fr; }
            .rpCategoriaTarjetaV9 { min-height:126px; padding:17px; }
        }
 
        @media (prefers-reduced-motion:reduce) {
            .pantalla.activa,
            #pantallaEntrenamiento #colorObjetivo,
            #pantallaEntrenamiento.rpFeedbackCorrectoV8,
            #pantallaEntrenamiento.rpFeedbackErrorV8,
            #mensajeResultado.rpMensajeCorrectoV8,
            #mensajeResultado.rpMensajeErrorV8 {
                animation:none !important;
            }
        }
    `;

  document.head.appendChild(estilo);
}

function organizarModosPorCategoriaV8() {
  const tarjetas = [...document.querySelectorAll(".tarjetaEntrenamientoModo")];
  if (!tarjetas.length) return;

  const contenedorOriginal = tarjetas[0].parentElement;
  if (!contenedorOriginal) return;

  let host = document.getElementById("categoriasEntrenamientoV8");

  if (!host) {
    host = document.createElement("div");
    host.id = "categoriasEntrenamientoV8";

    const encabezado = document.createElement("div");
    encabezado.id = "encabezadoModosV8";
    encabezado.innerHTML = `
            <div class="rpEyebrow">ENTRENAMIENTOS REACTIPOD</div>
            <h2>¿Qué quieres entrenar hoy?</h2>
            <p>Selecciona una categoría para descubrir los ejercicios disponibles.</p>
        `;

    contenedorOriginal.parentElement.insertBefore(encabezado, contenedorOriginal);
    contenedorOriginal.parentElement.insertBefore(host, contenedorOriginal);
    contenedorOriginal.style.display = "none";
  }

  const categorias = [
    {
      clave: "velocidad",
      icono: "⚡",
      titulo: "Velocidad",
      subtitulo: "Reacción rápida y ritmo continuo",
      descripcion: "Entrenamientos para responder más rápido ante estímulos visuales.",
      modos: ["simple", "persecucion", "contrarreloj"],
    },
    {
      clave: "coordinacion",
      icono: "🎯",
      titulo: "Coordinación",
      subtitulo: "Precisión y respuesta múltiple",
      descripcion: "Combina movimiento, precisión y control de varios estímulos.",
      modos: ["colores", "doble", "circuito"],
    },
    {
      clave: "memoria",
      icono: "🧠",
      titulo: "Memoria",
      subtitulo: "Atención y procesamiento",
      descripcion: "Ejercicios para recordar secuencias y responder con precisión.",
      modos: ["secuencia"],
    },
    {
      clave: "control",
      icono: "🛡️",
      titulo: "Control",
      subtitulo: "Decisión, inhibición y control manual",

      descripcion:
        "Entrena la toma de decisiones e incluye el modo de control directo para entrenadores.",
      modos: ["prohibido", "libre", "entrenador"],
    },
  ];

  host.innerHTML = `
        <div id="vistaCategoriasV9" class="rpVistaCategoriasV9"></div>
        <div id="vistaDetalleCategoriaV9" class="rpVistaDetalleCategoriaV9" hidden>
            <button id="btnVolverCategoriasV9" type="button" class="rpVolverCategoriaV9">← CATEGORÍAS</button>
            <div class="rpDetalleCabeceraV9">
                <div id="detalleIconoV9" class="rpDetalleIconoV9">⚡</div>
                <div>
                    <div id="detalleTituloV9" class="rpDetalleTituloV9">Velocidad</div>
                    <div id="detalleDescripcionV9" class="rpDetalleDescripcionV9"></div>
                </div>
            </div>
            <div id="gridDetalleCategoriaV9" class="rpGridModosV8 rpGridDetalleV9"></div>
        </div>
    `;

  const vistaCategorias = document.getElementById("vistaCategoriasV9");
  const vistaDetalle = document.getElementById("vistaDetalleCategoriaV9");
  const gridDetalle = document.getElementById("gridDetalleCategoriaV9");
  const encabezado = document.getElementById("encabezadoModosV8");

  function mostrarCategoriasV9() {
    vistaDetalle.hidden = true;
    vistaCategorias.hidden = false;
    vistaCategorias.classList.remove("rpEntraV9");
    void vistaCategorias.offsetWidth;
    vistaCategorias.classList.add("rpEntraV9");

    if (encabezado) {
      encabezado.querySelector("h2").textContent = "¿Qué quieres entrenar hoy?";
      encabezado.querySelector("p").textContent =
        "Selecciona una categoría para descubrir los ejercicios disponibles.";
    }
  }

  function abrirCategoriaV9(categoria) {
    gridDetalle.innerHTML = "";

    categoria.modos.forEach((modo) => {
      const tarjeta = tarjetas.find((t) => t.dataset.modo === modo);
      if (tarjeta) gridDetalle.appendChild(tarjeta);
    });

    document.getElementById("detalleIconoV9").textContent = categoria.icono;
    document.getElementById("detalleTituloV9").textContent = categoria.titulo;
    document.getElementById("detalleDescripcionV9").textContent = categoria.descripcion;

    vistaCategorias.hidden = true;
    vistaDetalle.hidden = false;
    vistaDetalle.classList.remove("rpEntraV9");
    void vistaDetalle.offsetWidth;
    vistaDetalle.classList.add("rpEntraV9");

    if (encabezado) {
      encabezado.querySelector("h2").textContent = categoria.titulo;
      encabezado.querySelector("p").textContent = categoria.subtitulo;
    }
  }

  categorias.forEach((categoria) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "rpCategoriaTarjetaV9";
    boton.dataset.categoria = categoria.clave;
    boton.innerHTML = `
            <div class="rpCategoriaIconoGrandeV9">${categoria.icono}</div>
            <div class="rpCategoriaContenidoV9">
                <strong>${categoria.titulo}</strong>
                <span>${categoria.subtitulo}</span>
                <small>${categoria.modos.length} ${categoria.modos.length === 1 ? "entrenamiento" : "entrenamientos"}</small>
            </div>
            <div class="rpCategoriaFlechaV9">›</div>
        `;
    boton.addEventListener("click", () => abrirCategoriaV9(categoria));
    vistaCategorias.appendChild(boton);
  });

  document
    .getElementById("btnVolverCategoriasV9")
    .addEventListener("click", mostrarCategoriasV9);

  if (btnVolverTipos && btnVolverTipos.dataset.v9Categorias !== "1") {
    btnVolverTipos.dataset.v9Categorias = "1";
    const volverOriginal = btnVolverTipos.onclick;

    btnVolverTipos.onclick = () => {
      if (!vistaDetalle.hidden) {
        mostrarCategoriasV9();
        return;
      }

      if (typeof volverOriginal === "function") volverOriginal();
    };
  }

  if (btnEntrenamiento && btnEntrenamiento.dataset.v9Categorias !== "1") {
    btnEntrenamiento.dataset.v9Categorias = "1";
    btnEntrenamiento.addEventListener("click", () => setTimeout(mostrarCategoriasV9, 0));
  }

  window.mostrarCategoriasEntrenamientoV9 = mostrarCategoriasV9;
  mostrarCategoriasV9();
}

function prepararIndicadoresPodsV8() {
  const padres = lucesPods
    .filter(Boolean)
    .map((luz) => luz.parentElement)
    .filter(Boolean);

  if (!padres.length) return;

  const primero = padres[0];

  if (padres.every((p) => p === primero)) {
    primero.classList.add("indicadoresPodsV8");
  }
}

function iniciarFeedbackVisualV8() {
  if (!mensajeResultado || mensajeResultado.dataset.observadorV8 === "1") return;

  mensajeResultado.dataset.observadorV8 = "1";
  let ultimoTexto = "";

  const disparar = () => {
    const texto = mensajeResultado.textContent.trim();
    if (!texto || texto === ultimoTexto) return;

    const esCorrecto = mensajeResultado.classList.contains("mensajeCorrecto");
    const esError = mensajeResultado.classList.contains("mensajeError");
    if (!esCorrecto && !esError) return;

    ultimoTexto = texto;

    // V9: animamos sin modificar las clases observadas.
    // En V8 el MutationObserver observaba cambios de clase y, al mismo tiempo,
    // cambiaba esas mismas clases. Eso podía crear un ciclo y congelar la app.
    if (typeof mensajeResultado.animate === "function") {
      mensajeResultado.animate(
        esCorrecto
          ? [
              { transform: "scale(.94)", opacity: 0.72 },
              { transform: "scale(1.08)", opacity: 1, offset: 0.55 },
              { transform: "scale(1)", opacity: 1 },
            ]
          : [
              { transform: "translateX(0)" },
              { transform: "translateX(-8px)" },

              { transform: "translateX(8px)" },
              { transform: "translateX(-5px)" },
              { transform: "translateX(0)" },
            ],
        { duration: esCorrecto ? 340 : 390, easing: "ease-out" }
      );
    }

    if (typeof pantallaEntrenamiento.animate === "function") {
      pantallaEntrenamiento.animate(
        esCorrecto
          ? [
              { filter: "brightness(1)" },
              { filter: "brightness(1.10)", offset: 0.45 },
              { filter: "brightness(1)" },
            ]
          : [
              { transform: "translateX(0)" },
              { transform: "translateX(-5px)" },
              { transform: "translateX(5px)" },
              { transform: "translateX(0)" },
            ],
        { duration: 360, easing: "ease-out" }
      );
    }

    setTimeout(() => {
      if (mensajeResultado.textContent.trim() === texto) ultimoTexto = "";
    }, 500);
  };

  const observador = new MutationObserver(disparar);

  // Solo contenido: no se observan atributos/clases para evitar retroalimentación.
  observador.observe(mensajeResultado, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

function obtenerRecordPersonalV8(perfil, nombreModo, mejorActual) {
  const historialMismoModo = (perfil.historial || []).filter(
    (ent) => ent && ent.modo === nombreModo
  );

  if (modoActual === "contrarreloj") {
    const anteriores = historialMismoModo
      .map((ent) => Number(ent.aciertos))
      .filter(Number.isFinite);

    const recordPrevio = anteriores.length ? Math.max(...anteriores) : null;
    const recordActual = Math.max(recordPrevio ?? 0, aciertos);

    return {
      etiqueta: "RÉCORD PERSONAL",
      valor: `${recordActual} aciertos`,
      nuevo: recordPrevio === null || aciertos > recordPrevio,
    };
  }

  const anteriores = historialMismoModo
    .map((ent) => ent.mejor)
    .filter((valor) => typeof valor === "number" && Number.isFinite(valor));

  const recordPrevio = anteriores.length ? Math.min(...anteriores) : null;

  if (typeof mejorActual !== "number" || !Number.isFinite(mejorActual)) {
    return {
      etiqueta: "RÉCORD PERSONAL",
      valor: recordPrevio === null ? "--" : `${recordPrevio.toFixed(3)} s`,
      nuevo: false,
    };
  }

  const recordActual =
    recordPrevio === null ? mejorActual : Math.min(recordPrevio, mejorActual);

  return {
    etiqueta: "RÉCORD PERSONAL",
    valor: `${recordActual.toFixed(3)} s`,
    nuevo: recordPrevio === null || mejorActual < recordPrevio,
  };
}

function construirResumenResultadosV8(datos) {
  const perfil = obtenerPerfilActivo();
  const nombreModo = obtenerNombreModo();
  const totalRespuestas = aciertos + errores;
  const precision = totalRespuestas > 0 ? (aciertos / totalRespuestas) * 100 : 0;

  const record = obtenerRecordPersonalV8(perfil, nombreModo, datos.mejor);

  let panel = document.getElementById("resumenResultadosV8");

  if (!panel) {
    panel = document.createElement("section");
    panel.id = "resumenResultadosV8";

    const referencia = listaResultados || btnNuevoEntrenamiento;
    if (referencia && referencia.parentElement) {
      referencia.parentElement.insertBefore(panel, referencia);
    } else {
      pantallaResultados.appendChild(panel);
    }
  }

  const promedioTexto =
    typeof datos.promedio === "number" ? `${datos.promedio.toFixed(3)} s` : "--";

  const mensajeRecord = record.nuevo
    ? "🏆 ¡Nuevo récord personal! Tu mejor marca acaba de mejorar."
    : "Sigue entrenando para superar tu mejor marca en este modo.";

  panel.innerHTML = `
        <div class="rpResultadoSuperiorV8">
            <div>
                <div class="rpEyebrow">ENTRENAMIENTO COMPLETADO</div>
                <h2>${escaparHTML(nombreModo)}</h2>
            </div>
            <div class="rpResultadoBadgeV8">${record.nuevo ? "NUEVO RÉCORD" : "RESULTADO GUARDADO"}</div>
        </div>
 
        <div class="rpMetricasV8">
            <div class="rpMetricaV8">
                <span>${record.etiqueta}</span>
                <strong>${record.valor}</strong>
            </div>
            <div class="rpMetricaV8">
                <span>PROMEDIO</span>
                <strong>${promedioTexto}</strong>
            </div>
            <div class="rpMetricaV8">
                <span>PRECISIÓN</span>
                <strong>${precision.toFixed(1)} %</strong>
            </div>
            <div class="rpMetricaV8">
                <span>ACIERTOS</span>
                <strong>${aciertos}</strong>
            </div>
        </div>
 
        <div class="rpResultadoMensajeV8">${mensajeRecord}</div>
    `;

  if (btnNuevoEntrenamiento) {
    btnNuevoEntrenamiento.textContent = "🎯 CAMBIAR MODO";
  }

  const repetir = document.getElementById("btnRepetirEntrenamientoReactiPod");
  if (repetir) {
    repetir.textContent = "🔁 REPETIR ENTRENAMIENTO";
  }
}

const mostrarResultadosBaseV8 = mostrarResultados;
mostrarResultados = function () {
  const tiempos = resultados
    .filter((resultado) => typeof resultado.tiempo === "number")
    .map((resultado) => resultado.tiempo);

  const mejor = tiempos.length ? Math.min(...tiempos) : null;
  const promedio = tiempos.length
    ? tiempos.reduce((suma, valor) => suma + valor, 0) / tiempos.length
    : null;

  // El panel se construye antes de guardar la sesión actual,
  // así podemos detectar correctamente si acaba de romperse el récord previo.
  construirResumenResultadosV8({ mejor, promedio });
  mostrarResultadosBaseV8();
};

// =====================================================
// V11 - AJUSTE DE ENCABEZADOS
// Alinea títulos de Entrenamientos, Progreso e Historial
// hacia la izquierda para mejorar equilibrio visual móvil.
// =====================================================

function ajustarEncabezadosV11() {
  const pantallas = [
    pantallaTiposEntrenamiento,
    pantallaProgreso,
    pantallaEstadisticas,
  ].filter(Boolean);

  pantallas.forEach((pantalla) => {
    const titulo = pantalla.querySelector("h1, h2");
    if (!titulo) return;

    // El título normalmente vive dentro de un bloque junto al botón volver.
    // Forzamos la alineación del bloque y del texto sin alterar la navegación.
    const bloqueTitulo = titulo.parentElement;

    titulo.style.setProperty("text-align", "left", "important");
    titulo.style.setProperty("margin-left", "0", "important");
    titulo.style.setProperty("margin-right", "0", "important");

    if (bloqueTitulo) {
      bloqueTitulo.style.setProperty("text-align", "left", "important");
      bloqueTitulo.style.setProperty("margin-left", "18px", "important");
      bloqueTitulo.style.setProperty("margin-right", "auto", "important");
      bloqueTitulo.style.setProperty("flex", "1 1 auto", "important");
      bloqueTitulo.style.setProperty("min-width", "0", "important");
    }
  });
}

function inicializarInterfazV8() {
  aplicarMejorasVisualesV8();
  organizarModosPorCategoriaV8();
  prepararIndicadoresPodsV8();
  iniciarFeedbackVisualV8();
}

// =====================================================
// INICIO
// =====================================================

cargarDatos();

cargarAjustes();

crearPantallaInicioApp();

actualizarNombresPerfil();

actualizarFotoPerfilInicio();

actualizarEstadoGeneralPods();

actualizarResumenInicio();

crearControlesExperienciaEntrenamiento();

aplicarMejorasVisualesV7();

inicializarInterfazV8();

ajustarEncabezadosV11();

configurarModo();

// En Android busca automaticamente ReactiPods encendidos.
iniciarReconexionAutomatica();

// Gate de Términos y Privacidad (una sola vez por dispositivo).
mostrarGateTerminos();

// =====================================================
// V15 - ORDEN VISUAL DEFINITIVO DE CONFIGURACIÓN
// Cabecera -> descripción -> finalizar por -> colores (si aplica)
// -> dificultad -> sonidos/pods -> iniciar
// =====================================================
function bloqueDirectoConfiguracionV15(elemento) {
  if (!elemento || !pantallaConfiguracion) return null;
  let nodo = elemento;
  while (nodo && nodo.parentElement && nodo.parentElement !== pantallaConfiguracion) {
    nodo = nodo.parentElement;
  }
  return nodo && nodo.parentElement === pantallaConfiguracion ? nodo : null;
}

function insertarDespuesV15(referencia, nodo) {
  if (!referencia || !nodo || referencia === nodo) return referencia || nodo;
  if (nodo.parentElement !== pantallaConfiguracion) return referencia;
  referencia.insertAdjacentElement("afterend", nodo);
  return nodo;
}

function ordenarConfiguracionV15() {
  if (!pantallaConfiguracion || !descripcionModo) return;

  const panel = document.getElementById("panelExperienciaReactiPod");
  if (!panel) return;

  // El panel dinámico (Finalizar por / Colores fijos / Dificultad) va
  // siempre justo después de la tarjeta de descripción del modo, y por
  // lo tanto antes de la tarjeta de Sonidos/Pods disponibles y del botón
  // de inicio (que ya vienen en ese orden en el HTML base).
  if (descripcionModo.nextElementSibling !== panel) {
    descripcionModo.insertAdjacentElement("afterend", panel);
  }

  panel.style.setProperty("margin-top", "0", "important");
  panel.style.setProperty("margin-bottom", "16px", "important");
}

// Ejecutar el orden cada vez que se cambia/configura un modo.
const configurarModoBaseV15 = configurarModo;
configurarModo = function () {
  configurarModoBaseV15();
  ordenarConfiguracionV15();
};

// =====================================================
// V15 - MODO ENTRENADOR ACTIVO
// Cabecera -> ronda/tiempo -> cronómetro -> objetivo -> control manual
// -> botones del entrenador -> métricas -> pausa/cancelar
// =====================================================
function ordenarEntrenadorActivoV15() {
  if (!pantallaEntrenamiento || modoActual !== "entrenador") return;

  const panel = document.getElementById("panelEntrenadorActivoReactiPod");
  if (!panel) return;

  // nombreColor vive dentro de la tarjeta central que contiene:
  // ELIGE UN POD -> círculo -> CONTROL MANUAL.
  const zonaObjetivoRef = nombreColor ? nombreColor.closest(".zonaObjetivo") : null;

  if (zonaObjetivoRef && zonaObjetivoRef.nextElementSibling !== panel) {
    zonaObjetivoRef.insertAdjacentElement("afterend", panel);
  }

  panel.style.setProperty("margin-top", "10px", "important");
  panel.style.setProperty("margin-bottom", "12px", "important");
}

const mostrarPanelEntrenadorActivoBaseV15 = mostrarPanelEntrenadorActivo;
mostrarPanelEntrenadorActivo = function (mostrar) {
  mostrarPanelEntrenadorActivoBaseV15(mostrar);
  if (mostrar) {
    ordenarEntrenadorActivoV15();
  }
};

// Refuerzo de estilo del panel manual para replicar la jerarquía solicitada.
(function aplicarEstiloEntrenadorV15() {
  if (document.getElementById("estiloEntrenadorV15")) return;
  const estilo = document.createElement("style");
  estilo.id = "estiloEntrenadorV15";
  estilo.textContent = `
        #panelEntrenadorActivoReactiPod {
            padding:19px !important;
            border-radius:14px !important;
            background:var(--tarjeta) !important;
            border:1px solid var(--borde) !important;
        }
        #panelEntrenadorActivoReactiPod > div:first-child {
            margin-bottom:8px !important;
            font-size:11px !important;
            letter-spacing:.04em !important;
        }
        #gridEntrenadorActivoReactiPod {
            grid-template-columns:repeat(2,minmax(0,1fr)) !important;
            gap:8px !important;
        }
        .btnPodEntrenadorActivo {
            min-height:48px !important;
            border-radius:12px !important;
            font-size:12px !important;
        }
        @media(max-width:420px){
            .btnPodEntrenadorActivo { font-size:11px !important; }
        }
    `;
  document.head.appendChild(estilo);
})();

// Aplicar de inmediato a la pantalla actualmente cargada.
ordenarConfiguracionV15();

// =====================================================
// REHABPOD V17
// BLE GENERICO + CANTIDAD VARIABLE DE PODS + MINIMOS POR MODO
// PEGAR ESTE BLOQUE AL FINAL DE app.js
// =====================================================

var REHABPOD_MAX_PODS = 4;
var REHABPOD_CLAVE_CANTIDAD = "rehabpodCantidadPods";
var cantidadPodsSeleccionada = Number(localStorage.getItem(REHABPOD_CLAVE_CANTIDAD) || 4);

var MINIMO_PODS_POR_MODO = {
  simple: 1,
  colores: 2,
  secuencia: 2,
  libre: 1,
  persecucion: 2,
  doble: 2,
  prohibido: 2,
  circuito: 2,
  contrarreloj: 1,
  entrenador: 1,
};

function rehabMinimoPodsModo(modo) {
  return MINIMO_PODS_POR_MODO[modo] || 1;
}

function rehabIndicesPodsConectados() {
  return podsBLE
    .map((pod, indice) => (pod && pod.conectado ? indice : -1))
    .filter((indice) => indice >= 0);
}

function rehabIndicesPodsActivos() {
  var conectados = rehabIndicesPodsConectados();
  var cantidad = Math.max(
    rehabMinimoPodsModo(modoActual),
    Math.min(Number(cantidadPodsSeleccionada) || 1, REHABPOD_MAX_PODS)
  );
  return conectados.slice(0, cantidad);
}

function rehabEsPodActivo(indice) {
  return rehabIndicesPodsActivos().includes(indice);
}

function rehabNumeroVisiblePod(indice) {
  var activos = rehabIndicesPodsActivos();
  var posicion = activos.indexOf(indice);
  return posicion >= 0 ? posicion + 1 : indice + 1;
}

function rehabElegirPodActivo(excluidos) {
  excluidos = Array.isArray(excluidos) ? excluidos : [];
  var disponibles = rehabIndicesPodsActivos().filter(
    (indice) => !excluidos.includes(indice)
  );

  if (!disponibles.length) {
    return -1;
  }

  return disponibles[Math.floor(Math.random() * disponibles.length)];
}

function rehabMezclarCopia(array) {
  return mezclar(array.slice());
}

// =====================================================
// INTERFAZ: CONEXION GENERICA
// Los ESP32 pueden seguir anunciandose como ReactiPod-1, -2, -3 y -4.
// La app ya no exige que un nombre concreto vaya en un espacio concreto.
// =====================================================

function rehabActualizarInterfazConexionGenerica() {
  var filas = document.querySelectorAll(".conexionPod");

  filas.forEach((fila, indice) => {
    var titulo = fila.querySelector(".datosConexionPod strong");
    var estado = estadosConexion[indice];
    var pod = podsBLE[indice];

    if (titulo) {
      titulo.textContent = `RehabPod ${indice + 1}`;
    }

    if (estado && pod && pod.conectado) {
      estado.textContent = pod.nombre ? `Conectado · ${pod.nombre}` : "Conectado";
    }
  });

  if (pantallaPods) {
    var subtitulo = pantallaPods.querySelector(".cabeceraSecundaria p");
    if (subtitulo) {
      subtitulo.textContent = "Conecta cualquier RehabPod disponible";
    }
  }
}

// =====================================================
// INTERFAZ: SELECTOR DE CANTIDAD DE PODS
// =====================================================

function rehabCrearControlCantidadPods() {
  var existente = document.getElementById("controlCantidadPodsRehabPod");
  if (existente) {
    return existente;
  }

  var panel = document.createElement("div");
  panel.id = "controlCantidadPodsRehabPod";
  panel.className = "tarjeta";
  panel.style.marginTop = "12px";
  panel.innerHTML = `
    <label for="cantidadPodsEntrenamientoRehabPod" style="display:block;font-weight:800;margin-bottom:8px;">
      Cantidad de Pods para este entrenamiento
    </label>
    <select id="cantidadPodsEntrenamientoRehabPod" style="width:100%;">
    </select>
    <small id="ayudaCantidadPodsRehabPod" style="display:block;margin-top:8px;line-height:1.4;opacity:.78;">
    </small>
  `;

  if (descripcionModo && descripcionModo.parentElement) {
    descripcionModo.insertAdjacentElement("afterend", panel);
  } else if (btnComenzar && btnComenzar.parentElement) {
    btnComenzar.parentElement.insertBefore(panel, btnComenzar);
  }

  var selector = panel.querySelector("#cantidadPodsEntrenamientoRehabPod");
  selector.addEventListener("change", () => {
    cantidadPodsSeleccionada = Number(selector.value) || 1;
    localStorage.setItem(REHABPOD_CLAVE_CANTIDAD, String(cantidadPodsSeleccionada));
    rehabActualizarControlCantidadPods();
    rehabActualizarDescripcionModo();
    rehabActualizarVisualesPodsActivos();
  });

  return panel;
}

function rehabActualizarControlCantidadPods() {
  var panel = rehabCrearControlCantidadPods();
  var selector = panel.querySelector("#cantidadPodsEntrenamientoRehabPod");
  var ayuda = panel.querySelector("#ayudaCantidadPodsRehabPod");
  var minimo = rehabMinimoPodsModo(modoActual);
  var conectados = cantidadConectados();

  cantidadPodsSeleccionada = Math.max(
    minimo,
    Math.min(Number(cantidadPodsSeleccionada) || minimo, REHABPOD_MAX_PODS)
  );

  selector.innerHTML = "";

  for (var cantidad = minimo; cantidad <= REHABPOD_MAX_PODS; cantidad++) {
    var opcion = document.createElement("option");
    opcion.value = String(cantidad);
    opcion.textContent = cantidad === 1 ? "1 Pod" : `${cantidad} Pods`;
    selector.appendChild(opcion);
  }

  selector.value = String(cantidadPodsSeleccionada);
  localStorage.setItem(REHABPOD_CLAVE_CANTIDAD, String(cantidadPodsSeleccionada));

  if (ayuda) {
    ayuda.textContent = `Mínimo para este modo: ${minimo} ${minimo === 1 ? "Pod" : "Pods"} · Conectados ahora: ${conectados} de ${REHABPOD_MAX_PODS}`;
  }
}

function rehabActualizarEtiquetasMinimoPods() {
  document.querySelectorAll("[data-modo]").forEach((tarjeta) => {
    var modo = tarjeta.dataset.modo;
    if (!MINIMO_PODS_POR_MODO[modo]) {
      return;
    }

    var minimo = rehabMinimoPodsModo(modo);
    var etiqueta = tarjeta.querySelector(".etiquetaFisico, .rehabMinimoPods");

    if (!etiqueta) {
      etiqueta = document.createElement("span");
      etiqueta.className = "rehabMinimoPods";
      etiqueta.style.cssText =
        "display:inline-block;margin-top:10px;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:.04em;background:rgba(34,197,94,.13);border:1px solid rgba(34,197,94,.35);color:#86efac;";
      tarjeta.appendChild(etiqueta);
    }

    etiqueta.textContent = `MÍN. ${minimo} ${minimo === 1 ? "POD" : "PODS"}`;
  });

  var tarjetaCircuito = document.querySelector('[data-modo="circuito"]');
  if (tarjetaCircuito) {
    var titulo = tarjetaCircuito.querySelector("h3, strong");
    if (titulo) {
      titulo.textContent = "Circuito de Pods";
    }
  }
}

function rehabActualizarDescripcionModo() {
  if (!descripcionModo) {
    return;
  }

  var cantidad = Number(cantidadPodsSeleccionada) || rehabMinimoPodsModo(modoActual);
  var plural = cantidad === 1 ? "Pod seleccionado" : `${cantidad} Pods seleccionados`;

  var descripciones = {
    simple: `Uno de los ${plural} se encenderá aleatoriamente y cambiará de color entre estímulos. Golpea únicamente el Pod iluminado.`,
    colores: `Los ${plural} mostrarán colores diferentes. La pantalla te indicará qué color debes buscar y tocar.`,
    secuencia: `Memoriza y repite una secuencia utilizando los ${plural}. La secuencia crece progresivamente.`,
    libre: `Golpea libremente cualquiera de los ${plural}. RehabPod registrará el intervalo entre cada golpe.`,
    persecucion: `Persigue el estímulo entre los ${plural}. Después de cada acierto aparecerá rápidamente un nuevo objetivo.`,
    doble: `Dos de los ${plural} se encenderán al mismo tiempo. Debes tocar ambos; el tiempo termina al presionar el segundo objetivo correcto.`,
    prohibido: `Los ${plural} mostrarán colores diferentes. NO toques el color prohibido indicado en pantalla; toca cualquiera de los otros.`,
    circuito: `Completa los ${plural} una vez por ronda. El orden cambia aleatoriamente y aparece un Pod a la vez.`,
    contrarreloj: `Durante el tiempo seleccionado, toca tantos objetivos correctos como puedas utilizando los ${plural}.`,
    entrenador: `El entrenador controla manualmente cuál de los ${plural} se enciende en cada estímulo.`,
  };

  descripcionModo.textContent = descripciones[modoActual] || descripcionModo.textContent;

  if (modoActual === "circuito" && tituloConfiguracion) {
    tituloConfiguracion.textContent = "Circuito de Pods";
  }
}

function rehabActualizarVisualesPodsActivos() {
  if (!entrenamientoActivo) {
    return;
  }

  var activos = rehabIndicesPodsActivos();
  var botones = document.querySelectorAll(".pod[data-pod]");

  botones.forEach((boton) => {
    var indice = Number(boton.dataset.pod);
    var activo = activos.includes(indice);
    boton.style.display = activo ? "" : "none";

    var texto = boton.querySelector("strong");
    if (texto && activo) {
      texto.textContent = `POD ${rehabNumeroVisiblePod(indice)}`;
    }
  });
}

function rehabRestaurarVisualesPods() {
  document.querySelectorAll(".pod[data-pod]").forEach((boton) => {
    boton.style.display = "";
  });
}

// =====================================================
// BLE MANUAL: CUALQUIER POD COMPATIBLE PUEDE OCUPAR CUALQUIER ESPACIO
// =====================================================

conectarPodNativo = async function (indice) {
  var pod = podsBLE[indice];

  try {
    await inicializarBLENativo();
    estadosConexion[indice].textContent = "Buscando RehabPod...";

    var dispositivo = await BluetoothLe.requestDevice({
      services: [SERVICE_UUID],
      optionalServices: [SERVICE_UUID],
    });

    if (!dispositivo || !dispositivo.deviceId) {
      throw new Error("No se obtuvo el identificador BLE.");
    }

    var duplicado = podsBLE.findIndex(
      (otro, otroIndice) =>
        otroIndice !== indice &&
        otro &&
        otro.conectado &&
        otro.deviceId === dispositivo.deviceId
    );

    if (duplicado >= 0) {
      alert(`Ese Pod ya está conectado como RehabPod ${duplicado + 1}.`);
      estadosConexion[indice].textContent = "Selecciona otro Pod";
      return;
    }

    // Si el mismo deviceId estaba recordado en otro espacio desconectado,
    // liberamos ese registro para poder asignarlo al espacio elegido.
    podsBLE.forEach((otro, otroIndice) => {
      if (
        otroIndice !== indice &&
        otro &&
        !otro.conectado &&
        otro.deviceId === dispositivo.deviceId
      ) {
        otro.deviceId = null;
        otro.device = null;
      }
    });

    pod.nombre = dispositivo.name || pod.nombre || `RehabPod ${indice + 1}`;
    pod.deviceId = dispositivo.deviceId;
    pod.device = dispositivo;

    guardarPodRegistrado(indice, dispositivo);
    estadosConexion[indice].textContent = "Conectando...";

    await limpiarListenersPod(pod);

    try {
      await BluetoothLe.disconnect({ deviceId: pod.deviceId });
    } catch (error) {
      // Normal si Android no lo tenía conectado.
    }

    await new Promise((resolver) => setTimeout(resolver, 250));

    pod.disconnectListener = await BluetoothLe.addListener(
      `disconnected|${pod.deviceId}`,
      () => podDesconectado(indice)
    );

    await BluetoothLe.connect({ deviceId: pod.deviceId });
    await prepararNotificacionesPod(indice);
    marcarPodConectado(indice);
    await enviarComandoPod(indice, "off");

    rehabActualizarInterfazConexionGenerica();
  } catch (error) {
    console.error("Error conectando RehabPod:", error);
    marcarPodNoConectado(indice, "No conectado");
    alert("No se pudo conectar el Pod seleccionado.");
  }
};

conectarPodWeb = async function (indice) {
  if (!navigator.bluetooth) {
    alert("Web Bluetooth no está disponible. Usa Chrome o Edge.");
    return;
  }

  var pod = podsBLE[indice];

  try {
    estadosConexion[indice].textContent = "Buscando RehabPod...";

    var device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }],
      optionalServices: [SERVICE_UUID],
    });

    var duplicado = podsBLE.findIndex(
      (otro, otroIndice) =>
        otroIndice !== indice &&
        otro &&
        otro.conectado &&
        otro.device &&
        otro.device.id === device.id
    );

    if (duplicado >= 0) {
      alert(`Ese Pod ya está conectado como RehabPod ${duplicado + 1}.`);
      estadosConexion[indice].textContent = "Selecciona otro Pod";
      return;
    }

    pod.nombre = device.name || pod.nombre || `RehabPod ${indice + 1}`;
    pod.device = device;

    device.addEventListener("gattserverdisconnected", () => {
      podDesconectado(indice);
    });

    var servidor = await device.gatt.connect();
    var servicio = await servidor.getPrimaryService(SERVICE_UUID);
    pod.commandChar = await servicio.getCharacteristic(COMMAND_UUID);
    pod.buttonChar = await servicio.getCharacteristic(BUTTON_UUID);

    await pod.buttonChar.startNotifications();
    pod.buttonChar.addEventListener("characteristicvaluechanged", (evento) => {
      recibirBotonFisicoWeb(indice, evento);
    });

    pod.conectado = true;
    estadosConexion[indice].textContent = `Conectado · ${pod.nombre}`;
    estadosConexion[indice].classList.add("conectadoTexto");
    botonesConexion[indice].textContent = "CONECTADO";
    botonesConexion[indice].classList.add("conectado");

    await enviarComandoPod(indice, "off");
    actualizarEstadoGeneralPods();
    rehabActualizarInterfazConexionGenerica();
  } catch (error) {
    console.error(error);
    estadosConexion[indice].textContent = "No conectado";
    actualizarEstadoGeneralPods();
  }
};

// =====================================================
// RECONECTAR CUALQUIER POD ENCONTRADO POR SERVICE_UUID
// =====================================================

buscarPodsParaReconectar = async function () {
  if (!usarBLENativo() || reconexionAutomaticaEnCurso) {
    return;
  }

  if (cantidadConectados() >= podsBLE.length) {
    return;
  }

  reconexionAutomaticaEnCurso = true;
  var listenerEscaneo = null;

  try {
    await inicializarBLENativo();
    var encontrados = new Map();

    listenerEscaneo = await BluetoothLe.addListener("onScanResult", (resultado) => {
      var dispositivo = resultado?.device;
      if (!dispositivo || !dispositivo.deviceId) {
        return;
      }

      var nombre = resultado?.localName || dispositivo.name || "RehabPod";
      encontrados.set(dispositivo.deviceId, {
        name: nombre,
        deviceId: dispositivo.deviceId,
      });
    });

    await BluetoothLe.requestLEScan({ services: [SERVICE_UUID] });
    await new Promise((resolver) => setTimeout(resolver, 3000));

    try {
      await BluetoothLe.stopLEScan();
    } catch (error) {}

    if (listenerEscaneo) {
      try {
        await listenerEscaneo.remove();
      } catch (error) {}
      listenerEscaneo = null;
    }

    for (var dispositivo of encontrados.values()) {
      var yaConectado = podsBLE.some(
        (pod) => pod.conectado && pod.deviceId === dispositivo.deviceId
      );
      if (yaConectado) {
        continue;
      }

      // Primero intenta recuperar el mismo espacio donde ese deviceId ya estaba guardado.
      var indice = podsBLE.findIndex(
        (pod) => !pod.conectado && pod.deviceId === dispositivo.deviceId
      );

      // Si es un Pod nuevo, usa el primer espacio libre.
      if (indice < 0) {
        indice = podsBLE.findIndex((pod) => !pod.conectado);
      }

      if (indice < 0) {
        break;
      }

      podsBLE[indice].nombre = dispositivo.name || `RehabPod ${indice + 1}`;
      await conectarPodEncontrado(indice, dispositivo);
      await new Promise((resolver) => setTimeout(resolver, 350));
    }
  } catch (error) {
    console.log("Escaneo automático RehabPod:", error);
  } finally {
    try {
      await BluetoothLe.stopLEScan();
    } catch (error) {}

    if (listenerEscaneo) {
      try {
        await listenerEscaneo.remove();
      } catch (error) {}
    }

    reconexionAutomaticaEnCurso = false;
    rehabActualizarInterfazConexionGenerica();
    actualizarEstadoGeneralPods();
  }
};

// =====================================================
// ESTADO GENERAL DE PODS
// =====================================================

actualizarEstadoGeneralPods = function () {
  var cantidad = cantidadConectados();
  var objetivo = Math.max(1, Number(cantidadPodsSeleccionada) || 1);

  textoEstadoPods.textContent = `${cantidad} de ${REHABPOD_MAX_PODS}`;
  cantidadPodsConectados.textContent = `${cantidad} / ${REHABPOD_MAX_PODS}`;

  if (podsListosConfiguracion) {
    podsListosConfiguracion.textContent = `${cantidad} conectados`;
  }

  indicadorPods.classList.remove("desconectado", "parcial", "conectado");

  if (cantidad === 0) {
    indicadorPods.classList.add("desconectado");
  } else if (cantidad < objetivo) {
    indicadorPods.classList.add("parcial");
  } else {
    indicadorPods.classList.add("conectado");
  }

  var ayuda = document.getElementById("ayudaCantidadPodsRehabPod");
  if (ayuda) {
    var minimo = rehabMinimoPodsModo(modoActual);
    ayuda.textContent = `Mínimo para este modo: ${minimo} ${minimo === 1 ? "Pod" : "Pods"} · Conectados ahora: ${cantidad} de ${REHABPOD_MAX_PODS}`;
  }
};

// =====================================================
// CONFIGURACION DEL MODO
// Conserva toda la configuracion V16 y añade cantidad/minimos.
// =====================================================

var rehabConfigurarModoBase = configurarModo;
configurarModo = function () {
  rehabConfigurarModoBase();
  rehabActualizarControlCantidadPods();
  rehabActualizarDescripcionModo();
  rehabActualizarEtiquetasMinimoPods();
};

var rehabObtenerNombreModoBase = obtenerNombreModo;
obtenerNombreModo = function () {
  if (modoActual === "circuito") {
    return "Circuito de Pods";
  }
  return rehabObtenerNombreModoBase();
};

// =====================================================
// INICIO DEL ENTRENAMIENTO
// Valida cantidad elegida + minimo del modo.
// =====================================================

var rehabIniciarEntrenamientoBase = iniciarEntrenamiento;
iniciarEntrenamiento = function () {
  var selector = document.getElementById("cantidadPodsEntrenamientoRehabPod");
  var minimo = rehabMinimoPodsModo(modoActual);

  if (selector) {
    cantidadPodsSeleccionada = Number(selector.value) || minimo;
  }

  cantidadPodsSeleccionada = Math.max(
    minimo,
    Math.min(cantidadPodsSeleccionada, REHABPOD_MAX_PODS)
  );

  localStorage.setItem(REHABPOD_CLAVE_CANTIDAD, String(cantidadPodsSeleccionada));

  if (cantidadPodsSeleccionada < minimo) {
    alert(`Este modo necesita mínimo ${minimo} ${minimo === 1 ? "Pod" : "Pods"}.`);
    return;
  }

  var conectados = cantidadConectados();
  if (conectados < cantidadPodsSeleccionada) {
    alert(
      `Seleccionaste ${cantidadPodsSeleccionada} ${cantidadPodsSeleccionada === 1 ? "Pod" : "Pods"}, pero solo hay ${conectados} conectado${conectados === 1 ? "" : "s"}.\n\nConecta ${cantidadPodsSeleccionada - conectados} más o reduce la cantidad.`
    );
    return;
  }

  if (rehabIndicesPodsActivos().length < minimo) {
    alert(`Este entrenamiento necesita al menos ${minimo} Pods activos.`);
    return;
  }

  // La V16 tenía una validación fija de 4 Pods. La anulamos solo durante
  // esta llamada para conservar intacto todo el resto de iniciarEntrenamiento().
  var cantidadConectadosReal = cantidadConectados;
  cantidadConectados = function () {
    return REHABPOD_MAX_PODS;
  };

  try {
    rehabIniciarEntrenamientoBase();
  } finally {
    cantidadConectados = cantidadConectadosReal;
  }

  rehabActualizarVisualesPodsActivos();
};

if (btnComenzar) {
  btnComenzar.onclick = iniciarEntrenamiento;
}

// =====================================================
// IGNORAR PULSACIONES DE PODS CONECTADOS PERO NO SELECCIONADOS
// =====================================================

var rehabProcesarPulsacionBase = procesarPulsacion;
procesarPulsacion = function (indice) {
  if (entrenamientoActivo && !rehabEsPodActivo(indice)) {
    console.log(`PRESS ignorado: Pod ${indice + 1} no participa en esta sesión.`);
    return;
  }

  rehabProcesarPulsacionBase(indice);
};

// =====================================================
// FEEDBACK DE TODOS LOS PODS: SOLO LOS PODS ACTIVOS
// =====================================================

feedbackTodosPods = async function (comando, colorCSS, duracion = 800) {
  var activos = rehabIndicesPodsActivos();

  activos.forEach((indice) => encenderVisual(indice, colorCSS));

  await Promise.all(activos.map((indice) => enviarComandoPod(indice, comando)));

  await new Promise((resolver) => setTimeout(resolver, duracion));

  await Promise.all(activos.map((indice) => enviarComandoPod(indice, "off")));

  activos.forEach((indice) => apagarVisualPod(indice));
};

// =====================================================
// REACCION ALEATORIA
// =====================================================

activarSimple = async function () {
  fase = "respuesta";
  objetivoCorrecto = rehabElegirPodActivo();

  if (objetivoCorrecto < 0) {
    return;
  }

  var color = obtenerColorEstimulo(objetivoCorrecto);
  textoFase.textContent = "¡AHORA!";
  textoObjetivo.textContent = `TOCA POD ${rehabNumeroVisiblePod(objetivoCorrecto)}`;
  nombreColor.textContent = color.nombre;
  colorObjetivo.style.background = color.css;

  encenderVisual(objetivoCorrecto, color.css);
  await enviarComandoPod(objetivoCorrecto, color.comando);
  iniciarMedicion();
};

// =====================================================
// REACCION POR COLORES
// =====================================================

activarColores = async function () {
  fase = "respuesta";
  var activos = rehabIndicesPodsActivos();
  var usados = [];

  coloresActuales = new Array(podsBLE.length).fill(null);

  activos.forEach((indice) => {
    var color = obtenerColorAleatorioParaPod(indice, usados);
    usados.push(color.comando);
    coloresActuales[indice] = color;
    encenderVisual(indice, color.css);
  });

  objetivoCorrecto = rehabElegirPodActivo();
  var objetivo = coloresActuales[objetivoCorrecto];

  await Promise.all(
    activos.map((indice) => enviarComandoPod(indice, coloresActuales[indice].comando))
  );

  textoFase.textContent = "¡AHORA!";
  textoObjetivo.textContent = "TOCA EL COLOR";
  nombreColor.textContent = objetivo.nombre;
  colorObjetivo.style.background = objetivo.css;
  iniciarMedicion();
};

// =====================================================
// DOBLE ESTIMULO
// =====================================================

activarDobleEstimulo = async function () {
  fase = "dobleRespuesta";
  var activos = rehabMezclarCopia(rehabIndicesPodsActivos());
  var primero = activos[0];
  var segundo = activos[1];

  if (primero === undefined || segundo === undefined) {
    alert("Doble estímulo necesita al menos 2 Pods activos.");
    return;
  }

  objetivosDobles = [primero, segundo];
  objetivosDoblesPendientes = new Set(objetivosDobles);

  textoFase.textContent = "¡DOBLE!";
  textoObjetivo.textContent = `POD ${rehabNumeroVisiblePod(primero)} + POD ${rehabNumeroVisiblePod(segundo)}`;
  nombreColor.textContent = "TOCA LOS DOS";

  var colorPrimero = obtenerColorEstimulo(primero);
  var colorSegundo = obtenerColorEstimulo(segundo, [colorPrimero.comando]);

  colorObjetivo.style.background = `linear-gradient(135deg, ${colorPrimero.css} 0 48%, ${colorSegundo.css} 52% 100%)`;
  encenderVisual(primero, colorPrimero.css);

  encenderVisual(segundo, colorSegundo.css);

  await Promise.all([
    enviarComandoPod(primero, colorPrimero.comando),
    enviarComandoPod(segundo, colorSegundo.comando),
  ]);

  iniciarMedicion();
};

// =====================================================
// COLOR PROHIBIDO
// =====================================================

activarColorProhibido = async function () {
  fase = "prohibidoRespuesta";
  var activos = rehabIndicesPodsActivos();
  var usados = [];

  coloresActuales = new Array(podsBLE.length).fill(null);

  activos.forEach((indice) => {
    var color = obtenerColorAleatorioParaPod(indice, usados);
    usados.push(color.comando);
    coloresActuales[indice] = color;
    encenderVisual(indice, color.css);
  });

  indiceColorProhibido = rehabElegirPodActivo();
  var prohibido = coloresActuales[indiceColorProhibido];

  await Promise.all(
    activos.map((indice) => enviarComandoPod(indice, coloresActuales[indice].comando))
  );

  textoFase.textContent = "¡CUIDADO!";
  textoObjetivo.textContent = "NO TOQUES";
  nombreColor.textContent = prohibido.nombre;
  colorObjetivo.style.background = prohibido.css;
  iniciarMedicion();
};

// =====================================================
// SECUENCIA / MEMORIA
// =====================================================

iniciarSecuencia = function () {
  fase = "secuenciaMostrar";

  var elegido = rehabElegirPodActivo();
  if (elegido < 0) {
    return;
  }

  secuencia.push(elegido);
  indiceMostrarSecuencia = 0;
  posicionSecuencia = 0;
  textoFase.textContent = "Memoriza";
  textoObjetivo.textContent = "MEMORIZA";
  nombreColor.textContent = `${secuencia.length} pasos`;
  colorObjetivo.style.background = "#374151";
  mostrarElementoSecuencia();
};

// =====================================================
// CIRCUITO VARIABLE
// =====================================================

activarCircuito = async function () {
  if (!entrenamientoActivo || pausado) {
    return;
  }

  circuitoOrden = rehabMezclarCopia(rehabIndicesPodsActivos());
  circuitoPosicion = 0;
  circuitoTiempoInicio = performance.now();
  fase = "circuitoRespuesta";
  esperandoRespuesta = true;

  textoFase.textContent = "¡CIRCUITO!";
  mensajeResultado.textContent = `Completa los ${circuitoOrden.length} Pods`;

  await mostrarObjetivoCircuito();
  iniciarMedicion();
};

mostrarObjetivoCircuito = async function () {
  if (circuitoPosicion >= circuitoOrden.length) {
    return;
  }

  var indice = circuitoOrden[circuitoPosicion];
  objetivoCorrecto = indice;
  var color = obtenerColorEstimulo(indice);

  textoObjetivo.textContent = `TOCA POD ${rehabNumeroVisiblePod(indice)}`;
  nombreColor.textContent = `${color.nombre} · ${circuitoPosicion + 1}/${circuitoOrden.length}`;
  colorObjetivo.style.background = color.css;

  encenderVisual(indice, color.css);
  await enviarComandoPod(indice, color.comando);
};

respuestaCircuito = async function (indice) {
  if (!esperandoRespuesta || circuitoPosicion >= circuitoOrden.length) {
    return;
  }

  var esperado = circuitoOrden[circuitoPosicion];

  if (indice !== esperado) {
    errores++;
    contadorErrores.textContent = errores;
    mensajeResultado.textContent = `❌ Pod ${rehabNumeroVisiblePod(indice)} incorrecto · busca Pod ${rehabNumeroVisiblePod(esperado)}`;
    mensajeResultado.className = "mensajeResultado mensajeError";
    tono(220, 120);
    return;
  }

  await enviarComandoPod(indice, "off");
  apagarVisualPod(indice);
  circuitoPosicion++;
  tono(820, 70);

  if (circuitoPosicion < circuitoOrden.length) {
    mensajeResultado.textContent = `✅ ${circuitoPosicion}/${circuitoOrden.length} · siguiente`;
    mensajeResultado.className = "mensajeResultado mensajeCorrecto";
    await mostrarObjetivoCircuito();
    return;
  }

  esperandoRespuesta = false;
  detenerCronometro();
  fase = "resultado";

  var tiempo = (performance.now() - circuitoTiempoInicio - tiempoPausado) / 1000;

  aciertos++;
  contadorAciertos.textContent = aciertos;
  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;
  mensajeResultado.textContent = `✅ CIRCUITO COMPLETO · ${tiempo.toFixed(3)} s`;
  mensajeResultado.className = "mensajeResultado mensajeCorrecto";
  tono(1050, 160);

  resultados.push({
    ronda: rondaActual,
    correcto: true,
    tiempo,
    estado: `Circuito ${circuitoOrden.map((i) => rehabNumeroVisiblePod(i)).join("-")}`,
  });

  await apagarTodosLosPods();
  continuar();
};

// =====================================================
// PERSECUCION
// =====================================================

activarPersecucion = async function () {
  if (!entrenamientoActivo || pausado) {
    return;
  }

  fase = "respuesta";
  var excluir = objetivoCorrecto >= 0 ? [objetivoCorrecto] : [];
  var nuevoObjetivo = rehabElegirPodActivo(excluir);

  if (nuevoObjetivo < 0) {
    nuevoObjetivo = rehabElegirPodActivo();
  }

  objetivoCorrecto = nuevoObjetivo;
  var color = obtenerColorEstimulo(objetivoCorrecto);

  textoFase.textContent = "¡PERSIGUE!";
  textoObjetivo.textContent = `TOCA POD ${rehabNumeroVisiblePod(objetivoCorrecto)}`;

  nombreColor.textContent = color.nombre;
  colorObjetivo.style.background = color.css;

  encenderVisual(objetivoCorrecto, color.css);
  await enviarComandoPod(objetivoCorrecto, color.comando);
  iniciarMedicion();
};

// =====================================================
// CONTRARRELOJ
// =====================================================

activarObjetivoContrarreloj = async function () {
  if (!entrenamientoActivo || modoActual !== "contrarreloj") {
    return;
  }

  await apagarTodosLosPods();

  var excluir = objetivoContrarreloj >= 0 ? [objetivoContrarreloj] : [];
  var siguiente = rehabElegirPodActivo(excluir);
  if (siguiente < 0) {
    siguiente = rehabElegirPodActivo();
  }

  objetivoContrarreloj = siguiente;
  var color = obtenerColorEstimulo(objetivoContrarreloj);

  fase = "contrarrelojRespuesta";
  rondaActual++;
  textoObjetivo.textContent = `POD ${rehabNumeroVisiblePod(objetivoContrarreloj)}`;
  nombreColor.textContent = color.nombre;
  colorObjetivo.style.background = color.css;

  encenderVisual(objetivoContrarreloj, color.css);
  await enviarComandoPod(objetivoContrarreloj, color.comando);
  iniciarMedicion();
};

// =====================================================
// MODO ENTRENADOR: SOLO MUESTRA/HABILITA LOS PODS ELEGIDOS
// =====================================================

var rehabHabilitarBotonesEntrenadorBase = habilitarBotonesEntrenador;
habilitarBotonesEntrenador = function (habilitar) {
  var panel = document.getElementById("panelEntrenadorActivoReactiPod");
  if (!panel) {
    return;
  }

  var activos = rehabIndicesPodsActivos();

  panel.querySelectorAll(".btnPodEntrenadorActivo").forEach((boton) => {
    var indice = Number(boton.dataset.entrenadorPod);
    var activo = activos.includes(indice);
    boton.style.display = activo ? "" : "none";
    boton.disabled = !habilitar || !activo;

    if (activo) {
      boton.textContent = `ACTIVAR POD ${rehabNumeroVisiblePod(indice)}`;
    }
  });
};

var rehabActivarPodEntrenadorBase = activarPodEntrenador;
activarPodEntrenador = async function (indice) {
  if (!rehabEsPodActivo(indice)) {
    return;
  }
  await rehabActivarPodEntrenadorBase(indice);
};

// =====================================================
// MODO LIBRE
// La lógica existente ya acepta cualquier indice; procesarPulsacion()
// filtra los Pods que no participan en esta sesión.
// =====================================================

// =====================================================
// RESTAURAR VISUALES AL FINAL / CANCELAR
// =====================================================

var rehabFinalizarEntrenamientoBase = finalizarEntrenamiento;
finalizarEntrenamiento = async function () {
  try {
    return await rehabFinalizarEntrenamientoBase();
  } finally {
    rehabRestaurarVisualesPods();
  }
};

var rehabCancelarEntrenamientoBase = cancelarEntrenamiento;
cancelarEntrenamiento = async function () {
  try {
    return await rehabCancelarEntrenamientoBase();
  } finally {
    rehabRestaurarVisualesPods();
  }
};

if (btnCancelar) {
  btnCancelar.onclick = cancelarEntrenamiento;
}

// =====================================================
// INICIALIZACION V17
// =====================================================

(function inicializarRehabPodV17() {
  cantidadPodsSeleccionada = Math.max(
    1,
    Math.min(Number(cantidadPodsSeleccionada) || 4, REHABPOD_MAX_PODS)
  );

  rehabActualizarInterfazConexionGenerica();
  rehabCrearControlCantidadPods();
  rehabActualizarControlCantidadPods();
  rehabActualizarEtiquetasMinimoPods();
  rehabActualizarDescripcionModo();
  actualizarEstadoGeneralPods();

  console.log("RehabPod V17: BLE genérico y cantidad variable de Pods activados.");
})();

// =====================================================
// REHABPOD V18
// COLOR FIJO EN MEMORIA + PODS VIRTUALES PARA SIMULACION
// PEGAR ESTE BLOQUE COMPLETO AL FINAL DE app.js,
// DESPUES DEL BLOQUE V17.
// =====================================================

// -----------------------------------------------------

// 1. AJUSTES V18
// -----------------------------------------------------

var REHABPOD_CLAVE_MODO_VIRTUAL = "rehabpodModoVirtual";
var REHABPOD_CLAVE_COLOR_MEMORIA = "rehabpodColorMemoria";

var rehabModoVirtual = localStorage.getItem(REHABPOD_CLAVE_MODO_VIRTUAL) === "true";

var rehabColorMemoria = localStorage.getItem(REHABPOD_CLAVE_COLOR_MEMORIA) || "blue";

// En Memoria NO se permiten rojo ni verde porque quedan reservados para
// feedback de error/correcto al terminar la secuencia.
var REHABPOD_COLORES_MEMORIA = [
  "blue",
  "yellow",
  "white",
  "purple",
  "cyan",
  "orange",
  "pink",
];

if (!REHABPOD_COLORES_MEMORIA.includes(rehabColorMemoria)) {
  rehabColorMemoria = "blue";
}

function rehabObtenerColorMemoria() {
  return (
    catalogoColoresPersonalizados[rehabColorMemoria] || catalogoColoresPersonalizados.blue
  );
}

// -----------------------------------------------------
// 2. SELECTOR DE COLOR PARA SECUENCIA / MEMORIA
// -----------------------------------------------------

function rehabCrearControlColorMemoria() {
  var existente = document.getElementById("controlColorMemoriaRehabPod");
  if (existente) {
    return existente;
  }

  var panel = document.createElement("div");
  panel.id = "controlColorMemoriaRehabPod";
  panel.className = "tarjeta";
  panel.style.marginTop = "12px";
  panel.innerHTML = `
    <label for="colorMemoriaRehabPod" style="display:block;font-weight:800;margin-bottom:8px;">

      Color de la secuencia
    </label>

    <select id="colorMemoriaRehabPod" style="width:100%;">
      <option value="blue">Azul</option>
      <option value="yellow">Amarillo</option>
      <option value="white">Blanco</option>
      <option value="purple">Morado</option>
      <option value="cyan">Cian</option>
      <option value="orange">Naranja</option>
      <option value="pink">Rosado</option>
    </select>

    <small style="display:block;margin-top:8px;line-height:1.4;opacity:.78;">
      Todos los Pods usarán este mismo color durante la secuencia.
      Verde y rojo se reservan para indicar correcto o incorrecto.
    </small>
  `;

  var panelCantidad = document.getElementById("controlCantidadPodsRehabPod");

  if (panelCantidad && panelCantidad.parentElement) {
    panelCantidad.insertAdjacentElement("afterend", panel);
  } else if (descripcionModo && descripcionModo.parentElement) {
    descripcionModo.insertAdjacentElement("afterend", panel);
  }

  var selector = panel.querySelector("#colorMemoriaRehabPod");
  selector.value = rehabColorMemoria;

  selector.addEventListener("change", function () {
    var nuevo = selector.value;

    if (!REHABPOD_COLORES_MEMORIA.includes(nuevo)) {
      nuevo = "blue";
    }

    rehabColorMemoria = nuevo;
    localStorage.setItem(REHABPOD_CLAVE_COLOR_MEMORIA, rehabColorMemoria);

    var color = rehabObtenerColorMemoria();
    selector.style.borderColor = color.css;
  });

  var colorInicial = rehabObtenerColorMemoria();
  selector.style.borderColor = colorInicial.css;

  return panel;
}

function rehabActualizarControlColorMemoria() {
  var panel = rehabCrearControlColorMemoria();
  var mostrar = modoActual === "secuencia";

  panel.style.display = mostrar ? "" : "none";

  if (!mostrar) {
    return;
  }

  var selector = panel.querySelector("#colorMemoriaRehabPod");
  selector.value = rehabColorMemoria;

  var color = rehabObtenerColorMemoria();
  selector.style.borderColor = color.css;
}

// Hacemos que el modo Secuencia / Memoria use SIEMPRE el color elegido.
// Los demás entrenamientos continúan usando sus colores dinámicos normales.
var rehabV18ObtenerColorEstimuloBase = obtenerColorEstimulo;
obtenerColorEstimulo = function (indice, excluidos = []) {
  if (modoActual === "secuencia") {
    return rehabObtenerColorMemoria();
  }

  return rehabV18ObtenerColorEstimuloBase(indice, excluidos);
};

// -----------------------------------------------------
// 3. CONTROL DE PODS VIRTUALES
// -----------------------------------------------------

function rehabCrearControlModoVirtual() {
  var existente = document.getElementById("controlModoVirtualRehabPod");
  if (existente) {
    return existente;
  }

  var panel = document.createElement("div");
  panel.id = "controlModoVirtualRehabPod";
  panel.className = "tarjeta";
  panel.style.marginTop = "12px";
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;">
      <div>
        <strong style="display:block;">Pods virtuales</strong>
        <small style="display:block;margin-top:4px;line-height:1.4;opacity:.78;">
          Simula los golpes tocando los Pods de la pantalla, sin necesitar los dispositivos físicos.
        </small>
      </div>

      <label style="display:flex;align-items:center;gap:8px;font-weight:800;white-space:nowrap;cursor:pointer;">
        <input id="modoVirtualRehabPod" type="checkbox" style="width:20px;height:20px;">
        ACTIVAR
      </label>
    </div>


    <div id="estadoModoVirtualRehabPod" style="margin-top:10px;font-size:12px;font-weight:800;"></div>
  `;

  var panelCantidad = document.getElementById("controlCantidadPodsRehabPod");

  if (panelCantidad && panelCantidad.parentElement) {
    panelCantidad.insertAdjacentElement("afterend", panel);
  } else if (descripcionModo && descripcionModo.parentElement) {
    descripcionModo.insertAdjacentElement("afterend", panel);
  }

  var check = panel.querySelector("#modoVirtualRehabPod");
  check.checked = rehabModoVirtual;

  check.addEventListener("change", function () {
    rehabModoVirtual = check.checked;
    localStorage.setItem(
      REHABPOD_CLAVE_MODO_VIRTUAL,
      rehabModoVirtual ? "true" : "false"
    );

    rehabActualizarModoVirtual();
    rehabActualizarControlCantidadPods();
    rehabActualizarVisualesPodsActivos();
    actualizarEstadoGeneralPods();
  });

  return panel;
}

function rehabActualizarModoVirtual() {
  var panel = rehabCrearControlModoVirtual();
  var check = panel.querySelector("#modoVirtualRehabPod");
  var estado = panel.querySelector("#estadoModoVirtualRehabPod");

  check.checked = rehabModoVirtual;

  if (rehabModoVirtual) {
    estado.textContent =
      "SIMULACIÓN ACTIVADA · toca un Pod en pantalla para simular el golpe";
    estado.style.color = "#22c55e";
  } else {
    estado.textContent = "SIMULACIÓN DESACTIVADA · se usarán los Pods Bluetooth";
    estado.style.color = "";
  }

  rehabActualizarAparienciaPodsVirtuales();
}

// En simulación, consideramos disponibles las 4 posiciones virtuales.
// La cantidad realmente usada sigue dependiendo del selector 1/2/3/4 Pods.
var rehabV18IndicesPodsConectadosBase = rehabIndicesPodsConectados;
rehabIndicesPodsConectados = function () {
  if (rehabModoVirtual) {
    return Array.from({ length: REHABPOD_MAX_PODS }, (_, indice) => indice);
  }

  return rehabV18IndicesPodsConectadosBase();
};

function rehabActualizarAparienciaPodsVirtuales() {
  document.querySelectorAll(".pod[data-pod]").forEach(function (podVisual) {
    if (rehabModoVirtual) {
      podVisual.style.cursor = "pointer";
      podVisual.style.userSelect = "none";
      podVisual.style.touchAction = "manipulation";
      podVisual.title = "Toca para simular el golpe de este Pod";
      podVisual.setAttribute("role", "button");
      podVisual.setAttribute("tabindex", "0");
    } else {
      podVisual.style.cursor = "";
      podVisual.style.userSelect = "";
      podVisual.style.touchAction = "";

      podVisual.title = "";
      podVisual.removeAttribute("role");
      podVisual.removeAttribute("tabindex");
    }
  });
}

function rehabSimularGolpePod(indice) {
  if (!rehabModoVirtual) {
    return;
  }

  if (!entrenamientoActivo || pausado) {
    return;
  }

  if (!rehabEsPodActivo(indice)) {
    return;
  }

  // Pequeña animación táctil para que el usuario sienta que el toque fue leído.
  var podVisual = document.querySelector(`.pod[data-pod="${indice}"]`);
  if (podVisual) {
    var transformAnterior = podVisual.style.transform;
    podVisual.style.transform = "scale(.95)";

    setTimeout(function () {
      podVisual.style.transform = transformAnterior;
    }, 90);
  }

  procesarPulsacion(indice);
}

function rehabPrepararEventosPodsVirtuales() {
  document.querySelectorAll(".pod[data-pod]").forEach(function (podVisual) {
    if (podVisual.dataset.rehabVirtualPreparado === "1") {
      return;
    }

    podVisual.dataset.rehabVirtualPreparado = "1";

    podVisual.addEventListener("click", function () {
      var indice = Number(podVisual.dataset.pod);
      rehabSimularGolpePod(indice);
    });

    podVisual.addEventListener("keydown", function (evento) {
      if (evento.key !== "Enter" && evento.key !== " ") {
        return;
      }

      evento.preventDefault();
      var indice = Number(podVisual.dataset.pod);
      rehabSimularGolpePod(indice);
    });
  });

  rehabActualizarAparienciaPodsVirtuales();
}

// -----------------------------------------------------
// 4. INICIO DEL ENTRENAMIENTO EN MODO VIRTUAL
// -----------------------------------------------------

var rehabV18IniciarEntrenamientoBase = iniciarEntrenamiento;
iniciarEntrenamiento = function () {
  if (!rehabModoVirtual) {
    return rehabV18IniciarEntrenamientoBase();
  }

  // La V17 valida cuántos Pods Bluetooth están conectados.
  // Solo durante esta llamada informamos que hay 4 posiciones disponibles.
  // No alteramos permanentemente el estado Bluetooth real.
  var cantidadConectadosRealV18 = cantidadConectados;

  cantidadConectados = function () {
    return REHABPOD_MAX_PODS;
  };

  try {
    var resultado = rehabV18IniciarEntrenamientoBase();
    rehabActualizarAparienciaPodsVirtuales();
    return resultado;
  } finally {
    cantidadConectados = cantidadConectadosRealV18;
  }
};

if (btnComenzar) {
  btnComenzar.onclick = iniciarEntrenamiento;
}

// -----------------------------------------------------
// 5. ESTADO GENERAL CUANDO SE USA SIMULACION
// -----------------------------------------------------

var rehabV18ActualizarEstadoGeneralPodsBase = actualizarEstadoGeneralPods;
actualizarEstadoGeneralPods = function () {
  if (!rehabModoVirtual) {
    rehabV18ActualizarEstadoGeneralPodsBase();
    return;
  }

  var objetivo = Math.max(1, Number(cantidadPodsSeleccionada) || 1);

  if (textoEstadoPods) {
    textoEstadoPods.textContent = `${objetivo} virtuales`;
  }

  if (cantidadPodsConectados) {
    cantidadPodsConectados.textContent = `${objetivo} virtuales`;
  }

  if (podsListosConfiguracion) {
    podsListosConfiguracion.textContent = `${objetivo} Pods virtuales`;
  }

  if (indicadorPods) {
    indicadorPods.classList.remove("desconectado", "parcial", "conectado");
    indicadorPods.classList.add("conectado");
  }

  var ayuda = document.getElementById("ayudaCantidadPodsRehabPod");
  if (ayuda) {
    var minimo = rehabMinimoPodsModo(modoActual);
    ayuda.textContent = `Mínimo para este modo: ${minimo} ${
      minimo === 1 ? "Pod" : "Pods"
    } · Simulación virtual activa`;
  }
};

// -----------------------------------------------------
// 6. REAPLICAR CONTROLES AL CAMBIAR DE MODO
// -----------------------------------------------------

var rehabV18ConfigurarModoBase = configurarModo;
configurarModo = function () {
  rehabV18ConfigurarModoBase();

  rehabCrearControlModoVirtual();
  rehabActualizarModoVirtual();

  rehabCrearControlColorMemoria();
  rehabActualizarControlColorMemoria();

  // Orden recomendado:
  // Descripción -> Cantidad de Pods -> Pods virtuales -> Color memoria (si aplica)
  var cantidad = document.getElementById("controlCantidadPodsRehabPod");
  var virtual = document.getElementById("controlModoVirtualRehabPod");
  var memoria = document.getElementById("controlColorMemoriaRehabPod");

  if (cantidad && virtual && cantidad.parentElement === virtual.parentElement) {
    cantidad.insertAdjacentElement("afterend", virtual);
  }

  if (
    modoActual === "secuencia" &&
    virtual &&
    memoria &&
    virtual.parentElement === memoria.parentElement
  ) {
    virtual.insertAdjacentElement("afterend", memoria);
  }

  rehabPrepararEventosPodsVirtuales();
  actualizarEstadoGeneralPods();
};

// -----------------------------------------------------
// 7. DESCRIPCION ESPECIFICA DE MEMORIA
// -----------------------------------------------------

var rehabV18ActualizarDescripcionModoBase = rehabActualizarDescripcionModo;
rehabActualizarDescripcionModo = function () {
  rehabV18ActualizarDescripcionModoBase();

  if (modoActual === "secuencia" && descripcionModo) {
    var cantidad = Number(cantidadPodsSeleccionada) || rehabMinimoPodsModo(modoActual);
    var color = rehabObtenerColorMemoria();

    descripcionModo.textContent =
      `Memoriza y repite la secuencia utilizando ${cantidad} ${
        cantidad === 1 ? "Pod" : "Pods"
      }. Todos los estímulos usarán el color ${color.nombre.toLowerCase()}. ` +
      "La secuencia crece progresivamente. Verde indica secuencia correcta y rojo indica error.";
  }
};

// -----------------------------------------------------
// 8. RESTAURAR INTERFAZ AL TERMINAR
// -----------------------------------------------------

var rehabV18FinalizarEntrenamientoBase = finalizarEntrenamiento;
finalizarEntrenamiento = async function () {
  try {
    return await rehabV18FinalizarEntrenamientoBase();
  } finally {
    rehabActualizarAparienciaPodsVirtuales();
    actualizarEstadoGeneralPods();
  }
};

var rehabV18CancelarEntrenamientoBase = cancelarEntrenamiento;
cancelarEntrenamiento = async function () {
  try {
    return await rehabV18CancelarEntrenamientoBase();
  } finally {
    rehabActualizarAparienciaPodsVirtuales();
    actualizarEstadoGeneralPods();
  }
};

if (btnCancelar) {
  btnCancelar.onclick = cancelarEntrenamiento;
}

// -----------------------------------------------------
// 9. INICIALIZACION V18
// -----------------------------------------------------

(function inicializarRehabPodV18() {
  rehabCrearControlModoVirtual();
  rehabCrearControlColorMemoria();
  rehabActualizarModoVirtual();
  rehabActualizarControlColorMemoria();
  rehabPrepararEventosPodsVirtuales();
  rehabActualizarDescripcionModo();
  actualizarEstadoGeneralPods();

  console.log(
    "RehabPod V18: color fijo de memoria + simulación de Pods virtuales activados."
  );
})();

// =====================================================
// REHABPOD V19
// 2 NUEVOS MODOS:
// 1) CAZA DE COLOR: busca SIEMPRE el mismo color aunque cambie de Pod.
// 2) CAMBIO AUTOMATICO: el estimulo cambia de Pod solo, sin tocarlo.
// PEGAR ESTE BLOQUE COMPLETO AL FINAL DE app.js,
// DESPUES DEL BLOQUE V18.
// =====================================================

// -----------------------------------------------------
// 1. AJUSTES GENERALES V19
// -----------------------------------------------------

var REHABPOD_CLAVE_COLOR_CAZA = "rehabpodColorCaza";
var REHABPOD_CLAVE_TIEMPO_AUTOMATICO = "rehabpodTiempoAutomatico";

var rehabColorCaza = localStorage.getItem(REHABPOD_CLAVE_COLOR_CAZA) || "red";

var rehabTiempoAutomaticoMs = Number(
  localStorage.getItem(REHABPOD_CLAVE_TIEMPO_AUTOMATICO) || 1000
);

var REHABPOD_COLORES_CAZA = [
  "red",
  "green",
  "blue",
  "yellow",
  "white",
  "purple",
  "cyan",
  "orange",
  "pink",
];

if (!REHABPOD_COLORES_CAZA.includes(rehabColorCaza)) {
  rehabColorCaza = "red";
}

if (![500, 750, 1000, 1500, 2000, 3000].includes(rehabTiempoAutomaticoMs)) {
  rehabTiempoAutomaticoMs = 1000;
}

// Minimos de Pods para los nuevos modos.
MINIMO_PODS_POR_MODO.cazaColor = 2;
MINIMO_PODS_POR_MODO.automatico = 1;

var rehabTemporizadorAutomatico = null;
var rehabUltimoPodAutomatico = -1;

function rehabObtenerColorCaza() {
  return (
    catalogoColoresPersonalizados[rehabColorCaza] || catalogoColoresPersonalizados.red
  );
}

function rehabColoresCazaSecundarios() {
  return REHABPOD_COLORES_CAZA.filter(function (clave) {
    return clave !== rehabColorCaza;
  })
    .map(function (clave) {
      return catalogoColoresPersonalizados[clave];
    })
    .filter(Boolean);
}

// -----------------------------------------------------
// 2. TARJETAS DE LOS NUEVOS MODOS
// Se insertan dentro de las categorias ya existentes.
// -----------------------------------------------------

function rehabV19CrearTarjetaModo(modo) {
  var tarjeta = document.createElement("button");
  tarjeta.type = "button";
  tarjeta.className = "tarjetaEntrenamientoModo";
  tarjeta.dataset.modo = modo;
  tarjeta.style.width = "100%";
  tarjeta.style.textAlign = "left";

  if (modo === "cazaColor") {
    tarjeta.innerHTML = `
      <div style="font-size:34px;margin-bottom:8px;">🎯🎨</div>
      <strong style="display:block;font-size:17px;">Caza de color</strong>
      <small style="display:block;margin-top:6px;line-height:1.45;opacity:.78;">
        Busca siempre el mismo color. Después de cada acierto los colores cambian de posición.
      </small>
    `;
  } else {
    tarjeta.innerHTML = `
      <div style="font-size:34px;margin-bottom:8px;">🔁⚡</div>
      <strong style="display:block;font-size:17px;">Cambio automático</strong>
      <small style="display:block;margin-top:6px;line-height:1.45;opacity:.78;">
        Un Pod se enciende y cambia automáticamente al siguiente sin necesidad de tocarlo.
      </small>
    `;
  }

  tarjeta.addEventListener("click", function () {
    seleccionarModo(modo);
  });

  return tarjeta;
}

function rehabV19InsertarModoEnCategoria(claveCategoria, modo) {
  var detalle = document.getElementById("gridDetalleCategoriaV9");
  var titulo = document.getElementById("detalleTituloV9");
  if (!detalle || !titulo) {
    return;
  }

  var mapaTitulos = {
    velocidad: "Velocidad",
    coordinacion: "Coordinación",
  };

  if (titulo.textContent.trim() !== mapaTitulos[claveCategoria]) {
    return;
  }

  if (detalle.querySelector(`[data-modo="${modo}"]`)) {
    return;
  }

  detalle.appendChild(rehabV19CrearTarjetaModo(modo));
}

function rehabV19PrepararCategorias() {
  var velocidad = document.querySelector('[data-categoria="velocidad"]');
  var coordinacion = document.querySelector('[data-categoria="coordinacion"]');

  if (velocidad && velocidad.dataset.rehabV19 !== "1") {
    velocidad.dataset.rehabV19 = "1";
    velocidad.addEventListener("click", function () {
      setTimeout(function () {
        rehabV19InsertarModoEnCategoria("velocidad", "automatico");
      }, 0);
    });

    var contadorVelocidad = velocidad.querySelector("small");
    if (contadorVelocidad) {
      contadorVelocidad.textContent = "4 entrenamientos";
    }
  }

  if (coordinacion && coordinacion.dataset.rehabV19 !== "1") {
    coordinacion.dataset.rehabV19 = "1";
    coordinacion.addEventListener("click", function () {
      setTimeout(function () {
        rehabV19InsertarModoEnCategoria("coordinacion", "cazaColor");
      }, 0);
    });

    var contadorCoordinacion = coordinacion.querySelector("small");
    if (contadorCoordinacion) {
      contadorCoordinacion.textContent = "4 entrenamientos";
    }
  }
}

// -----------------------------------------------------
// 3. CONTROL: COLOR FIJO PARA CAZA DE COLOR
// -----------------------------------------------------

function rehabV19CrearControlColorCaza() {
  var existente = document.getElementById("controlColorCazaRehabPod");
  if (existente) {
    return existente;
  }

  var panel = document.createElement("div");
  panel.id = "controlColorCazaRehabPod";
  panel.className = "tarjeta";
  panel.style.marginTop = "12px";
  panel.innerHTML = `
    <label for="colorCazaRehabPod" style="display:block;font-weight:800;margin-bottom:8px;">
      Color que debes buscar
    </label>

    <select id="colorCazaRehabPod" style="width:100%;">
      <option value="red">Rojo</option>
      <option value="green">Verde</option>
      <option value="blue">Azul</option>
      <option value="yellow">Amarillo</option>
      <option value="white">Blanco</option>
      <option value="purple">Morado</option>
      <option value="cyan">Cian</option>
      <option value="orange">Naranja</option>
      <option value="pink">Rosado</option>
    </select>

    <small style="display:block;margin-top:8px;line-height:1.4;opacity:.78;">
      Ese color se mantendrá como objetivo durante todo el entrenamiento.
      Después de cada acierto cambiará de posición entre los Pods.
    </small>
  `;

  var virtual = document.getElementById("controlModoVirtualRehabPod");
  var cantidad = document.getElementById("controlCantidadPodsRehabPod");

  if (virtual && virtual.parentElement) {
    virtual.insertAdjacentElement("afterend", panel);
  } else if (cantidad && cantidad.parentElement) {
    cantidad.insertAdjacentElement("afterend", panel);
  } else if (descripcionModo && descripcionModo.parentElement) {
    descripcionModo.insertAdjacentElement("afterend", panel);
  }

  var selector = panel.querySelector("#colorCazaRehabPod");
  selector.value = rehabColorCaza;

  selector.addEventListener("change", function () {
    rehabColorCaza = selector.value;
    if (!REHABPOD_COLORES_CAZA.includes(rehabColorCaza)) {
      rehabColorCaza = "red";
    }

    localStorage.setItem(REHABPOD_CLAVE_COLOR_CAZA, rehabColorCaza);
    var color = rehabObtenerColorCaza();
    selector.style.borderColor = color.css;
    rehabActualizarDescripcionModo();
  });

  selector.style.borderColor = rehabObtenerColorCaza().css;
  return panel;
}

function rehabV19ActualizarControlColorCaza() {
  var panel = rehabV19CrearControlColorCaza();
  var mostrar = modoActual === "cazaColor";
  panel.style.display = mostrar ? "" : "none";

  if (mostrar) {
    var selector = panel.querySelector("#colorCazaRehabPod");
    selector.value = rehabColorCaza;
    selector.style.borderColor = rehabObtenerColorCaza().css;
  }
}

// -----------------------------------------------------
// 4. CONTROL: TIEMPO DE CAMBIO AUTOMATICO
// -----------------------------------------------------

function rehabV19CrearControlTiempoAutomatico() {
  var existente = document.getElementById("controlTiempoAutomaticoRehabPod");
  if (existente) {
    return existente;
  }

  var panel = document.createElement("div");
  panel.id = "controlTiempoAutomaticoRehabPod";
  panel.className = "tarjeta";
  panel.style.marginTop = "12px";
  panel.innerHTML = `
    <label for="tiempoAutomaticoRehabPod" style="display:block;font-weight:800;margin-bottom:8px;">
      Tiempo que permanece encendido cada Pod
    </label>

    <select id="tiempoAutomaticoRehabPod" style="width:100%;">
      <option value="500">0.5 segundos</option>
      <option value="750">0.75 segundos</option>
      <option value="1000">1 segundo</option>
      <option value="1500">1.5 segundos</option>
      <option value="2000">2 segundos</option>
      <option value="3000">3 segundos</option>
    </select>

    <small style="display:block;margin-top:8px;line-height:1.4;opacity:.78;">
      No necesitas tocar el Pod. Al terminar este tiempo se apagará y otro Pod se encenderá automáticamente.
    </small>
  `;

  var virtual = document.getElementById("controlModoVirtualRehabPod");
  var cantidad = document.getElementById("controlCantidadPodsRehabPod");

  if (virtual && virtual.parentElement) {
    virtual.insertAdjacentElement("afterend", panel);
  } else if (cantidad && cantidad.parentElement) {
    cantidad.insertAdjacentElement("afterend", panel);
  } else if (descripcionModo && descripcionModo.parentElement) {
    descripcionModo.insertAdjacentElement("afterend", panel);
  }

  var selector = panel.querySelector("#tiempoAutomaticoRehabPod");
  selector.value = String(rehabTiempoAutomaticoMs);

  selector.addEventListener("change", function () {
    rehabTiempoAutomaticoMs = Number(selector.value) || 1000;
    localStorage.setItem(
      REHABPOD_CLAVE_TIEMPO_AUTOMATICO,
      String(rehabTiempoAutomaticoMs)
    );
    rehabActualizarDescripcionModo();
  });

  return panel;
}

function rehabV19ActualizarControlTiempoAutomatico() {
  var panel = rehabV19CrearControlTiempoAutomatico();
  var mostrar = modoActual === "automatico";
  panel.style.display = mostrar ? "" : "none";

  if (mostrar) {
    panel.querySelector("#tiempoAutomaticoRehabPod").value = String(
      rehabTiempoAutomaticoMs
    );
  }
}

// -----------------------------------------------------
// 5. CONFIGURACION Y NOMBRES DE LOS NUEVOS MODOS
// -----------------------------------------------------

var rehabV19ConfigurarModoBase = configurarModo;
configurarModo = function () {
  rehabV19ConfigurarModoBase();

  if (modoActual === "cazaColor") {
    tituloConfiguracion.textContent = "Caza de color";
    iconoConfiguracion.textContent = "🎯🎨";
  } else if (modoActual === "automatico") {
    tituloConfiguracion.textContent = "Cambio automático";
    iconoConfiguracion.textContent = "🔁⚡";
  }

  rehabV19ActualizarControlColorCaza();
  rehabV19ActualizarControlTiempoAutomatico();
  rehabActualizarControlCantidadPods();
  rehabActualizarEtiquetasMinimoPods();
  rehabActualizarDescripcionModo();
};

var rehabV19ActualizarDescripcionBase = rehabActualizarDescripcionModo;
rehabActualizarDescripcionModo = function () {
  rehabV19ActualizarDescripcionBase();

  if (!descripcionModo) {
    return;
  }

  var cantidad = Number(cantidadPodsSeleccionada) || rehabMinimoPodsModo(modoActual);
  var plural = cantidad === 1 ? "Pod" : "Pods";

  if (modoActual === "cazaColor") {
    var color = rehabObtenerColorCaza();
    descripcionModo.textContent =
      `Busca siempre el color ${color.nombre.toLowerCase()} entre ${cantidad} ${plural}. ` +
      "Cuando lo toques correctamente, todos los Pods cambiarán de color y deberás volver a encontrar el mismo color en otra posición.";
  }

  if (modoActual === "automatico") {
    descripcionModo.textContent =
      `Uno de los ${cantidad} ${plural} se encenderá durante ${(rehabTiempoAutomaticoMs / 1000).toFixed(2).replace(/\.00$/, "")} s. ` +
      "Después se apagará automáticamente y se encenderá otro Pod. No es necesario tocar ningún Pod.";
  }
};

var rehabV19ObtenerNombreModoBase = obtenerNombreModo;
obtenerNombreModo = function () {
  if (modoActual === "cazaColor") {
    return "Caza de color";
  }

  if (modoActual === "automatico") {
    return "Cambio automático";
  }

  return rehabV19ObtenerNombreModoBase();
};

// Introducciones previas al entrenamiento.
var rehabV19ObtenerGuiaModoBase = obtenerGuiaModoV7;
obtenerGuiaModoV7 = function () {
  if (modoActual === "cazaColor") {
    var color = rehabObtenerColorCaza();
    return {
      icono: "🎯🎨",
      titulo: "Caza de color",
      descripcion: `Encuentra siempre el color ${color.nombre.toLowerCase()}, aunque cambie de posición entre los Pods.`,
      pasos: [
        `Busca el color ${color.nombre.toLowerCase()} entre los Pods iluminados.`,
        "Tócalo correctamente para completar el estímulo.",
        "Los colores cambiarán de posición y deberás encontrar nuevamente el mismo color.",
      ],
    };
  }

  if (modoActual === "automatico") {
    return {
      icono: "🔁⚡",
      titulo: "Cambio automático",
      descripcion:
        "Los Pods cambian de estímulo automáticamente. Este modo sirve para desplazamientos, seguimiento visual y ejercicios guiados sin necesidad de tocar los Pods.",
      pasos: [
        "Observa el Pod que se ilumina.",
        "Desplázate, apunta, gira o realiza el ejercicio indicado por el entrenador.",
        "No necesitas tocarlo: después del tiempo configurado cambiará automáticamente a otro Pod.",
      ],
    };
  }

  return rehabV19ObtenerGuiaModoBase();
};

// -----------------------------------------------------
// 6. MODO CAZA DE COLOR
// -----------------------------------------------------

async function rehabV19ActivarCazaColor() {
  if (!entrenamientoActivo || pausado || modoActual !== "cazaColor") {
    return;
  }

  fase = "cazaColorRespuesta";
  esperandoRespuesta = true;

  var activos = rehabIndicesPodsActivos();
  if (activos.length < 2) {
    alert("Caza de color necesita al menos 2 Pods activos.");
    return;
  }

  var colorObjetivoCaza = rehabObtenerColorCaza();
  var otros = rehabMezclarCopia(rehabColoresCazaSecundarios());

  objetivoCorrecto = rehabElegirPodActivo();
  coloresActuales = new Array(podsBLE.length).fill(null);

  var posicionOtro = 0;
  activos.forEach(function (indice) {
    var color;

    if (indice === objetivoCorrecto) {
      color = colorObjetivoCaza;
    } else {
      color = otros[posicionOtro % otros.length];
      posicionOtro++;
    }

    coloresActuales[indice] = color;
    encenderVisual(indice, color.css);
  });

  await Promise.all(
    activos.map(function (indice) {
      return enviarComandoPod(indice, coloresActuales[indice].comando);
    })
  );

  textoFase.textContent = "¡BUSCA!";
  textoObjetivo.textContent = "TOCA SIEMPRE";
  nombreColor.textContent = colorObjetivoCaza.nombre;
  colorObjetivo.style.background = colorObjetivoCaza.css;
  mensajeResultado.textContent = "Encuentra el mismo color aunque cambie de posición";
  mensajeResultado.className = "mensajeResultado";

  iniciarMedicion();
}

async function rehabV19RespuestaCazaColor(indice) {
  if (
    !entrenamientoActivo ||
    modoActual !== "cazaColor" ||
    fase !== "cazaColorRespuesta" ||
    !esperandoRespuesta
  ) {
    return;
  }

  if (indice !== objetivoCorrecto) {
    errores++;
    contadorErrores.textContent = errores;
    mensajeResultado.textContent = `❌ Ese no es ${rehabObtenerColorCaza().nombre}. Sigue buscando.`;
    mensajeResultado.className = "mensajeResultado mensajeError";
    tono(220, 120);
    return;
  }

  esperandoRespuesta = false;
  detenerCronometro();
  fase = "resultado";

  var tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;

  aciertos++;
  contadorAciertos.textContent = aciertos;

  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;
  mensajeResultado.textContent = `✅ ${rehabObtenerColorCaza().nombre} encontrado · ${tiempo.toFixed(3)} s`;
  mensajeResultado.className = "mensajeResultado mensajeCorrecto";
  tono(1000, 120);

  resultados.push({
    ronda: rondaActual,
    correcto: true,
    tiempo: tiempo,
    estado: `Caza ${rehabObtenerColorCaza().nombre} · Pod ${rehabNumeroVisiblePod(indice)}`,
  });

  await apagarTodosLosPods();
  continuar();
}

// Interceptamos el estimulo normal para Caza de color.
var rehabV19ActivarEstimuloBase = activarEstimulo;
activarEstimulo = async function () {
  if (modoActual === "cazaColor") {
    await rehabV19ActivarCazaColor();
    return;
  }

  await rehabV19ActivarEstimuloBase();
};

// -----------------------------------------------------
// 7. MODO CAMBIO AUTOMATICO
// -----------------------------------------------------

function rehabV19LimpiarTemporizadorAutomatico() {
  clearTimeout(rehabTemporizadorAutomatico);
  rehabTemporizadorAutomatico = null;
}

async function rehabV19IniciarRondaAutomatica() {
  if (!entrenamientoActivo || modoActual !== "automatico") {
    return;
  }

  rehabV19LimpiarTemporizadorAutomatico();

  if (pausado) {
    return;
  }

  // En finalización por rondas, cada activación cuenta como una ronda.
  if (tipoFinalGeneral !== "tiempo" && rondaActual >= totalRondasActual) {
    fase = "resultado";
    esperandoRespuesta = false;
    await apagarTodosLosPods();
    finalizarEntrenamiento();
    return;
  }

  rondaActual++;

  if (tipoFinalGeneral !== "tiempo") {
    textoRonda.textContent = `Cambio ${rondaActual} de ${totalRondasActual}`;
  }

  await apagarTodosLosPods();

  var excluir = rehabUltimoPodAutomatico >= 0 ? [rehabUltimoPodAutomatico] : [];
  var indice = rehabElegirPodActivo(excluir);

  if (indice < 0) {
    indice = rehabElegirPodActivo();
  }

  if (indice < 0) {
    return;
  }

  rehabUltimoPodAutomatico = indice;
  objetivoCorrecto = indice;

  var color = obtenerColorEstimulo(indice);

  fase = "automatico";
  esperandoRespuesta = false;

  textoFase.textContent = "CAMBIO AUTOMÁTICO";
  textoObjetivo.textContent = `POD ${rehabNumeroVisiblePod(indice)}`;
  nombreColor.textContent = color.nombre;
  colorObjetivo.style.background = color.css;
  mensajeResultado.textContent = "No necesitas tocar el Pod";
  mensajeResultado.className = "mensajeResultado";
  cronometro.textContent = `${(rehabTiempoAutomaticoMs / 1000).toFixed(2)} s`;
  ultimoTiempo.textContent = "AUTO";

  encenderVisual(indice, color.css);
  await enviarComandoPod(indice, color.comando);

  resultados.push({
    ronda: rondaActual,
    correcto: true,
    tiempo: null,
    estado: `Cambio automático · Pod ${rehabNumeroVisiblePod(indice)}`,
  });

  // Aquí "aciertos" representa cantidad de estímulos mostrados.
  aciertos++;
  contadorAciertos.textContent = aciertos;

  rehabTemporizadorAutomatico = setTimeout(async function () {
    if (!entrenamientoActivo || modoActual !== "automatico") {
      return;
    }

    await enviarComandoPod(indice, "off");
    apagarVisualPod(indice);

    if (pausado) {
      return;
    }

    // Pequeña separación para que el cambio visual sea claro.
    rehabTemporizadorAutomatico = setTimeout(function () {
      rehabV19IniciarRondaAutomatica();
    }, 100);
  }, rehabTiempoAutomaticoMs);
}

var rehabV19IniciarRondaBase = iniciarRonda;
iniciarRonda = async function () {
  if (modoActual === "automatico") {
    await rehabV19IniciarRondaAutomatica();
    return;
  }

  await rehabV19IniciarRondaBase();
};

// -----------------------------------------------------
// 8. PULSACIONES
// Caza de color sí usa PRESS. Cambio automático los ignora.
// -----------------------------------------------------

var rehabV19ProcesarPulsacionBase = procesarPulsacion;
procesarPulsacion = function (indice) {
  if (modoActual === "automatico" && entrenamientoActivo) {
    return;
  }

  if (
    modoActual === "cazaColor" &&
    entrenamientoActivo &&
    fase === "cazaColorRespuesta"
  ) {
    rehabV19RespuestaCazaColor(indice);
    return;
  }

  rehabV19ProcesarPulsacionBase(indice);
};

// -----------------------------------------------------
// 9. PAUSA / REANUDAR EN CAMBIO AUTOMATICO
// -----------------------------------------------------

var rehabV19AlternarPausaBase = alternarPausa;
alternarPausa = async function () {
  var estabaPausado = pausado;

  if (modoActual === "automatico") {
    rehabV19LimpiarTemporizadorAutomatico();
  }

  await rehabV19AlternarPausaBase();

  if (modoActual === "automatico" && entrenamientoActivo && estabaPausado && !pausado) {
    rehabTemporizadorAutomatico = setTimeout(function () {
      rehabV19IniciarRondaAutomatica();
    }, 250);
  }
};

if (btnPausar) {
  btnPausar.onclick = alternarPausa;
}

// -----------------------------------------------------
// 10. LIMPIEZA AL TERMINAR O CANCELAR
// -----------------------------------------------------

var rehabV19FinalizarEntrenamientoBase = finalizarEntrenamiento;
finalizarEntrenamiento = async function () {
  rehabV19LimpiarTemporizadorAutomatico();
  rehabUltimoPodAutomatico = -1;
  return await rehabV19FinalizarEntrenamientoBase();
};

var rehabV19CancelarEntrenamientoBase = cancelarEntrenamiento;
cancelarEntrenamiento = async function () {
  rehabV19LimpiarTemporizadorAutomatico();
  rehabUltimoPodAutomatico = -1;
  return await rehabV19CancelarEntrenamientoBase();
};

if (btnCancelar) {
  btnCancelar.onclick = cancelarEntrenamiento;
}

// -----------------------------------------------------
// 11. INICIALIZACION V19
// -----------------------------------------------------

(function inicializarRehabPodV19() {
  rehabV19CrearControlColorCaza();
  rehabV19CrearControlTiempoAutomatico();
  rehabV19ActualizarControlColorCaza();
  rehabV19ActualizarControlTiempoAutomatico();

  // Las categorias se construyen en V9. Damos un instante por si el DOM
  // todavía está terminando de organizar las tarjetas.
  setTimeout(function () {
    rehabV19PrepararCategorias();
  }, 0);

  console.log("RehabPod V19: Caza de color + Cambio automático activados.");
})();
// =====================================================
// REHABPOD V20
// DIFICULTAD ESPECIFICA + STROOP (PALABRA VS COLOR)
// PEGAR AL FINAL DE app.js, DESPUES DE V19.
// =====================================================

var rehabProhibidosActuales = new Set();
var rehabColorProhibidoActual = null;
var rehabUltimoColorCazaDinamico = rehabColorCaza;
var rehabReglaStroopActual = "palabra";
var rehabObjetivoStroop = -1;
var rehabColorSemanticoStroop = null;
var rehabColorVisualStroop = null;

MINIMO_PODS_POR_MODO.stroop = 2;

function rehabDificultad() {
  return dificultadActual || ajustesApp.dificultad || "media";
}

function rehabElegirColorClave(excluir) {
  excluir = excluir || [];
  var disponibles = REHABPOD_COLORES_CAZA.filter(function (c) {
    return !excluir.includes(c) && catalogoColoresPersonalizados[c];
  });
  if (!disponibles.length) disponibles = REHABPOD_COLORES_CAZA.slice();
  return disponibles[Math.floor(Math.random() * disponibles.length)];
}

function rehabColorPorClave(clave) {
  return catalogoColoresPersonalizados[clave] || catalogoColoresPersonalizados.blue;
}

// -----------------------------------------------------
// 1. RESUMEN DE DIFICULTAD ESPECIFICO POR MODO
// -----------------------------------------------------
function rehabDescripcionDificultadEspecifica(modo, dificultad) {
  var mapa = {
    simple: {
      facil: "Fácil · El estímulo tarda 2–4 s en aparecer y hay más pausa entre rondas.",
      media: "Media · Espera de 1–3 s y ritmo equilibrado.",
      dificil: "Difícil · El estímulo aparece en 0.5–1.5 s y la pausa es corta.",
      personalizada: "Personal · Tú eliges la espera y la pausa entre rondas.",
    },
    colores: {
      facil: "Fácil · Ritmo lento para identificar con calma el color objetivo.",
      media: "Media · Colores dinámicos y ritmo equilibrado.",
      dificil:
        "Difícil · Los colores cambian con espera y pausas más cortas; exige discriminación rápida.",
      personalizada:
        "Personal · Mantiene los colores dinámicos y usa tus tiempos personalizados.",
    },
    secuencia: {
      facil: "Fácil · La secuencia crece de 1 en 1 y se muestra lentamente.",
      media: "Media · La secuencia crece de 1 en 1 a velocidad normal.",
      dificil: "Difícil · La secuencia crece de 2 en 2 y se muestra mucho más rápido.",
      personalizada:
        "Personal · La secuencia crece de 1 en 1 con los tiempos personalizados disponibles.",
    },
    libre: {
      facil: "Fácil · Sesión libre con ritmo cómodo y sin una secuencia obligatoria.",
      media: "Media · Sesión libre para mantener un ritmo continuo.",
      dificil:
        "Difícil · Busca mantener golpes rápidos y continuos; la app conserva el registro de tiempos.",
      personalizada: "Personal · Sesión libre con la configuración general elegida.",
    },
    persecucion: {
      facil: "Fácil · El siguiente objetivo aparece con una pausa aproximada de 450 ms.",
      media: "Media · El siguiente objetivo aparece con una pausa aproximada de 250 ms.",
      dificil:
        "Difícil · El objetivo cambia casi inmediatamente, con una pausa aproximada de 120 ms.",
      personalizada:
        "Personal · Mantiene el comportamiento de persecución con la configuración disponible.",
    },
    doble: {
      facil: "Fácil · Toca los dos Pods objetivo; no importa el orden ni la mano.",
      media: "Media · Toca los dos Pods con un ritmo más rápido; no importa el orden.",
      dificil:
        "Difícil · La pantalla asigna un Pod a IZQUIERDA y otro a DERECHA. La app valida los Pods, pero el sensor actual no puede comprobar qué mano usaste.",
      personalizada:
        "Personal · Dos objetivos simultáneos con tus tiempos personalizados.",
    },
    prohibido: {
      facil:
        "Fácil · 1 Pod muestra el color prohibido. Toca cualquiera de los permitidos.",
      media:
        "Media · Hasta 2 Pods muestran el mismo color prohibido. Debes evitar ambos.",
      dificil:
        "Difícil · Entre 2 y 3 Pods pueden mostrar el mismo color prohibido, variando aleatoriamente según la cantidad de Pods activos.",
      personalizada: "Personal · 1 Pod prohibido y tus tiempos personalizados.",
    },
    circuito: {
      facil: "Fácil · Recorre los Pods en orden lógico 1→2→3→4 (solo los seleccionados).",
      media: "Media · El orden del circuito cambia aleatoriamente en cada ronda.",
      dificil: "Difícil · Orden aleatorio y ritmo más rápido entre estímulos.",
      personalizada:
        "Personal · Circuito con orden aleatorio y configuración general personalizada.",
    },
    contrarreloj: {
      facil: "Fácil · Prioriza precisión durante el tiempo disponible.",
      media: "Media · Equilibrio entre velocidad y precisión.",
      dificil:
        "Difícil · Busca encadenar respuestas lo más rápido posible; el siguiente objetivo aparece inmediatamente tras acertar.",
      personalizada:
        "Personal · Mantiene la duración elegida y la configuración general personalizada.",
    },
    entrenador: {
      facil: "Fácil · El entrenador puede dar más tiempo entre activaciones manuales.",
      media: "Media · Control manual con ritmo normal.",
      dificil:
        "Difícil · El entrenador puede alternar Pods rápidamente y combinar indicaciones físicas o cognitivas.",
      personalizada:
        "Personal · El entrenador controla manualmente la exigencia de la sesión.",
    },
    cazaColor: {
      facil: "Fácil · Busca el mismo color durante todo el entrenamiento.",
      media: "Media · El color objetivo cambia automáticamente cada 3 rondas.",
      dificil:
        "Difícil · El color objetivo puede cambiar en cada ronda; debes leer el nuevo objetivo antes de responder.",
      personalizada:
        "Personal · Mantiene fijo el color que elegiste y usa la configuración personalizada.",
    },
    automatico: {
      facil:
        "Fácil · Cada estímulo permanece encendido aproximadamente 2 s antes de cambiar solo.",
      media: "Media · Cada estímulo permanece aproximadamente 1 s.",
      dificil: "Difícil · Cambio automático rápido, aproximadamente cada 0.5 s.",
      personalizada:
        "Personal · Se usa exactamente el tiempo por estímulo que seleccionaste.",
    },
    stroop: {
      facil:
        "Fácil · La pantalla te indica claramente si debes seguir la PALABRA o el COLOR visual.",
      media: "Media · La regla PALABRA/COLOR cambia aleatoriamente en cada ronda.",
      dificil:
        "Difícil · La regla cambia en cada ronda y la palabra siempre aparece escrita con un color diferente para generar interferencia Stroop.",
      personalizada: "Personal · Regla aleatoria con tus tiempos personalizados.",
    },
  };
  var grupo = mapa[modo] || mapa.simple;
  return grupo[dificultad] || grupo.media;
}

var rehabV20ActualizarResumenBase = actualizarResumenDificultad;
actualizarResumenDificultad = function () {
  var resumen = document.getElementById("resumenDificultadReactiPod");
  if (!resumen) return;
  resumen.textContent = rehabDescripcionDificultadEspecifica(
    modoActual,
    rehabDificultad()
  );
};

// -----------------------------------------------------
// 2. COLOR PROHIBIDO: 1 / 2 / 2-3 PODS PROHIBIDOS
// -----------------------------------------------------
activarColorProhibido = async function () {
  fase = "prohibidoRespuesta";
  var activos = rehabIndicesPodsActivos();
  if (activos.length < 2) return;

  var maxPermitido = Math.max(1, activos.length - 1); // siempre queda al menos un Pod válido
  var cantidadProhibidos = 1;
  var dif = rehabDificultad();

  if (dif === "media") {
    cantidadProhibidos = Math.min(2, maxPermitido);
  } else if (dif === "dificil") {
    var maxDificil = Math.min(3, maxPermitido);
    var minDificil = Math.min(2, maxDificil);
    cantidadProhibidos =
      minDificil + Math.floor(Math.random() * (maxDificil - minDificil + 1));
  }

  var claveProhibida = rehabElegirColorClave([]);
  rehabColorProhibidoActual = rehabColorPorClave(claveProhibida);
  var mezclados = rehabMezclarCopia(activos);
  rehabProhibidosActuales = new Set(mezclados.slice(0, cantidadProhibidos));
  indiceColorProhibido = mezclados[0]; // compatibilidad con variables antiguas
  coloresActuales = new Array(podsBLE.length).fill(null);

  var clavesPermitidas = REHABPOD_COLORES_CAZA.filter(function (c) {
    return c !== claveProhibida;
  });
  var pos = 0;

  activos.forEach(function (indice) {
    var color;
    if (rehabProhibidosActuales.has(indice)) {
      color = rehabColorProhibidoActual;
    } else {
      color = rehabColorPorClave(clavesPermitidas[pos % clavesPermitidas.length]);
      pos++;
    }
    coloresActuales[indice] = color;
    encenderVisual(indice, color.css);
  });

  await Promise.all(
    activos.map(function (indice) {
      return enviarComandoPod(indice, coloresActuales[indice].comando);
    })
  );

  textoFase.textContent = "¡CUIDADO!";
  textoObjetivo.textContent =
    cantidadProhibidos === 1
      ? "NO TOQUES ESTE COLOR"
      : `EVITA ${cantidadProhibidos} PODS`;
  nombreColor.textContent = rehabColorProhibidoActual.nombre;
  colorObjetivo.style.background = rehabColorProhibidoActual.css;
  mensajeResultado.textContent =
    cantidadProhibidos > 1
      ? `${cantidadProhibidos} Pods tienen el color prohibido`
      : "Evita el color prohibido";
  mensajeResultado.className = "mensajeResultado";
  iniciarMedicion();
};

respuestaColorProhibido = async function (indice) {
  if (!esperandoRespuesta) return;
  esperandoRespuesta = false;
  detenerCronometro();
  fase = "resultado";

  var tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;
  var correcto = !rehabProhibidosActuales.has(indice);
  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

  if (correcto) {
    aciertos++;
    contadorAciertos.textContent = aciertos;
    mensajeResultado.textContent = `✅ Evitaste ${rehabColorProhibidoActual.nombre}`;
    mensajeResultado.className = "mensajeResultado mensajeCorrecto";
    tono(1000, 130);
  } else {
    errores++;
    contadorErrores.textContent = errores;
    mensajeResultado.textContent = `❌ Tocaste un Pod ${rehabColorProhibidoActual.nombre} prohibido`;
    mensajeResultado.className = "mensajeResultado mensajeError";
    tono(220, 240);
  }

  resultados.push({
    ronda: rondaActual,
    correcto: correcto,
    tiempo: tiempo,
    estado: correcto
      ? `Evitó ${rehabColorProhibidoActual.nombre}`
      : `Tocó prohibido ${rehabColorProhibidoActual.nombre}`,
  });

  await apagarTodosLosPods();
  continuar();
};

// -----------------------------------------------------
// 3. DOBLE ESTIMULO: COORDINACION IZQUIERDA/DERECHA
// -----------------------------------------------------
var rehabV20ActivarDobleBase = activarDobleEstimulo;
activarDobleEstimulo = async function () {
  await rehabV20ActivarDobleBase();

  if (rehabDificultad() === "dificil" && objetivosDobles && objetivosDobles.length >= 2) {
    var izquierda = objetivosDobles[0];
    var derecha = objetivosDobles[1];
    textoFase.textContent = "¡DOS MANOS!";
    textoObjetivo.textContent = `IZQUIERDA → POD ${rehabNumeroVisiblePod(izquierda)}   |   DERECHA → POD ${rehabNumeroVisiblePod(derecha)}`;
    nombreColor.textContent = "COORDINACIÓN BILATERAL";
    mensajeResultado.textContent = "Usa la mano indicada para cada Pod";
    mensajeResultado.className = "mensajeResultado";
  }
};

// -----------------------------------------------------
// 4. MEMORIA: EN DIFICIL AGREGA 2 PASOS POR RONDA
// V18 sigue controlando el color fijo elegido.
// -----------------------------------------------------
iniciarSecuencia = function () {
  fase = "secuenciaMostrar";
  var cantidadAgregar = rehabDificultad() === "dificil" ? 2 : 1;

  for (var i = 0; i < cantidadAgregar; i++) {
    var elegido = rehabElegirPodActivo();
    if (elegido >= 0) secuencia.push(elegido);
  }

  indiceMostrarSecuencia = 0;
  posicionSecuencia = 0;
  textoFase.textContent = "Memoriza";
  textoObjetivo.textContent =
    rehabDificultad() === "dificil" ? "MEMORIZA · +2 PASOS" : "MEMORIZA";
  nombreColor.textContent = `${secuencia.length} pasos`;
  colorObjetivo.style.background = "#374151";
  mostrarElementoSecuencia();
};

// -----------------------------------------------------
// 5. CIRCUITO: FACIL ORDENADO; MEDIA/DIFICIL ALEATORIO
// -----------------------------------------------------
var rehabV20ActivarCircuitoBase = activarCircuito;
activarCircuito = async function () {
  if (rehabDificultad() !== "facil") {
    return await rehabV20ActivarCircuitoBase();
  }

  if (!entrenamientoActivo || pausado) return;
  circuitoOrden = rehabIndicesPodsActivos().slice();
  circuitoPosicion = 0;
  circuitoTiempoInicio = performance.now();
  fase = "circuitoRespuesta";
  esperandoRespuesta = true;
  textoFase.textContent = "¡CIRCUITO!";
  mensajeResultado.textContent = "Orden fácil: sigue los Pods en orden";
  await mostrarObjetivoCircuito();
  iniciarMedicion();
};

// -----------------------------------------------------
// 6. CAZA DE COLOR: OBJETIVO FIJO / CADA 3 / CADA RONDA
// -----------------------------------------------------
var rehabV20ActivarCazaBase = rehabV19ActivarCazaColor;
rehabV19ActivarCazaColor = async function () {
  var dif = rehabDificultad();
  var debeCambiar = false;

  if (dif === "media" && (rondaActual - 1) % 3 === 0 && rondaActual > 1)
    debeCambiar = true;
  if (dif === "dificil") debeCambiar = true;

  if (debeCambiar) {
    rehabColorCaza = rehabElegirColorClave([rehabUltimoColorCazaDinamico]);
    rehabUltimoColorCazaDinamico = rehabColorCaza;
  }

  await rehabV20ActivarCazaBase();

  if (dif === "media") {
    mensajeResultado.textContent = "El color objetivo cambia cada 3 rondas";
  } else if (dif === "dificil") {
    mensajeResultado.textContent = "Objetivo nuevo: léelo antes de tocar";
  }
};

// -----------------------------------------------------
// 7. CAMBIO AUTOMATICO: TIEMPO SEGUN DIFICULTAD
// Personal conserva el selector de V19.
// -----------------------------------------------------
var rehabV20IniciarAutomaticoBase = rehabV19IniciarRondaAutomatica;
rehabV19IniciarRondaAutomatica = async function () {
  var dif = rehabDificultad();
  if (dif === "facil") rehabTiempoAutomaticoMs = 2000;
  else if (dif === "media") rehabTiempoAutomaticoMs = 1000;
  else if (dif === "dificil") rehabTiempoAutomaticoMs = 500;
  // personalizada conserva rehabTiempoAutomaticoMs elegido por el usuario
  return await rehabV20IniciarAutomaticoBase();
};

// -----------------------------------------------------
// 8. NUEVO MODO: PALABRA VS COLOR (EFECTO STROOP)
// -----------------------------------------------------
function rehabV20CrearTarjetaStroop() {
  var tarjeta = document.createElement("button");
  tarjeta.type = "button";
  tarjeta.className = "tarjetaEntrenamientoModo";
  tarjeta.dataset.modo = "stroop";
  tarjeta.style.width = "100%";
  tarjeta.style.textAlign = "left";
  tarjeta.innerHTML = `
    <div style="font-size:34px;margin-bottom:8px;">🧠🎨</div>
    <strong style="display:block;font-size:17px;">Palabra vs color</strong>

    <small style="display:block;margin-top:6px;line-height:1.45;opacity:.78;">
      Lee la regla: toca el color que DICE la palabra o el color con el que está ESCRITA.
    </small>`;
  tarjeta.addEventListener("click", function () {
    seleccionarModo("stroop");
  });
  return tarjeta;
}

function rehabV20InsertarStroopSiCoordinacion() {
  var detalle = document.getElementById("gridDetalleCategoriaV9");
  var titulo = document.getElementById("detalleTituloV9");
  if (!detalle || !titulo || titulo.textContent.trim() !== "Coordinación") return;
  if (!detalle.querySelector('[data-modo="stroop"]'))
    detalle.appendChild(rehabV20CrearTarjetaStroop());
}

async function rehabV20ActivarStroop() {
  if (!entrenamientoActivo || pausado || modoActual !== "stroop") return;
  var activos = rehabIndicesPodsActivos();
  if (activos.length < 2) return;

  fase = "stroopRespuesta";
  esperandoRespuesta = true;

  var clavePalabra = rehabElegirColorClave([]);
  var claveVisual = rehabElegirColorClave([clavePalabra]);
  rehabColorSemanticoStroop = rehabColorPorClave(clavePalabra);
  rehabColorVisualStroop = rehabColorPorClave(claveVisual);

  var dif = rehabDificultad();
  if (dif === "facil") {
    // Fácil alterna de manera predecible por ronda.
    rehabReglaStroopActual = rondaActual % 2 === 0 ? "visual" : "palabra";
  } else {
    rehabReglaStroopActual = Math.random() < 0.5 ? "palabra" : "visual";
  }

  var colorObjetivoReal =
    rehabReglaStroopActual === "palabra"
      ? rehabColorSemanticoStroop
      : rehabColorVisualStroop;
  var claveObjetivo = rehabReglaStroopActual === "palabra" ? clavePalabra : claveVisual;
  var otrasClaves = REHABPOD_COLORES_CAZA.filter(function (c) {
    return c !== claveObjetivo;
  });
  otrasClaves = rehabMezclarCopia(otrasClaves);

  rehabObjetivoStroop = rehabElegirPodActivo();
  objetivoCorrecto = rehabObjetivoStroop;
  coloresActuales = new Array(podsBLE.length).fill(null);
  var pos = 0;

  activos.forEach(function (indice) {
    var color =
      indice === rehabObjetivoStroop
        ? colorObjetivoReal
        : rehabColorPorClave(otrasClaves[pos++ % otrasClaves.length]);
    coloresActuales[indice] = color;
    encenderVisual(indice, color.css);
  });

  await Promise.all(
    activos.map(function (indice) {
      return enviarComandoPod(indice, coloresActuales[indice].comando);
    })
  );

  textoFase.textContent = "¡STROOP!";
  textoObjetivo.textContent =
    rehabReglaStroopActual === "palabra"
      ? "TOCA LO QUE DICE"
      : "TOCA EL COLOR DE LA PALABRA";
  nombreColor.textContent = rehabColorSemanticoStroop.nombre;
  nombreColor.style.color = rehabColorVisualStroop.css;
  nombreColor.style.fontWeight = "900";
  nombreColor.style.textShadow = "0 1px 2px rgba(0,0,0,.25)";
  colorObjetivo.style.background = rehabColorVisualStroop.css;
  mensajeResultado.textContent =
    rehabReglaStroopActual === "palabra"
      ? `La palabra dice ${rehabColorSemanticoStroop.nombre}; ignora el color de las letras.`
      : `Ignora lo que dice la palabra; busca el color ${rehabColorVisualStroop.nombre} de las letras.`;
  mensajeResultado.className = "mensajeResultado";
  iniciarMedicion();
}

async function rehabV20RespuestaStroop(indice) {
  if (
    !entrenamientoActivo ||
    modoActual !== "stroop" ||
    fase !== "stroopRespuesta" ||
    !esperandoRespuesta
  )
    return;
  esperandoRespuesta = false;
  detenerCronometro();
  fase = "resultado";

  var tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;
  var correcto = indice === rehabObjetivoStroop;
  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

  if (correcto) {
    aciertos++;
    contadorAciertos.textContent = aciertos;
    mensajeResultado.textContent = `✅ CORRECTO · ${tiempo.toFixed(3)} s`;
    mensajeResultado.className = "mensajeResultado mensajeCorrecto";
    tono(1000, 130);
  } else {
    errores++;
    contadorErrores.textContent = errores;
    mensajeResultado.textContent = "❌ Respuesta incorrecta";
    mensajeResultado.className = "mensajeResultado mensajeError";
    tono(220, 220);
  }

  resultados.push({
    ronda: rondaActual,
    correcto: correcto,
    tiempo: tiempo,
    estado: `Stroop ${rehabReglaStroopActual === "palabra" ? "palabra" : "color visual"}`,
  });

  nombreColor.style.color = "";
  nombreColor.style.textShadow = "";
  await apagarTodosLosPods();

  continuar();
}

// Interceptar estimulo: V19 ya intercepta Caza; V20 añade Stroop.
var rehabV20ActivarEstimuloBase = activarEstimulo;
activarEstimulo = async function () {
  if (modoActual === "stroop") {
    await rehabV20ActivarStroop();
    return;
  }
  await rehabV20ActivarEstimuloBase();
};

// Interceptar PRESS para Stroop.
var rehabV20ProcesarPulsacionBase = procesarPulsacion;
procesarPulsacion = function (indice) {
  if (modoActual === "stroop" && entrenamientoActivo && fase === "stroopRespuesta") {
    rehabV20RespuestaStroop(indice);
    return;
  }
  rehabV20ProcesarPulsacionBase(indice);
};

// -----------------------------------------------------
// 9. CONFIGURACION, NOMBRE, DESCRIPCION Y GUIA DE STROOP
// -----------------------------------------------------
var rehabV20ConfigurarModoBase = configurarModo;
configurarModo = function () {
  rehabV20ConfigurarModoBase();
  if (modoActual === "stroop") {
    tituloConfiguracion.textContent = "Palabra vs color";
    iconoConfiguracion.textContent = "🧠🎨";
  }
  actualizarResumenDificultad();
  rehabActualizarEtiquetasMinimoPods();
  rehabActualizarDescripcionModo();
};

var rehabV20DescripcionBase = rehabActualizarDescripcionModo;
rehabActualizarDescripcionModo = function () {
  rehabV20DescripcionBase();
  if (modoActual === "stroop" && descripcionModo) {
    descripcionModo.textContent =
      "Entrenamiento de atención e inhibición: la palabra puede decir un color pero estar escrita con otro. Sigue la regla indicada en cada ronda.";
  }
};

var rehabV20NombreModoBase = obtenerNombreModo;
obtenerNombreModo = function () {
  if (modoActual === "stroop") return "Palabra vs color";
  return rehabV20NombreModoBase();
};

var rehabV20GuiaBase = obtenerGuiaModoV7;
obtenerGuiaModoV7 = function () {
  if (modoActual === "stroop") {
    return {
      icono: "🧠🎨",
      titulo: "Palabra vs color",
      descripcion: "La palabra y el color con el que está escrita pueden ser diferentes.",
      pasos: [
        "Si dice TOCA LO QUE DICE, busca en los Pods el color nombrado por la palabra.",
        "Si dice TOCA EL COLOR DE LA PALABRA, ignora el texto y busca el color con el que están pintadas las letras.",
        "Toca el Pod que tenga el color correcto según la regla.",
      ],
    };
  }
  return rehabV20GuiaBase();
};

// -----------------------------------------------------
// 10. AL CAMBIAR DIFICULTAD, ACTUALIZAR TEXTO INMEDIATO
// -----------------------------------------------------
document.querySelectorAll("[data-dificultad]").forEach(function (boton) {
  boton.addEventListener("click", function () {
    setTimeout(function () {
      actualizarResumenDificultad();
      if (modoActual === "automatico") rehabV19ActualizarControlTiempoAutomatico();
    }, 0);
  });
});

// -----------------------------------------------------
// 11. LIMPIEZA VISUAL STROOP
// -----------------------------------------------------
var rehabV20FinalizarBase = finalizarEntrenamiento;
finalizarEntrenamiento = async function () {
  if (nombreColor) {
    nombreColor.style.color = "";
    nombreColor.style.textShadow = "";
  }
  return await rehabV20FinalizarBase();
};

var rehabV20CancelarBase = cancelarEntrenamiento;
cancelarEntrenamiento = async function () {
  if (nombreColor) {
    nombreColor.style.color = "";
    nombreColor.style.textShadow = "";
  }
  return await rehabV20CancelarBase();
};

if (btnCancelar) btnCancelar.onclick = cancelarEntrenamiento;

(function inicializarRehabPodV20() {
  setTimeout(function () {
    var coordinacion = document.querySelector('[data-categoria="coordinacion"]');
    if (coordinacion && coordinacion.dataset.rehabV20 !== "1") {
      coordinacion.dataset.rehabV20 = "1";
      coordinacion.addEventListener("click", function () {
        setTimeout(rehabV20InsertarStroopSiCoordinacion, 0);
      });
      var contador = coordinacion.querySelector("small");
      if (contador) contador.textContent = "5 entrenamientos";
    }
    rehabV20InsertarStroopSiCoordinacion();
    actualizarResumenDificultad();
  }, 0);
  console.log("RehabPod V20: dificultad específica + Palabra vs color activados.");
})();
// =====================================================
// REHABPOD V21
// FEEDBACK UNIVERSAL DE RESPUESTA
// Verde = pulsacion correcta
// Rojo  = pulsacion incorrecta
// Pegar TODO este bloque al FINAL de app.js, despues de V20.
// =====================================================

const REHAB_V21_VERDE = "#22c55e";
const REHAB_V21_ROJO = "#ef4444";
const REHAB_V21_DURACION = 240;

function rehabV21Esperar(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// Ilumina UNICAMENTE el Pod que se presiono.
// Si restaurarComando/restaurarCss se indican, vuelve al color anterior
// despues del feedback. Esto se usa, por ejemplo, en Caza de color cuando
// el usuario toca un color incorrecto y debe seguir buscando en la misma ronda.
async function rehabV21FeedbackPod(
  indice,
  correcto,
  duracion,
  restaurarComando,
  restaurarCss
) {
  if (typeof indice !== "number" || indice < 0 || indice >= podsBLE.length) return;

  var comando = correcto ? "green" : "red";
  var css = correcto ? REHAB_V21_VERDE : REHAB_V21_ROJO;
  var tiempo = typeof duracion === "number" ? duracion : REHAB_V21_DURACION;

  try {
    encenderVisual(indice, css);
    await enviarComandoPod(indice, comando);
    await rehabV21Esperar(tiempo);

    if (restaurarComando) {
      await enviarComandoPod(indice, restaurarComando);
      encenderVisual(indice, restaurarCss || "#64748b");
    } else {
      await enviarComandoPod(indice, "off");
      apagarVisualPod(indice);
    }
  } catch (error) {
    console.warn("RehabPod V21: no se pudo mostrar feedback en Pod", indice + 1, error);
  }
}

// =====================================================
// 1. MODO LIBRE + PASOS CORRECTOS DE MEMORIA
// La funcion original iluminaba el Pod con el color del estimulo.
// Desde V21, cualquier golpe correcto de estas funciones se muestra VERDE.
// =====================================================
iluminarPodPresionado = async function (indice, duracion = 300) {
  await rehabV21FeedbackPod(indice, true, duracion);
};

// =====================================================
// 2. RESPUESTA NORMAL
// Reaccion aleatoria + Reaccion por colores.
// La logica original decide si es correcto y registra el resultado.
// Al terminar esa evaluacion, V21 muestra verde o rojo en el Pod presionado.
// =====================================================
var rehabV21RespuestaNormalBase = respuestaNormal;
respuestaNormal = async function (indice) {
  // Persecucion tiene su propia funcion V21 mas abajo.
  if (modoActual === "persecucion") {
    await respuestaPersecucion(indice);
    return;
  }

  if (!esperandoRespuesta) return;
  var correcto = indice === objetivoCorrecto;

  await rehabV21RespuestaNormalBase(indice);
  await rehabV21FeedbackPod(indice, correcto, REHAB_V21_DURACION);
};

// =====================================================
// 3. DOBLE ESTIMULO
// Correcto: el Pod tocado parpadea verde.
// Incorrecto: el Pod tocado parpadea rojo.
// En dificultad dificil se conserva la indicacion IZQUIERDA / DERECHA de V20.
// =====================================================
var rehabV21RespuestaDobleBase = respuestaDobleEstimulo;
respuestaDobleEstimulo = async function (indice) {
  if (!esperandoRespuesta) return;
  var correcto = objetivosDoblesPendientes && objetivosDoblesPendientes.has(indice);

  await rehabV21RespuestaDobleBase(indice);
  await rehabV21FeedbackPod(indice, correcto, 210);
};

// =====================================================
// 4. COLOR PROHIBIDO
// Correcto (toco un color permitido) = verde.
// Incorrecto (toco uno de los prohibidos) = rojo.
// =====================================================
var rehabV21RespuestaProhibidoBase = respuestaColorProhibido;
respuestaColorProhibido = async function (indice) {
  if (!esperandoRespuesta) return;

  var correcto;
  if (
    typeof rehabProhibidosActuales !== "undefined" &&
    rehabProhibidosActuales instanceof Set
  ) {
    correcto = !rehabProhibidosActuales.has(indice);
  } else {
    correcto = indice !== indiceColorProhibido;
  }

  await rehabV21RespuestaProhibidoBase(indice);
  await rehabV21FeedbackPod(indice, correcto, REHAB_V21_DURACION);
};

// =====================================================
// 5. CIRCUITO
// Si toca el siguiente Pod correcto = verde.
// Si toca otro = rojo.
// =====================================================
var rehabV21RespuestaCircuitoBase = respuestaCircuito;
respuestaCircuito = async function (indice) {
  if (!esperandoRespuesta || circuitoPosicion >= circuitoOrden.length) return;
  var esperado = circuitoOrden[circuitoPosicion];
  var correcto = indice === esperado;

  await rehabV21RespuestaCircuitoBase(indice);
  await rehabV21FeedbackPod(indice, correcto, 210);
};

// =====================================================
// 6. MODO ENTRENADOR
// El Pod solicitado por el entrenador = verde.
// Otro Pod = rojo.
// =====================================================
var rehabV21RespuestaEntrenadorBase = respuestaEntrenador;
respuestaEntrenador = async function (indice) {
  if (!entrenamientoActivo || modoActual !== "entrenador" || !esperandoRespuesta) return;
  var correcto = indice === objetivoEntrenador;

  await rehabV21RespuestaEntrenadorBase(indice);
  await rehabV21FeedbackPod(indice, correcto, REHAB_V21_DURACION);
};

// =====================================================
// 7. CAZA DE COLOR
// Si encuentra el color objetivo = verde.
// Si toca otro color = rojo y luego el Pod vuelve al color que tenia,
// porque la ronda continua hasta encontrar el objetivo correcto.
// =====================================================
var rehabV21RespuestaCazaBase = rehabV19RespuestaCazaColor;
rehabV19RespuestaCazaColor = async function (indice) {
  if (
    !entrenamientoActivo ||
    modoActual !== "cazaColor" ||
    fase !== "cazaColorRespuesta" ||
    !esperandoRespuesta
  )
    return;

  var correcto = indice === objetivoCorrecto;
  var colorAnterior =
    coloresActuales && coloresActuales[indice] ? coloresActuales[indice] : null;

  await rehabV21RespuestaCazaBase(indice);

  if (correcto) {
    await rehabV21FeedbackPod(indice, true, REHAB_V21_DURACION);
  } else {
    await rehabV21FeedbackPod(
      indice,
      false,
      REHAB_V21_DURACION,
      colorAnterior ? colorAnterior.comando : null,
      colorAnterior ? colorAnterior.css : null
    );
  }
};

// =====================================================
// 8. PALABRA VS COLOR (STROOP)
// Respuesta correcta = verde.
// Respuesta incorrecta = rojo.
// =====================================================
var rehabV21RespuestaStroopBase = rehabV20RespuestaStroop;
rehabV20RespuestaStroop = async function (indice) {
  if (
    !entrenamientoActivo ||
    modoActual !== "stroop" ||
    fase !== "stroopRespuesta" ||
    !esperandoRespuesta
  )
    return;
  var correcto = indice === rehabObjetivoStroop;

  await rehabV21RespuestaStroopBase(indice);
  await rehabV21FeedbackPod(indice, correcto, REHAB_V21_DURACION);
};

// =====================================================
// 9. PERSECUCION
// Se reemplaza esta funcion para que el feedback ocurra ANTES de encender
// el siguiente objetivo. Asi el verde/rojo no tapa el siguiente estimulo.
// =====================================================
respuestaPersecucion = async function (indice) {
  if (!esperandoRespuesta) return;

  var tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;

  if (indice !== objetivoCorrecto) {
    errores++;

    contadorErrores.textContent = errores;
    mensajeResultado.textContent = `❌ Pod ${rehabNumeroVisiblePod(indice)} incorrecto`;
    mensajeResultado.className = "mensajeResultado mensajeError";
    tono(220, 120);

    await rehabV21FeedbackPod(indice, false, 190);
    return;
  }

  esperandoRespuesta = false;
  detenerCronometro();

  aciertos++;
  rondaActual = Math.max(rondaActual, aciertos);
  contadorAciertos.textContent = aciertos;
  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;
  mensajeResultado.textContent = `✅ ${tiempo.toFixed(3)} s`;
  mensajeResultado.className = "mensajeResultado mensajeCorrecto";
  tono(900, 70);

  resultados.push({
    ronda: aciertos,
    correcto: true,

    tiempo: tiempo,
    estado: `Pod ${rehabNumeroVisiblePod(indice)}`,
  });

  await apagarTodosLosPods();
  await rehabV21FeedbackPod(indice, true, 190);

  if (aciertos >= totalRondasActual) {
    fase = "resultado";
    esperandoRespuesta = false;
    detenerCronometro();
    temporizador = setTimeout(finalizarEntrenamiento, 250);
    return;
  }

  textoRonda.textContent = `Objetivo ${aciertos + 1} de ${totalRondasActual}`;

  var pausaPersecucion =
    dificultadActual === "dificil" ? 120 : dificultadActual === "facil" ? 450 : 250;

  temporizador = setTimeout(activarPersecucion, pausaPersecucion);
};

// =====================================================
// 10. CONTRARRELOJ
// Feedback antes del siguiente objetivo para evitar que el color verde/rojo
// interfiera visualmente con el siguiente estimulo.
// =====================================================
respuestaContrarreloj = async function (indice) {
  if (!entrenamientoActivo || modoActual !== "contrarreloj" || !esperandoRespuesta)
    return;

  esperandoRespuesta = false;
  detenerCronometro();

  var tiempo = (performance.now() - tiempoInicio - tiempoPausado) / 1000;
  var correcto = indice === objetivoContrarreloj;
  ultimoTiempo.textContent = `${tiempo.toFixed(3)} s`;

  if (correcto) {
    aciertos++;
    contadorAciertos.textContent = aciertos;
    mensajeResultado.textContent = `✅ ${tiempo.toFixed(3)} s`;
    mensajeResultado.className = "mensajeResultado mensajeCorrecto";
    tono(980, 80);
  } else {
    errores++;
    contadorErrores.textContent = errores;
    mensajeResultado.textContent = `❌ Era el Pod ${rehabNumeroVisiblePod(objetivoContrarreloj)}`;
    mensajeResultado.className = "mensajeResultado mensajeError";
    tono(220, 100);
  }

  resultados.push({
    ronda: rondaActual,
    correcto: correcto,
    tiempo: tiempo,
    estado: correcto
      ? `Pod ${rehabNumeroVisiblePod(objetivoContrarreloj)} correcto`
      : `Pod ${rehabNumeroVisiblePod(indice)}; objetivo Pod ${rehabNumeroVisiblePod(objetivoContrarreloj)}`,
  });

  await apagarTodosLosPods();
  await rehabV21FeedbackPod(indice, correcto, 190);

  if (performance.now() >= finContrarrelojMs) {
    terminarContrarreloj();
    return;
  }

  await activarObjetivoContrarreloj();
};

// =====================================================
// 11. MEMORIA / SECUENCIA
// - Cada paso correcto usa iluminarPodPresionado(), que V21 puso en VERDE.
// - Un error ya pone TODOS los Pods en ROJO (logica existente).
// - Una secuencia completa ya pone TODOS los Pods en VERDE (logica existente).
// No hace falta reemplazar respuestaSecuencia().
// =====================================================

// =====================================================
// 12. CAMBIO AUTOMATICO
// Este modo NO espera una pulsacion del usuario, por lo tanto no existe una
// respuesta correcta/incorrecta que marcar. Se conserva sin feedback verde/rojo.
// =====================================================

console.log(
  "RehabPod V21: feedback universal verde/correcto y rojo/incorrecto activado."
);
// =====================================================
// REHABPOD V22
// NUEVAS CATEGORIAS PRINCIPALES:
// 1) DEPORTISTA
// 2) FISIOTERAPIA
// 3) NEUROLOGIA
//
// Pegar TODO este bloque al FINAL de app.js, despues de V21.
// No elimina ningun modo: solo reorganiza la pantalla de categorias.
// Un mismo entrenamiento puede aparecer en mas de una categoria.
// =====================================================

(function () {
  const REHAB_V22_MODOS = {
    simple: {
      icono: "⚡",
      titulo: "Reacción aleatoria",
      descripcion: "Responde al Pod que se enciende de forma aleatoria.",
    },
    colores: {
      icono: "🎨",
      titulo: "Reacción por colores",
      descripcion: "Identifica el color indicado y toca el Pod correcto.",
    },
    secuencia: {
      icono: "🧠",
      titulo: "Secuencia / memoria",
      descripcion: "Memoriza y repite una secuencia de Pods.",
    },
    libre: {
      icono: "🏃",
      titulo: "Modo libre",
      descripcion: "Golpea libremente los Pods y registra el ritmo entre contactos.",
    },
    persecucion: {
      icono: "🔥",
      titulo: "Persecución",
      descripcion: "Sigue el estímulo mientras va cambiando rápidamente entre Pods.",
    },
    doble: {
      icono: "⚡⚡",

      titulo: "Doble estímulo",
      descripcion: "Responde a dos Pods en una misma ronda.",
    },
    prohibido: {
      icono: "🚫🎨",
      titulo: "Color prohibido",
      descripcion: "Evita el color prohibido y responde únicamente a los permitidos.",
    },
    circuito: {
      icono: "🔄",
      titulo: "Circuito",
      descripcion: "Completa un recorrido entre los Pods siguiendo el orden indicado.",
    },
    contrarreloj: {
      icono: "⏱️",
      titulo: "Contrarreloj",
      descripcion:
        "Consigue la mayor cantidad de respuestas dentro del tiempo disponible.",
    },
    entrenador: {
      icono: "🧑‍🏫",
      titulo: "Modo entrenador",
      descripcion:
        "El profesional o entrenador activa manualmente el Pod que desea trabajar.",
    },
    cazaColor: {
      icono: "🎯🎨",
      titulo: "Caza de color",
      descripcion: "Busca repetidamente el color objetivo aunque cambie de posición.",
    },
    automatico: {
      icono: "🔁⚡",
      titulo: "Cambio automático",
      descripcion:
        "Los estímulos cambian de Pod automáticamente sin necesidad de golpearlos.",
    },
    stroop: {
      icono: "🧠🎨",
      titulo: "Palabra vs color",
      descripcion: "Responde según la palabra escrita o según su color visual.",
    },
  };

  const REHAB_V22_CATEGORIAS = [
    {
      clave: "deportista",
      icono: "🏅",
      titulo: "Deportista",
      subtitulo: "Velocidad, agilidad, coordinación y reacción",

      descripcion:
        "Entrenamientos orientados al rendimiento físico, la velocidad de respuesta, los desplazamientos y la coordinación.",
      modos: [
        "simple",
        "persecucion",
        "doble",
        "circuito",
        "contrarreloj",
        "colores",
        "cazaColor",
        "automatico",
        "libre",
        "entrenador",
      ],
    },
    {
      clave: "fisioterapia",
      icono: "🦾",
      titulo: "Fisioterapia",
      subtitulo: "Movimiento, control y progresión funcional",
      descripcion:
        "Ejercicios que pueden organizarse para trabajar movilidad, coordinación, alcance y respuesta motora de forma progresiva.",
      modos: [
        "simple",
        "libre",
        "automatico",
        "circuito",
        "colores",
        "doble",
        "cazaColor",
        "secuencia",
        "entrenador",
      ],
    },
    {
      clave: "neurologia",
      icono: "🧠",
      titulo: "Neurología",
      subtitulo: "Atención, memoria, inhibición y procesamiento",
      descripcion:
        "Entrenamientos centrados en memoria, atención, discriminación visual, toma de decisiones y respuesta a estímulos.",
      modos: [
        "secuencia",
        "prohibido",
        "stroop",
        "colores",
        "cazaColor",
        "simple",
        "doble",
        "automatico",
      ],
    },
  ];

  function rehabV22AgregarEstilos() {
    if (document.getElementById("rehabV22Estilos")) return;

    const style = document.createElement("style");
    style.id = "rehabV22Estilos";
    style.textContent = `
      #rehabV22Categorias {
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:14px;
        margin-top:16px;
      }

      .rehabV22Categoria {
        appearance:none;
        width:100%;
        border:1px solid rgba(148,163,184,.22);
        border-radius:20px;
        padding:20px;
        text-align:left;
        cursor:pointer;
        color:inherit;
        background:rgba(148,163,184,.08);
        transition:transform .18s ease, border-color .18s ease, background .18s ease;
      }

      .rehabV22Categoria:hover {
        transform:translateY(-2px);
        border-color:rgba(59,130,246,.55);
        background:rgba(59,130,246,.09);
      }

      .rehabV22CategoriaIcono {
        font-size:34px;
        margin-bottom:10px;
      }

      .rehabV22CategoriaTitulo {
        font-size:1.18rem;
        font-weight:800;
        margin-bottom:5px;
      }

      .rehabV22CategoriaSubtitulo {
        opacity:.78;
        font-size:.9rem;
        line-height:1.35;
      }

      .rehabV22CategoriaCantidad {
        margin-top:12px;

        font-size:.78rem;
        font-weight:700;
        opacity:.72;
      }

      #rehabV22Detalle {
        margin-top:16px;
      }

      .rehabV22Volver {
        appearance:none;
        border:0;
        background:transparent;
        color:inherit;
        font-weight:800;
        cursor:pointer;
        padding:8px 0 14px;
      }

      .rehabV22DetalleCabecera {
        display:flex;
        gap:14px;
        align-items:center;
        margin-bottom:16px;
      }

      .rehabV22DetalleIcono {
        font-size:38px;
      }

      .rehabV22DetalleTitulo {
        font-size:1.35rem;
        font-weight:900;
      }

      .rehabV22DetalleDescripcion {
        opacity:.78;
        margin-top:4px;
        line-height:1.4;
      }

      .rehabV22GridModos {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
      }

      .rehabV22Modo {
        appearance:none;
        width:100%;
        border:1px solid rgba(148,163,184,.20);
        border-radius:17px;
        padding:16px;
        background:rgba(148,163,184,.07);
        color:inherit;
        cursor:pointer;
        text-align:left;
        display:flex;
        gap:12px;
        align-items:flex-start;
        transition:transform .16s ease, border-color .16s ease, background .16s ease;
      }

      .rehabV22Modo:hover {
        transform:translateY(-1px);
        border-color:rgba(34,197,94,.50);
        background:rgba(34,197,94,.07);
      }

      .rehabV22ModoIcono {
        font-size:26px;
        min-width:34px;
      }

      .rehabV22ModoTitulo {

        font-weight:850;
        margin-bottom:4px;
      }

      .rehabV22ModoDescripcion {
        font-size:.85rem;
        opacity:.75;
        line-height:1.35;
      }

      .rehabV22Nota {
        margin-top:16px;
        font-size:.78rem;
        opacity:.66;
        line-height:1.4;
      }

      @media (max-width:760px) {
        #rehabV22Categorias,
        .rehabV22GridModos {
          grid-template-columns:1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function rehabV22CrearTarjetaCategoria(categoria) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "rehabV22Categoria";
    boton.dataset.categoria = categoria.clave;

    boton.innerHTML = `
      <div class="rehabV22CategoriaIcono">${categoria.icono}</div>
      <div class="rehabV22CategoriaTitulo">${categoria.titulo}</div>
      <div class="rehabV22CategoriaSubtitulo">${categoria.subtitulo}</div>
      <div class="rehabV22CategoriaCantidad">${categoria.modos.length} entrenamientos</div>
    `;

    boton.addEventListener("click", function () {
      rehabV22MostrarDetalle(categoria.clave);
    });

    return boton;
  }

  function rehabV22CrearTarjetaModo(claveModo) {
    const modo = REHAB_V22_MODOS[claveModo];
    if (!modo) return null;

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "rehabV22Modo";
    boton.dataset.modo = claveModo;

    boton.innerHTML = `
      <div class="rehabV22ModoIcono">${modo.icono}</div>
      <div>
        <div class="rehabV22ModoTitulo">${modo.titulo}</div>
        <div class="rehabV22ModoDescripcion">${modo.descripcion}</div>
      </div>
    `;

    boton.addEventListener("click", function () {
      seleccionarModo(claveModo);
    });

    return boton;
  }

  function rehabV22MostrarCategorias() {
    const vistaCategorias = document.getElementById("rehabV22Categorias");
    const detalle = document.getElementById("rehabV22Detalle");
    if (!vistaCategorias || !detalle) return;

    vistaCategorias.hidden = false;
    detalle.hidden = true;

    const encabezado = document.getElementById("encabezadoModosV8");
    if (encabezado) {
      const h2 = encabezado.querySelector("h2");
      const p = encabezado.querySelector("p");
      const eyebrow = encabezado.querySelector(".rpEyebrow");

      if (eyebrow) eyebrow.textContent = "ENTRENAMIENTOS REHABPOD";
      if (h2) h2.textContent = "Elige el área de entrenamiento";
      if (p) {
        p.textContent =
          "Selecciona Deportista, Fisioterapia o Neurología para ver los ejercicios disponibles.";
      }
    }
  }

  function rehabV22MostrarDetalle(claveCategoria) {
    const categoria = REHAB_V22_CATEGORIAS.find(function (item) {
      return item.clave === claveCategoria;
    });

    if (!categoria) return;

    const vistaCategorias = document.getElementById("rehabV22Categorias");
    const detalle = document.getElementById("rehabV22Detalle");
    const grid = document.getElementById("rehabV22GridModos");
    const icono = document.getElementById("rehabV22DetalleIcono");
    const titulo = document.getElementById("rehabV22DetalleTitulo");
    const descripcion = document.getElementById("rehabV22DetalleDescripcion");

    if (!vistaCategorias || !detalle || !grid) return;

    vistaCategorias.hidden = true;
    detalle.hidden = false;

    if (icono) icono.textContent = categoria.icono;
    if (titulo) titulo.textContent = categoria.titulo;
    if (descripcion) descripcion.textContent = categoria.descripcion;

    grid.innerHTML = "";

    categoria.modos.forEach(function (claveModo) {
      const tarjeta = rehabV22CrearTarjetaModo(claveModo);
      if (tarjeta) grid.appendChild(tarjeta);
    });

    const encabezado = document.getElementById("encabezadoModosV8");
    if (encabezado) {
      const h2 = encabezado.querySelector("h2");
      const p = encabezado.querySelector("p");

      if (h2) h2.textContent = categoria.titulo;
      if (p) p.textContent = categoria.subtitulo;
    }
  }

  function rehabV22AplicarCategorias() {
    rehabV22AgregarEstilos();

    const host = document.getElementById("categoriasEntrenamientoV8");
    if (!host) {
      console.warn("RehabPod V22: no se encontro categoriasEntrenamientoV8.");
      return;
    }

    host.innerHTML = `
      <div id="rehabV22Categorias"></div>

      <div id="rehabV22Detalle" hidden>
        <button type="button" id="rehabV22Volver" class="rehabV22Volver">
          ← VOLVER A CATEGORÍAS
        </button>

        <div class="rehabV22DetalleCabecera">
          <div id="rehabV22DetalleIcono" class="rehabV22DetalleIcono">🏅</div>
          <div>
            <div id="rehabV22DetalleTitulo" class="rehabV22DetalleTitulo">Deportista</div>
            <div id="rehabV22DetalleDescripcion" class="rehabV22DetalleDescripcion"></div>
          </div>
        </div>

        <div id="rehabV22GridModos" class="rehabV22GridModos"></div>

        <div class="rehabV22Nota">
          Las categorías organizan los entrenamientos por enfoque de uso.
          En aplicaciones clínicas, la selección y progresión de ejercicios debe definirse
          de acuerdo con la evaluación del profesional responsable.
        </div>
      </div>
    `;

    const vistaCategorias = document.getElementById("rehabV22Categorias");

    REHAB_V22_CATEGORIAS.forEach(function (categoria) {
      vistaCategorias.appendChild(rehabV22CrearTarjetaCategoria(categoria));
    });

    const volver = document.getElementById("rehabV22Volver");
    if (volver) {
      volver.addEventListener("click", rehabV22MostrarCategorias);
    }

    rehabV22MostrarCategorias();
    console.log(
      "RehabPod V22: categorias Deportista / Fisioterapia / Neurologia activadas."
    );
  }

  // Como V22 se pega al final de app.js, normalmente el resto de la interfaz
  // ya fue creado. El pequeno retraso asegura que las versiones anteriores
  // terminen de organizar sus tarjetas antes de reemplazar esa vista.
  setTimeout(rehabV22AplicarCategorias, 80);

  // Lo dejamos accesible para volver a aplicarlo manualmente desde consola
  // durante pruebas si hiciera falta.
  window.rehabV22AplicarCategorias = rehabV22AplicarCategorias;
})();
// =====================================================
// REHABPOD V23
// LOGO OFICIAL + SECCION DE RUTINAS + CREAR/GUARDAR RUTINAS
//
// Pegar TODO este bloque al FINAL de app.js, despues de V22.
// Ademas copia el archivo rehabpod-logo.png dentro de la carpeta public.
//
// V23 guarda las rutinas LOCALMENTE en este dispositivo.
// La ejecucion automatica de una rutina se implementara en una version posterior.
// =====================================================

(function () {
  const REHAB_V23_CLAVE_RUTINAS = "rehabpodRutinas";
  const REHAB_V23_LOGO = "rehabpod-logo.png";

  const REHAB_V23_CATEGORIAS = [
    { clave: "deportista", nombre: "Deportista", icono: "🏅" },
    { clave: "fisioterapia", nombre: "Fisioterapia", icono: "🦾" },
    { clave: "neurologia", nombre: "Neurología", icono: "🧠" },
  ];

  const REHAB_V23_MODOS = [
    { clave: "simple", nombre: "Reacción aleatoria", icono: "⚡" },
    { clave: "colores", nombre: "Reacción por colores", icono: "🎨" },
    { clave: "secuencia", nombre: "Secuencia / memoria", icono: "🧠" },
    { clave: "libre", nombre: "Modo libre", icono: "🏃" },
    { clave: "persecucion", nombre: "Persecución", icono: "🔥" },
    { clave: "doble", nombre: "Doble estímulo", icono: "⚡⚡" },
    { clave: "prohibido", nombre: "Color prohibido", icono: "🚫🎨" },
    { clave: "circuito", nombre: "Circuito", icono: "🔄" },
    { clave: "contrarreloj", nombre: "Contrarreloj", icono: "⏱️" },
    { clave: "entrenador", nombre: "Modo entrenador", icono: "🧑‍🏫" },
    { clave: "cazaColor", nombre: "Caza de color", icono: "🎯🎨" },
    { clave: "automatico", nombre: "Cambio automático", icono: "🔁⚡" },
    { clave: "stroop", nombre: "Palabra vs color", icono: "🧠🎨" },
  ];

  let rehabV23Rutinas = rehabV23LeerRutinas();
  let rehabV23RutinaEditandoId = null;

  let rehabV23EjerciciosEditor = [];

  function rehabV23Id() {
    return "rutina_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  }

  function rehabV23LeerRutinas() {
    try {
      const raw = localStorage.getItem(REHAB_V23_CLAVE_RUTINAS);
      if (!raw) return [];
      const valor = JSON.parse(raw);
      return Array.isArray(valor) ? valor : [];
    } catch (error) {
      console.warn("RehabPod V23: no se pudieron leer rutinas.", error);
      return [];
    }
  }

  function rehabV23GuardarRutinas() {
    localStorage.setItem(REHAB_V23_CLAVE_RUTINAS, JSON.stringify(rehabV23Rutinas));
  }

  function rehabV23Escapar(texto) {
    return String(texto ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function rehabV23NombreModo(clave) {
    const modo = REHAB_V23_MODOS.find(function (m) {
      return m.clave === clave;
    });
    return modo ? modo.nombre : clave;
  }

  function rehabV23IconoModo(clave) {
    const modo = REHAB_V23_MODOS.find(function (m) {
      return m.clave === clave;
    });
    return modo ? modo.icono : "•";
  }

  function rehabV23NombreCategoria(clave) {
    const categoria = REHAB_V23_CATEGORIAS.find(function (c) {
      return c.clave === clave;
    });
    return categoria ? categoria.nombre : clave;
  }

  function rehabV23IconoCategoria(clave) {
    const categoria = REHAB_V23_CATEGORIAS.find(function (c) {
      return c.clave === clave;
    });
    return categoria ? categoria.icono : "📋";
  }

  function rehabV23AgregarEstilos() {
    if (document.getElementById("rehabV23Estilos")) return;

    const style = document.createElement("style");
    style.id = "rehabV23Estilos";
    style.textContent = `
      .rehabV23Marca {
        display:flex;
        justify-content:center;
        align-items:center;
        margin:4px auto 18px;
      }

      .rehabV23Logo {
        width:min(180px, 48vw);
        max-height:126px;
        object-fit:contain;
        border-radius:18px;
        display:block;
        filter:drop-shadow(0 8px 22px rgba(0,0,0,.18));
      }

      .rehabV23BotonRutinas {
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        width:100%;
        min-height:48px;
        margin-top:10px;
        border:1px solid rgba(59,130,246,.30);
        border-radius:14px;
        background:rgba(59,130,246,.10);
        color:inherit;
        font-weight:800;
        cursor:pointer;
      }

      .rehabV23BotonRutinas:hover {
        background:rgba(59,130,246,.17);
      }

      .rehabV23Overlay {
        position:fixed;
        inset:0;
        z-index:99999;
        background:rgba(2,6,23,.72);
        backdrop-filter:blur(7px);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
      }

      .rehabV23Overlay[hidden] {
        display:none !important;
      }

      .rehabV23Modal {
        width:min(920px, 100%);
        max-height:92vh;
        overflow:auto;
        border-radius:24px;
        border:1px solid rgba(148,163,184,.22);
        background:var(--tarjeta);
        color:inherit;
        padding:20px;

        box-shadow:0 25px 80px rgba(0,0,0,.40);
      }

      .tema-claro .rehabV23Modal {
        background:#ffffff;
      }

      .rehabV23ModalCabecera {
        display:flex;
        gap:14px;
        align-items:center;
        justify-content:space-between;
        margin-bottom:18px;
      }

      .rehabV23ModalTitulo {
        display:flex;
        align-items:center;
        gap:11px;
      }

      .rehabV23ModalLogo {
        width:58px;
        height:58px;
        object-fit:contain;
        border-radius:14px;
      }

      .rehabV23Modal h2,
      .rehabV23Modal h3 {
        margin:0;
      }

      .rehabV23Cerrar {
        appearance:none;
        border:1px solid rgba(148,163,184,.25);
        color:inherit;
        background:rgba(148,163,184,.08);
        border-radius:12px;
        width:42px;
        height:42px;
        cursor:pointer;
        font-size:20px;
      }

      .rehabV23Acciones {
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        margin:12px 0 18px;
      }

      .rehabV23Btn {
        appearance:none;
        border:0;
        border-radius:13px;
        padding:11px 15px;
        cursor:pointer;
        font-weight:800;
        background:var(--acento);
        color:var(--acento-tinta);
      }

      .rehabV23Btn.secundario {
        background:rgba(148,163,184,.16);
        color:inherit;
        border:1px solid rgba(148,163,184,.25);
      }

      .rehabV23Btn.peligro {
        background:#b91c1c;
      }

      .rehabV23Lista {
        display:grid;
        gap:12px;
      }

      .rehabV23Vacio {
        padding:28px 18px;
        border:1px dashed rgba(148,163,184,.30);
        border-radius:18px;
        text-align:center;
        opacity:.78;
      }

      .rehabV23RutinaCard {
        border:1px solid rgba(148,163,184,.22);
        border-radius:18px;
        padding:16px;
        background:rgba(148,163,184,.06);
      }

      .rehabV23RutinaTop {
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
      }

      .rehabV23RutinaNombre {
        font-weight:900;
        font-size:1.05rem;
      }

      .rehabV23RutinaMeta {
        margin-top:4px;
        opacity:.72;
        font-size:.84rem;
      }

      .rehabV23RutinaEjercicios {
        margin:12px 0 0;
        padding-left:20px;
        opacity:.90;
      }

      .rehabV23RutinaEjercicios li {
        margin:4px 0;
      }

      .rehabV23Campo {
        display:grid;
        gap:6px;
        margin-bottom:13px;
      }

      .rehabV23Campo label {
        font-size:.82rem;
        font-weight:800;
        opacity:.80;
      }

      .rehabV23Campo input,
      .rehabV23Campo select {
        width:100%;
        box-sizing:border-box;
        padding:11px 12px;
        border-radius:12px;
        border:1px solid rgba(148,163,184,.28);
        background:rgba(148,163,184,.08);
        color:inherit;
      }

      .rehabV23DosColumnas {
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
      }

      .rehabV23EditorEjercicio {
        border:1px solid rgba(148,163,184,.22);
        border-radius:16px;
        padding:14px;
        margin:12px 0;
        background:rgba(148,163,184,.05);
      }

      .rehabV23FilaEjercicio {
        display:grid;
        grid-template-columns:1.5fr 1fr 1fr 110px auto;
        gap:8px;
        align-items:end;
      }

      .rehabV23MiniLabel {
        display:grid;
        gap:5px;
        font-size:.73rem;
        font-weight:700;
        opacity:.82;
      }

      .rehabV23MiniLabel select,
      .rehabV23MiniLabel input {
        width:100%;
        box-sizing:border-box;
        border-radius:10px;
        border:1px solid rgba(148,163,184,.25);
        padding:9px;

        background:rgba(148,163,184,.08);
        color:inherit;

      }

      .rehabV23Quitar {
        width:38px;
        height:38px;
        border:0;
        border-radius:10px;
        background:rgba(239,68,68,.15);
        color:#ef4444;
        cursor:pointer;
        font-weight:900;
      }

      .rehabV23Aviso {
        margin-top:14px;
        padding:12px 14px;
        border-radius:13px;
        background:rgba(59,130,246,.09);
        border:1px solid rgba(59,130,246,.20);
        font-size:.82rem;
        line-height:1.45;
      }

      @media (max-width:720px) {
        .rehabV23FilaEjercicio {
          grid-template-columns:1fr 1fr;
        }

        .rehabV23DosColumnas {
          grid-template-columns:1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function rehabV23ColocarLogo() {
    const pantalla = document.getElementById("pantallaInicio");
    if (!pantalla || document.getElementById("rehabV23MarcaInicio")) return;

    const marca = document.createElement("div");
    marca.id = "rehabV23MarcaInicio";
    marca.className = "rehabV23Marca";
    marca.innerHTML = `
      <img
        src="${REHAB_V23_LOGO}"
        alt="RehabPod"
        class="rehabV23Logo"
      >
    `;

    pantalla.insertBefore(marca, pantalla.firstChild);

    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = REHAB_V23_LOGO;
  }

  function rehabV23CrearBotonRutinas() {
    if (document.getElementById("rehabV23BtnRutinas")) return;

    const btnEntrenamientoActual = document.getElementById("btnEntrenamiento");
    if (!btnEntrenamientoActual) return;

    const boton = document.createElement("button");
    boton.type = "button";
    boton.id = "rehabV23BtnRutinas";
    boton.className = "rehabV23BotonRutinas";
    boton.innerHTML = "📋 MIS RUTINAS";

    boton.addEventListener("click", rehabV23AbrirLista);

    btnEntrenamientoActual.insertAdjacentElement("afterend", boton);
  }

  function rehabV23CrearModal() {
    if (document.getElementById("rehabV23Overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "rehabV23Overlay";
    overlay.className = "rehabV23Overlay";
    overlay.hidden = true;

    overlay.innerHTML = `
      <div class="rehabV23Modal" role="dialog" aria-modal="true">
        <div class="rehabV23ModalCabecera">
          <div class="rehabV23ModalTitulo">
            <img src="${REHAB_V23_LOGO}" alt="RehabPod" class="rehabV23ModalLogo">
            <div>
              <div style="font-size:.72rem;opacity:.68;font-weight:800;">REHABPOD</div>
              <h2 id="rehabV23TituloModal">Mis rutinas</h2>
            </div>
          </div>

          <button type="button" id="rehabV23Cerrar" class="rehabV23Cerrar">×</button>
        </div>

        <div id="rehabV23Contenido"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    document
      .getElementById("rehabV23Cerrar")
      .addEventListener("click", rehabV23CerrarModal);

    overlay.addEventListener("click", function (evento) {
      if (evento.target === overlay) rehabV23CerrarModal();
    });
  }

  function rehabV23AbrirModal() {
    const overlay = document.getElementById("rehabV23Overlay");
    if (overlay) overlay.hidden = false;
  }

  function rehabV23CerrarModal() {
    const overlay = document.getElementById("rehabV23Overlay");
    if (overlay) overlay.hidden = true;
  }

  function rehabV23AbrirLista() {
    rehabV23Rutinas = rehabV23LeerRutinas();
    rehabV23RutinaEditandoId = null;
    rehabV23EjerciciosEditor = [];

    document.getElementById("rehabV23TituloModal").textContent = "Mis rutinas";
    rehabV23RenderLista();
    rehabV23AbrirModal();
  }

  function rehabV23RenderLista() {
    const contenido = document.getElementById("rehabV23Contenido");
    if (!contenido) return;

    contenido.innerHTML = `
      <div class="rehabV23Acciones">
        <button type="button" id="rehabV23Nueva" class="rehabV23Btn">
          + CREAR NUEVA RUTINA
        </button>
      </div>

      <div id="rehabV23Lista" class="rehabV23Lista"></div>

      <div class="rehabV23Aviso">
        En V23 las rutinas se guardan en este dispositivo.
        Todavía no se ejecutan automáticamente una detrás de otra;
        primero estamos creando y guardando la estructura de cada rutina.
      </div>
    `;

    document.getElementById("rehabV23Nueva").addEventListener("click", function () {
      rehabV23AbrirEditor(null);
    });

    const lista = document.getElementById("rehabV23Lista");

    if (!rehabV23Rutinas.length) {
      lista.innerHTML = `
        <div class="rehabV23Vacio">
          <div style="font-size:36px;margin-bottom:8px;">📋</div>
          <strong>Aún no tienes rutinas guardadas.</strong>
          <div style="margin-top:6px;">Crea una rutina combinando los entrenamientos de RehabPod.</div>
        </div>
      `;
      return;
    }

    rehabV23Rutinas.forEach(function (rutina) {
      const card = document.createElement("div");
      card.className = "rehabV23RutinaCard";

      const ejercicios = Array.isArray(rutina.ejercicios) ? rutina.ejercicios : [];

      card.innerHTML = `
        <div class="rehabV23RutinaTop">
          <div>
            <div class="rehabV23RutinaNombre">
              ${rehabV23IconoCategoria(rutina.categoria)}
              ${rehabV23Escapar(rutina.nombre)}
            </div>
            <div class="rehabV23RutinaMeta">
              ${rehabV23Escapar(rehabV23NombreCategoria(rutina.categoria))}
              · ${ejercicios.length} ejercicio${ejercicios.length === 1 ? "" : "s"}
              · Descanso: ${Number(rutina.descansoSeg || 0)} s
            </div>
          </div>
        </div>

        <ol class="rehabV23RutinaEjercicios">
          ${ejercicios
            .map(function (ejercicio) {
              const tipo =
                ejercicio.finalizarPor === "tiempo"
                  ? `${ejercicio.valor} s`
                  : `${ejercicio.valor} rondas`;

              return `
              <li>
                ${rehabV23IconoModo(ejercicio.modo)}
                ${rehabV23Escapar(rehabV23NombreModo(ejercicio.modo))}
                · ${rehabV23Escapar(ejercicio.dificultad)}
                · ${tipo}
              </li>
            `;
            })
            .join("")}
        </ol>

        <div class="rehabV23Acciones">
          <button type="button" class="rehabV23Btn secundario" data-editar="${rutina.id}">
            ✏️ EDITAR
          </button>
          <button type="button" class="rehabV23Btn peligro" data-borrar="${rutina.id}">
            🗑 BORRAR
          </button>
        </div>
      `;

      lista.appendChild(card);
    });

    lista.querySelectorAll("[data-editar]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        rehabV23AbrirEditor(boton.dataset.editar);
      });
    });

    lista.querySelectorAll("[data-borrar]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        const id = boton.dataset.borrar;
        const rutina = rehabV23Rutinas.find(function (r) {
          return r.id === id;
        });
        if (!rutina) return;

        if (!confirm(`¿Borrar la rutina "${rutina.nombre}"?`)) return;

        rehabV23Rutinas = rehabV23Rutinas.filter(function (r) {
          return r.id !== id;
        });
        rehabV23GuardarRutinas();
        rehabV23RenderLista();
      });
    });
  }

  function rehabV23AbrirEditor(id) {
    const rutina = id
      ? rehabV23Rutinas.find(function (r) {
          return r.id === id;
        })
      : null;

    rehabV23RutinaEditandoId = rutina ? rutina.id : null;
    rehabV23EjerciciosEditor =
      rutina && Array.isArray(rutina.ejercicios)
        ? JSON.parse(JSON.stringify(rutina.ejercicios))
        : [
            {
              id: rehabV23Id(),
              modo: "simple",
              dificultad: "media",
              finalizarPor: "rondas",
              valor: 5,
            },
          ];

    document.getElementById("rehabV23TituloModal").textContent = rutina
      ? "Editar rutina"
      : "Nueva rutina";

    const contenido = document.getElementById("rehabV23Contenido");

    contenido.innerHTML = `
      <div class="rehabV23DosColumnas">
        <div class="rehabV23Campo">
          <label>Nombre de la rutina</label>
          <input
            id="rehabV23NombreRutina"
            type="text"
            maxlength="60"
            placeholder="Ej. Recuperación miembro superior"
            value="${rutina ? rehabV23Escapar(rutina.nombre) : ""}"
          >
        </div>

        <div class="rehabV23Campo">
          <label>Categoría</label>
          <select id="rehabV23CategoriaRutina">
            ${REHAB_V23_CATEGORIAS.map(function (categoria) {
              const seleccionada =
                rutina && rutina.categoria === categoria.clave ? "selected" : "";
              return `<option value="${categoria.clave}" ${seleccionada}>${categoria.icono} ${categoria.nombre}</option>`;
            }).join("")}
          </select>
        </div>
      </div>

      <div class="rehabV23Campo">
        <label>Descanso entre ejercicios</label>
        <select id="rehabV23DescansoRutina">
          ${[0, 15, 30, 45, 60, 90, 120]
            .map(function (seg) {
              const actual = rutina ? Number(rutina.descansoSeg || 0) : 30;
              return `<option value="${seg}" ${actual === seg ? "selected" : ""}>${seg === 0 ? "Sin descanso" : seg + " segundos"}</option>`;
            })
            .join("")}
        </select>
      </div>

      <h3 style="margin-top:18px;">Ejercicios</h3>
      <div id="rehabV23Ejercicios"></div>

      <div class="rehabV23Acciones">
        <button type="button" id="rehabV23AgregarEjercicio" class="rehabV23Btn secundario">
          + AGREGAR EJERCICIO
        </button>
      </div>

      <div class="rehabV23Acciones">
        <button type="button" id="rehabV23Guardar" class="rehabV23Btn">
          💾 GUARDAR RUTINA
        </button>
        <button type="button" id="rehabV23CancelarEditor" class="rehabV23Btn secundario">
          CANCELAR
        </button>
      </div>
    `;

    rehabV23RenderEjerciciosEditor();

    document
      .getElementById("rehabV23AgregarEjercicio")
      .addEventListener("click", function () {
        rehabV23EjerciciosEditor.push({
          id: rehabV23Id(),
          modo: "simple",
          dificultad: "media",
          finalizarPor: "rondas",
          valor: 5,
        });
        rehabV23RenderEjerciciosEditor();
      });

    document
      .getElementById("rehabV23Guardar")
      .addEventListener("click", rehabV23GuardarDesdeEditor);
    document
      .getElementById("rehabV23CancelarEditor")
      .addEventListener("click", rehabV23AbrirLista);
  }

  function rehabV23RenderEjerciciosEditor() {
    const host = document.getElementById("rehabV23Ejercicios");
    if (!host) return;

    host.innerHTML = "";

    rehabV23EjerciciosEditor.forEach(function (ejercicio, indice) {
      const fila = document.createElement("div");
      fila.className = "rehabV23EditorEjercicio";
      fila.dataset.id = ejercicio.id;

      fila.innerHTML = `
        <div style="font-size:.78rem;font-weight:900;opacity:.68;margin-bottom:9px;">
          EJERCICIO ${indice + 1}
        </div>

        <div class="rehabV23FilaEjercicio">
          <label class="rehabV23MiniLabel">
            Modo
            <select data-campo="modo">
              ${REHAB_V23_MODOS.map(function (modo) {
                return `<option value="${modo.clave}" ${ejercicio.modo === modo.clave ? "selected" : ""}>${modo.icono} ${modo.nombre}</option>`;
              }).join("")}
            </select>
          </label>

          <label class="rehabV23MiniLabel">
            Dificultad
            <select data-campo="dificultad">
              ${["facil", "media", "dificil", "personalizada"]
                .map(function (dif) {
                  const etiqueta = {
                    facil: "Fácil",
                    media: "Media",
                    dificil: "Difícil",
                    personalizada: "Personalizada",
                  }[dif];

                  return `<option value="${dif}" ${ejercicio.dificultad === dif ? "selected" : ""}>${etiqueta}</option>`;
                })
                .join("")}
            </select>
          </label>

          <label class="rehabV23MiniLabel">
            Finalizar por
            <select data-campo="finalizarPor">
              <option value="rondas" ${ejercicio.finalizarPor === "rondas" ? "selected" : ""}>Rondas</option>
              <option value="tiempo" ${ejercicio.finalizarPor === "tiempo" ? "selected" : ""}>Tiempo</option>
            </select>
          </label>

          <label class="rehabV23MiniLabel">
            Valor
            <input data-campo="valor" type="number" min="1" max="999" value="${Number(ejercicio.valor || 5)}">
          </label>

          <button type="button" class="rehabV23Quitar" title="Quitar ejercicio">×</button>
        </div>
      `;

      host.appendChild(fila);

      fila.querySelectorAll("[data-campo]").forEach(function (control) {
        control.addEventListener("change", function () {
          const item = rehabV23EjerciciosEditor.find(function (e) {
            return e.id === ejercicio.id;
          });
          if (!item) return;

          const campo = control.dataset.campo;
          item[campo] = campo === "valor" ? Number(control.value) : control.value;
        });
      });

      fila.querySelector(".rehabV23Quitar").addEventListener("click", function () {
        if (rehabV23EjerciciosEditor.length <= 1) {
          alert("La rutina debe tener al menos un ejercicio.");
          return;
        }

        rehabV23EjerciciosEditor = rehabV23EjerciciosEditor.filter(function (e) {
          return e.id !== ejercicio.id;
        });
        rehabV23RenderEjerciciosEditor();
      });
    });
  }

  function rehabV23GuardarDesdeEditor() {
    const nombre = document.getElementById("rehabV23NombreRutina").value.trim();
    const categoria = document.getElementById("rehabV23CategoriaRutina").value;
    const descansoSeg = Number(document.getElementById("rehabV23DescansoRutina").value);

    // Sincroniza el valor de los inputs numericos por si el usuario no salio del campo.
    document
      .querySelectorAll("#rehabV23Ejercicios .rehabV23EditorEjercicio")
      .forEach(function (fila) {
        const item = rehabV23EjerciciosEditor.find(function (e) {
          return e.id === fila.dataset.id;
        });

        if (!item) return;

        fila.querySelectorAll("[data-campo]").forEach(function (control) {
          const campo = control.dataset.campo;

          item[campo] = campo === "valor" ? Number(control.value) : control.value;
        });
      });

    if (!nombre) {
      alert("Escribe un nombre para la rutina.");
      return;
    }

    if (!rehabV23EjerciciosEditor.length) {
      alert("Agrega al menos un ejercicio.");
      return;
    }

    const invalido = rehabV23EjerciciosEditor.some(function (ejercicio) {
      return (
        !ejercicio.modo ||
        !ejercicio.dificultad ||
        !ejercicio.finalizarPor ||
        !Number.isFinite(Number(ejercicio.valor)) ||
        Number(ejercicio.valor) <= 0
      );
    });

    if (invalido) {
      alert("Revisa la configuración de los ejercicios.");
      return;
    }

    const ahora = Date.now();

    const nueva = {
      id: rehabV23RutinaEditandoId || rehabV23Id(),
      nombre: nombre,
      categoria: categoria,
      descansoSeg: descansoSeg,
      ejercicios: rehabV23EjerciciosEditor.map(function (ejercicio) {
        return {
          id: ejercicio.id || rehabV23Id(),
          modo: ejercicio.modo,
          dificultad: ejercicio.dificultad,
          finalizarPor: ejercicio.finalizarPor,
          valor: Number(ejercicio.valor),
        };
      }),
      creadaEn: rehabV23RutinaEditandoId
        ? (
            rehabV23Rutinas.find(function (r) {
              return r.id === rehabV23RutinaEditandoId;
            }) || {}
          ).creadaEn || ahora
        : ahora,
      actualizadaEn: ahora,
    };

    if (rehabV23RutinaEditandoId) {
      rehabV23Rutinas = rehabV23Rutinas.map(function (rutina) {
        return rutina.id === rehabV23RutinaEditandoId ? nueva : rutina;
      });
    } else {
      rehabV23Rutinas.push(nueva);
    }

    rehabV23GuardarRutinas();
    rehabV23AbrirLista();
  }

  function rehabV23Iniciar() {
    rehabV23AgregarEstilos();
    rehabV23ColocarLogo();
    rehabV23CrearBotonRutinas();
    rehabV23CrearModal();

    console.log("RehabPod V23: logo y rutinas activados.");
  }

  setTimeout(rehabV23Iniciar, 120);

  // Funciones de apoyo para pruebas desde consola.
  window.rehabV23AbrirRutinas = rehabV23AbrirLista;
  window.rehabV23LeerRutinas = rehabV23LeerRutinas;
})();
// =====================================================
// REHABPOD V24
// HISTORIAL DE RUTINAS
//
// Pegar TODO este bloque al FINAL de app.js, despues de V23.
//
// V24 agrega:
// - Boton HISTORIAL DE RUTINAS en la pantalla principal.
// - Registro manual de una rutina realizada.
// - Historial por perfil activo.
// - Fecha, duracion, ejercicios completados, precision y notas.
// - Resumen: sesiones, adherencia media y tiempo acumulado.
//
// IMPORTANTE:
// En esta version el registro es MANUAL porque V23 todavia no ejecuta
// automaticamente una rutina completa. Cuando implementemos la ejecucion
// automatica, este mismo historial podra llenarse solo.
// =====================================================

(function () {
  const REHAB_V24_CLAVE_HISTORIAL = "rehabpodHistorialRutinas";
  const REHAB_V24_CLAVE_RUTINAS = "rehabpodRutinas";

  function rehabV24Id() {
    return "sesion_rutina_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  }

  function rehabV24Escapar(texto) {
    return String(texto ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function rehabV24LeerHistorial() {
    try {
      const raw = localStorage.getItem(REHAB_V24_CLAVE_HISTORIAL);
      if (!raw) return [];
      const valor = JSON.parse(raw);
      return Array.isArray(valor) ? valor : [];
    } catch (error) {
      console.warn("RehabPod V24: error leyendo historial.", error);
      return [];
    }
  }

  function rehabV24GuardarHistorial(historial) {
    localStorage.setItem(REHAB_V24_CLAVE_HISTORIAL, JSON.stringify(historial));
  }

  function rehabV24LeerRutinas() {
    try {
      const raw = localStorage.getItem(REHAB_V24_CLAVE_RUTINAS);
      if (!raw) return [];
      const valor = JSON.parse(raw);
      return Array.isArray(valor) ? valor : [];
    } catch (error) {
      console.warn("RehabPod V24: error leyendo rutinas.", error);
      return [];
    }
  }

  function rehabV24PerfilActivo() {
    try {
      if (typeof obtenerPerfilActivo === "function") {
        return obtenerPerfilActivo();
      }
    } catch (error) {}

    return {
      id: "perfil_local",
      nombre: "Perfil local",
    };
  }

  function rehabV24AgregarEstilos() {
    if (document.getElementById("rehabV24Estilos")) return;

    const style = document.createElement("style");
    style.id = "rehabV24Estilos";
    style.textContent = `
      .rehabV24BotonHistorial {
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        width:100%;
        min-height:48px;
        margin-top:10px;
        border:1px solid rgba(34,197,94,.28);
        border-radius:14px;
        background:rgba(34,197,94,.09);
        color:inherit;
        font-weight:800;
        cursor:pointer;
      }

      .rehabV24BotonHistorial:hover {
        background:rgba(34,197,94,.15);
      }

      .rehabV24Overlay {
        position:fixed;
        inset:0;
        z-index:100000;
        background:rgba(2,6,23,.74);
        backdrop-filter:blur(7px);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
      }

      .rehabV24Overlay[hidden] {
        display:none !important;
      }

      .rehabV24Modal {
        width:min(950px,100%);
        max-height:92vh;
        overflow:auto;
        border-radius:24px;
        border:1px solid rgba(148,163,184,.22);
        background:var(--tarjeta);
        color:inherit;
        padding:20px;
        box-shadow:0 25px 80px rgba(0,0,0,.42);
      }

      .tema-claro .rehabV24Modal {
        background:#fff;
      }

      .rehabV24Cabecera {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin-bottom:16px;
      }

      .rehabV24Titulo {
        display:flex;
        align-items:center;
        gap:10px;
      }

      .rehabV24Cerrar {
        appearance:none;
        border:1px solid rgba(148,163,184,.25);
        width:42px;
        height:42px;
        border-radius:12px;
        background:rgba(148,163,184,.08);
        color:inherit;
        cursor:pointer;
        font-size:20px;
      }

      .rehabV24Resumen {
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:10px;
        margin:14px 0 18px;
      }

      .rehabV24ResumenCard {
        padding:14px;
        border-radius:16px;
        border:1px solid rgba(148,163,184,.20);

        background:rgba(148,163,184,.06);
      }

      .rehabV24ResumenValor {
        font-size:1.25rem;
        font-weight:900;
      }

      .rehabV24ResumenLabel {
        margin-top:3px;
        font-size:.76rem;
        opacity:.68;
      }

      .rehabV24Acciones {
        display:flex;
        flex-wrap:wrap;
        gap:9px;
        margin:12px 0 17px;
      }

      .rehabV24Btn {
        appearance:none;
        border:0;
        border-radius:12px;
        padding:10px 14px;
        cursor:pointer;
        background:var(--acento);
        color:var(--acento-tinta);
        font-weight:800;
      }

      .rehabV24Btn.secundario {
        background:rgba(148,163,184,.15);
        border:1px solid rgba(148,163,184,.22);
        color:inherit;
      }

      .rehabV24Btn.peligro {
        background:#b91c1c;
      }

      .rehabV24Lista {
        display:grid;
        gap:11px;
      }

      .rehabV24Sesion {
        border:1px solid rgba(148,163,184,.21);
        border-radius:18px;
        padding:15px;
        background:rgba(148,163,184,.05);
      }

      .rehabV24SesionTop {
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:flex-start;
      }

      .rehabV24SesionNombre {
        font-weight:900;
        font-size:1.02rem;
      }

      .rehabV24Meta {
        margin-top:4px;
        font-size:.82rem;
        opacity:.70;
      }

      .rehabV24Barra {
        height:8px;
        border-radius:99px;
        overflow:hidden;
        background:rgba(148,163,184,.18);
        margin-top:11px;
      }

      .rehabV24Barra > span {
        display:block;
        height:100%;
        border-radius:99px;
        background:#22c55e;
      }

      .rehabV24Datos {
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:8px;
        margin-top:11px;
      }

      .rehabV24Dato {
        font-size:.79rem;
        padding:8px 10px;
        border-radius:11px;
        background:rgba(148,163,184,.08);
      }

      .rehabV24Notas {
        margin-top:10px;
        font-size:.82rem;
        opacity:.84;
        line-height:1.4;
      }

      .rehabV24Vacio {
        padding:28px 18px;
        border:1px dashed rgba(148,163,184,.30);
        border-radius:18px;
        text-align:center;
        opacity:.77;
      }

      .rehabV24Campo {
        display:grid;
        gap:6px;
        margin-bottom:13px;
      }

      .rehabV24Campo label {
        font-size:.80rem;
        font-weight:800;
        opacity:.78;
      }

      .rehabV24Campo input,
      .rehabV24Campo select,
      .rehabV24Campo textarea {
        width:100%;
        box-sizing:border-box;
        border-radius:12px;
        border:1px solid rgba(148,163,184,.27);
        padding:10px 11px;
        background:rgba(148,163,184,.07);
        color:inherit;
      }

      .rehabV24DosColumnas {
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
      }

      .rehabV24InfoRutina {
        padding:12px;
        border-radius:14px;
        background:rgba(59,130,246,.08);
        border:1px solid rgba(59,130,246,.18);
        margin-bottom:14px;
        font-size:.83rem;
        line-height:1.45;
      }

      .rehabV24EjerciciosCheck {
        display:grid;
        gap:7px;
        margin:7px 0 15px;
      }

      .rehabV24EjercicioCheck {
        display:flex;
        align-items:center;
        gap:8px;
        padding:9px 10px;
        border-radius:11px;
        background:rgba(148,163,184,.07);
      }

      @media(max-width:760px) {
        .rehabV24Resumen {
          grid-template-columns:1fr 1fr;
        }

        .rehabV24Datos,
        .rehabV24DosColumnas {
          grid-template-columns:1fr;
        }

      }
    `;
    document.head.appendChild(style);
  }

  function rehabV24CrearBoton() {
    if (document.getElementById("rehabV24BtnHistorial")) return;

    const btnRutinas = document.getElementById("rehabV23BtnRutinas");
    const btnEntrenamiento = document.getElementById("btnEntrenamiento");
    const referencia = btnRutinas || btnEntrenamiento;
    if (!referencia) return;

    const boton = document.createElement("button");
    boton.type = "button";
    boton.id = "rehabV24BtnHistorial";
    boton.className = "rehabV24BotonHistorial";
    boton.innerHTML = "📊 HISTORIAL DE RUTINAS";
    boton.addEventListener("click", rehabV24AbrirHistorial);

    referencia.insertAdjacentElement("afterend", boton);
  }

  function rehabV24CrearModal() {
    if (document.getElementById("rehabV24Overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "rehabV24Overlay";

    overlay.className = "rehabV24Overlay";
    overlay.hidden = true;

    overlay.innerHTML = `
      <div class="rehabV24Modal" role="dialog" aria-modal="true">
        <div class="rehabV24Cabecera">
          <div class="rehabV24Titulo">
            <div style="font-size:30px;">📊</div>
            <div>
              <div style="font-size:.72rem;opacity:.65;font-weight:800;">REHABPOD</div>
              <h2 id="rehabV24TituloModal" style="margin:0;">Historial de rutinas</h2>
            </div>
          </div>

          <button id="rehabV24Cerrar" type="button" class="rehabV24Cerrar">×</button>
        </div>

        <div id="rehabV24Contenido"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("rehabV24Cerrar").addEventListener("click", rehabV24Cerrar);

    overlay.addEventListener("click", function (evento) {
      if (evento.target === overlay) rehabV24Cerrar();
    });
  }

  function rehabV24Abrir() {
    const overlay = document.getElementById("rehabV24Overlay");
    if (overlay) overlay.hidden = false;
  }

  function rehabV24Cerrar() {
    const overlay = document.getElementById("rehabV24Overlay");
    if (overlay) overlay.hidden = true;
  }

  function rehabV24HistorialPerfil() {
    const perfil = rehabV24PerfilActivo();
    return rehabV24LeerHistorial()
      .filter(function (sesion) {
        return sesion.perfilId === perfil.id;
      })
      .sort(function (a, b) {
        return Number(b.timestamp || 0) - Number(a.timestamp || 0);
      });
  }

  function rehabV24FormatoDuracion(segundos) {
    segundos = Math.max(0, Number(segundos || 0));
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);

    if (min <= 0) return seg + " s";
    return min + " min " + String(seg).padStart(2, "0") + " s";
  }

  function rehabV24CalcularResumen(historial) {
    const sesiones = historial.length;

    if (!sesiones) {
      return {
        sesiones: 0,
        adherencia: 0,
        tiempo: 0,
        precision: null,
      };
    }

    const adherencia =
      historial.reduce(function (suma, s) {
        return suma + Number(s.porcentajeCompletado || 0);
      }, 0) / sesiones;

    const tiempo = historial.reduce(function (suma, s) {
      return suma + Number(s.duracionSeg || 0);
    }, 0);

    const precisiones = historial
      .map(function (s) {
        return Number(s.precision);
      })
      .filter(function (v) {
        return Number.isFinite(v);
      });

    const precision = precisiones.length
      ? precisiones.reduce(function (a, b) {
          return a + b;
        }, 0) / precisiones.length
      : null;

    return { sesiones, adherencia, tiempo, precision };
  }

  function rehabV24AbrirHistorial() {
    const contenido = document.getElementById("rehabV24Contenido");
    if (!contenido) return;

    const perfil = rehabV24PerfilActivo();
    const historial = rehabV24HistorialPerfil();
    const resumen = rehabV24CalcularResumen(historial);

    document.getElementById("rehabV24TituloModal").textContent = "Historial de rutinas";

    contenido.innerHTML = `
      <div style="font-size:.88rem;opacity:.76;margin-bottom:6px;">
        Perfil: <strong>${rehabV24Escapar(perfil.nombre || "Perfil")}</strong>
      </div>

      <div class="rehabV24Resumen">
        <div class="rehabV24ResumenCard">
          <div class="rehabV24ResumenValor">${resumen.sesiones}</div>
          <div class="rehabV24ResumenLabel">Sesiones registradas</div>
        </div>

        <div class="rehabV24ResumenCard">
          <div class="rehabV24ResumenValor">${resumen.adherencia.toFixed(0)}%</div>
          <div class="rehabV24ResumenLabel">Completado promedio</div>
        </div>

        <div class="rehabV24ResumenCard">
          <div class="rehabV24ResumenValor">${rehabV24FormatoDuracion(resumen.tiempo)}</div>
          <div class="rehabV24ResumenLabel">Tiempo acumulado</div>
        </div>

        <div class="rehabV24ResumenCard">
          <div class="rehabV24ResumenValor">
            ${resumen.precision === null ? "--" : resumen.precision.toFixed(1) + "%"}
          </div>
          <div class="rehabV24ResumenLabel">Precisión media</div>
        </div>
      </div>

      <div class="rehabV24Acciones">
        <button id="rehabV24Registrar" type="button" class="rehabV24Btn">
          + REGISTRAR RUTINA REALIZADA
        </button>
      </div>

      <div id="rehabV24Lista" class="rehabV24Lista"></div>
    `;

    document
      .getElementById("rehabV24Registrar")
      .addEventListener("click", rehabV24AbrirRegistro);

    const lista = document.getElementById("rehabV24Lista");

    if (!historial.length) {
      lista.innerHTML = `
        <div class="rehabV24Vacio">

          <div style="font-size:34px;margin-bottom:7px;">📭</div>
          <strong>Todavía no hay rutinas registradas.</strong>
          <div style="margin-top:5px;">
            Registra una sesión para comenzar a construir el historial.
          </div>
        </div>
      `;

      rehabV24Abrir();
      return;
    }

    historial.forEach(function (sesion) {
      const card = document.createElement("div");
      card.className = "rehabV24Sesion";

      const fecha = sesion.timestamp
        ? new Date(sesion.timestamp).toLocaleString()
        : sesion.fecha || "--";

      const porcentaje = Math.max(
        0,
        Math.min(100, Number(sesion.porcentajeCompletado || 0))
      );

      card.innerHTML = `
        <div class="rehabV24SesionTop">
          <div>
            <div class="rehabV24SesionNombre">
              📋 ${rehabV24Escapar(sesion.rutinaNombre || "Rutina")}
            </div>
            <div class="rehabV24Meta">
              ${rehabV24Escapar(fecha)}
            </div>
          </div>

          <strong>${porcentaje.toFixed(0)}%</strong>
        </div>

        <div class="rehabV24Barra">
          <span style="width:${porcentaje}%"></span>
        </div>

        <div class="rehabV24Datos">
          <div class="rehabV24Dato">
            ✅ ${Number(sesion.ejerciciosCompletados || 0)} / ${Number(sesion.totalEjercicios || 0)} ejercicios
          </div>

          <div class="rehabV24Dato">
            ⏱️ ${rehabV24FormatoDuracion(sesion.duracionSeg)}
          </div>

          <div class="rehabV24Dato">
            🎯 ${Number.isFinite(Number(sesion.precision)) ? Number(sesion.precision).toFixed(1) + "%" : "--"}
          </div>
        </div>

        ${
          sesion.notas
            ? `<div class="rehabV24Notas"><strong>Notas:</strong> ${rehabV24Escapar(sesion.notas)}</div>`
            : ""
        }

        <div class="rehabV24Acciones">
          <button
            type="button"
            class="rehabV24Btn peligro"
            data-borrar-sesion="${sesion.id}">
            BORRAR
          </button>
        </div>
      `;

      lista.appendChild(card);
    });

    lista.querySelectorAll("[data-borrar-sesion]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        const id = boton.dataset.borrarSesion;
        if (!confirm("¿Borrar este registro del historial?")) return;

        const nuevo = rehabV24LeerHistorial().filter(function (s) {
          return s.id !== id;
        });

        rehabV24GuardarHistorial(nuevo);
        rehabV24AbrirHistorial();
      });
    });

    rehabV24Abrir();
  }

  function rehabV24AbrirRegistro() {
    const contenido = document.getElementById("rehabV24Contenido");
    const rutinas = rehabV24LeerRutinas();

    document.getElementById("rehabV24TituloModal").textContent = "Registrar rutina";

    if (!rutinas.length) {
      contenido.innerHTML = `
        <div class="rehabV24Vacio">
          <strong>No tienes rutinas guardadas.</strong>
          <div style="margin-top:6px;">
            Primero crea una rutina desde “MIS RUTINAS”.
          </div>

          <div class="rehabV24Acciones" style="justify-content:center;">
            <button id="rehabV24VolverHistorial" type="button" class="rehabV24Btn secundario">
              VOLVER
            </button>
          </div>
        </div>
      `;

      document
        .getElementById("rehabV24VolverHistorial")
        .addEventListener("click", rehabV24AbrirHistorial);
      return;
    }

    contenido.innerHTML = `
      <div class="rehabV24Campo">
        <label>Rutina realizada</label>
        <select id="rehabV24RutinaSelect">
          ${rutinas
            .map(function (rutina) {
              return `<option value="${rehabV24Escapar(rutina.id)}">${rehabV24Escapar(rutina.nombre)}</option>`;
            })
            .join("")}
        </select>
      </div>

      <div id="rehabV24InfoRutina" class="rehabV24InfoRutina"></div>

      <div class="rehabV24DosColumnas">
        <div class="rehabV24Campo">
          <label>Duración total (minutos)</label>
          <input id="rehabV24DuracionMin" type="number" min="0" max="600" step="1" value="10">
        </div>

        <div class="rehabV24Campo">
          <label>Precisión general (%) — opcional</label>
          <input id="rehabV24Precision" type="number" min="0" max="100" step="0.1" placeholder="Ej. 88.5">
        </div>
      </div>

      <div class="rehabV24Campo">
        <label>Ejercicios completados</label>
        <div id="rehabV24Checks" class="rehabV24EjerciciosCheck"></div>
      </div>

      <div class="rehabV24Campo">
        <label>Notas — opcional</label>
        <textarea

          id="rehabV24Notas"
          rows="3"
          maxlength="400"
          placeholder="Ej. Buena tolerancia, dificultad en miembro derecho, fatiga al final..."
        ></textarea>
      </div>

      <div class="rehabV24Acciones">
        <button id="rehabV24GuardarRegistro" type="button" class="rehabV24Btn">
          💾 GUARDAR EN HISTORIAL
        </button>

        <button id="rehabV24CancelarRegistro" type="button" class="rehabV24Btn secundario">
          CANCELAR
        </button>
      </div>
    `;

    const select = document.getElementById("rehabV24RutinaSelect");
    select.addEventListener("change", rehabV24ActualizarRegistroRutina);

    document

      .getElementById("rehabV24GuardarRegistro")
      .addEventListener("click", rehabV24GuardarRegistro);
    document
      .getElementById("rehabV24CancelarRegistro")
      .addEventListener("click", rehabV24AbrirHistorial);

    rehabV24ActualizarRegistroRutina();
  }

  function rehabV24ActualizarRegistroRutina() {
    const rutinas = rehabV24LeerRutinas();
    const id = document.getElementById("rehabV24RutinaSelect").value;
    const rutina = rutinas.find(function (r) {
      return r.id === id;
    });

    if (!rutina) return;

    const ejercicios = Array.isArray(rutina.ejercicios) ? rutina.ejercicios : [];

    document.getElementById("rehabV24InfoRutina").innerHTML = `
      <strong>${rehabV24Escapar(rutina.nombre)}</strong><br>
      Categoría: ${rehabV24Escapar(rutina.categoria || "--")}<br>
      ${ejercicios.length} ejercicio${ejercicios.length === 1 ? "" : "s"}
      · Descanso: ${Number(rutina.descansoSeg || 0)} s
    `;

    const checks = document.getElementById("rehabV24Checks");
    checks.innerHTML = "";

    ejercicios.forEach(function (ejercicio, indice) {
      const fila = document.createElement("label");
      fila.className = "rehabV24EjercicioCheck";

      fila.innerHTML = `
        <input
          type="checkbox"
          data-ejercicio-rutina="${rehabV24Escapar(ejercicio.id || String(indice))}"
          checked
        >
        <span>
          <strong>${indice + 1}.</strong>
          ${rehabV24Escapar(
            typeof rehabV23NombreModo === "function"
              ? rehabV23NombreModo(ejercicio.modo)
              : ejercicio.modo
          )}
          · ${rehabV24Escapar(ejercicio.dificultad || "media")}
        </span>
      `;

      checks.appendChild(fila);
    });
  }

  function rehabV24GuardarRegistro() {
    const rutinas = rehabV24LeerRutinas();
    const rutinaId = document.getElementById("rehabV24RutinaSelect").value;
    const rutina = rutinas.find(function (r) {
      return r.id === rutinaId;
    });

    if (!rutina) {
      alert("No se encontró la rutina seleccionada.");
      return;
    }

    const ejercicios = Array.isArray(rutina.ejercicios) ? rutina.ejercicios : [];
    const checks = Array.from(
      document.querySelectorAll("#rehabV24Checks input[type='checkbox']")
    );

    const completadosIds = checks
      .filter(function (c) {
        return c.checked;
      })
      .map(function (c) {
        return c.dataset.ejercicioRutina;
      });

    const totalEjercicios = ejercicios.length;
    const ejerciciosCompletados = completadosIds.length;

    const porcentajeCompletado = totalEjercicios
      ? (ejerciciosCompletados / totalEjercicios) * 100
      : 0;

    const duracionMin = Number(document.getElementById("rehabV24DuracionMin").value || 0);

    const precisionInput = document.getElementById("rehabV24Precision").value.trim();
    const precision = precisionInput === "" ? null : Number(precisionInput);

    if (duracionMin < 0 || !Number.isFinite(duracionMin)) {
      alert("Revisa la duración.");
      return;
    }

    if (
      precision !== null &&
      (!Number.isFinite(precision) || precision < 0 || precision > 100)
    ) {
      alert("La precisión debe estar entre 0 y 100.");
      return;
    }

    const perfil = rehabV24PerfilActivo();
    const ahora = Date.now();

    const registro = {
      id: rehabV24Id(),
      timestamp: ahora,
      fecha: new Date(ahora).toLocaleString(),

      perfilId: perfil.id,
      perfilNombre: perfil.nombre || "Perfil",

      rutinaId: rutina.id,
      rutinaNombre: rutina.nombre,
      categoria: rutina.categoria || "",

      totalEjercicios: totalEjercicios,
      ejerciciosCompletados: ejerciciosCompletados,
      ejerciciosCompletadosIds: completadosIds,
      porcentajeCompletado: porcentajeCompletado,

      duracionSeg: Math.round(duracionMin * 60),
      precision: precision,

      notas: document.getElementById("rehabV24Notas").value.trim(),
    };

    const historial = rehabV24LeerHistorial();

    historial.push(registro);
    rehabV24GuardarHistorial(historial);

    rehabV24AbrirHistorial();
  }

  function rehabV24Iniciar() {
    rehabV24AgregarEstilos();
    rehabV24CrearModal();
    // Nav final: ya no creamos el botón "HISTORIAL DE RUTINAS" en Inicio;
    // esa información ya vive en Progreso, para no repetirla al usuario
    // ni cargar la pantalla principal.

    console.log("RehabPod V24: historial de rutinas activado.");
  }

  setTimeout(rehabV24Iniciar, 180);

  window.rehabV24AbrirHistorial = rehabV24AbrirHistorial;
  window.rehabV24LeerHistorial = rehabV24LeerHistorial;
})();

// =====================================================
// REHABPOD V25
// VIDEOS DE RUTINA / EJERCICIO
//
// Pegar TODO este bloque al FINAL de app.js, despues de V24.
//
// Que hace:
// - En MIS RUTINAS agrega boton "VIDEOS" a cada rutina.
// - Permite guardar un enlace de video por cada ejercicio.
// - Puede ser YouTube, Vimeo o un enlace directo.
// - El paciente puede abrir el video desde la rutina.
// - Los enlaces se guardan dentro de rehabpodRutinas en localStorage.
// =====================================================

(function () {
  const CLAVE_RUTINAS = "rehabpodRutinas";

  function leerRutinas() {
    try {
      const raw = localStorage.getItem(CLAVE_RUTINAS);
      if (!raw) return [];
      const r = JSON.parse(raw);
      return Array.isArray(r) ? r : [];
    } catch (e) {
      console.warn("V25: no se pudieron leer rutinas", e);
      return [];
    }
  }

  function guardarRutinas(rutinas) {
    localStorage.setItem(CLAVE_RUTINAS, JSON.stringify(rutinas));
  }

  function escapar(texto) {
    return String(texto ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function nombreModo(clave) {
    const mapa = {
      simple: "Reacción aleatoria",
      colores: "Reacción por colores",
      secuencia: "Secuencia / memoria",
      libre: "Modo libre",
      persecucion: "Persecución",
      doble: "Doble estímulo",
      prohibido: "Color prohibido",
      circuito: "Circuito",
      contrarreloj: "Contrarreloj",
      entrenador: "Modo entrenador",
      cazaColor: "Caza de color",
      automatico: "Cambio automático",
      stroop: "Palabra vs color",
    };
    return mapa[clave] || clave;
  }

  function agregarEstilos() {
    if (document.getElementById("rehabV25Estilos")) return;

    const st = document.createElement("style");
    st.id = "rehabV25Estilos";
    st.textContent = `
      .rehabV25Overlay{
        position:fixed;inset:0;z-index:100100;background:rgba(2,6,23,.76);
        backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:18px
      }
      .rehabV25Overlay[hidden]{display:none!important}
      .rehabV25Modal{
        width:min(850px,100%);max-height:92vh;overflow:auto;border-radius:24px;
        border:1px solid rgba(148,163,184,.22);background:var(--tarjeta);
        color:inherit;padding:20px;box-shadow:0 25px 80px rgba(0,0,0,.42)
      }
      .tema-claro .rehabV25Modal{background:#fff}
      .rehabV25Cabecera{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:16px}
      .rehabV25Cerrar{width:42px;height:42px;border-radius:12px;border:1px solid rgba(148,163,184,.25);
        background:rgba(148,163,184,.08);color:inherit;font-size:20px;cursor:pointer}
      .rehabV25Ejercicio{border:1px solid rgba(148,163,184,.22);border-radius:16px;padding:14px;margin:10px 0;
        background:rgba(148,163,184,.05)}
      .rehabV25EjercicioTitulo{font-weight:900;margin-bottom:8px}
      .rehabV25Campo{display:grid;gap:6px}
      .rehabV25Campo label{font-size:.79rem;font-weight:800;opacity:.76}
      .rehabV25Campo input{width:100%;box-sizing:border-box;padding:10px 11px;border-radius:11px;
        border:1px solid rgba(148,163,184,.27);background:rgba(148,163,184,.07);color:inherit}
      .rehabV25Acciones{display:flex;gap:9px;flex-wrap:wrap;margin-top:10px}
      .rehabV25Btn{appearance:none;border:0;border-radius:12px;padding:10px 14px;font-weight:800;cursor:pointer;
        background:var(--acento);color:var(--acento-tinta)}
      .rehabV25Btn.sec{background:rgba(148,163,184,.15);color:inherit;border:1px solid rgba(148,163,184,.22)}
      .rehabV25VideoBtn{display:inline-flex;gap:6px;align-items:center;margin-top:8px;padding:8px 11px;border-radius:10px;
        background:rgba(59,130,246,.11);border:1px solid rgba(59,130,246,.23);color:inherit;text-decoration:none;font-weight:800}
    `;
    document.head.appendChild(st);
  }

  function crearModal() {
    if (document.getElementById("rehabV25Overlay")) return;

    const ov = document.createElement("div");
    ov.id = "rehabV25Overlay";
    ov.className = "rehabV25Overlay";
    ov.hidden = true;
    ov.innerHTML = `
      <div class="rehabV25Modal">
        <div class="rehabV25Cabecera">
          <div>
            <div style="font-size:.72rem;opacity:.65;font-weight:800">REHABPOD</div>
            <h2 style="margin:0">Videos de la rutina</h2>
          </div>
          <button id="rehabV25Cerrar" class="rehabV25Cerrar" type="button">×</button>
        </div>
        <div id="rehabV25Contenido"></div>
      </div>
    `;
    document.body.appendChild(ov);

    document.getElementById("rehabV25Cerrar").onclick = function () {
      ov.hidden = true;
    };
    ov.addEventListener("click", function (e) {
      if (e.target === ov) ov.hidden = true;
    });
  }

  function abrirVideos(rutinaId) {
    const rutinas = leerRutinas();
    const rutina = rutinas.find((r) => r.id === rutinaId);
    if (!rutina) return;

    const contenido = document.getElementById("rehabV25Contenido");
    const ejercicios = Array.isArray(rutina.ejercicios) ? rutina.ejercicios : [];

    contenido.innerHTML = `
      <div style="opacity:.78;margin-bottom:12px">
        Rutina: <strong>${escapar(rutina.nombre)}</strong><br>
        Agrega un video por ejercicio para mostrar exactamente cómo debe realizarse.
      </div>
      <div id="rehabV25ListaVideos"></div>
      <div class="rehabV25Acciones">
        <button id="rehabV25Guardar" class="rehabV25Btn" type="button">💾 GUARDAR VIDEOS</button>
        <button id="rehabV25Cancelar" class="rehabV25Btn sec" type="button">CANCELAR</button>
      </div>
    `;

    const host = document.getElementById("rehabV25ListaVideos");

    ejercicios.forEach((ej, i) => {
      const box = document.createElement("div");
      box.className = "rehabV25Ejercicio";
      box.innerHTML = `
        <div class="rehabV25EjercicioTitulo">${i + 1}. ${escapar(nombreModo(ej.modo))}</div>
        <div class="rehabV25Campo">
          <label>Enlace del video</label>
          <input
            type="url"
            data-video-ejercicio="${escapar(ej.id || String(i))}"
            placeholder="https://..."
            value="${escapar(ej.videoUrl || "")}">
        </div>
        ${ej.videoUrl ? `<a class="rehabV25VideoBtn" target="_blank" rel="noopener noreferrer" href="${escapar(ej.videoUrl)}">▶ VER VIDEO ACTUAL</a>` : ""}
      `;
      host.appendChild(box);
    });

    document.getElementById("rehabV25Guardar").onclick = function () {
      const inputs = host.querySelectorAll("[data-video-ejercicio]");

      inputs.forEach((input, i) => {
        if (!ejercicios[i]) return;
        ejercicios[i].videoUrl = input.value.trim();
      });

      rutina.ejercicios = ejercicios;
      guardarRutinas(rutinas);

      alert("Videos guardados.");
      document.getElementById("rehabV25Overlay").hidden = true;

      // Refresca la lista de V23 si esta disponible.
      if (typeof window.rehabV23AbrirRutinas === "function") {
        setTimeout(window.rehabV23AbrirRutinas, 80);
      }
    };

    document.getElementById("rehabV25Cancelar").onclick = function () {
      document.getElementById("rehabV25Overlay").hidden = true;
    };

    document.getElementById("rehabV25Overlay").hidden = false;
  }

  function decorarRutinas() {
    // Se ejecuta repetidamente porque V23 reconstruye la lista al crear/editar.
    document.querySelectorAll(".rehabV23RutinaCard").forEach((card) => {
      if (card.dataset.rehabV25 === "1") return;

      const editar = card.querySelector("[data-editar]");
      if (!editar) return;

      const rutinaId = editar.dataset.editar;
      card.dataset.rehabV25 = "1";

      const acciones = editar.parentElement;
      const boton = document.createElement("button");
      boton.type = "button";

      boton.className = "rehabV23Btn secundario";
      boton.textContent = "🎥 VIDEOS";
      boton.addEventListener("click", function () {
        abrirVideos(rutinaId);
      });

      acciones.insertBefore(boton, editar);
    });

    // Agrega botones VER VIDEO dentro del resumen de cada rutina.
    const rutinas = leerRutinas();
    document.querySelectorAll(".rehabV23RutinaCard").forEach((card) => {
      const editar = card.querySelector("[data-editar]");
      if (!editar) return;

      const rutina = rutinas.find((r) => r.id === editar.dataset.editar);
      if (!rutina || !Array.isArray(rutina.ejercicios)) return;

      const lista = card.querySelector(".rehabV23RutinaEjercicios");
      if (!lista) return;

      const lis = lista.querySelectorAll("li");
      rutina.ejercicios.forEach((ej, i) => {
        if (!ej.videoUrl || !lis[i] || lis[i].querySelector(".rehabV25VideoBtn")) return;

        const link = document.createElement("a");
        link.className = "rehabV25VideoBtn";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.href = ej.videoUrl;
        link.textContent = "▶ VER VIDEO";
        lis[i].appendChild(document.createElement("br"));
        lis[i].appendChild(link);
      });
    });
  }

  function iniciar() {
    agregarEstilos();
    crearModal();
    setInterval(decorarRutinas, 700);
    console.log("RehabPod V25: videos por ejercicio activados.");
  }

  setTimeout(iniciar, 220);
})();

// =====================================================
// REHABPOD V30
// CLIENTE SUPABASE UNICO COMPARTIDO POR V27 + V28 + V29
// =====================================================

window.rehabSupabaseClient = window.rehabSupabaseClient || null;
window.rehabSupabasePromise = window.rehabSupabasePromise || null;

window.rehabGetSupabaseClient = async function () {
  if (window.rehabSupabaseClient) {
    return window.rehabSupabaseClient;
  }

  if (window.rehabSupabasePromise) {
    return await window.rehabSupabasePromise;
  }

  window.rehabSupabasePromise = (async function () {
    // Cargar la configuracion publica una sola vez.
    if (
      !window.REHAB_SUPABASE_CONFIG?.url ||
      !window.REHAB_SUPABASE_CONFIG?.publishableKey
    ) {
      await new Promise((resolve, reject) => {
        const existente = document.getElementById("rehabSupabaseConfigPublica");

        if (existente) {
          if (
            window.REHAB_SUPABASE_CONFIG?.url &&
            window.REHAB_SUPABASE_CONFIG?.publishableKey
          ) {
            resolve();
            return;
          }

          existente.addEventListener("load", resolve, { once: true });
          existente.addEventListener(
            "error",
            () => reject(new Error("No se pudo cargar supabase-config.js.")),
            { once: true }
          );
          return;
        }

        const script = document.createElement("script");
        script.id = "rehabSupabaseConfigPublica";
        script.src = "supabase-config.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("No se pudo cargar supabase-config.js."));
        document.head.appendChild(script);
      });
    }

    if (
      !window.REHAB_SUPABASE_CONFIG?.url ||
      !window.REHAB_SUPABASE_CONFIG?.publishableKey
    ) {
      throw new Error("Configuracion publica de Supabase incompleta.");
    }

    // Cargar supabase-js una sola vez.
    if (!window.supabase?.createClient) {
      await new Promise((resolve, reject) => {
        const existente = document.getElementById("rehabSupabaseSDK");

        if (existente) {
          if (window.supabase?.createClient) {
            resolve();
            return;
          }

          existente.addEventListener("load", resolve, { once: true });
          existente.addEventListener(
            "error",
            () => reject(new Error("No se pudo cargar Supabase JS.")),
            { once: true }
          );
          return;
        }

        const script = document.createElement("script");
        script.id = "rehabSupabaseSDK";
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.onload = resolve;
        script.onerror = () => reject(new Error("No se pudo cargar Supabase JS."));
        document.head.appendChild(script);
      });
    }

    if (!window.supabase?.createClient) {
      throw new Error("Supabase JS no esta disponible.");
    }

    window.rehabSupabaseClient = window.supabase.createClient(
      window.REHAB_SUPABASE_CONFIG.url,
      window.REHAB_SUPABASE_CONFIG.publishableKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );

    return window.rehabSupabaseClient;
  })();

  try {
    return await window.rehabSupabasePromise;
  } catch (error) {
    window.rehabSupabasePromise = null;
    throw error;
  }
};

// =====================================================
// REHABPOD V27
// CUENTAS GENERALES: PROFESIONAL / USUARIO + SUPABASE
//
// Esta version REEMPLAZA el bloque V26 completo.
// Requiere ejecutar primero:
// rehabpod_v27_migracion_profesional_usuario.sql
//
// Configuracion publica de Supabase:
// public/supabase-config.js
// =====================================================

(function () {
  let rehabCloud = null;
  let rehabCloudUser = null;

  let rehabCloudProfile = null;

  const ESPECIALIDADES = {
    professional: [
      ["physiotherapy", "Fisioterapia"],
      ["sports_coach", "Entrenador deportivo"],
      ["physical_trainer", "Preparador físico"],
      ["rehabilitation_professional", "Profesional de rehabilitación"],
      ["educator", "Profesor / educador"],
      ["other", "Otro"],
    ],
    user: [
      ["athlete", "Deportista"],
      ["fitness", "Fitness / gimnasio"],
      ["rehabilitation", "Rehabilitación"],
      ["cognitive_training", "Entrenamiento cognitivo"],
      ["recreational", "Recreativo"],
      ["other", "Otro"],
    ],
  };

  function escapar(texto) {
    return String(texto ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function etiquetaRol(role) {
    return role === "professional" ? "Profesional" : "Usuario";
  }

  function etiquetaEspecialidad(role, specialty) {
    const opciones = ESPECIALIDADES[role] || [];
    const encontrada = opciones.find((x) => x[0] === specialty);
    if (encontrada) return encontrada[1];
    if (!specialty || specialty === "unspecified") return "Sin especificar";
    return specialty;
  }

  function opcionesEspecialidad(role, seleccionada = "") {
    return (ESPECIALIDADES[role] || [])
      .map(
        ([value, label]) =>
          `<option value="${escapar(value)}" ${value === seleccionada ? "selected" : ""}>${escapar(label)}</option>`
      )
      .join("");
  }

  // -----------------------------------------------------
  // CONFIGURACION PUBLICA DE SUPABASE
  // -----------------------------------------------------

  async function cargarConfigPublica() {
    if (
      window.REHAB_SUPABASE_CONFIG?.url &&
      window.REHAB_SUPABASE_CONFIG?.publishableKey
    ) {
      return true;
    }

    return new Promise((resolve) => {
      const existente = document.getElementById("rehabSupabaseConfigPublica");
      if (existente) {
        existente.addEventListener(
          "load",
          () => resolve(!!window.REHAB_SUPABASE_CONFIG),
          { once: true }
        );
        existente.addEventListener("error", () => resolve(false), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "rehabSupabaseConfigPublica";
      script.src = "supabase-config.js";
      script.onload = () => resolve(!!window.REHAB_SUPABASE_CONFIG);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  function configurado() {
    const cfg = window.REHAB_SUPABASE_CONFIG;
    return !!(
      cfg &&
      typeof cfg.url === "string" &&
      cfg.url.startsWith("https://") &&
      typeof cfg.publishableKey === "string" &&
      cfg.publishableKey.length > 10
    );
  }

  function cargarSupabaseSDK() {
    return new Promise((resolve, reject) => {
      if (window.supabase && window.supabase.createClient) {
        resolve();
        return;
      }

      const existente = document.getElementById("rehabSupabaseSDK");
      if (existente) {
        existente.addEventListener("load", resolve, { once: true });
        existente.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "rehabSupabaseSDK";
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = resolve;
      script.onerror = () => reject(new Error("No se pudo cargar Supabase JS."));
      document.head.appendChild(script);
    });
  }

  async function inicializarCloud() {
    try {
      rehabCloud = await window.rehabGetSupabaseClient();

      const { data } = await rehabCloud.auth.getSession();
      rehabCloudUser = data?.session?.user || null;

      if (rehabCloudUser) {
        await cargarPerfilCloud();
      } else {
        rehabCloudProfile = null;
      }

      return true;
    } catch (error) {
      console.error("RehabPod Cloud:", error);
      rehabCloud = null;
      rehabCloudUser = null;
      rehabCloudProfile = null;
      return false;
    }
  }

  async function cargarPerfilCloud() {
    if (!rehabCloudUser) return null;

    const { data, error } = await rehabCloud
      .from("rehab_profiles")
      .select("user_id, full_name, role, specialty, user_code, created_at")
      .eq("user_id", rehabCloudUser.id)
      .single();

    if (error) {
      console.warn("No se pudo cargar perfil cloud:", error);
      rehabCloudProfile = null;
      return null;
    }

    rehabCloudProfile = data;
    return data;
  }

  // -----------------------------------------------------
  // ESTILOS / BOTON
  // -----------------------------------------------------
  function agregarEstilos() {
    if (document.getElementById("rehabV27Estilos")) return;

    const st = document.createElement("style");
    st.id = "rehabV27Estilos";
    st.textContent = `
      .rehabV27Boton{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:48px;
        margin-top:10px;border:1px solid rgba(168,85,247,.28);border-radius:14px;
        background:rgba(168,85,247,.09);color:inherit;font-weight:800;cursor:pointer}
      .rehabV27Boton:hover{background:rgba(168,85,247,.15)}
      .rehabV27Overlay{position:fixed;inset:0;z-index:100200;background:rgba(2,6,23,.76);backdrop-filter:blur(7px);
        display:flex;align-items:center;justify-content:center;padding:18px}
      .rehabV27Overlay[hidden]{display:none!important}
      .rehabV27Modal{width:min(900px,100%);max-height:92vh;overflow:auto;border-radius:24px;
        border:1px solid rgba(148,163,184,.22);background:var(--tarjeta);color:inherit;
        padding:20px;box-shadow:0 25px 80px rgba(0,0,0,.42)}
      .tema-claro .rehabV27Modal{background:#fff}
      .rehabV27Cabecera{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}

      .rehabV27Cerrar{width:42px;height:42px;border-radius:12px;border:1px solid rgba(148,163,184,.25);
        background:rgba(148,163,184,.08);color:inherit;font-size:20px;cursor:pointer}
      .rehabV27Campo{display:grid;gap:6px;margin-bottom:12px}
      .rehabV27Campo label{font-size:.8rem;font-weight:800;opacity:.78}
      .rehabV27Campo input,.rehabV27Campo select{width:100%;box-sizing:border-box;padding:10px 11px;border-radius:11px;
        border:1px solid rgba(148,163,184,.27);background:rgba(148,163,184,.07);color:inherit}
      .rehabV27Dos{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .rehabV27Acciones{display:flex;flex-wrap:wrap;gap:9px;margin:12px 0}
      .rehabV27Btn{appearance:none;border:0;border-radius:12px;padding:10px 14px;font-weight:800;cursor:pointer;
        background:#7c3aed;color:#fff}
      .rehabV27Btn.sec{background:rgba(148,163,184,.15);color:inherit;border:1px solid rgba(148,163,184,.22)}
      .rehabV27Card{border:1px solid rgba(148,163,184,.21);border-radius:17px;padding:14px;
        background:rgba(148,163,184,.05);margin:10px 0}
      .rehabV27Estado{padding:11px 12px;border-radius:13px;background:rgba(59,130,246,.09);
        border:1px solid rgba(59,130,246,.18);font-size:.84rem;line-height:1.45;margin-bottom:12px}
      .rehabV27Codigo{font-size:1.5rem;font-weight:950;letter-spacing:3px;text-align:center;padding:16px;
        border-radius:15px;background:rgba(34,197,94,.09);border:1px dashed rgba(34,197,94,.35);margin:12px 0}
      .rehabV27Ayuda{font-size:.8rem;opacity:.72;line-height:1.45;margin-top:-4px;margin-bottom:12px}
      @media(max-width:700px){.rehabV27Dos{grid-template-columns:1fr}}
    `;
    document.head.appendChild(st);
  }

  function crearBoton() {
    // Limpieza defensiva si la app venia de V26.
    document.getElementById("rehabV26BtnCloud")?.remove();

    if (document.getElementById("rehabV27BtnCloud")) return;

    const ref =
      document.getElementById("rehabV24BtnHistorial") ||
      document.getElementById("rehabV23BtnRutinas") ||
      document.getElementById("btnEntrenamiento");

    if (!ref) return;

    const b = document.createElement("button");
    b.id = "rehabV27BtnCloud";
    b.type = "button";
    b.className = "rehabV27Boton";
    b.innerHTML = "☁️ CUENTA Y NUBE";
    b.onclick = abrirCloud;
    ref.insertAdjacentElement("afterend", b);
  }

  function crearModal() {
    document.getElementById("rehabV26Overlay")?.remove();
    if (document.getElementById("rehabV27Overlay")) return;

    const ov = document.createElement("div");
    ov.id = "rehabV27Overlay";
    ov.className = "rehabV27Overlay";
    ov.hidden = true;
    ov.innerHTML = `
      <div class="rehabV27Modal">
        <div class="rehabV27Cabecera">
          <div>
            <div style="font-size:.72rem;opacity:.65;font-weight:800">REHABPOD CLOUD</div>
            <h2 id="rehabV27Titulo" style="margin:0">Cuenta y nube</h2>
          </div>
          <button id="rehabV27Cerrar" class="rehabV27Cerrar" type="button">×</button>
        </div>
        <div id="rehabV27Contenido"></div>
      </div>
    `;
    document.body.appendChild(ov);

    document.getElementById("rehabV27Cerrar").onclick = () => (ov.hidden = true);
    ov.addEventListener("click", (e) => {
      if (e.target === ov) ov.hidden = true;
    });
  }

  // -----------------------------------------------------
  // LOGIN / REGISTRO
  // -----------------------------------------------------
  async function abrirCloud() {
    const contenido = document.getElementById("rehabV27Contenido");
    document.getElementById("rehabV27Overlay").hidden = false;
    contenido.innerHTML = `<div class="rehabV27Estado">Conectando con RehabPod Cloud...</div>`;

    const ok = await inicializarCloud();
    if (!ok) {
      contenido.innerHTML = `
        <div class="rehabV27Estado">
          No se pudo iniciar RehabPod Cloud.<br><br>
          Comprueba que <strong>supabase-config.js</strong> esté dentro de la carpeta public y que contenga únicamente
          Project URL + Publishable Key.
        </div>`;
      return;
    }

    if (rehabCloudUser) await renderPanelCuenta();
    else renderLogin();
  }

  function renderLogin() {
    const c = document.getElementById("rehabV27Contenido");
    document.getElementById("rehabV27Titulo").textContent = "Ingresar a RehabPod";

    c.innerHTML = `
      <div class="rehabV27Dos">
        <div class="rehabV27Card">
          <h3>Iniciar sesión</h3>
          <div class="rehabV27Campo"><label>Correo</label><input id="rehabV27LoginEmail" type="email" autocomplete="email"></div>
          <div class="rehabV27Campo"><label>Contraseña</label><input id="rehabV27LoginPass" type="password" autocomplete="current-password"></div>
          <button id="rehabV27LoginBtn" class="rehabV27Btn" type="button">INGRESAR</button>
        </div>

        <div class="rehabV27Card">
          <h3>Crear cuenta</h3>
          <div class="rehabV27Campo"><label>Nombre</label><input id="rehabV27RegNombre" type="text" maxlength="80" autocomplete="name"></div>
          <div class="rehabV27Campo">
            <label>Tipo de cuenta</label>
            <select id="rehabV27RegRol">
              <option value="user">Usuario</option>
              <option value="professional">Profesional</option>
            </select>
          </div>
          <div id="rehabV27DescripcionRol" class="rehabV27Ayuda"></div>
          <div class="rehabV27Campo">
            <label id="rehabV27LabelEspecialidad">Tipo de uso</label>
            <select id="rehabV27RegEspecialidad"></select>
          </div>
          <div class="rehabV27Campo"><label>Correo</label><input id="rehabV27RegEmail" type="email" autocomplete="email"></div>
          <div class="rehabV27Campo"><label>Contraseña</label><input id="rehabV27RegPass" type="password" minlength="6" autocomplete="new-password"></div>
          <button id="rehabV27RegBtn" class="rehabV27Btn" type="button">CREAR CUENTA</button>
        </div>
      </div>
      <div id="rehabV27Mensaje" class="rehabV27Estado" style="display:none"></div>
    `;

    document.getElementById("rehabV27LoginBtn").onclick = login;
    document.getElementById("rehabV27RegBtn").onclick = registrar;
    document.getElementById("rehabV27RegRol").onchange = actualizarRegistroRol;
    actualizarRegistroRol();
  }

  function actualizarRegistroRol() {
    const role = document.getElementById("rehabV27RegRol")?.value || "user";
    const sel = document.getElementById("rehabV27RegEspecialidad");
    const label = document.getElementById("rehabV27LabelEspecialidad");
    const desc = document.getElementById("rehabV27DescripcionRol");
    if (!sel || !label || !desc) return;

    sel.innerHTML = opcionesEspecialidad(role);

    if (role === "professional") {
      label.textContent = "Área profesional";
      desc.textContent =
        "Profesional: crea, sincroniza y posteriormente podrá asignar rutinas a otras personas.";
    } else {
      label.textContent = "Tipo de uso";
      desc.textContent =
        "Usuario: entrena con RehabPod por cuenta propia o puede vincularse con un profesional.";
    }
  }

  function mensaje(texto) {
    const m = document.getElementById("rehabV27Mensaje");
    if (!m) return;
    m.style.display = "block";
    m.textContent = texto;
  }

  async function login() {
    const email = document.getElementById("rehabV27LoginEmail").value.trim();
    const password = document.getElementById("rehabV27LoginPass").value;

    if (!email || !password) {
      mensaje("Completa correo y contraseña.");
      return;
    }

    const { data, error } = await rehabCloud.auth.signInWithPassword({ email, password });
    if (error) {
      mensaje(error.message);
      return;
    }

    rehabCloudUser = data.user;
    await cargarPerfilCloud();
    await renderPanelCuenta();
  }

  async function registrar() {
    const full_name = document.getElementById("rehabV27RegNombre").value.trim();
    const role = document.getElementById("rehabV27RegRol").value;
    const specialty = document.getElementById("rehabV27RegEspecialidad").value;
    const email = document.getElementById("rehabV27RegEmail").value.trim();
    const password = document.getElementById("rehabV27RegPass").value;

    if (!full_name || !email || !password || !specialty) {
      mensaje("Completa todos los campos.");
      return;
    }

    const { data, error } = await rehabCloud.auth.signUp({
      email,
      password,
      options: { data: { full_name, role, specialty } },
    });

    if (error) {
      mensaje(error.message);
      return;
    }

    if (!data.session) {
      mensaje(
        "Cuenta creada. Revisa tu correo para confirmar la cuenta y luego inicia sesión."
      );
      return;
    }

    rehabCloudUser = data.user;
    await new Promise((r) => setTimeout(r, 700));
    await cargarPerfilCloud();
    await renderPanelCuenta();
  }

  // -----------------------------------------------------
  // PANEL DE CUENTA
  // -----------------------------------------------------
  async function renderPanelCuenta() {
    if (!rehabCloudProfile) await cargarPerfilCloud();

    const c = document.getElementById("rehabV27Contenido");
    document.getElementById("rehabV27Titulo").textContent = "Mi cuenta RehabPod";

    if (!rehabCloudProfile) {
      c.innerHTML = `<div class="rehabV27Estado">No se encontró el perfil de esta cuenta. Comprueba que ejecutaste la migración SQL V27.</div>`;
      return;
    }

    c.innerHTML = `
      <div class="rehabV27Estado">
        <strong>${escapar(rehabCloudProfile.full_name)}</strong><br>
        ${escapar(etiquetaRol(rehabCloudProfile.role))} · ${escapar(etiquetaEspecialidad(rehabCloudProfile.role, rehabCloudProfile.specialty))}<br>
        ${escapar(rehabCloudUser.email || "")}
      </div>

      <div class="rehabV27Card">
        <h3>Mi perfil</h3>
        <div class="rehabV27Campo">
          <label>${rehabCloudProfile.role === "professional" ? "Área profesional" : "Tipo de uso"}</label>
          <select id="rehabV27PerfilEspecialidad">
            ${opcionesEspecialidad(rehabCloudProfile.role, rehabCloudProfile.specialty)}
          </select>
        </div>
        <button id="rehabV27GuardarPerfil" class="rehabV27Btn sec" type="button">GUARDAR PERFIL</button>
      </div>

      <div id="rehabV27PanelRol"></div>

      <div class="rehabV27Acciones">
        <button id="rehabV27Sync" class="rehabV27Btn" type="button">☁️ SINCRONIZAR MIS RUTINAS</button>
        <button id="rehabV27Salir" class="rehabV27Btn sec" type="button">CERRAR SESIÓN</button>
      </div>

      <div id="rehabV27PanelMensaje" class="rehabV27Estado" style="display:none"></div>
    `;

    document.getElementById("rehabV27Salir").onclick = logout;
    document.getElementById("rehabV27Sync").onclick = sincronizarRutinas;
    document.getElementById("rehabV27GuardarPerfil").onclick = guardarEspecialidadPerfil;

    if (rehabCloudProfile.role === "professional") await renderPanelProfesional();
    else await renderPanelUsuario();
  }

  async function guardarEspecialidadPerfil() {
    const specialty = document.getElementById("rehabV27PerfilEspecialidad")?.value;
    if (!specialty) return;

    const { error } = await rehabCloud
      .from("rehab_profiles")
      .update({ specialty })
      .eq("user_id", rehabCloudUser.id);

    if (error) {
      panelMensaje("No se pudo actualizar el perfil: " + error.message);
      return;
    }

    rehabCloudProfile.specialty = specialty;
    panelMensaje("Perfil actualizado.");
    await renderPanelCuenta();
  }

  async function renderPanelUsuario() {
    const host = document.getElementById("rehabV27PanelRol");
    host.innerHTML = `
      <div class="rehabV27Card">
        <h3>Mi código de usuario</h3>
        <p style="opacity:.76">Si quieres trabajar con un entrenador, fisioterapeuta u otro profesional, comparte este código únicamente con esa persona.</p>
        <div class="rehabV27Codigo">${escapar(rehabCloudProfile.user_code || "--------")}</div>
      </div>

      <div class="rehabV27Card">
        <h3>Rutinas asignadas</h3>
        <div id="rehabV27AsignacionesUsuario">Cargando...</div>
      </div>
    `;

    const { data, error } = await rehabCloud
      .from("rehab_assignments")
      .select(
        "id, scheduled_date, scheduled_time, status, professional_notes, routine_id"
      )
      .eq("user_id", rehabCloudUser.id)
      .order("scheduled_date", { ascending: true });

    const box = document.getElementById("rehabV27AsignacionesUsuario");
    if (error) {
      box.textContent = "No se pudieron cargar las asignaciones.";
      return;
    }
    if (!data?.length) {
      box.textContent =
        "Todavía no tienes rutinas asignadas. También puedes crear y usar tus propias rutinas.";
      return;
    }

    box.innerHTML = data
      .map(
        (a) => `
      <div style="padding:9px 0;border-bottom:1px solid rgba(148,163,184,.16)">
        📅 ${escapar(a.scheduled_date)} ${a.scheduled_time ? "· " + escapar(a.scheduled_time) : ""}
        <br><small>${escapar(a.status)}</small>
      </div>
    `
      )
      .join("");
  }

  async function renderPanelProfesional() {
    const host = document.getElementById("rehabV27PanelRol");

    host.innerHTML = `
      <div class="rehabV27Card">
        <h3>Vincular usuario</h3>
        <p style="opacity:.76">El usuario te comparte su código. Puede ser un deportista, paciente, cliente de gimnasio u otra persona que utilice RehabPod.</p>
        <div class="rehabV27Campo">
          <label>Código del usuario</label>
          <input id="rehabV27CodigoUsuario" type="text" maxlength="12" placeholder="Ej. A1B2C3D4" autocomplete="off">
        </div>
        <button id="rehabV27Vincular" class="rehabV27Btn" type="button">VINCULAR USUARIO</button>
      </div>

      <div class="rehabV27Card">
        <h3>Mis usuarios</h3>
        <div id="rehabV27Usuarios">Cargando...</div>
      </div>
    `;

    document.getElementById("rehabV27Vincular").onclick = vincularUsuario;
    await cargarUsuariosVinculados();
  }

  async function vincularUsuario() {
    const codigo = document.getElementById("rehabV27CodigoUsuario").value.trim();
    if (!codigo) {
      panelMensaje("Escribe el código del usuario.");
      return;
    }

    const { data, error } = await rehabCloud.rpc("rehab_connect_user_by_code", {
      p_code: codigo,
    });
    if (error) {
      panelMensaje(error.message);
      return;
    }

    const nombre = data?.[0]?.user_name || "Usuario";
    panelMensaje("Usuario vinculado: " + nombre);
    document.getElementById("rehabV27CodigoUsuario").value = "";
    await cargarUsuariosVinculados();
  }

  async function cargarUsuariosVinculados() {
    const box = document.getElementById("rehabV27Usuarios");
    if (!box) return;

    const { data: links, error } = await rehabCloud
      .from("rehab_professional_users")
      .select("user_id, status, created_at")
      .eq("professional_id", rehabCloudUser.id)
      .eq("status", "active");

    if (error) {
      box.textContent = "No se pudieron cargar los usuarios vinculados.";
      return;
    }
    if (!links?.length) {
      box.textContent = "Todavía no tienes usuarios vinculados.";
      return;
    }

    const ids = links.map((x) => x.user_id);
    const { data: perfiles, error: perfilesError } = await rehabCloud
      .from("rehab_profiles")
      .select("user_id, full_name, specialty")
      .in("user_id", ids);

    if (perfilesError) {
      box.textContent = "No se pudieron cargar los perfiles vinculados.";
      return;
    }

    const mapa = new Map((perfiles || []).map((p) => [p.user_id, p]));
    box.innerHTML = links
      .map((l) => {
        const p = mapa.get(l.user_id) || {};
        return `
        <div style="padding:10px 0;border-bottom:1px solid rgba(148,163,184,.16)">
          👤 <strong>${escapar(p.full_name || "Usuario")}</strong><br>
          <small>${escapar(etiquetaEspecialidad("user", p.specialty))}</small>
        </div>`;
      })
      .join("");
  }

  function panelMensaje(texto) {
    const m = document.getElementById("rehabV27PanelMensaje");
    if (!m) return;
    m.style.display = "block";
    m.textContent = texto;
  }

  async function logout() {
    await rehabCloud.auth.signOut();
    rehabCloudUser = null;
    rehabCloudProfile = null;
    renderLogin();
  }

  // -----------------------------------------------------
  // SINCRONIZAR RUTINAS LOCALES
  // Tanto Profesional como Usuario pueden tener rutinas propias.
  // -----------------------------------------------------
  function leerRutinasLocales() {
    try {
      const raw = localStorage.getItem("rehabpodRutinas");
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  async function sincronizarRutinas() {
    if (!rehabCloudUser) return;

    const rutinas = leerRutinasLocales();
    if (!rutinas.length) {
      panelMensaje("No tienes rutinas locales para sincronizar.");
      return;
    }

    panelMensaje("Sincronizando rutinas...");

    try {
      for (const rutina of rutinas) {
        const { data: routineRow, error: routineError } = await rehabCloud
          .from("rehab_routines")
          .upsert(
            {
              owner_id: rehabCloudUser.id,
              local_source_id: rutina.id,
              name: rutina.nombre,
              category: rutina.categoria || "fisioterapia",
              rest_seconds: Number(rutina.descansoSeg || 0),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "owner_id,local_source_id" }
          )
          .select("id")
          .single();

        if (routineError) throw routineError;
        const routineId = routineRow.id;

        const { error: deleteError } = await rehabCloud
          .from("rehab_routine_exercises")
          .delete()
          .eq("routine_id", routineId);
        if (deleteError) throw deleteError;

        const ejercicios = Array.isArray(rutina.ejercicios) ? rutina.ejercicios : [];
        if (ejercicios.length) {
          const rows = ejercicios.map((ej, index) => ({
            routine_id: routineId,
            position: index + 1,
            mode: ej.modo,
            difficulty: ej.dificultad || "media",
            finish_type: ej.finalizarPor || "rondas",
            finish_value: Number(ej.valor || 5),
            video_url: ej.videoUrl || null,
          }));

          const { error: insertError } = await rehabCloud
            .from("rehab_routine_exercises")
            .insert(rows);
          if (insertError) throw insertError;
        }
      }

      panelMensaje(
        `Sincronización completada: ${rutinas.length} rutina(s) guardadas en la nube.`
      );
    } catch (error) {
      console.error(error);
      panelMensaje("Error al sincronizar: " + error.message);
    }
  }

  // -----------------------------------------------------
  // INICIO
  // -----------------------------------------------------
  async function iniciar() {
    agregarEstilos();
    crearBoton();
    crearModal();
    await inicializarCloud();
    console.log("RehabPod V27: cuentas Profesional/Usuario + nube preparadas.");
  }

  setTimeout(iniciar, 260);

  window.rehabCloudAbrir = abrirCloud;
})();
// =====================================================
// REHABPOD V28
// ASIGNAR RUTINAS PROFESIONAL -> USUARIO
// + GUIA DE EJERCICIO CON VIDEO DENTRO DE LA APP
//
// PEGAR TODO ESTE BLOQUE AL FINAL DE app.js, DESPUES DE V27.
// REQUIERE ejecutar antes:
// rehabpod_v28_asignaciones_guias.sql

// =====================================================

(function () {
  let cloud = null;
  let sesionUser = null;
  let perfilCloud = null;

  const MAPA_MODOS = {
    simple: "Reacción aleatoria",
    colores: "Reacción por colores",
    secuencia: "Secuencia / memoria",
    libre: "Modo libre",
    persecucion: "Persecución",
    doble: "Doble estímulo",
    prohibido: "Color prohibido",
    circuito: "Circuito de Pods",
    contrarreloj: "Contrarreloj",
    entrenador: "Modo entrenador",
    cazaColor: "Caza de color",
    automatico: "Cambio automático",
    stroop: "Palabra vs color",
  };

  function esc(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function modoNombre(modo) {
    return MAPA_MODOS[modo] || modo || "Ejercicio";
  }

  function fechaBonita(fecha) {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha + "T12:00:00");
    if (Number.isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString();
  }

  function horaBonita(hora) {
    if (!hora) return "";
    return String(hora).slice(0, 5);
  }

  function estadoAsignacionBonito(status, scheduledDate = null) {
    const estado = String(status || "pending");

    if (estado === "pending" && scheduledDate) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fecha = new Date(String(scheduledDate) + "T00:00:00");
      if (!Number.isNaN(fecha.getTime())) {
        if (fecha.getTime() < hoy.getTime()) return "Atrasada";
        if (fecha.getTime() === hoy.getTime()) return "Para hoy";
      }
    }

    const estados = {
      pending: "Pendiente",
      in_progress: "En progreso",
      completed: "Completada",
      cancelled: "Cancelada",
      expired: "Vencida",
    };

    return estados[estado] || estado;
  }

  async function cargarSDK() {
    if (window.supabase?.createClient) return true;

    await new Promise((resolve, reject) => {
      const existente = document.getElementById("rehabSupabaseSDK");
      if (existente) {
        if (window.supabase?.createClient) return resolve();
        existente.addEventListener("load", resolve, { once: true });
        existente.addEventListener("error", reject, { once: true });
        return;
      }

      const s = document.createElement("script");
      s.id = "rehabSupabaseSDK";
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

    return !!window.supabase?.createClient;
  }

  async function cargarConfig() {
    if (
      window.REHAB_SUPABASE_CONFIG?.url &&
      window.REHAB_SUPABASE_CONFIG?.publishableKey
    ) {
      return true;
    }

    await new Promise((resolve) => {
      const existente = document.getElementById("rehabSupabaseConfigPublica");

      if (existente) {
        existente.addEventListener("load", resolve, { once: true });
        existente.addEventListener("error", resolve, { once: true });
        return;
      }

      const s = document.createElement("script");
      s.id = "rehabSupabaseConfigPublica";
      s.src = "supabase-config.js";
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });

    return !!window.REHAB_SUPABASE_CONFIG;
  }

  async function iniciarCloud() {
    cloud = await window.rehabGetSupabaseClient();

    const { data } = await cloud.auth.getSession();
    sesionUser = data?.session?.user || null;

    if (!sesionUser) {
      perfilCloud = null;
      return false;
    }

    const { data: perfil, error } = await cloud
      .from("rehab_profiles")
      .select("user_id, full_name, role, specialty, user_code")
      .eq("user_id", sesionUser.id)
      .single();

    if (error) throw error;

    perfilCloud = perfil;
    return true;
  }

  // -----------------------------------------------------
  // VIDEO EMBEBIDO
  // -----------------------------------------------------
  function videoEmbebible(url) {
    const original = String(url || "").trim();
    if (!original) return { tipo: "none", src: "" };

    try {
      const u = new URL(original);
      const host = u.hostname.replace(/^www\./, "").toLowerCase();

      if (host === "youtu.be") {
        const id = u.pathname.split("/").filter(Boolean)[0];
        if (id)
          return {
            tipo: "iframe",
            src: `https://www.youtube.com/embed/${encodeURIComponent(id)}`,
          };
      }

      if (host.endsWith("youtube.com")) {
        let id = u.searchParams.get("v");

        if (!id) {
          const partes = u.pathname.split("/").filter(Boolean);
          if (partes[0] === "shorts" || partes[0] === "embed") {
            id = partes[1];
          }
        }

        if (id)
          return {
            tipo: "iframe",
            src: `https://www.youtube.com/embed/${encodeURIComponent(id)}`,
          };
      }

      if (host.endsWith("vimeo.com")) {
        const id = u.pathname
          .split("/")
          .filter(Boolean)
          .find((x) => /^\d+$/.test(x));
        if (id)
          return {
            tipo: "iframe",
            src: `https://player.vimeo.com/video/${encodeURIComponent(id)}`,
          };
      }

      if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(original)) {
        return { tipo: "video", src: original };
      }

      return { tipo: "link", src: original };
    } catch (e) {
      return { tipo: "link", src: original };
    }
  }

  function htmlVideo(url) {
    const v = videoEmbebible(url);

    if (v.tipo === "iframe") {
      return `
        <div class="rehabV28VideoWrap">
          <iframe
            src="${esc(v.src)}"
            title="Video del ejercicio"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>
      `;
    }

    if (v.tipo === "video") {
      return `
        <div class="rehabV28VideoWrap">
          <video controls playsinline preload="metadata">
            <source src="${esc(v.src)}">
          </video>
        </div>
      `;
    }

    if (v.tipo === "link") {
      return `
        <div class="rehabV28Aviso">
          Este proveedor no permite garantizar video embebido dentro de la app.
          <br><br>
          <a class="rehabV28Btn secundario" href="${esc(v.src)}" target="_blank" rel="noopener noreferrer">
            ▶ ABRIR VIDEO
          </a>
        </div>
      `;
    }

    return `<div class="rehabV28Aviso">Este ejercicio todavía no tiene video.</div>`;
  }

  // -----------------------------------------------------
  // UI GENERAL
  // -----------------------------------------------------
  function estilos() {
    if (document.getElementById("rehabV28Estilos")) return;

    const st = document.createElement("style");
    st.id = "rehabV28Estilos";
    st.textContent = `
      .rehabV28HomeBtn{
        display:flex;align-items:center;justify-content:center;gap:8px;width:100%;
        min-height:48px;margin-top:10px;border-radius:14px;cursor:pointer;
        border:1px solid rgba(14,165,233,.30);background:rgba(14,165,233,.09);
        color:inherit;font-weight:900

      }
      .rehabV28Overlay{
        position:fixed;inset:0;z-index:100300;background:rgba(2,6,23,.80);
        backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:16px
      }
      .rehabV28Overlay[hidden]{display:none!important}
      .rehabV28Modal{
        width:min(960px,100%);max-height:94vh;overflow:auto;border-radius:24px;padding:20px;
        background:var(--tarjeta);color:inherit;
        border:1px solid rgba(148,163,184,.22);box-shadow:0 25px 80px rgba(0,0,0,.44)
      }
      .tema-claro .rehabV28Modal{background:#fff}
      .rehabV28Head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:15px}
      .rehabV28Cerrar{width:42px;height:42px;border-radius:12px;border:1px solid rgba(148,163,184,.25);
        background:rgba(148,163,184,.08);color:inherit;font-size:20px;cursor:pointer}
      .rehabV28Card{border:1px solid rgba(148,163,184,.20);border-radius:17px;padding:14px;
        margin:10px 0;background:rgba(148,163,184,.045)}
      .rehabV28Grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .rehabV28Campo{display:grid;gap:6px;margin-bottom:11px}
      .rehabV28Campo label{font-size:.79rem;font-weight:900;opacity:.76}
      .rehabV28Campo input,.rehabV28Campo select,.rehabV28Campo textarea{
        width:100%;box-sizing:border-box;padding:10px 11px;border-radius:11px;
        border:1px solid rgba(148,163,184,.28);background:rgba(148,163,184,.07);
        color:inherit;font:inherit
      }
      .rehabV28Campo textarea{min-height:85px;resize:vertical}
      .rehabV28Btn{
        appearance:none;border:0;border-radius:12px;padding:10px 14px;font-weight:900;
        cursor:pointer;background:#0284c7;color:white;display:inline-flex;align-items:center;
        justify-content:center;gap:7px;text-decoration:none
      }
      .rehabV28Btn.secundario{
        background:rgba(148,163,184,.14);color:inherit;border:1px solid rgba(148,163,184,.22)
      }
      .rehabV28Btn.peligro{background:#b91c1c}
      .rehabV28Acciones{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .rehabV28Aviso{padding:12px;border-radius:13px;background:rgba(14,165,233,.08);
        border:1px solid rgba(14,165,233,.18);line-height:1.5}
      .rehabV28Asignacion{display:grid;gap:7px}
      .rehabV28Asignacion small{opacity:.70}
      .rehabV28VideoWrap{
        width:100%;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000;
        margin:12px 0
      }
      .rehabV28VideoWrap iframe,.rehabV28VideoWrap video{
        width:100%;height:100%;border:0;display:block
      }
      .rehabV28Dato{
        padding:10px 12px;border-radius:12px;background:rgba(148,163,184,.06);
        border:1px solid rgba(148,163,184,.16);margin:8px 0;line-height:1.5
      }
      .rehabV28EjercicioTitulo{font-weight:950;font-size:1.05rem}
      .rehabV28Badge{
        display:inline-flex;padding:5px 8px;border-radius:999px;background:rgba(14,165,233,.10);
        border:1px solid rgba(14,165,233,.20);font-size:.75rem;font-weight:900;margin:4px 4px 4px 0
      }
      @media(max-width:700px){.rehabV28Grid{grid-template-columns:1fr}.rehabV28Modal{padding:15px}}
    `;
    document.head.appendChild(st);
  }

  function crearBotonHome() {
    if (document.getElementById("rehabV28HomeBtn")) return;

    const ref =
      document.getElementById("rehabV27BtnCloud") ||
      document.getElementById("rehabV24BtnHistorial") ||
      document.getElementById("btnEntrenamiento");

    if (!ref) return;

    const b = document.createElement("button");
    b.id = "rehabV28HomeBtn";
    b.type = "button";
    b.className = "rehabV28HomeBtn";
    b.textContent = "📨 RUTINAS ASIGNADAS";
    b.onclick = abrirPrincipal;

    ref.insertAdjacentElement("afterend", b);
  }

  function crearModal() {
    if (document.getElementById("rehabV28Overlay")) return;

    const ov = document.createElement("div");
    ov.id = "rehabV28Overlay";
    ov.className = "rehabV28Overlay";
    ov.hidden = true;

    ov.innerHTML = `
      <div class="rehabV28Modal">
        <div class="rehabV28Head">
          <div>
            <div style="font-size:.72rem;opacity:.65;font-weight:900">REHABPOD CLOUD</div>
            <h2 id="rehabV28Titulo" style="margin:0">Rutinas asignadas</h2>
          </div>
          <button id="rehabV28Cerrar" class="rehabV28Cerrar" type="button">×</button>
        </div>
        <div id="rehabV28Contenido"></div>
      </div>
    `;

    document.body.appendChild(ov);

    document.getElementById("rehabV28Cerrar").onclick = cerrar;
    ov.addEventListener("click", (e) => {
      if (e.target === ov) cerrar();
    });
  }

  function abrir() {
    document.getElementById("rehabV28Overlay").hidden = false;
  }

  function cerrar() {
    document.getElementById("rehabV28Overlay").hidden = true;
  }

  function mensaje(texto) {
    const el = document.getElementById("rehabV28Mensaje");
    if (!el) return;
    el.style.display = "block";
    el.textContent = texto;
  }

  // -----------------------------------------------------
  // ABRIR SEGUN ROL
  // -----------------------------------------------------
  async function abrirPrincipal() {
    abrir();
    const c = document.getElementById("rehabV28Contenido");
    c.innerHTML = `<div class="rehabV28Aviso">Conectando con RehabPod Cloud...</div>`;

    try {
      const ok = await iniciarCloud();

      if (!ok) {
        c.innerHTML = `
          <div class="rehabV28Aviso">
            Primero inicia sesión desde <strong>☁️ CUENTA Y NUBE</strong>.
          </div>
        `;
        return;
      }

      if (perfilCloud.role === "professional") {
        await renderProfesional();
      } else {
        await renderUsuario();
      }
    } catch (error) {
      console.error(error);
      c.innerHTML = `<div class="rehabV28Aviso">Error: ${esc(error.message)}</div>`;
    }
  }

  // -----------------------------------------------------
  // PROFESIONAL
  // -----------------------------------------------------
  async function obtenerUsuariosVinculados() {
    const { data: links, error } = await cloud
      .from("rehab_professional_users")
      .select("user_id, status")
      .eq("professional_id", sesionUser.id)
      .eq("status", "active");

    if (error) throw error;
    if (!links?.length) return [];

    const ids = links.map((x) => x.user_id);

    const { data: perfiles, error: e2 } = await cloud
      .from("rehab_profiles")
      .select("user_id, full_name, specialty")
      .in("user_id", ids);

    if (e2) throw e2;

    return (perfiles || []).sort((a, b) =>
      String(a.full_name || "").localeCompare(String(b.full_name || ""))
    );
  }

  async function obtenerMisRutinas() {
    const { data, error } = await cloud
      .from("rehab_routines")
      .select("id, name, category, rest_seconds, created_at, updated_at")
      .eq("owner_id", sesionUser.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async function renderProfesional() {
    document.getElementById("rehabV28Titulo").textContent = "Asignar rutinas";

    const c = document.getElementById("rehabV28Contenido");
    const [usuarios, rutinas] = await Promise.all([
      obtenerUsuariosVinculados(),
      obtenerMisRutinas(),
    ]);

    c.innerHTML = `
      <div class="rehabV28Card">
        <h3 style="margin-top:0">📨 Asignar rutina a un usuario</h3>

        ${
          !usuarios.length
            ? `
          <div class="rehabV28Aviso">
            Todavía no tienes usuarios vinculados. Vincúlalos desde <strong>☁️ CUENTA Y NUBE</strong>.
          </div>
        `
            : ""
        }

        ${
          !rutinas.length
            ? `
          <div class="rehabV28Aviso">
            Todavía no tienes rutinas sincronizadas. Primero usa
            <strong>☁️ SINCRONIZAR MIS RUTINAS</strong>.
          </div>
        `
            : ""
        }

        <div class="rehabV28Grid">
          <div class="rehabV28Campo">
            <label>Usuario</label>
            <select id="rehabV28Usuario" ${!usuarios.length ? "disabled" : ""}>
              ${usuarios.map((u) => `<option value="${esc(u.user_id)}">${esc(u.full_name || "Usuario")}</option>`).join("")}
            </select>
          </div>

          <div class="rehabV28Campo">
            <label>Rutina</label>
            <select id="rehabV28Rutina" ${!rutinas.length ? "disabled" : ""}>
              ${rutinas.map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join("")}
            </select>
          </div>

          <div class="rehabV28Campo">
            <label>Fecha</label>
            <input id="rehabV28Fecha" type="date">
          </div>

          <div class="rehabV28Campo">
            <label>Hora (opcional)</label>
            <input id="rehabV28Hora" type="time">
          </div>
        </div>

        <div class="rehabV28Campo">
          <label>Indicaciones generales para el usuario</label>
          <textarea id="rehabV28Notas" placeholder="Ej. Realizar con calzado deportivo, descansar si aparece dolor, completar 2 veces..."></textarea>
        </div>

        <div class="rehabV28Acciones">
          <button id="rehabV28Asignar" class="rehabV28Btn" type="button"
            ${!usuarios.length || !rutinas.length ? "disabled" : ""}>
            ENVIAR RUTINA
          </button>
        </div>
      </div>

      <div class="rehabV28Card">
        <h3 style="margin-top:0">🎥 Videos e indicaciones de mis rutinas</h3>
        <p style="opacity:.75">
          Aquí puedes añadir el video y explicar exactamente cómo colocar los Pods antes de enviar la rutina.
        </p>
        <div id="rehabV28RutinasGuia">
          ${
            rutinas.length
              ? rutinas
                  .map(
                    (r) => `
            <div class="rehabV28Dato">
              <strong>${esc(r.name)}</strong>
              <div class="rehabV28Acciones">
                <button class="rehabV28Btn secundario" data-guia-rutina="${esc(r.id)}" type="button">
                  ✏️ EDITAR GUÍA
                </button>
              </div>
            </div>
          `
                  )
                  .join("")
              : "No hay rutinas en la nube."
          }
        </div>
      </div>

      <div class="rehabV28Card">
        <h3 style="margin-top:0">📋 Asignaciones enviadas</h3>
        <div id="rehabV28Enviadas">Cargando...</div>
      </div>

      <div id="rehabV28Mensaje" class="rehabV28Aviso" style="display:none"></div>
    `;

    const fecha = document.getElementById("rehabV28Fecha");
    if (fecha) fecha.value = new Date().toISOString().slice(0, 10);

    const btnAsignar = document.getElementById("rehabV28Asignar");
    if (btnAsignar) btnAsignar.onclick = guardarAsignacion;

    document.querySelectorAll("[data-guia-rutina]").forEach((btn) => {
      btn.onclick = () => editarGuiaRutina(btn.dataset.guiaRutina);
    });

    await cargarAsignacionesProfesional();
  }

  async function guardarAsignacion() {
    const user_id = document.getElementById("rehabV28Usuario")?.value;
    const routine_id = document.getElementById("rehabV28Rutina")?.value;
    const scheduled_date = document.getElementById("rehabV28Fecha")?.value;
    const scheduled_time = document.getElementById("rehabV28Hora")?.value || null;
    const professional_notes =
      document.getElementById("rehabV28Notas")?.value.trim() || null;

    if (!user_id || !routine_id || !scheduled_date) {
      mensaje("Selecciona usuario, rutina y fecha.");
      return;
    }

    const { error } = await cloud.from("rehab_assignments").insert({
      routine_id,
      professional_id: sesionUser.id,
      user_id,
      scheduled_date,
      scheduled_time,
      professional_notes,
      status: "pending",
    });

    if (error) {
      mensaje("No se pudo asignar: " + error.message);
      return;
    }

    mensaje("Rutina enviada correctamente.");
    document.getElementById("rehabV28Notas").value = "";
    await cargarAsignacionesProfesional();
  }

  async function cargarAsignacionesProfesional() {
    const host = document.getElementById("rehabV28Enviadas");
    if (!host) return;

    const { data: asignaciones, error } = await cloud
      .from("rehab_assignments")
      .select(
        "id, routine_id, user_id, scheduled_date, scheduled_time, professional_notes, status, created_at"
      )
      .eq("professional_id", sesionUser.id)
      .order("scheduled_date", { ascending: false });

    if (error) {
      host.textContent = "No se pudieron cargar.";
      return;
    }

    if (!asignaciones?.length) {
      host.textContent = "Todavía no has enviado rutinas.";
      return;
    }

    const routineIds = [
      ...new Set(asignaciones.map((a) => a.routine_id).filter(Boolean)),
    ];
    const userIds = [...new Set(asignaciones.map((a) => a.user_id).filter(Boolean))];

    const [rutinasResp, usersResp] = await Promise.all([
      routineIds.length
        ? cloud.from("rehab_routines").select("id, name").in("id", routineIds)
        : Promise.resolve({ data: [] }),
      userIds.length
        ? cloud.from("rehab_profiles").select("user_id, full_name").in("user_id", userIds)
        : Promise.resolve({ data: [] }),
    ]);

    const rutinas = new Map((rutinasResp.data || []).map((r) => [r.id, r.name]));
    const usuarios = new Map((usersResp.data || []).map((u) => [u.user_id, u.full_name]));

    host.innerHTML = asignaciones
      .map(
        (a) => `
      <div class="rehabV28Dato rehabV28Asignacion">
        <strong>${esc(rutinas.get(a.routine_id) || "Rutina")}</strong>
        <span>👤 ${esc(usuarios.get(a.user_id) || "Usuario")}</span>
        <span>📅 ${esc(fechaBonita(a.scheduled_date))}${a.scheduled_time ? " · " + esc(horaBonita(a.scheduled_time)) : ""}</span>
        <small>Estado: ${esc(estadoAsignacionBonito(a.status, a.scheduled_date))}</small>
        ${a.professional_notes ? `<small>📝 ${esc(a.professional_notes)}</small>` : ""}
        ${
          ["pending", "in_progress"].includes(String(a.status || "pending"))
            ? `
          <div class="rehabV28Acciones">
            <button
              class="rehabV28Btn peligro"
              data-v41-cancel-assignment="${esc(a.id)}"
              data-v41-cancel-role="professional"
              type="button"
            >
              CANCELAR ASIGNACIÓN
            </button>
          </div>
        `
            : ""
        }
      </div>
    `
      )
      .join("");
  }

  // -----------------------------------------------------
  // EDITOR DE GUIAS
  // -----------------------------------------------------
  async function editarGuiaRutina(routineId) {
    const [{ data: rutina, error: er1 }, { data: ejercicios, error: er2 }] =
      await Promise.all([
        cloud
          .from("rehab_routines")
          .select("id, name, category, rest_seconds")
          .eq("id", routineId)
          .single(),
        cloud
          .from("rehab_routine_exercises")
          .select(
            "id, position, mode, difficulty, finish_type, finish_value, video_url, instructions, pod_distance, pod_setup"
          )
          .eq("routine_id", routineId)
          .order("position", { ascending: true }),
      ]);

    if (er1 || er2) {
      mensaje("No se pudo abrir la guía.");
      return;
    }

    const c = document.getElementById("rehabV28Contenido");
    document.getElementById("rehabV28Titulo").textContent = "Editar guía";

    c.innerHTML = `
      <div class="rehabV28Aviso">
        <strong>${esc(rutina.name)}</strong><br>
        Estos datos se mostrarán al Usuario debajo del video.
      </div>

      <div id="rehabV28EditorEjercicios">
        ${(ejercicios || [])
          .map(
            (e, i) => `
          <div class="rehabV28Card" data-editor-ejercicio="${esc(e.id)}">
            <div class="rehabV28EjercicioTitulo">${i + 1}. ${esc(modoNombre(e.mode))}</div>
            <span class="rehabV28Badge">${esc(e.difficulty || "media")}</span>
            <span class="rehabV28Badge">${esc(e.finish_type || "rondas")}: ${esc(e.finish_value ?? "")}</span>

            <div class="rehabV28Campo">
              <label>Enlace del video</label>
              <input data-campo="video_url" type="url" value="${esc(e.video_url || "")}"
                placeholder="https://youtube.com/...">

            </div>

            <div class="rehabV28Campo">
              <label>Distancia recomendada entre Pods</label>
              <input data-campo="pod_distance" type="text" value="${esc(e.pod_distance || "")}"
                placeholder="Ej. 1,5 m entre cada Pod">
            </div>

            <div class="rehabV28Campo">
              <label>Cómo colocar los Pods</label>
              <textarea data-campo="pod_setup"
                placeholder="Ej. 4 Pods formando un cuadrado; el usuario se coloca en el centro.">${esc(e.pod_setup || "")}</textarea>
            </div>

            <div class="rehabV28Campo">
              <label>Indicaciones del ejercicio</label>
              <textarea data-campo="instructions"
                placeholder="Ej. Mantener semiflexión de rodillas, tocar el Pod iluminado y volver al centro.">${esc(e.instructions || "")}</textarea>
            </div>

            ${e.video_url ? htmlVideo(e.video_url) : ""}
          </div>
        `
          )
          .join("")}

      </div>

      <div class="rehabV28Acciones">
        <button id="rehabV28GuardarGuia" class="rehabV28Btn" type="button">💾 GUARDAR GUÍA</button>
        <button id="rehabV28VolverProfesional" class="rehabV28Btn secundario" type="button">VOLVER</button>
      </div>

      <div id="rehabV28Mensaje" class="rehabV28Aviso" style="display:none"></div>
    `;

    document.getElementById("rehabV28GuardarGuia").onclick = guardarGuia;
    document.getElementById("rehabV28VolverProfesional").onclick = renderProfesional;
  }

  async function guardarGuia() {
    const cards = [...document.querySelectorAll("[data-editor-ejercicio]")];

    try {
      for (const card of cards) {
        const id = card.dataset.editorEjercicio;
        const valor = (nombre) =>
          card.querySelector(`[data-campo="${nombre}"]`)?.value.trim() || null;

        const { error } = await cloud
          .from("rehab_routine_exercises")
          .update({
            video_url: valor("video_url"),
            pod_distance: valor("pod_distance"),
            pod_setup: valor("pod_setup"),
            instructions: valor("instructions"),
          })
          .eq("id", id);

        if (error) throw error;
      }

      mensaje("Guía guardada correctamente.");
    } catch (error) {
      mensaje("Error guardando la guía: " + error.message);
    }
  }

  // -----------------------------------------------------
  // USUARIO
  // -----------------------------------------------------
  async function renderUsuario() {
    document.getElementById("rehabV28Titulo").textContent = "Mis rutinas asignadas";

    const c = document.getElementById("rehabV28Contenido");
    c.innerHTML = `
      <div class="rehabV28Aviso">
        Aquí aparecen las rutinas que un Profesional te ha enviado.
      </div>
      <div id="rehabV28ListaUsuario" style="margin-top:12px">Cargando...</div>
    `;

    const { data: asignaciones, error } = await cloud
      .from("rehab_assignments")
      .select(
        "id, routine_id, professional_id, scheduled_date, scheduled_time, professional_notes, status, created_at"
      )
      .eq("user_id", sesionUser.id)
      .neq("status", "completed")
      .neq("status", "cancelled")
      .order("scheduled_date", { ascending: true });

    const host = document.getElementById("rehabV28ListaUsuario");

    if (error) {
      host.textContent = "No se pudieron cargar las rutinas.";
      return;
    }

    if (!asignaciones?.length) {
      host.innerHTML = `<div class="rehabV28Card">Todavía no tienes rutinas asignadas.</div>`;
      return;
    }

    const routineIds = [
      ...new Set(asignaciones.map((a) => a.routine_id).filter(Boolean)),
    ];
    const proIds = [
      ...new Set(asignaciones.map((a) => a.professional_id).filter(Boolean)),
    ];

    const [rutinasResp, prosResp] = await Promise.all([
      cloud
        .from("rehab_routines")
        .select("id, name, category, rest_seconds")
        .in("id", routineIds),
      cloud.from("rehab_profiles").select("user_id, full_name").in("user_id", proIds),
    ]);

    const rutinas = new Map((rutinasResp.data || []).map((r) => [r.id, r]));
    const pros = new Map((prosResp.data || []).map((p) => [p.user_id, p.full_name]));

    host.innerHTML = asignaciones
      .map((a) => {
        const r = rutinas.get(a.routine_id);
        return `
        <div class="rehabV28Card">
          <h3 style="margin:0 0 8px">${esc(r?.name || "Rutina")}</h3>
          <div>👤 ${esc(pros.get(a.professional_id) || "Profesional")}</div>
          <div>📅 ${esc(fechaBonita(a.scheduled_date))}${a.scheduled_time ? " · " + esc(horaBonita(a.scheduled_time)) : ""}</div>
          <div>📌 ${esc(estadoAsignacionBonito(a.status, a.scheduled_date))}</div>
          ${a.professional_notes ? `<div class="rehabV28Dato">📝 ${esc(a.professional_notes)}</div>` : ""}
          <div class="rehabV28Acciones">
            <button class="rehabV28Btn" data-ver-asignacion="${esc(a.id)}" type="button">
              ▶ VER RUTINA
            </button>
            ${
              ["pending", "in_progress"].includes(String(a.status || "pending"))
                ? `
              <button
                class="rehabV28Btn peligro"
                data-v41-cancel-assignment="${esc(a.id)}"
                data-v41-cancel-role="user"
                type="button"
              >
                CANCELAR
              </button>
            `
                : ""
            }
          </div>
        </div>
      `;
      })
      .join("");

    document.querySelectorAll("[data-ver-asignacion]").forEach((btn) => {
      btn.onclick = () => verAsignacionUsuario(btn.dataset.verAsignacion);
    });
  }

  async function verAsignacionUsuario(assignmentId) {
    const { data: a, error: ea } = await cloud
      .from("rehab_assignments")
      .select(
        "id, routine_id, professional_id, scheduled_date, scheduled_time, professional_notes, status"
      )
      .eq("id", assignmentId)
      .eq("user_id", sesionUser.id)
      .single();

    if (ea) {
      alert("No se pudo abrir la asignación.");
      return;
    }

    const [rutinaResp, ejerciciosResp, proResp] = await Promise.all([
      cloud
        .from("rehab_routines")
        .select("id, name, category, rest_seconds")
        .eq("id", a.routine_id)
        .single(),
      cloud
        .from("rehab_routine_exercises")
        .select(
          "id, position, mode, difficulty, finish_type, finish_value, video_url, instructions, pod_distance, pod_setup"
        )
        .eq("routine_id", a.routine_id)
        .order("position", { ascending: true }),
      cloud
        .from("rehab_profiles")
        .select("user_id, full_name")
        .eq("user_id", a.professional_id)
        .single(),
    ]);

    if (rutinaResp.error || ejerciciosResp.error) {
      alert("No se pudo cargar la rutina.");
      return;
    }

    const rutina = rutinaResp.data;
    const ejercicios = ejerciciosResp.data || [];
    const profesional = proResp.data;

    document.getElementById("rehabV28Titulo").textContent = rutina.name;
    const c = document.getElementById("rehabV28Contenido");

    c.innerHTML = `
      <div class="rehabV28Aviso">
        <strong>${esc(rutina.name)}</strong><br>
        Profesional: ${esc(profesional?.full_name || "Profesional")}<br>
        Fecha: ${esc(fechaBonita(a.scheduled_date))}
        ${a.scheduled_time ? " · " + esc(horaBonita(a.scheduled_time)) : ""}
        ${rutina.rest_seconds ? `<br>Descanso entre ejercicios: ${esc(rutina.rest_seconds)} s` : ""}
      </div>

      ${
        a.professional_notes
          ? `
        <div class="rehabV28Dato">

          <strong>Indicaciones generales</strong><br>
          ${esc(a.professional_notes)}
        </div>
      `
          : ""
      }

      <div style="margin-top:14px">
        ${ejercicios
          .map(
            (e, i) => `
          <div class="rehabV28Card">
            <div class="rehabV28EjercicioTitulo">${i + 1}. ${esc(modoNombre(e.mode))}</div>
            <span class="rehabV28Badge">Dificultad: ${esc(e.difficulty || "media")}</span>
            <span class="rehabV28Badge">${esc(e.finish_type || "rondas")}: ${esc(e.finish_value ?? "")}</span>

            ${htmlVideo(e.video_url)}

            ${
              e.pod_distance
                ? `
              <div class="rehabV28Dato">
                <strong>📏 Distancia entre Pods</strong><br>
                ${esc(e.pod_distance)}
              </div>
            `
                : ""
            }

            ${
              e.pod_setup
                ? `
              <div class="rehabV28Dato">
                <strong>🔵 Colocación de los Pods</strong><br>
                ${esc(e.pod_setup).replaceAll("\n", "<br>")}
              </div>
            `
                : ""
            }

            ${
              e.instructions
                ? `
              <div class="rehabV28Dato">
                <strong>📋 Cómo realizar el ejercicio</strong><br>
                ${esc(e.instructions).replaceAll("\n", "<br>")}
              </div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>

      <div class="rehabV28Acciones">
        <button id="rehabV28VolverUsuario" class="rehabV28Btn secundario" type="button">← VOLVER A MIS RUTINAS</button>
      </div>
    `;

    document.getElementById("rehabV28VolverUsuario").onclick = renderUsuario;
  }

  // -----------------------------------------------------
  // ARRANQUE
  // -----------------------------------------------------
  function iniciar() {
    estilos();
    crearModal();
    crearBotonHome();
    console.log("RehabPod V28: asignaciones + guías con video activadas.");
  }

  setTimeout(iniciar, 320);

  window.rehabV28Abrir = abrirPrincipal;
})();
// =====================================================
// REHABPOD V29
// EJECUCION AUTOMATICA DE RUTINAS ASIGNADAS
//
// PEGAR TODO ESTE BLOQUE AL FINAL DE app.js, DESPUES DE V28.
//
// FUNCIONES:
// - Agrega COMENZAR RUTINA dentro del detalle V28.
// - Ejecuta automaticamente ejercicio 1 -> descanso -> ejercicio 2 -> ...
// - Respeta modo, dificultad, rondas/tiempo y descanso de la rutina.

// - Muestra cuenta regresiva antes de cada ejercicio.
// - Guarda resumen local en rehabpodHistorialRutinas.
// - Marca la asignacion como completed en Supabase.
// - Guarda una sesion general en rehab_routine_sessions.
// - Compatible con Pods fisicos y modo virtual.
//
// NOTA:
// - "Modo entrenador" NO puede ejecutarse automaticamente porque requiere
//   que una persona elija manualmente el Pod desde la pantalla.
// =====================================================

(function () {
  const V29_CLAVE_HISTORIAL = "rehabpodHistorialRutinas";

  let v29Cloud = null;
  let v29AuthUser = null;

  let v29RutinaActiva = false;
  let v29Asignacion = null;
  let v29Rutina = null;
  let v29Ejercicios = [];
  let v29Indice = 0;
  let v29ResultadosEjercicios = [];
  let v29InicioRutinaMs = 0;
  let v29AssignmentIdCapturado = null;
  let v29TimeoutDescanso = null;
  let v29IntervaloDescanso = null;
  let v29CancelandoRutina = false;

  const V29_NOMBRES = {
    simple: "Reacción aleatoria",
    colores: "Reacción por colores",
    secuencia: "Secuencia / memoria",
    libre: "Modo libre",
    persecucion: "Persecución",
    doble: "Doble estímulo",
    prohibido: "Color prohibido",
    circuito: "Circuito de Pods",
    contrarreloj: "Contrarreloj",
    entrenador: "Modo entrenador",
    cazaColor: "Caza de color",
    automatico: "Cambio automático",
    stroop: "Palabra vs color",
  };

  function v29Esc(texto) {
    return String(texto ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function v29NombreModo(modo) {
    return V29_NOMBRES[modo] || modo || "Ejercicio";
  }

  function v29Esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // -----------------------------------------------------
  // SUPABASE
  // -----------------------------------------------------
  async function v29CargarSDK() {
    if (window.supabase?.createClient) return;

    await new Promise((resolve, reject) => {
      const existente = document.getElementById("rehabSupabaseSDK");

      if (existente) {
        if (window.supabase?.createClient) {
          resolve();
          return;
        }

        existente.addEventListener("load", resolve, { once: true });
        existente.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "rehabSupabaseSDK";
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function v29CargarConfig() {
    if (
      window.REHAB_SUPABASE_CONFIG?.url &&
      window.REHAB_SUPABASE_CONFIG?.publishableKey
    ) {
      return;
    }

    await new Promise((resolve) => {
      const existente = document.getElementById("rehabSupabaseConfigPublica");

      if (existente) {
        existente.addEventListener("load", resolve, { once: true });
        existente.addEventListener("error", resolve, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "rehabSupabaseConfigPublica";
      script.src = "supabase-config.js";
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
  }

  async function v29IniciarCloud() {
    v29Cloud = await window.rehabGetSupabaseClient();

    const { data } = await v29Cloud.auth.getSession();
    v29AuthUser = data?.session?.user || null;

    if (!v29AuthUser) {
      throw new Error("Primero inicia sesion en CUENTA Y NUBE.");
    }
  }

  // -----------------------------------------------------
  // ESTILOS
  // -----------------------------------------------------
  function v29AgregarEstilos() {
    if (document.getElementById("rehabV29Estilos")) return;

    const st = document.createElement("style");
    st.id = "rehabV29Estilos";

    st.textContent = `
      .rehabV29BtnInicio{
        appearance:none;border:0;border-radius:13px;padding:12px 16px;font-weight:950;
        cursor:pointer;background:#16a34a;color:#fff;display:inline-flex;align-items:center;
        justify-content:center;gap:8px;text-decoration:none
      }

      .rehabV29Overlay{
        position:fixed;inset:0;z-index:100500;background:rgba(2,6,23,.88);
        backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;
        padding:18px;color:#fff
      }

      .rehabV29Overlay[hidden]{display:none!important}

      .rehabV29Card{
        width:min(520px,100%);border-radius:26px;padding:24px 20px;text-align:center;

        background:linear-gradient(160deg,#111c30,#07101f);
        border:1px solid rgba(148,163,184,.20);
        box-shadow:0 28px 90px rgba(0,0,0,.50)
      }

      .rehabV29Progreso{
        height:8px;background:#1e293b;border-radius:999px;overflow:hidden;margin:17px 0
      }

      .rehabV29Progreso span{
        display:block;height:100%;background:#22c55e;border-radius:999px
      }

      .rehabV29Cuenta{
        width:112px;height:112px;border-radius:50%;display:flex;align-items:center;
        justify-content:center;margin:18px auto;font-size:46px;font-weight:950;
        border:5px solid rgba(34,197,94,.50);background:rgba(34,197,94,.10)
      }

      .rehabV29Acciones{
        display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin-top:16px
      }

      .rehabV29Btn{
        appearance:none;border:0;border-radius:12px;padding:10px 14px;font-weight:900;
        cursor:pointer;background:var(--acento);color:var(--acento-tinta)
      }

      .rehabV29Btn.sec{
        background:#1e293b;color:#e2e8f0;border:1px solid #334155
      }

      .rehabV29Resumen{
        text-align:left;margin:14px 0;padding:12px;border-radius:14px;
        background:rgba(148,163,184,.07);border:1px solid rgba(148,163,184,.15)
      }

      .rehabV29Fila{
        display:flex;justify-content:space-between;gap:12px;padding:7px 0;
        border-bottom:1px solid rgba(148,163,184,.12)
      }

      .rehabV29Fila:last-child{border-bottom:0}
    `;

    document.head.appendChild(st);
  }

  function v29CrearOverlay() {
    if (document.getElementById("rehabV29Overlay")) return;

    const ov = document.createElement("div");
    ov.id = "rehabV29Overlay";
    ov.className = "rehabV29Overlay";
    ov.hidden = true;
    ov.innerHTML = `<div id="rehabV29Card" class="rehabV29Card"></div>`;

    document.body.appendChild(ov);
  }

  function v29AbrirOverlay(html) {
    const ov = document.getElementById("rehabV29Overlay");
    const card = document.getElementById("rehabV29Card");

    card.innerHTML = html;
    ov.hidden = false;
  }

  function v29CerrarOverlay() {
    const ov = document.getElementById("rehabV29Overlay");
    if (ov) ov.hidden = true;
  }

  // Cierra las ventanas de Cloud que quedan debajo del overlay V29.
  // Asi, al empezar el ejercicio, la pantalla de entrenamiento queda visible.
  function v29CerrarVentanasCloud() {
    const ids = ["rehabV28Overlay", "rehabV27Overlay"];

    ids.forEach((id) => {
      const ov = document.getElementById(id);
      if (ov) ov.hidden = true;
    });
  }

  async function v29MarcarAsignacionEnProgreso() {
    if (!v29Asignacion?.id) return;

    try {
      await v29IniciarCloud();

      const { error } = await v29Cloud
        .from("rehab_assignments")
        .update({ status: "in_progress" })
        .eq("id", v29Asignacion.id)
        .eq("user_id", v29AuthUser.id);

      if (error) throw error;
      v29Asignacion.status = "in_progress";
    } catch (error) {
      // El entrenamiento puede continuar aunque falle este cambio temporal.
      // Al finalizar, V29 volverá a intentar guardar "completed".
      console.warn("V32 estado en progreso:", error);
    }
  }

  // -----------------------------------------------------
  // CAPTURAR LA ASIGNACION V28 Y AGREGAR COMENZAR RUTINA
  // -----------------------------------------------------
  function v29PrepararIntegracionV28() {
    document.addEventListener(
      "click",
      function (evento) {
        const boton = evento.target.closest?.("[data-ver-asignacion]");
        if (!boton) return;

        v29AssignmentIdCapturado = boton.dataset.verAsignacion || null;
      },
      true
    );

    const observer = new MutationObserver(function () {
      const volver = document.getElementById("rehabV28VolverUsuario");
      if (!volver || !v29AssignmentIdCapturado) return;

      if (document.getElementById("rehabV29ComenzarRutina")) return;

      const btn = document.createElement("button");
      btn.id = "rehabV29ComenzarRutina";
      btn.type = "button";
      btn.className = "rehabV29BtnInicio";
      btn.innerHTML = "▶ COMENZAR RUTINA";

      btn.onclick = function () {
        v29PrepararRutina(v29AssignmentIdCapturado);
      };

      const acciones = volver.parentElement;
      acciones.insertBefore(btn, volver);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // -----------------------------------------------------
  // CARGAR RUTINA
  // -----------------------------------------------------
  async function v29PrepararRutina(assignmentId) {
    try {
      await v29IniciarCloud();

      v29AbrirOverlay(`

        <div style="font-size:42px">☁️</div>
        <h2>Preparando rutina...</h2>
        <p style="color:#cbd5e1">Cargando ejercicios y comprobando Pods.</p>
      `);

      const { data: asignacion, error: ea } = await v29Cloud
        .from("rehab_assignments")
        .select(
          "id, routine_id, user_id, professional_id, scheduled_date, scheduled_time, professional_notes, status"
        )
        .eq("id", assignmentId)
        .eq("user_id", v29AuthUser.id)
        .single();

      if (ea) throw ea;

      const [{ data: rutina, error: er }, { data: ejercicios, error: ee }] =
        await Promise.all([
          v29Cloud
            .from("rehab_routines")
            .select("id, name, category, rest_seconds")
            .eq("id", asignacion.routine_id)
            .single(),

          v29Cloud
            .from("rehab_routine_exercises")
            .select(
              "id, position, mode, difficulty, finish_type, finish_value, video_url, instructions, pod_distance, pod_setup"
            )
            .eq("routine_id", asignacion.routine_id)
            .order("position", { ascending: true }),
        ]);

      if (er) throw er;
      if (ee) throw ee;

      if (!ejercicios?.length) {
        throw new Error("Esta rutina no contiene ejercicios.");
      }

      const contieneEntrenador = ejercicios.some((e) => e.mode === "entrenador");

      if (contieneEntrenador) {
        v29AbrirOverlay(`
          <div style="font-size:46px">🧑‍🏫</div>
          <h2>Modo entrenador requiere control manual</h2>
          <p style="color:#cbd5e1;line-height:1.5">
            Esta rutina contiene <strong>Modo entrenador</strong>.
            Ese modo necesita que una persona seleccione manualmente los Pods
            y no puede formar parte de una ejecución automática.
          </p>
          <div class="rehabV29Acciones">
            <button class="rehabV29Btn sec" id="rehabV29CerrarAviso">VOLVER</button>
          </div>
        `);

        document.getElementById("rehabV29CerrarAviso").onclick = v29CerrarOverlay;
        return;
      }

      const maxMinimo = Math.max(
        ...ejercicios.map((e) => {
          try {
            return typeof rehabMinimoPodsModo === "function"
              ? rehabMinimoPodsModo(e.mode)
              : 1;
          } catch (_) {
            return 1;
          }
        })
      );

      let disponibles = 0;

      try {
        disponibles =
          typeof rehabIndicesPodsConectados === "function"
            ? rehabIndicesPodsConectados().length
            : cantidadConectados();
      } catch (_) {
        disponibles = cantidadConectados();
      }

      if (disponibles < maxMinimo) {
        v29AbrirOverlay(`
          <div style="font-size:46px">🔵</div>
          <h2>Faltan Pods</h2>
          <p style="color:#cbd5e1;line-height:1.5">
            Esta rutina necesita al menos <strong>${maxMinimo} Pods</strong>,
            pero ahora hay <strong>${disponibles}</strong> disponibles.
          </p>
          <p style="color:#94a3b8">
            Conecta más Pods o activa el modo virtual para realizar la prueba.
          </p>
          <div class="rehabV29Acciones">
            <button class="rehabV29Btn sec" id="rehabV29CerrarPods">VOLVER</button>
          </div>
        `);

        document.getElementById("rehabV29CerrarPods").onclick = v29CerrarOverlay;
        return;
      }

      v29Asignacion = asignacion;
      v29Rutina = rutina;
      v29Ejercicios = ejercicios;
      v29Indice = 0;
      v29ResultadosEjercicios = [];
      v29InicioRutinaMs = Date.now();
      v29RutinaActiva = true;
      v29CancelandoRutina = false;

      v29MostrarInicioRutina();
    } catch (error) {
      console.error("V29 preparar rutina:", error);

      v29AbrirOverlay(`
        <div style="font-size:46px">⚠️</div>
        <h2>No se pudo iniciar</h2>
        <p style="color:#cbd5e1">${v29Esc(error.message)}</p>
        <div class="rehabV29Acciones">
          <button class="rehabV29Btn sec" id="rehabV29CerrarError">VOLVER</button>
        </div>
      `);

      document.getElementById("rehabV29CerrarError").onclick = v29CerrarOverlay;
    }
  }

  function v29MostrarInicioRutina() {
    const descanso = Math.max(0, Number(v29Rutina?.rest_seconds || 0));

    v29AbrirOverlay(`
      <div style="font-size:52px">🏁</div>
      <h2 style="margin-bottom:6px">${v29Esc(v29Rutina.name)}</h2>
      <p style="color:#cbd5e1;margin-top:0">
        ${v29Ejercicios.length} ejercicio${v29Ejercicios.length === 1 ? "" : "s"}
        · ${descanso} s de descanso entre ejercicios
      </p>

      <div class="rehabV29Resumen">
        ${v29Ejercicios
          .map(
            (e, i) => `

          <div class="rehabV29Fila">
            <span>${i + 1}. ${v29Esc(v29NombreModo(e.mode))}</span>
            <strong>${v29Esc(e.difficulty || "media")}</strong>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="rehabV29Acciones">

        <button id="rehabV29ConfirmarInicio" class="rehabV29Btn">COMENZAR</button>
        <button id="rehabV29CancelarAntes" class="rehabV29Btn sec">CANCELAR</button>
      </div>
    `);

    document.getElementById("rehabV29ConfirmarInicio").onclick = async function () {
      const boton = document.getElementById("rehabV29ConfirmarInicio");
      if (boton) {
        boton.disabled = true;
        boton.textContent = "INICIANDO...";
      }

      await v29MarcarAsignacionEnProgreso();
      v29CerrarVentanasCloud();
      v29IniciarEjercicioActual();
    };

    document.getElementById("rehabV29CancelarAntes").onclick = function () {
      v29AbortarRutina(false);
    };
  }

  // -----------------------------------------------------
  // CONFIGURAR EJERCICIO EN EL MOTOR EXISTENTE
  // -----------------------------------------------------
  function v29AsegurarOpcion(select, valor, etiqueta) {
    if (!select) return;

    valor = String(valor);

    if (![...select.options].some((o) => o.value === valor)) {
      const op = document.createElement("option");
      op.value = valor;
      op.textContent = etiqueta || valor;
      select.appendChild(op);
    }

    select.value = valor;
  }

  function v29ConfigurarEjercicio(ejercicio) {
    modoActual = ejercicio.mode || "simple";

    ajustesApp.dificultad = ejercicio.difficulty || "media";
    dificultadActual = ajustesApp.dificultad;

    try {
      guardarAjustes();
    } catch (_) {}

    try {
      configurarModo();
    } catch (error) {
      console.warn("V29 configurarModo:", error);
    }

    const valor = Math.max(1, Number(ejercicio.finish_value || 5));
    const finalizarPor = ejercicio.finish_type === "tiempo" ? "tiempo" : "rondas";

    // Modos normales
    const tipoGeneral = document.getElementById("tipoFinalGeneralReactiPod");
    const rondasGeneral = document.getElementById("rondasGeneralReactiPod");
    const tiempoGeneral = document.getElementById("duracionGeneralReactiPod");

    if (tipoGeneral) {
      tipoGeneral.value = finalizarPor;
    }

    if (finalizarPor === "rondas") {
      v29AsegurarOpcion(rondasGeneral, valor, `${valor} rondas`);
      if (numeroRondas) numeroRondas.value = String(valor);
    } else {
      v29AsegurarOpcion(tiempoGeneral, valor, `${valor} segundos`);
    }

    // Contrarreloj siempre funciona por tiempo
    if (modoActual === "contrarreloj") {
      const duracionContrarreloj = document.getElementById(
        "duracionContrarrelojReactiPod"
      );
      v29AsegurarOpcion(duracionContrarreloj, valor, `${valor} segundos`);
    }

    // Cantidad de Pods: usamos todos los disponibles sin bajar del minimo del modo
    let minimo = 1;

    try {
      minimo = rehabMinimoPodsModo(modoActual);
    } catch (_) {}

    let disponibles = 4;

    try {
      disponibles = rehabIndicesPodsConectados().length;
    } catch (_) {
      try {
        disponibles = cantidadConectados();
      } catch (_) {}
    }

    cantidadPodsSeleccionada = Math.max(minimo, Math.min(4, disponibles));

    const selectorCantidad = document.getElementById("cantidadPodsEntrenamientoRehabPod");

    if (selectorCantidad) {
      selectorCantidad.value = String(cantidadPodsSeleccionada);
    }

    try {
      pintarControlesExperiencia();
    } catch (_) {}
  }

  async function v29IniciarEjercicioActual() {
    if (!v29RutinaActiva) return;

    const ejercicio = v29Ejercicios[v29Indice];

    if (!ejercicio) {
      await v29FinalizarRutinaCompleta();
      return;
    }

    clearTimeout(v29TimeoutDescanso);
    clearInterval(v29IntervaloDescanso);

    v29ConfigurarEjercicio(ejercicio);

    const progreso = (v29Indice / v29Ejercicios.length) * 100;

    v29AbrirOverlay(`
      <div style="font-size:.76rem;letter-spacing:1px;color:#94a3b8;font-weight:900">
        EJERCICIO ${v29Indice + 1} DE ${v29Ejercicios.length}
      </div>

      <div class="rehabV29Progreso">
        <span style="width:${progreso}%"></span>
      </div>

      <div style="font-size:48px;margin-top:10px">⚡</div>
      <h2 style="margin-bottom:6px">${v29Esc(v29NombreModo(ejercicio.mode))}</h2>

      <p style="color:#cbd5e1;margin-top:0">
        Dificultad: <strong>${v29Esc(ejercicio.difficulty || "media")}</strong><br>
        ${
          ejercicio.mode === "contrarreloj"
            ? `Tiempo: <strong>${Number(ejercicio.finish_value || 30)} s</strong>`
            : ejercicio.finish_type === "tiempo"
              ? `Tiempo: <strong>${Number(ejercicio.finish_value || 60)} s</strong>`
              : `Rondas: <strong>${Number(ejercicio.finish_value || 5)}</strong>`
        }
      </p>

      <div class="rehabV29Cuenta">3</div>

      <p style="color:#94a3b8">
        RehabPod continuará automáticamente.
      </p>

      <div class="rehabV29Acciones">
        <button id="rehabV29CancelarRutina" class="rehabV29Btn sec">CANCELAR RUTINA</button>
      </div>
    `);

    document.getElementById("rehabV29CancelarRutina").onclick = function () {
      v29AbortarRutina(true);
    };

    // Esta cuenta solo prepara visualmente; el motor ya tiene su propio 3-2-1.
    let n = 3;

    const cuenta = document.querySelector("#rehabV29Card .rehabV29Cuenta");

    const intervalo = setInterval(() => {
      n--;

      if (n > 0) {
        if (cuenta) cuenta.textContent = n;
        return;
      }

      clearInterval(intervalo);

      v29CerrarOverlay();

      try {
        iniciarEntrenamiento();
      } catch (error) {
        console.error("V29 iniciar entrenamiento:", error);
        v29AbortarPorError(error);
      }
    }, 650);
  }

  // -----------------------------------------------------
  // EVITAR INTRO MANUAL ENTRE EJERCICIOS
  // iniciarEntrenamiento() normalmente abre la introduccion.
  // En rutina automatica saltamos esa pantalla y vamos al 3-2-1 del motor.
  // -----------------------------------------------------
  var v29MostrarIntroduccionBase = mostrarIntroduccionEntrenamiento;

  mostrarIntroduccionEntrenamiento = function () {
    if (v29RutinaActiva) {
      iniciarCuenta();
      return;
    }

    return v29MostrarIntroduccionBase();
  };

  // -----------------------------------------------------
  // INTERCEPTAR FIN DE CADA EJERCICIO
  // -----------------------------------------------------
  var v29FinalizarEntrenamientoBase = finalizarEntrenamiento;

  finalizarEntrenamiento = async function () {
    if (!v29RutinaActiva) {
      return await v29FinalizarEntrenamientoBase();
    }

    const ejercicio = v29Ejercicios[v29Indice];

    const tiempos = resultados
      .filter((r) => typeof r.tiempo === "number" && Number.isFinite(r.tiempo))
      .map((r) => r.tiempo);

    const promedio = tiempos.length
      ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length
      : null;

    const mejor = tiempos.length ? Math.min(...tiempos) : null;
    const peor = tiempos.length ? Math.max(...tiempos) : null;

    const resumenEjercicio = {
      ejercicioId: ejercicio?.id || null,
      modo: ejercicio?.mode || modoActual,
      nombre: v29NombreModo(ejercicio?.mode || modoActual),
      dificultad: ejercicio?.difficulty || dificultadActual,
      aciertos: Number(aciertos || 0),
      errores: Number(errores || 0),
      rondas: Array.isArray(resultados) ? resultados.length : 0,
      promedio,
      mejor,
      peor,
    };

    // Quitamos la celebracion individual: la celebracion importante sera al final
    // de toda la rutina. El motor sigue realizando su limpieza normal.
    const celebracionOriginal = mostrarCelebracionFinal;

    try {
      mostrarCelebracionFinal = async function () {};
      await v29FinalizarEntrenamientoBase();
    } finally {
      mostrarCelebracionFinal = celebracionOriginal;
    }

    v29ResultadosEjercicios.push(resumenEjercicio);
    v29Indice++;

    if (!v29RutinaActiva) return;

    if (v29Indice >= v29Ejercicios.length) {
      await v29FinalizarRutinaCompleta();
      return;
    }

    v29MostrarDescanso();
  };

  // -----------------------------------------------------
  // DESCANSO
  // -----------------------------------------------------
  function v29MostrarDescanso() {
    clearTimeout(v29TimeoutDescanso);
    clearInterval(v29IntervaloDescanso);

    let restante = Math.max(0, Number(v29Rutina?.rest_seconds || 0));
    const siguiente = v29Ejercicios[v29Indice];

    if (restante <= 0) {
      v29IniciarEjercicioActual();
      return;
    }

    const porcentaje = (v29Indice / v29Ejercicios.length) * 100;

    v29AbrirOverlay(`
      <div style="font-size:44px">⏸️</div>
      <h2>Descanso</h2>

      <div class="rehabV29Progreso">
        <span style="width:${porcentaje}%"></span>
      </div>

      <div style="color:#94a3b8;font-size:.82rem;font-weight:900">
        SIGUIENTE EJERCICIO
      </div>

      <h3>${v29Esc(v29NombreModo(siguiente.mode))}</h3>

      <div id="rehabV29DescansoCuenta" class="rehabV29Cuenta">${restante}</div>

      <p style="color:#cbd5e1">La siguiente actividad comenzará automáticamente.</p>

      <div class="rehabV29Acciones">
        <button id="rehabV29SaltarDescanso" class="rehabV29Btn">SALTAR DESCANSO</button>
        <button id="rehabV29CancelarDescanso" class="rehabV29Btn sec">CANCELAR RUTINA</button>
      </div>
    `);

    const cuenta = document.getElementById("rehabV29DescansoCuenta");

    v29IntervaloDescanso = setInterval(() => {
      restante--;

      if (cuenta) {
        cuenta.textContent = Math.max(0, restante);
      }

      if (restante <= 0) {
        clearInterval(v29IntervaloDescanso);
      }
    }, 1000);

    v29TimeoutDescanso = setTimeout(() => {
      clearInterval(v29IntervaloDescanso);
      v29IniciarEjercicioActual();
    }, restante * 1000);

    document.getElementById("rehabV29SaltarDescanso").onclick = function () {
      clearTimeout(v29TimeoutDescanso);
      clearInterval(v29IntervaloDescanso);
      v29IniciarEjercicioActual();
    };

    document.getElementById("rehabV29CancelarDescanso").onclick = function () {
      v29AbortarRutina(false);
    };
  }

  // -----------------------------------------------------
  // CANCELACION
  // -----------------------------------------------------
  var v29CancelarEntrenamientoBase = cancelarEntrenamiento;

  cancelarEntrenamiento = async function () {
    if (!v29RutinaActiva) {
      return await v29CancelarEntrenamientoBase();
    }

    const estabaActiva = entrenamientoActivo;

    await v29CancelarEntrenamientoBase();

    // Si sigue activo, el usuario respondio "No" al confirm.
    if (estabaActiva && entrenamientoActivo) {
      return;
    }

    v29AbortarRutina(false);
  };

  function v29AbortarRutina(detenerEjercicioActual) {
    if (v29CancelandoRutina) return;

    v29CancelandoRutina = true;
    v29RutinaActiva = false;

    clearTimeout(v29TimeoutDescanso);
    clearInterval(v29IntervaloDescanso);

    if (detenerEjercicioActual && entrenamientoActivo) {
      entrenamientoActivo = false;
      esperandoRespuesta = false;

      try {
        clearTimeout(temporizador);
      } catch (_) {}
      try {
        detenerTemporizadorGeneral();
      } catch (_) {}
      try {
        apagarTodosLosPods();
      } catch (_) {}
    }

    v29AbrirOverlay(`
      <div style="font-size:48px">⏹️</div>
      <h2>Rutina detenida</h2>
      <p style="color:#cbd5e1">
        La rutina no se marcó como completada. Puedes volver a iniciarla más tarde.
      </p>
      <div class="rehabV29Acciones">
        <button id="rehabV29CerrarCancelada" class="rehabV29Btn sec">CERRAR</button>
      </div>
    `);

    document.getElementById("rehabV29CerrarCancelada").onclick = function () {
      v29CerrarOverlay();

      try {
        mostrarPantalla(pantallaInicio);
      } catch (_) {}

      v29ResetEstado();
    };
  }

  function v29AbortarPorError(error) {
    v29RutinaActiva = false;

    v29AbrirOverlay(`
      <div style="font-size:48px">⚠️</div>
      <h2>No se pudo continuar</h2>
      <p style="color:#cbd5e1">${v29Esc(error?.message || "Error inesperado")}</p>
      <div class="rehabV29Acciones">
        <button id="rehabV29CerrarErrorRutina" class="rehabV29Btn sec">CERRAR</button>
      </div>
    `);

    document.getElementById("rehabV29CerrarErrorRutina").onclick = function () {
      v29CerrarOverlay();
      v29ResetEstado();
    };
  }

  // -----------------------------------------------------
  // FINAL DE TODA LA RUTINA
  // -----------------------------------------------------
  async function v29FinalizarRutinaCompleta() {
    if (!v29RutinaActiva) return;

    v29RutinaActiva = false;

    const duracionSeg = Math.max(0, Math.round((Date.now() - v29InicioRutinaMs) / 1000));

    const totalAciertos = v29ResultadosEjercicios.reduce(
      (s, e) => s + Number(e.aciertos || 0),
      0
    );

    const totalErrores = v29ResultadosEjercicios.reduce(
      (s, e) => s + Number(e.errores || 0),
      0
    );

    const intentos = totalAciertos + totalErrores;

    const precision = intentos > 0 ? (totalAciertos / intentos) * 100 : 100;

    const completados = v29ResultadosEjercicios.length;
    const total = v29Ejercicios.length;
    const porcentaje = total > 0 ? (completados / total) * 100 : 0;

    // Historial local V24
    try {
      const raw = localStorage.getItem(V29_CLAVE_HISTORIAL);
      const historialLeido = raw ? JSON.parse(raw) : [];
      const historial = Array.isArray(historialLeido) ? historialLeido : [];

      let perfil = { id: "perfil_local", nombre: "Perfil local" };

      try {
        if (typeof obtenerPerfilActivo === "function") {
          perfil = obtenerPerfilActivo();
        }
      } catch (_) {}

      historial.push({
        id: "sesion_rutina_auto_" + Date.now(),
        timestamp: Date.now(),
        fecha: new Date().toLocaleString(),
        perfilId: perfil.id,
        perfilNombre: perfil.nombre || "Perfil",
        rutinaId: v29Rutina.id,
        rutinaNombre: v29Rutina.name,
        categoria: v29Rutina.category || "",
        totalEjercicios: total,
        ejerciciosCompletados: completados,
        ejerciciosCompletadosIds: v29ResultadosEjercicios
          .map((e) => e.ejercicioId)
          .filter(Boolean),
        porcentajeCompletado: porcentaje,
        duracionSeg,
        precision,
        notas: "Rutina asignada completada automáticamente.",
        origen: "automatico",
        assignmentId: v29Asignacion.id,
        resultadosEjercicios: v29ResultadosEjercicios,
      });

      localStorage.setItem(V29_CLAVE_HISTORIAL, JSON.stringify(historial));
    } catch (error) {
      console.warn("V29 historial local:", error);
    }

    // Nube
    let nubeOk = true;

    try {
      await v29IniciarCloud();

      const { error: sessionError } = await v29Cloud
        .from("rehab_routine_sessions")
        .insert({
          assignment_id: v29Asignacion.id,
          user_id: v29AuthUser.id,
          routine_id: v29Rutina.id,
          routine_name: v29Rutina.name,
          completed_percent: porcentaje,
          duration_seconds: duracionSeg,
          precision: precision,
          hits: totalAciertos,
          errors: totalErrores,
          exercise_results: v29ResultadosEjercicios,
          notes: "Rutina completada desde ejecución automática RehabPod.",
        });

      if (sessionError) throw sessionError;

      const { error: assignmentError } = await v29Cloud
        .from("rehab_assignments")
        .update({ status: "completed" })
        .eq("id", v29Asignacion.id)
        .eq("user_id", v29AuthUser.id);

      if (assignmentError) throw assignmentError;
    } catch (error) {
      nubeOk = false;
      console.error("V29 guardado nube:", error);

      // V42: si no hay Internet o Supabase no responde, no perdemos el resultado.
      // Se guarda en una cola local y se reintenta automáticamente al volver la conexión.
      try {
        if (typeof window.rehabV42EncolarSesion === "function") {
          window.rehabV42EncolarSesion({
            assignment_id: v29Asignacion.id,
            user_id: v29AuthUser.id,
            routine_id: v29Rutina.id,
            routine_name: v29Rutina.name,
            completed_percent: porcentaje,
            duration_seconds: duracionSeg,
            precision: precision,
            hits: totalAciertos,
            errors: totalErrores,
            exercise_results: v29ResultadosEjercicios,
            notes: "Rutina completada desde ejecución automática RehabPod.",
          });
        }
      } catch (queueError) {
        console.warn("V42 cola offline:", queueError);
      }
    }

    const min = Math.floor(duracionSeg / 60);
    const seg = duracionSeg % 60;

    v29AbrirOverlay(`
      <div style="font-size:58px">🏆</div>
      <h2>¡Rutina completada!</h2>
      <p style="color:#cbd5e1">${v29Esc(v29Rutina.name)}</p>

      <div class="rehabV29Progreso">
        <span style="width:100%"></span>
      </div>

      <div class="rehabV29Resumen">
        <div class="rehabV29Fila">
          <span>Ejercicios</span>
          <strong>${completados}/${total}</strong>
        </div>
        <div class="rehabV29Fila">
          <span>Precisión</span>
          <strong>${precision.toFixed(1)}%</strong>
        </div>
        <div class="rehabV29Fila">
          <span>Aciertos</span>
          <strong>${totalAciertos}</strong>
        </div>
        <div class="rehabV29Fila">
          <span>Errores</span>
          <strong>${totalErrores}</strong>
        </div>
        <div class="rehabV29Fila">
          <span>Tiempo total</span>
          <strong>${min}:${String(seg).padStart(2, "0")}</strong>
        </div>
      </div>

      <p style="color:${nubeOk ? "#86efac" : "#fbbf24"}">
        ${
          nubeOk
            ? "☁️ Resultado guardado en RehabPod Cloud."
            : "⚠️ La rutina terminó, pero no se pudo guardar el resultado en la nube."
        }
      </p>

      <div class="rehabV29Acciones">
        <button id="rehabV29FinInicio" class="rehabV29Btn">VOLVER AL INICIO</button>
      </div>
    `);

    document.getElementById("rehabV29FinInicio").onclick = function () {
      v29CerrarOverlay();

      try {
        mostrarPantalla(pantallaInicio);
        actualizarResumenInicio();
      } catch (_) {}

      v29ResetEstado();
    };
  }

  function v29ResetEstado() {
    v29RutinaActiva = false;
    v29Asignacion = null;
    v29Rutina = null;
    v29Ejercicios = [];

    v29Indice = 0;
    v29ResultadosEjercicios = [];
    v29InicioRutinaMs = 0;
    v29CancelandoRutina = false;

    clearTimeout(v29TimeoutDescanso);
    clearInterval(v29IntervaloDescanso);

    v29TimeoutDescanso = null;
    v29IntervaloDescanso = null;
  }

  // -----------------------------------------------------
  // INICIO V29
  // -----------------------------------------------------
  function v29Iniciar() {
    v29AgregarEstilos();
    v29CrearOverlay();
    v29PrepararIntegracionV28();

    console.log("RehabPod V29: ejecución automática de rutinas activada.");
  }

  setTimeout(v29Iniciar, 420);

  window.rehabV29Estado = function () {
    return {
      activa: v29RutinaActiva,
      rutina: v29Rutina?.name || null,
      indice: v29Indice,
      total: v29Ejercicios.length,
    };
  };
})();

// =====================================================
// REHABPOD V31
// HISTORIAL CLOUD + PANEL DE PROGRESO
//
// FUNCIONES:
// - Usuario: ve sus sesiones cloud y detalle por ejercicio.
// - Profesional: selecciona un usuario vinculado y revisa su progreso.
// - Resumen: sesiones, precisión, tiempo promedio, aciertos y errores.
// - Evolución de las últimas sesiones.
// - Usa el cliente Supabase único de V30.
// =====================================================

(function () {
  let v31Cloud = null;
  let v31AuthUser = null;
  let v31Perfil = null;
  let v31UsuarioSeleccionado = null;

  function v31Esc(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function v31Numero(valor, defecto = 0) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : defecto;
  }

  function v31Fecha(valor) {
    if (!valor) return "Sin fecha";
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return String(valor);
    return d.toLocaleString();
  }

  function v31Duracion(segundos) {
    const s = Math.max(0, Math.round(v31Numero(segundos)));
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min}:${String(seg).padStart(2, "0")}`;
  }

  function v31Precision(valor) {
    return `${v31Numero(valor).toFixed(1)}%`;
  }

  async function v31IniciarCloud() {
    if (typeof window.rehabGetSupabaseClient !== "function") {
      throw new Error("RehabPod V30 no está disponible.");
    }

    v31Cloud = await window.rehabGetSupabaseClient();

    const { data } = await v31Cloud.auth.getSession();
    v31AuthUser = data?.session?.user || null;

    if (!v31AuthUser) {
      v31Perfil = null;
      return false;
    }

    const { data: perfil, error } = await v31Cloud
      .from("rehab_profiles")
      .select("user_id, full_name, role, specialty, user_code")
      .eq("user_id", v31AuthUser.id)
      .single();

    if (error) throw error;

    v31Perfil = perfil;
    return true;
  }

  function v31AgregarEstilos() {
    if (document.getElementById("rehabV31Estilos")) return;

    const st = document.createElement("style");
    st.id = "rehabV31Estilos";
    st.textContent = `
      .rehabV31HomeBtn{
        display:flex;align-items:center;justify-content:center;gap:8px;width:100%;
        min-height:48px;margin-top:10px;border-radius:14px;cursor:pointer;
        border:1px solid rgba(34,197,94,.30);background:rgba(34,197,94,.08);
        color:inherit;font-weight:900
      }
      .rehabV31Overlay{
        position:fixed;inset:0;z-index:100650;background:rgba(2,6,23,.82);
        backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:16px
      }
      .rehabV31Overlay[hidden]{display:none!important}
      .rehabV31Modal{
        width:min(980px,100%);max-height:94vh;overflow:auto;border-radius:24px;padding:20px;
        background:var(--tarjeta);color:inherit;
        border:1px solid rgba(148,163,184,.22);box-shadow:0 25px 80px rgba(0,0,0,.44)
      }
      .tema-claro .rehabV31Modal{background:#fff}
      .rehabV31Head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:15px}
      .rehabV31Cerrar{width:42px;height:42px;border-radius:12px;border:1px solid rgba(148,163,184,.25);
        background:rgba(148,163,184,.08);color:inherit;font-size:20px;cursor:pointer}
      .rehabV31Grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}
      .rehabV31Kpi{
        padding:14px;border-radius:16px;background:rgba(148,163,184,.06);
        border:1px solid rgba(148,163,184,.16)
      }
      .rehabV31Kpi small{display:block;opacity:.68;font-weight:850;margin-bottom:7px}
      .rehabV31Kpi strong{font-size:1.35rem}
      .rehabV31Card{
        border:1px solid rgba(148,163,184,.18);border-radius:16px;padding:14px;
        margin:10px 0;background:rgba(148,163,184,.045)
      }
      .rehabV31Fila{display:flex;justify-content:space-between;gap:12px;align-items:center}
      .rehabV31Mutado{opacity:.68;font-size:.86rem}
      .rehabV31Btn{
        appearance:none;border:0;border-radius:11px;padding:9px 12px;font-weight:900;
        cursor:pointer;background:#16a34a;color:white

      }
      .rehabV31Btn.sec{background:rgba(148,163,184,.14);color:inherit;border:1px solid rgba(148,163,184,.24)}
      .rehabV31Select{
        width:100%;padding:10px;border-radius:11px;border:1px solid rgba(148,163,184,.24);
        background:rgba(148,163,184,.07);color:inherit;font:inherit
      }
      .rehabV31Barra{height:9px;border-radius:999px;background:rgba(148,163,184,.14);overflow:hidden;margin-top:8px}
      .rehabV31Barra span{display:block;height:100%;border-radius:999px;background:#22c55e}
      .rehabV31Detalle{margin-top:12px;padding-top:12px;border-top:1px solid rgba(148,163,184,.14)}
      .rehabV31Ejercicio{
        padding:9px 10px;border-radius:11px;background:rgba(148,163,184,.05);margin:7px 0
      }
      .rehabV31Aviso{
        padding:13px;border-radius:14px;background:rgba(14,165,233,.08);
        border:1px solid rgba(14,165,233,.18);line-height:1.5
      }
      .rehabV31Evolucion{display:grid;gap:8px;margin-top:10px}
      .rehabV31EvoFila{display:grid;grid-template-columns:130px 1fr 65px;gap:8px;align-items:center;font-size:.85rem}
      .rehabV39Filtros{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
      .rehabV39Campo{display:grid;gap:6px}
      .rehabV39Campo label{font-size:.75rem;font-weight:900;opacity:.68}
      .rehabV39Tendencia{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:.82rem;opacity:.78}
      .rehabV39Punto{width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block}
      .rehabV39Vacio{text-align:center;padding:24px 12px;opacity:.72}
      @media(max-width:760px){
        .rehabV31Grid{grid-template-columns:1fr 1fr}
        .rehabV31EvoFila{grid-template-columns:90px 1fr 55px}
        .rehabV39Filtros{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(st);
  }

  function v31CrearModal() {
    if (document.getElementById("rehabV31Overlay")) return;

    const ov = document.createElement("div");
    ov.id = "rehabV31Overlay";
    ov.className = "rehabV31Overlay";
    ov.hidden = true;
    ov.innerHTML = `
      <div class="rehabV31Modal">
        <div class="rehabV31Head">
          <div>
            <div style="font-size:.72rem;opacity:.65;font-weight:900">REHABPOD CLOUD</div>
            <h2 id="rehabV31Titulo" style="margin:0">Progreso cloud</h2>
          </div>
          <button id="rehabV31Cerrar" class="rehabV31Cerrar" type="button">×</button>
        </div>
        <div id="rehabV31Contenido"></div>
      </div>
    `;

    document.body.appendChild(ov);

    document.getElementById("rehabV31Cerrar").onclick = v31Cerrar;
    ov.addEventListener("click", (e) => {
      if (e.target === ov) v31Cerrar();
    });
  }

  function v31Abrir() {
    document.getElementById("rehabV31Overlay").hidden = false;
  }

  function v31Cerrar() {
    document.getElementById("rehabV31Overlay").hidden = true;
  }

  function v31CrearBotonHome() {
    if (document.getElementById("rehabV31HomeBtn")) return;

    const ref =
      document.getElementById("rehabV28HomeBtn") ||
      document.getElementById("rehabV27BtnCloud") ||
      document.getElementById("rehabV24BtnHistorial");

    if (!ref) return;

    const b = document.createElement("button");
    b.id = "rehabV31HomeBtn";
    b.type = "button";
    b.className = "rehabV31HomeBtn";
    b.innerHTML = "☁️ PROGRESO CLOUD";
    b.onclick = v31AbrirPrincipal;

    ref.insertAdjacentElement("afterend", b);
  }

  async function v31SesionesDeUsuario(userId) {
    const { data, error } = await v31Cloud
      .from("rehab_routine_sessions")
      .select(
        "id, assignment_id, user_id, routine_id, routine_name, completed_percent, duration_seconds, precision, hits, errors, exercise_results, notes, performed_at"
      )
      .eq("user_id", userId)
      .order("performed_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  }

  function v31Resumen(sesiones) {
    const total = sesiones.length;

    const precision =
      total > 0 ? sesiones.reduce((s, x) => s + v31Numero(x.precision), 0) / total : 0;

    const duracion =
      total > 0
        ? sesiones.reduce((s, x) => s + v31Numero(x.duration_seconds), 0) / total
        : 0;

    const aciertos = sesiones.reduce((s, x) => s + v31Numero(x.hits), 0);
    const errores = sesiones.reduce((s, x) => s + v31Numero(x.errors), 0);

    return { total, precision, duracion, aciertos, errores };
  }

  function v31HtmlKpis(sesiones) {
    const r = v31Resumen(sesiones);

    return `
      <div class="rehabV31Grid">
        <div class="rehabV31Kpi">
          <small>SESIONES CLOUD</small>
          <strong>${r.total}</strong>
        </div>
        <div class="rehabV31Kpi">
          <small>PRECISIÓN PROMEDIO</small>
          <strong>${v31Precision(r.precision)}</strong>
        </div>
        <div class="rehabV31Kpi">
          <small>TIEMPO PROMEDIO</small>
          <strong>${v31Duracion(r.duracion)}</strong>
        </div>
        <div class="rehabV31Kpi">
          <small>ACIERTOS / ERRORES</small>
          <strong>${r.aciertos} / ${r.errores}</strong>
        </div>
      </div>
    `;
  }

  function v31HtmlEvolucion(sesiones) {
    const ultimas = [...sesiones].slice(0, 8).reverse();

    if (!ultimas.length) return "";

    return `
      <div class="rehabV31Card">

        <h3 style="margin-top:0">📈 Evolución reciente</h3>
        <div class="rehabV31Evolucion">
          ${ultimas
            .map((s) => {
              const p = Math.max(0, Math.min(100, v31Numero(s.precision)));
              return `
                <div class="rehabV31EvoFila">
                  <span title="${v31Esc(v31Fecha(s.performed_at))}">
                    ${v31Esc(String(s.routine_name || "Rutina").slice(0, 18))}
                  </span>
                  <div class="rehabV31Barra"><span style="width:${p}%"></span></div>
                  <strong>${p.toFixed(0)}%</strong>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function v31EjerciciosSesion(sesion) {
    const ejercicios = Array.isArray(sesion.exercise_results)
      ? sesion.exercise_results
      : [];

    if (!ejercicios.length) {
      return `
        <div class="rehabV31Detalle">
          <div class="rehabV31Mutado">
            Esta sesión fue registrada antes de V31 y no contiene detalle por ejercicio.
          </div>
        </div>
      `;
    }

    return `
      <div class="rehabV31Detalle">
        <strong>Detalle por ejercicio</strong>
        ${ejercicios
          .map((e, i) => {
            const intentos = v31Numero(e.aciertos) + v31Numero(e.errores);
            const precision =
              intentos > 0 ? (v31Numero(e.aciertos) / intentos) * 100 : 100;

            return `
              <div class="rehabV31Ejercicio">
                <div class="rehabV31Fila">
                  <strong>${i + 1}. ${v31Esc(e.nombre || e.modo || "Ejercicio")}</strong>
                  <span>${precision.toFixed(1)}%</span>
                </div>
                <div class="rehabV31Mutado">
                  Dificultad: ${v31Esc(e.dificultad || "-")} ·
                  Aciertos: ${v31Numero(e.aciertos)} ·
                  Errores: ${v31Numero(e.errores)}
                  ${
                    e.promedio != null
                      ? ` · Promedio: ${v31Numero(e.promedio).toFixed(3)} s`
                      : ""
                  }
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function v31HtmlSesiones(sesiones) {
    if (!sesiones.length) {
      return `
        <div class="rehabV31Aviso">
          Todavía no hay sesiones guardadas en RehabPod Cloud.
          Completa una rutina asignada y aparecerá aquí.
        </div>
      `;
    }

    return sesiones
      .map(
        (s) => `
        <div class="rehabV31Card">
          <div class="rehabV31Fila">
            <div>
              <strong>${v31Esc(s.routine_name || "Rutina")}</strong>
              <div class="rehabV31Mutado">${v31Esc(v31Fecha(s.performed_at))}</div>
            </div>
            <button class="rehabV31Btn sec" data-v31-detalle="${v31Esc(s.id)}">
              VER DETALLE
            </button>
          </div>

          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px">
            <span>🎯 ${v31Precision(s.precision)}</span>
            <span>⏱️ ${v31Duracion(s.duration_seconds)}</span>
            <span>✅ ${v31Numero(s.hits)}</span>
            <span>❌ ${v31Numero(s.errors)}</span>
            <span>📋 ${v31Numero(s.completed_percent).toFixed(0)}%</span>
          </div>

          <div id="rehabV31Detalle-${v31Esc(s.id)}" hidden>
            ${v31EjerciciosSesion(s)}
          </div>
        </div>
      `
      )
      .join("");
  }

  function v31ActivarDetalles(contenedor) {
    contenedor.querySelectorAll("[data-v31-detalle]").forEach((btn) => {
      btn.onclick = function () {
        const id = btn.dataset.v31Detalle;
        const detalle = document.getElementById(`rehabV31Detalle-${id}`);
        if (!detalle) return;

        detalle.hidden = !detalle.hidden;
        btn.textContent = detalle.hidden ? "VER DETALLE" : "OCULTAR";
      };
    });
  }

  // -----------------------------------------------------
  // REHABPOD V39 - filtros y resumen de progreso
  // -----------------------------------------------------
  function v39FiltrarSesiones(sesiones, periodo, rutina) {
    let lista = [...sesiones];

    if (periodo !== "todo") {
      const dias = Number(periodo);
      const limite = new Date();
      limite.setDate(limite.getDate() - dias);
      lista = lista.filter((s) => new Date(s.performed_at) >= limite);
    }

    if (rutina && rutina !== "todas") {
      lista = lista.filter((s) => String(s.routine_name || "") === rutina);
    }

    return lista;
  }

  function v39OpcionesRutinas(sesiones) {
    const nombres = [
      ...new Set(sesiones.map((s) => String(s.routine_name || "Rutina")).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));

    return nombres
      .map((n) => `<option value="${v31Esc(n)}">${v31Esc(n)}</option>`)
      .join("");
  }

  function v39HtmlFiltros(sesiones, prefijo) {
    return `
      <div class="rehabV31Card">
        <div style="font-size:.76rem;font-weight:900;opacity:.68">FILTRAR PROGRESO</div>

        <div class="rehabV39Filtros">
          <div class="rehabV39Campo">
            <label>PERÍODO</label>
            <select id="${prefijo}Periodo" class="rehabV31Select">
              <option value="todo">Todo el historial</option>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
          </div>
          <div class="rehabV39Campo">
            <label>RUTINA</label>
            <select id="${prefijo}Rutina" class="rehabV31Select">
              <option value="todas">Todas las rutinas</option>
              ${v39OpcionesRutinas(sesiones)}
            </select>
          </div>
        </div>
      </div>
    `;
  }

  function v39HtmlTendencia(sesiones) {
    if (sesiones.length < 2) return "";
    const orden = [...sesiones].sort(
      (a, b) => new Date(a.performed_at) - new Date(b.performed_at)
    );
    const mitad = Math.max(1, Math.floor(orden.length / 2));
    const anterior = orden.slice(0, mitad);
    const reciente = orden.slice(mitad);
    const prom = (arr) =>
      arr.length ? arr.reduce((s, x) => s + v31Numero(x.precision), 0) / arr.length : 0;
    const dif = prom(reciente) - prom(anterior);
    const texto =
      Math.abs(dif) < 0.5
        ? "Precisión estable"
        : dif > 0
          ? `Precisión +${dif.toFixed(1)} puntos`
          : `Precisión ${dif.toFixed(1)} puntos`;
    return `<div class="rehabV39Tendencia"><span class="rehabV39Punto"></span><strong>${texto}</strong> respecto a sesiones anteriores</div>`;
  }

  function v39RenderPanel(panel, sesiones) {
    if (!sesiones.length) {
      panel.innerHTML = `<div class="rehabV31Aviso">No hay sesiones para los filtros seleccionados.</div>`;
      return;
    }
    panel.innerHTML = `
      ${v31HtmlKpis(sesiones)}
      ${v39HtmlTendencia(sesiones)}
      ${v31HtmlEvolucion(sesiones)}
      <h3>Sesiones recientes</h3>
      ${v31HtmlSesiones(sesiones)}
    `;
    v31ActivarDetalles(panel);
  }

  function v39ActivarFiltros(sesiones, prefijo, panelId) {
    const periodo = document.getElementById(`${prefijo}Periodo`);
    const rutina = document.getElementById(`${prefijo}Rutina`);
    const panel = document.getElementById(panelId);
    if (!periodo || !rutina || !panel) return;

    const actualizar = () => {
      const filtradas = v39FiltrarSesiones(sesiones, periodo.value, rutina.value);
      v39RenderPanel(panel, filtradas);
    };
    periodo.onchange = actualizar;
    rutina.onchange = actualizar;
    actualizar();
  }

  async function v31RenderUsuario(
    userId,
    nombre,
    contentId = "rehabV31Contenido",
    titleId = "rehabV31Titulo"
  ) {
    const c = document.getElementById(contentId);
    if (!c) throw new Error("No se encontró el contenedor de progreso.");

    c.innerHTML = `<div class="rehabV31Aviso">Cargando historial cloud...</div>`;

    const sesiones = await v31SesionesDeUsuario(userId);

    const titulo = document.getElementById(titleId);
    if (titulo) {
      titulo.textContent = nombre ? `Progreso · ${nombre}` : "Mi progreso";
    }

    c.innerHTML = `
      ${v39HtmlFiltros(sesiones, "rehabV39User")}
      <div id="rehabV39UserPanel"></div>
    `;

    v39ActivarFiltros(sesiones, "rehabV39User", "rehabV39UserPanel");
  }

  async function v31UsuariosVinculados() {
    const { data: links, error } = await v31Cloud
      .from("rehab_professional_users")
      .select("user_id, status")
      .eq("professional_id", v31AuthUser.id)
      .eq("status", "active");

    if (error) throw error;
    if (!links?.length) return [];

    const ids = links.map((x) => x.user_id);

    const { data: perfiles, error: ep } = await v31Cloud
      .from("rehab_profiles")
      .select("user_id, full_name, specialty")
      .in("user_id", ids);

    if (ep) throw ep;

    return (perfiles || []).sort((a, b) =>
      String(a.full_name || "").localeCompare(String(b.full_name || ""))
    );
  }

  async function v31RenderProfesional(
    contentId = "rehabV31Contenido",
    titleId = "rehabV31Titulo"
  ) {
    const c = document.getElementById(contentId);
    if (!c) throw new Error("No se encontró el contenedor de progreso.");

    const titulo = document.getElementById(titleId);
    if (titulo) titulo.textContent = "Progreso de usuarios";

    c.innerHTML = `<div class="rehabV31Aviso">Cargando usuarios vinculados...</div>`;

    const usuarios = await v31UsuariosVinculados();

    if (!usuarios.length) {
      c.innerHTML = `
        <div class="rehabV31Aviso">
          Todavía no tienes usuarios vinculados.
          Vincula usuarios desde <strong>☁️ CUENTA Y NUBE</strong>.
        </div>
      `;
      return;
    }

    const seleccionado =
      usuarios.find((u) => u.user_id === v31UsuarioSeleccionado) || usuarios[0];

    v31UsuarioSeleccionado = seleccionado.user_id;

    c.innerHTML = `
      <div class="rehabV31Card">
        <label style="font-size:.8rem;font-weight:900;display:block;margin-bottom:7px">
          USUARIO
        </label>
        <select id="rehabV31UsuarioSelect" class="rehabV31Select">
          ${usuarios
            .map(
              (u) =>
                `<option value="${v31Esc(u.user_id)}" ${
                  u.user_id === seleccionado.user_id ? "selected" : ""
                }>${v31Esc(u.full_name || "Usuario")} · ${v31Esc(
                  u.specialty || "sin especialidad"
                )}</option>`
            )
            .join("")}
        </select>
      </div>

      <div id="rehabV31PanelUsuario">
        <div class="rehabV31Aviso">Cargando progreso...</div>
      </div>
    `;

    const select = document.getElementById("rehabV31UsuarioSelect");

    async function cargarUsuario() {
      v31UsuarioSeleccionado = select.value;
      const usuario = usuarios.find((u) => u.user_id === select.value);
      const panel = document.getElementById("rehabV31PanelUsuario");

      try {
        const sesiones = await v31SesionesDeUsuario(select.value);

        panel.innerHTML = `
          <h3>${v31Esc(usuario?.full_name || "Usuario")}</h3>
          ${v39HtmlFiltros(sesiones, "rehabV39Prof")}
          <div id="rehabV39ProfPanel"></div>
        `;

        v39ActivarFiltros(sesiones, "rehabV39Prof", "rehabV39ProfPanel");
      } catch (error) {
        console.error("V31 progreso profesional:", error);
        panel.innerHTML = `<div class="rehabV31Aviso">${v31Esc(rehabMensajeError(error))}</div>`;
      }
    }

    select.onchange = cargarUsuario;
    await cargarUsuario();
  }

  async function v31AbrirPrincipal(
    contentId = "rehabV31Contenido",
    titleId = "rehabV31Titulo",
    abrirModal = true
  ) {
    if (abrirModal) v31Abrir();

    const c = document.getElementById(contentId);
    if (!c) throw new Error("No se encontró el contenedor de progreso.");

    c.innerHTML = `<div class="rehabV31Aviso">Conectando con RehabPod Cloud...</div>`;

    try {
      const ok = await v31IniciarCloud();

      if (!ok) {
        c.innerHTML = `
          <div class="rehabV31Aviso">
            Primero inicia sesión desde <strong>Cuenta</strong>.
          </div>
        `;
        return false;
      }

      if (v31Perfil.role === "professional") {
        await v31RenderProfesional(contentId, titleId);
      } else {
        await v31RenderUsuario(
          v31AuthUser.id,
          v31Perfil.full_name || "Mi progreso",
          contentId,
          titleId
        );
      }

      return true;
    } catch (error) {
      console.error("RehabPod V31:", error);
      c.innerHTML = `<div class="rehabV31Aviso">${v31Esc(rehabMensajeError(error))}</div>`;
      return false;
    }
  }

  function v31Iniciar() {
    v31AgregarEstilos();
    v31CrearModal();
    v31CrearBotonHome();
    console.log("RehabPod V31: historial cloud + panel de progreso activados.");
  }

  setTimeout(v31Iniciar, 520);

  window.rehabV31Abrir = v31AbrirPrincipal;
  window.rehabV31RenderEnPantalla = function (contentId, titleId) {
    return v31AbrirPrincipal(contentId, titleId, false);
  };
})();

// =====================================================
// REHABPOD V32
// ESTADOS DE RUTINAS ASIGNADAS
// - pending -> Pendiente
// - in_progress -> En progreso al comenzar
// - completed -> Completada al finalizar
// - Las completadas dejan de mostrarse en RUTINAS ASIGNADAS del Usuario.
// - Permanecen en Supabase y en PROGRESO CLOUD para historial.
// =====================================================
console.log("RehabPod V32: estados de asignaciones + ocultar completadas activados.");

// =====================================================
// REHABPOD V33
// LIMPIEZA DE INTERFAZ + NAVEGACION CONTEXTUAL
//
// OBJETIVOS:
// - Ocultar el historial antiguo V24 de la pantalla principal.
// - Usar una sola entrada de PROGRESO.
// - PROGRESO abre Cloud si hay cuenta iniciada; si no, usa progreso local.
// - RUTINAS ASIGNADAS solo aparece para:
//     * Profesional autenticado (para asignar rutinas).
//     * Usuario autenticado y vinculado a un profesional.
// - Usuario sin cuenta Cloud o sin profesional vinculado no ve ese botón.
// - Mantener toda la lógica antigua internamente para compatibilidad.
// =====================================================

(function () {
  let v33Cloud = null;
  let v33AuthListener = null;
  let v33Actualizando = false;

  async function v33Cliente() {
    if (typeof window.rehabGetSupabaseClient !== "function") {
      return null;
    }

    try {
      v33Cloud = await window.rehabGetSupabaseClient();
      return v33Cloud;
    } catch (error) {
      console.warn("V33 Supabase:", error);
      return null;
    }
  }

  function v33OcultarHistorialAntiguo() {
    const historialV24 = document.getElementById("rehabV24BtnHistorial");
    if (historialV24) {
      historialV24.style.display = "none";
      historialV24.setAttribute("aria-hidden", "true");
    }

    // El botón inferior de estadísticas/historial deja de ser necesario:
    // toda la información queda unificada en PROGRESO.
    if (
      typeof btnEstadisticas !== "undefined" &&
      btnEstadisticas &&
      !btnEstadisticas.dataset.v34Cuenta
    ) {
      btnEstadisticas.style.display = "none";
      btnEstadisticas.setAttribute("aria-hidden", "true");
    }
  }

  function v33OcultarBotonProgresoCloudDuplicado() {
    const progresoCloud = document.getElementById("rehabV31HomeBtn");
    if (progresoCloud) {
      progresoCloud.style.display = "none";
      progresoCloud.setAttribute("aria-hidden", "true");
    }
  }

  async function v33AbrirProgresoUnificado() {
    const cloud = await v33Cliente();

    if (cloud) {
      try {
        const { data } = await cloud.auth.getSession();
        const usuario = data?.session?.user || null;

        if (usuario && typeof window.rehabV31Abrir === "function") {
          await window.rehabV31Abrir();
          return;
        }
      } catch (error) {
        console.warn("V33 progreso cloud:", error);
      }
    }

    // Si no hay cuenta Cloud, el usuario conserva el progreso local.
    try {
      if (typeof mostrarProgreso === "function") {
        mostrarProgreso();
      }
      if (
        typeof mostrarPantalla === "function" &&
        typeof pantallaProgreso !== "undefined"
      ) {
        mostrarPantalla(pantallaProgreso);
      }
    } catch (error) {
      console.error("V33 progreso local:", error);
    }
  }

  function v33ConfigurarBotonProgreso() {
    if (typeof btnProgreso === "undefined" || !btnProgreso) return;

    btnProgreso.onclick = function () {
      v33AbrirProgresoUnificado();
    };
  }

  async function v33UsuarioTieneProfesional(userId) {
    const cloud = await v33Cliente();
    if (!cloud || !userId) return false;

    const { data, error } = await cloud
      .from("rehab_professional_users")
      .select("professional_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1);

    if (error) {
      console.warn("V33 vínculo profesional:", error);
      return false;
    }

    return Array.isArray(data) && data.length > 0;
  }

  async function v33ActualizarRutinasAsignadas() {
    if (v33Actualizando) return;
    v33Actualizando = true;

    try {
      const boton = document.getElementById("rehabV28HomeBtn");
      if (!boton) return;

      // Oculto por defecto para evitar mostrar opciones que no aplican.
      boton.style.display = "none";
      boton.setAttribute("aria-hidden", "true");

      const cloud = await v33Cliente();
      if (!cloud) return;

      const { data } = await cloud.auth.getSession();
      const user = data?.session?.user || null;

      // Sin cuenta Cloud iniciada: no mostramos RUTINAS ASIGNADAS.
      if (!user) return;

      const { data: perfil, error: perfilError } = await cloud
        .from("rehab_profiles")
        .select("user_id, role")
        .eq("user_id", user.id)
        .single();

      if (perfilError || !perfil) {
        if (perfilError) console.warn("V33 perfil:", perfilError);
        return;
      }

      // Profesional: mantiene el acceso porque desde aquí asigna rutinas.
      if (perfil.role === "professional") {
        boton.textContent = "📨 ASIGNAR RUTINAS";
        boton.style.display = "";
        boton.removeAttribute("aria-hidden");
        return;
      }

      // Usuario: solo lo ve si está vinculado a un profesional.
      const vinculado = await v33UsuarioTieneProfesional(user.id);

      if (vinculado) {
        boton.textContent = "📨 RUTINAS ASIGNADAS";
        boton.style.display = "";
        boton.removeAttribute("aria-hidden");
      }
    } catch (error) {
      console.warn("V33 actualizar interfaz:", error);
    } finally {
      v33Actualizando = false;
    }
  }

  async function v33PrepararSesion() {
    const cloud = await v33Cliente();
    if (!cloud) return;

    try {
      if (v33AuthListener?.data?.subscription) {
        v33AuthListener.data.subscription.unsubscribe();
      }

      v33AuthListener = cloud.auth.onAuthStateChange(function () {
        setTimeout(() => {
          v33ActualizarRutinasAsignadas();
        }, 80);
      });
    } catch (error) {
      console.warn("V33 auth listener:", error);
    }
  }

  function v33MejorarEtiquetaProgreso() {
    // Si el botón inferior contiene texto "Progreso", lo conservamos.
    // Solo eliminamos terminología técnica "Cloud" de la navegación.
    const cloudBtn = document.getElementById("rehabV31HomeBtn");
    if (cloudBtn) {
      cloudBtn.textContent = "📊 PROGRESO";
    }
  }

  function v33ObservarBotonesDinamicos() {
    const observer = new MutationObserver(function () {
      v33OcultarHistorialAntiguo();
      v33OcultarBotonProgresoCloudDuplicado();

      const asignadas = document.getElementById("rehabV28HomeBtn");
      if (asignadas && !asignadas.dataset.v33Preparado) {
        asignadas.dataset.v33Preparado = "1";
        v33ActualizarRutinasAsignadas();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  async function v33Iniciar() {
    v33MejorarEtiquetaProgreso();
    v33OcultarBotonProgresoCloudDuplicado();
    // V36.2 / Nav final: ya no ocultamos Historial ni reasignamos el botón
    // Progreso aquí; la navegación inferior final se configura una sola
    // vez, de forma síncrona, al final de este archivo.

    await v33PrepararSesion();
    await v33ActualizarRutinasAsignadas();

    // Si el usuario vuelve a la app después de que un profesional lo vinculó,
    // actualizamos la navegación sin exigir cerrar sesión.
    window.addEventListener("focus", function () {
      v33ActualizarRutinasAsignadas();
    });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        v33ActualizarRutinasAsignadas();
      }
    });

    console.log(
      "RehabPod V33: interfaz simplificada + rutinas asignadas contextuales activadas."
    );
  }

  setTimeout(v33Iniciar, 700);

  // Permite refrescar manualmente la interfaz después de vincular cuentas.
  window.rehabV33ActualizarInterfaz = v33ActualizarRutinasAsignadas;
})();

// =====================================================
// REHABPOD V36
// LIMPIEZA FINAL DE INICIO + CONFIRMACION SEGURA AL DESVINCULAR
//
// CAMBIOS:
// - Inicio más simple: se ocultan tarjetas estadísticas duplicadas.
//   Esas métricas ya viven en la pestaña Progreso.
// - Se mantiene visible lo esencial: estado de Pods, administrar Pods,
//   Iniciar entrenamiento, Mis rutinas y Rutinas asignadas cuando corresponda.
// - Confirmación visual antes de desvincular.
// - El aviso explica exactamente qué se pierde y qué NO se borra.
// =====================================================

(function () {
  function v36AgregarEstilos() {
    if (document.getElementById("rehabV36Estilos")) return;

    const st = document.createElement("style");
    st.id = "rehabV36Estilos";
    st.textContent = `
      .rehabV36Oculto{display:none!important}

      .rehabV36ConfirmOverlay{
        position:fixed;inset:0;z-index:101000;background:rgba(2,6,23,.88);
        backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;
        padding:18px
      }
      .rehabV36ConfirmOverlay[hidden]{display:none!important}

      .rehabV36ConfirmCard{
        width:min(440px,100%);border-radius:24px;padding:22px 18px;
        background:var(--tarjeta);color:inherit;
        border:1px solid rgba(239,68,68,.28);
        box-shadow:0 28px 90px rgba(0,0,0,.50);text-align:center
      }
      .tema-claro .rehabV36ConfirmCard{background:#fff}

      .rehabV36Icono{
        width:66px;height:66px;border-radius:50%;display:flex;align-items:center;
        justify-content:center;margin:0 auto 12px;background:rgba(239,68,68,.12);
        border:1px solid rgba(239,68,68,.28);font-size:31px
      }

      .rehabV36Lista{
        text-align:left;margin:15px 0;padding:12px 14px;border-radius:14px;
        background:rgba(148,163,184,.06);border:1px solid rgba(148,163,184,.15);
        font-size:.87rem;line-height:1.55
      }

      .rehabV36Acciones{
        display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px
      }

      .rehabV36Btn{
        border:0;border-radius:12px;padding:11px 12px;font-weight:900;cursor:pointer
      }
      .rehabV36BtnCancelar{
        background:rgba(148,163,184,.14);color:inherit;
        border:1px solid rgba(148,163,184,.22)
      }
      .rehabV36BtnEliminar{background:#b91c1c;color:#fff}

      @media(max-width:480px){
        .rehabV36Acciones{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(st);
  }

  function v36CrearConfirmacion() {
    if (document.getElementById("rehabV36ConfirmOverlay")) return;

    const ov = document.createElement("div");
    ov.id = "rehabV36ConfirmOverlay";
    ov.className = "rehabV36ConfirmOverlay";
    ov.hidden = true;

    ov.innerHTML = `
      <div class="rehabV36ConfirmCard" role="dialog" aria-modal="true">
        <div class="rehabV36Icono">⚠️</div>
        <h2 style="margin:0 0 8px">Desvincular cuenta</h2>
        <p id="rehabV36ConfirmTexto" style="margin:0;opacity:.78;line-height:1.5"></p>

        <div class="rehabV36Lista">
          <strong>Al desvincular:</strong><br>
          • El Usuario dejará de recibir nuevas rutinas de este Profesional.<br>
          • Desaparecerá el acceso compartido al seguimiento futuro.<br>
          • Las asignaciones pendientes pueden dejar de estar disponibles para esa relación.<br><br>
          <strong>Importante:</strong> los resultados e historial que ya fueron guardados
          no se eliminan automáticamente de Supabase.
        </div>

        <div class="rehabV36Acciones">
          <button id="rehabV36Cancelar" class="rehabV36Btn rehabV36BtnCancelar" type="button">
            CANCELAR
          </button>
          <button id="rehabV36Confirmar" class="rehabV36Btn rehabV36BtnEliminar" type="button">
            SÍ, DESVINCULAR
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(ov);
  }

  window.v36ConfirmarDesvinculacion = function (nombre) {
    return new Promise((resolve) => {
      const ov = document.getElementById("rehabV36ConfirmOverlay");
      const texto = document.getElementById("rehabV36ConfirmTexto");
      const cancelar = document.getElementById("rehabV36Cancelar");
      const confirmar = document.getElementById("rehabV36Confirmar");

      if (!ov || !texto || !cancelar || !confirmar) {
        resolve(
          confirm(
            `¿Desvincular a ${nombre}?\\n\\n` +
              "Se perderá la relación profesional-usuario y el acceso compartido futuro."
          )
        );
        return;
      }

      texto.innerHTML = `¿Deseas desvincular a <strong>${String(nombre || "esta cuenta")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")}</strong>?`;

      ov.hidden = false;

      const cerrar = (valor) => {
        ov.hidden = true;
        cancelar.onclick = null;
        confirmar.onclick = null;
        resolve(valor);
      };

      cancelar.onclick = () => cerrar(false);
      confirmar.onclick = () => cerrar(true);

      ov.onclick = (e) => {
        if (e.target === ov) cerrar(false);
      };
    });
  };

  function v36OcultarResumenDuplicado() {
    // Las cuatro métricas del inicio ya existen en Progreso.
    // Ocultamos sus tarjetas completas para dejar Inicio más limpio.
    const ids = ["inicioMejorTiempo", "inicioPrecision", "inicioSesiones", "inicioRacha"];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      // Normalmente el valor está dentro de la tarjeta.
      // Subimos hasta dos niveles buscando el contenedor visual.
      let tarjeta = el.parentElement;
      if (
        tarjeta &&
        tarjeta.parentElement &&
        tarjeta.parentElement.children.length <= 6
      ) {
        // Conservamos el contenedor grid; ocultamos solo la tarjeta.
        tarjeta.classList.add("rehabV36Oculto");
      }
    });
  }

  function v36LimpiarTextoInicio() {
    const btnPods = typeof btnGestionarPods !== "undefined" ? btnGestionarPods : null;

    // FIX V36.1:
    // El MutationObserver ejecuta esta función cuando cambia el DOM.
    // No debemos reescribir textContent/innerHTML si el texto ya es correcto,
    // porque eso vuelve a generar otra mutación y puede crear un bucle.
    if (btnPods && btnPods.textContent.trim() !== "ADMINISTRAR PODS") {
      btnPods.textContent = "ADMINISTRAR PODS";
    }

    const btnRutinas = document.getElementById("rehabV23BtnRutinas");
    if (btnRutinas && btnRutinas.textContent.trim() !== "📋 MIS RUTINAS") {
      btnRutinas.textContent = "📋 MIS RUTINAS";
    }
  }

  function v36ObservarInicio() {
    let programado = false;

    const observer = new MutationObserver(() => {
      // Agrupamos varias mutaciones en una sola actualización.
      if (programado) return;
      programado = true;

      requestAnimationFrame(() => {
        programado = false;
        v36OcultarResumenDuplicado();
        v36LimpiarTextoInicio();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function v36Iniciar() {
    v36AgregarEstilos();
    v36CrearConfirmacion();
    v36OcultarResumenDuplicado();
    v36LimpiarTextoInicio();
    // V36.2: limpieza aplicada una sola vez. Sin observer global.

    console.log(
      "RehabPod V36.2: interfaz estable sin MutationObservers globales + confirmación segura."
    );
  }

  setTimeout(v36Iniciar, 1300);

  // Refresco ligero cuando el usuario vuelve a la app.
  // No observa el DOM y por eso no puede entrar en bucles de mutaciones.
  window.addEventListener("focus", () => {
    try {
      v36OcultarResumenDuplicado();
      v36LimpiarTextoInicio();
      if (typeof window.rehabV33ActualizarInterfaz === "function") {
        window.rehabV33ActualizarInterfaz();
      }
    } catch (error) {
      console.warn("V36.2 refresco interfaz:", error);
    }
  });
})();

// =====================================================
// NAVEGACIÓN INFERIOR FINAL
// Inicio | Progreso | Historial | Cuenta
//
// Reemplaza a V35 + V37 + V38 (que se pisaban entre sí con
// temporizadores de 1150/1500/1750ms, causando que en algunos
// dispositivos Progreso o Cuenta quedaran dibujados debajo de Inicio,
// o que el botón Inicio no respondiera hasta pasado ese tiempo).
//
// Esta versión no usa setTimeout: se ejecuta una sola vez, de forma
// síncrona, en el momento en que el script termina de cargar — los
// mismos botones y pantallas ya existen en el HTML en ese punto.
// =====================================================

const btnCuentaMenu = document.getElementById("btnCuentaMenu");
const btnInicioMenu = document.getElementById("btnInicioMenu");
const pantallaCuentaCloud = document.getElementById("pantallaCuentaCloud");
const btnVolverCuentaCloud = document.getElementById("btnVolverCuentaCloud");
const contenidoProgresoLocal = document.getElementById("contenidoProgresoLocal");
const contenidoProgresoCloud = document.getElementById("contenidoProgresoCloud");

async function navHaySesionCloud() {
  if (typeof window.rehabGetSupabaseClient !== "function") {
    return false;
  }

  try {
    const cloud = await window.rehabGetSupabaseClient();
    const { data } = await cloud.auth.getSession();
    return !!data?.session?.user;
  } catch (error) {
    console.warn("Nav: no se pudo verificar sesión Cloud", error);
    return false;
  }
}

async function abrirInicioNav() {
  actualizarResumenInicio();
  mostrarPantalla(pantallaInicio);
}

async function abrirProgresoNav() {
  const cloudActiva = await navHaySesionCloud();

  mostrarProgreso();
  mostrarPantalla(pantallaProgreso);

  if (!cloudActiva || typeof window.rehabV31RenderEnPantalla !== "function") {
    if (contenidoProgresoCloud) contenidoProgresoCloud.style.display = "none";
    if (contenidoProgresoLocal) contenidoProgresoLocal.style.display = "";
    return;
  }

  if (contenidoProgresoLocal) contenidoProgresoLocal.style.display = "none";
  if (contenidoProgresoCloud) {
    contenidoProgresoCloud.style.display = "";
    contenidoProgresoCloud.innerHTML = `<div class="rehabV31Aviso">Cargando progreso...</div>`;

    try {
      await window.rehabV31RenderEnPantalla("contenidoProgresoCloud", null);
    } catch (error) {
      console.error("Nav progreso cloud:", error);
      contenidoProgresoCloud.innerHTML = `
        <div class="rehabV31Aviso">
          ${rehabMensajeError(error)}
        </div>
      `;
    }
  }
}

async function abrirCuentaNav() {
  mostrarPantalla(pantallaCuentaCloud);

  const contenido = document.getElementById("contenidoCuentaCloud");
  if (!contenido) return;

  contenido.innerHTML = `<div class="rehabV40Aviso">Cargando cuenta...</div>`;

  try {
    if (typeof window.rehabV40RenderCuenta === "function") {
      await window.rehabV40RenderCuenta("contenidoCuentaCloud");
    } else {
      contenido.innerHTML = `<div class="rehabV40Aviso">No se pudo cargar la sección Cuenta.</div>`;
    }
  } catch (error) {
    console.error("Nav cuenta:", error);
    contenido.innerHTML = `
      <div class="rehabV40Aviso">
        ${rehabMensajeError(error)}
      </div>
    `;
  }
}

if (btnInicioMenu) btnInicioMenu.onclick = abrirInicioNav;
if (btnProgreso) btnProgreso.onclick = abrirProgresoNav;
// btnEstadisticas (Historial) ya no tiene entrada en el menú: su
// información vive dentro de Progreso, para no repetirla al usuario.
if (btnCuentaMenu) btnCuentaMenu.onclick = abrirCuentaNav;
if (btnVolverCuentaCloud) btnVolverCuentaCloud.onclick = abrirInicioNav;

console.log("RehabPod: navegación inferior (Inicio/Progreso/Historial/Cuenta) lista.");

// =====================================================
// REHABPOD V39
// PROGRESO MEJORADO: filtros, tendencia, KPIs y sesiones
// =====================================================
setTimeout(() => {
  console.log("RehabPod V39: Progreso mejorado con filtros y tendencia activado.");
}, 1900);

// =====================================================
// REHABPOD V40
// CUENTA MEJORADA
//
// - Cuenta más clara y organizada.
// - Editar nombre y especialidad/uso de la cuenta Cloud.
// - Cambiar contraseña desde una sesión iniciada.
// - Cerrar sesión.
// - Mantener vínculos Profesional <-> Usuario y desvinculación.
// - Ajustes de sonido y tema permanecen dentro de Cuenta.
// - Mantener perfil local y acceso a administrar perfiles.
// =====================================================

(function () {
  let v40Cloud = null;
  let v40User = null;
  let v40Perfil = null;
  let v40Relaciones = [];

  function v40Esc(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function v40Rol(role) {
    return role === "professional" ? "Profesional" : "Usuario";
  }

  function v40EspecialidadLabel(valor) {
    const mapa = {
      athlete: "Deportista",
      fitness: "Fitness / gimnasio",
      rehabilitation: "Rehabilitación",
      cognitive_training: "Entrenamiento cognitivo",
      recreational: "Recreativo",
      physiotherapy: "Fisioterapia",
      sports_coach: "Entrenador deportivo",
      physical_trainer: "Preparador físico",
      rehabilitation_professional: "Profesional de rehabilitación",
      educator: "Profesor / educador",
      unspecified: "Sin especificar",
      other: "Otro",
    };
    return mapa[valor] || valor || "Sin especificar";
  }

  function v40OpcionesEspecialidad(role, actual) {
    const usuario = [
      ["athlete", "Deportista"],
      ["fitness", "Fitness / gimnasio"],
      ["rehabilitation", "Rehabilitación"],
      ["cognitive_training", "Entrenamiento cognitivo"],
      ["recreational", "Recreativo"],
      ["other", "Otro"],
    ];

    const profesional = [
      ["physiotherapy", "Fisioterapia"],
      ["sports_coach", "Entrenador deportivo"],
      ["physical_trainer", "Preparador físico"],
      ["rehabilitation_professional", "Profesional de rehabilitación"],
      ["educator", "Profesor / educador"],
      ["other", "Otro"],
    ];

    const lista = role === "professional" ? profesional : usuario;

    if (actual && !lista.some(([v]) => v === actual)) {
      lista.unshift([actual, v40EspecialidadLabel(actual)]);
    }

    return lista
      .map(
        ([valor, etiqueta]) =>
          `<option value="${v40Esc(valor)}" ${
            valor === actual ? "selected" : ""
          }>${v40Esc(etiqueta)}</option>`
      )
      .join("");
  }

  async function v40Cliente() {
    if (typeof window.rehabGetSupabaseClient !== "function") return null;
    v40Cloud = await window.rehabGetSupabaseClient();
    return v40Cloud;
  }

  function v40AgregarEstilos() {
    if (document.getElementById("rehabV40Estilos")) return;

    const st = document.createElement("style");
    st.id = "rehabV40Estilos";
    st.textContent = `
      .rehabV40Wrap{display:grid;gap:12px}
      .rehabV40Hero{
        display:flex;align-items:center;gap:14px;padding:16px;border-radius:20px;
        border:1px solid rgba(148,163,184,.18);
        background:linear-gradient(135deg,rgba(59,130,246,.08),rgba(34,197,94,.06))
      }
      .rehabV40Avatar{
        width:62px;height:62px;border-radius:50%;display:flex;align-items:center;
        justify-content:center;flex:0 0 auto;font-size:25px;font-weight:950;
        background:rgba(34,197,94,.13);border:2px solid rgba(34,197,94,.38)
      }
      .rehabV40Hero h3{margin:0;font-size:1.18rem}
      .rehabV40Hero small{display:block;opacity:.65;margin-top:4px}
      .rehabV40Badge{
        display:inline-flex;padding:4px 8px;border-radius:999px;margin-top:7px;
        font-size:.72rem;font-weight:900;background:rgba(59,130,246,.10);
        border:1px solid rgba(59,130,246,.20)
      }
      .rehabV40Card{
        border:1px solid rgba(148,163,184,.18);border-radius:18px;padding:15px;
        background:rgba(148,163,184,.04)
      }
      .rehabV40SecTitulo{
        font-size:.78rem;font-weight:950;letter-spacing:.7px;opacity:.66;margin-bottom:11px
      }
      .rehabV40Dato{
        display:flex;justify-content:space-between;gap:16px;padding:8px 0;
        border-bottom:1px solid rgba(148,163,184,.12)
      }
      .rehabV40Dato:last-child{border-bottom:0}
      .rehabV40Dato span:first-child{opacity:.65}
      .rehabV40Campo{display:grid;gap:6px;margin:10px 0}
      .rehabV40Campo label{font-size:.76rem;font-weight:900;opacity:.70}
      .rehabV40Campo input,.rehabV40Campo select{
        width:100%;box-sizing:border-box;padding:10px 11px;border-radius:11px;
        border:1px solid rgba(148,163,184,.24);
        background:rgba(148,163,184,.07);color:inherit;font:inherit
      }
      .rehabV40Acciones{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px}
      .rehabV40Btn{

        appearance:none;border:0;border-radius:11px;padding:10px 13px;font-weight:900;
        cursor:pointer;background:var(--acento);color:var(--acento-tinta)
      }
      .rehabV40Btn.sec{
        background:rgba(148,163,184,.14);color:inherit;border:1px solid rgba(148,163,184,.24)
      }
      .rehabV40Btn.ok{background:#16a34a}
      .rehabV40Btn.peligro{background:#b91c1c}
      .rehabV40Switch{
        display:flex;align-items:center;justify-content:space-between;gap:14px;padding:9px 0
      }
      .rehabV40Switch input{width:22px;height:22px;accent-color:#22c55e}
      .rehabV40Relacion{
        display:flex;justify-content:space-between;align-items:center;gap:10px;
        padding:10px;border-radius:12px;background:rgba(148,163,184,.055);margin:7px 0
      }
      .rehabV40Relacion small{display:block;opacity:.64;margin-top:3px}
      .rehabV40Aviso{
        padding:12px;border-radius:13px;background:rgba(14,165,233,.08);
        border:1px solid rgba(14,165,233,.18);line-height:1.48
      }
      .rehabV40Mensaje{margin-top:9px;font-size:.84rem;line-height:1.45}
      .rehabV40Mensaje.ok{color:#22c55e}
      .rehabV40Mensaje.error{color:#ef4444}
      .rehabV40Local{
        display:flex;align-items:center;justify-content:space-between;gap:12px
      }
      @media(max-width:560px){
        .rehabV40Hero{align-items:flex-start}
        .rehabV40Dato{display:grid;gap:4px}
        .rehabV40Relacion{align-items:flex-start;flex-direction:column}
        .rehabV40Relacion .rehabV40Btn{width:100%}
      }
    `;
    document.head.appendChild(st);
  }

  function v40Mensaje(id, texto, tipo = "") {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `rehabV40Mensaje ${tipo}`;
    el.textContent = texto || "";
  }

  function v40PerfilLocal() {
    try {
      if (typeof obtenerPerfilActivo !== "function") return null;
      return obtenerPerfilActivo();
    } catch (_) {
      return null;
    }
  }

  async function v40CargarCloud() {
    v40User = null;
    v40Perfil = null;
    v40Relaciones = [];

    const cloud = await v40Cliente();
    if (!cloud) return false;

    const { data: sesion } = await cloud.auth.getSession();
    v40User = sesion?.session?.user || null;

    if (!v40User) return false;

    const { data: perfil, error } = await cloud
      .from("rehab_profiles")
      .select("user_id, full_name, role, specialty, user_code, created_at")
      .eq("user_id", v40User.id)
      .single();

    if (error) throw error;
    v40Perfil = perfil;

    if (perfil.role === "professional") {
      const { data: links, error: le } = await cloud
        .from("rehab_professional_users")
        .select("user_id, status")
        .eq("professional_id", v40User.id)
        .eq("status", "active");

      if (le) throw le;

      if (links?.length) {
        const ids = links.map((x) => x.user_id);
        const { data: perfiles, error: pe } = await cloud
          .from("rehab_profiles")
          .select("user_id, full_name, specialty")
          .in("user_id", ids);

        if (pe) throw pe;

        v40Relaciones = (perfiles || []).map((p) => ({
          id: p.user_id,
          nombre: p.full_name || "Usuario",
          detalle: v40EspecialidadLabel(p.specialty),
        }));
      }
    } else {
      const { data: links, error: le } = await cloud
        .from("rehab_professional_users")
        .select("professional_id, status")
        .eq("user_id", v40User.id)
        .eq("status", "active");

      if (le) throw le;

      if (links?.length) {
        const ids = links.map((x) => x.professional_id);
        const { data: perfiles, error: pe } = await cloud
          .from("rehab_profiles")
          .select("user_id, full_name, specialty")
          .in("user_id", ids);

        if (pe) throw pe;

        v40Relaciones = (perfiles || []).map((p) => ({
          id: p.user_id,
          nombre: p.full_name || "Profesional",
          detalle: v40EspecialidadLabel(p.specialty),
        }));
      }
    }

    return true;
  }

  function v40HtmlLocal() {
    const p = v40PerfilLocal();

    if (!p) {
      return `
        <div class="rehabV40Card">
          <div class="rehabV40SecTitulo">PERFIL EN ESTE DISPOSITIVO</div>
          <div class="rehabV40Aviso">No se encontró un perfil local activo.</div>
        </div>
      `;
    }

    return `
      <div class="rehabV40Card">
        <div class="rehabV40SecTitulo">PERFIL EN ESTE DISPOSITIVO</div>
        <div class="rehabV40Local">
          <div>
            <strong>${v40Esc(p.nombre || "Perfil")}</strong>
            <div style="opacity:.63;font-size:.82rem;margin-top:3px">
              ${Array.isArray(p.historial) ? p.historial.length : 0} entrenamientos locales
            </div>
          </div>
          <button id="rehabV40Perfiles" class="rehabV40Btn sec" type="button">
            ADMINISTRAR
          </button>
        </div>
      </div>

    `;
  }

  function v40HtmlSinCloud() {
    return `
      <div class="rehabV40Card">
        <div class="rehabV40SecTitulo">CUENTA CLOUD</div>
        <div class="rehabV40Aviso">
          Puedes entrenar sin una cuenta Cloud. Inicia sesión o crea una cuenta para
          recibir rutinas, sincronizar resultados y vincularte con un profesional.
        </div>
        <div class="rehabV40Acciones">
          <button id="rehabV40Login" class="rehabV40Btn" type="button">
            INICIAR SESIÓN / CREAR CUENTA
          </button>
        </div>
      </div>
    `;
  }

  function v40HtmlCloud() {
    const p = v40Perfil;
    const inicial = (p.full_name || v40User.email || "R").trim().charAt(0).toUpperCase();

    return `
      <div class="rehabV40Hero">
        <div class="rehabV40Avatar">${v40Esc(inicial)}</div>
        <div style="min-width:0">
          <h3>${v40Esc(p.full_name || "Cuenta RehabPod")}</h3>
          <small style="overflow-wrap:anywhere">${v40Esc(v40User.email || "")}</small>
          <span class="rehabV40Badge">${v40Esc(v40Rol(p.role))}</span>
        </div>
      </div>

      <div class="rehabV40Card">
        <div class="rehabV40SecTitulo">DATOS DE LA CUENTA</div>

        <div class="rehabV40Dato">
          <span>Nombre</span>
          <strong>${v40Esc(p.full_name || "Sin nombre")}</strong>
        </div>
        <div class="rehabV40Dato">
          <span>Tipo de cuenta</span>
          <strong>${v40Esc(v40Rol(p.role))}</strong>
        </div>
        <div class="rehabV40Dato">
          <span>Especialidad / uso</span>
          <strong>${v40Esc(v40EspecialidadLabel(p.specialty))}</strong>
        </div>
        ${
          p.user_code
            ? `
          <div class="rehabV40Dato">
            <span>Código de vinculación</span>
            <strong>${v40Esc(p.user_code)}</strong>
          </div>
        `
            : ""
        }

        <div class="rehabV40Acciones">
          <button id="rehabV40EditarPerfil" class="rehabV40Btn sec" type="button">
            EDITAR DATOS
          </button>
        </div>

        <div id="rehabV40EditorPerfil" hidden>
          <div class="rehabV40Campo">
            <label>NOMBRE</label>
            <input id="rehabV40Nombre" type="text" maxlength="80" value="${v40Esc(
              p.full_name || ""
            )}">
          </div>

          <div class="rehabV40Campo">
            <label>TIPO DE CUENTA</label>
            <select id="rehabV40Rol">
              <option value="user" ${p.role === "user" ? "selected" : ""}>Usuario</option>
              <option value="professional" ${p.role === "professional" ? "selected" : ""}>Profesional</option>
            </select>
            <div style="font-size:.76rem;opacity:.65;line-height:1.4;margin-top:2px">
              Si cambias el tipo de cuenta, revisa también la especialidad/uso debajo.
            </div>
          </div>

          <div class="rehabV40Campo">
            <label>ESPECIALIDAD / USO</label>
            <select id="rehabV40Especialidad">
              ${v40OpcionesEspecialidad(p.role, p.specialty)}
            </select>
          </div>

          <div class="rehabV40Acciones">
            <button id="rehabV40GuardarPerfil" class="rehabV40Btn ok" type="button">
              GUARDAR CAMBIOS
            </button>
            <button id="rehabV40CancelarPerfil" class="rehabV40Btn sec" type="button">
              CANCELAR
            </button>
          </div>
          <div id="rehabV40MensajePerfil"></div>
        </div>
      </div>
    `;
  }

  function v40HtmlRelaciones() {
    if (!v40User || !v40Perfil) return "";

    const titulo =
      v40Perfil.role === "professional"
        ? "USUARIOS VINCULADOS"
        : "PROFESIONALES VINCULADOS";

    return `
      <div class="rehabV40Card">
        <div class="rehabV40SecTitulo">${titulo}</div>

        ${
          v40Relaciones.length
            ? v40Relaciones
                .map(
                  (r) => `
            <div class="rehabV40Relacion">
              <div>
                <strong>${v40Esc(r.nombre)}</strong>
                <small>${v40Esc(r.detalle)}</small>
              </div>
              <button
                class="rehabV40Btn peligro"
                type="button"
                data-v40-desvincular="${v40Esc(r.id)}"
                data-v40-nombre="${v40Esc(r.nombre)}"
              >
                DESVINCULAR
              </button>
            </div>
          `
                )
                .join("")
            : `
              <div class="rehabV40Aviso">
                ${
                  v40Perfil.role === "professional"
                    ? "Todavía no tienes usuarios vinculados."
                    : "Todavía no estás vinculado a ningún profesional."
                }
              </div>
            `
        }
      </div>
    `;
  }

  function v40HtmlSeguridad() {
    if (!v40User) return "";

    return `
      <div class="rehabV40Card">
        <div class="rehabV40SecTitulo">SEGURIDAD</div>

        <div class="rehabV40Campo">
          <label>NUEVA CONTRASEÑA</label>
          <input id="rehabV40Password1" type="password" minlength="8" autocomplete="new-password"
            placeholder="Mínimo 8 caracteres">
        </div>


        <div class="rehabV40Campo">
          <label>REPETIR CONTRASEÑA</label>
          <input id="rehabV40Password2" type="password" minlength="8" autocomplete="new-password"
            placeholder="Repite la contraseña">
        </div>

        <div class="rehabV40Acciones">
          <button id="rehabV40CambiarPassword" class="rehabV40Btn sec" type="button">
            CAMBIAR CONTRASEÑA
          </button>
        </div>
        <div id="rehabV40MensajePassword"></div>
      </div>
    `;
  }

  function v40HtmlPreferencias() {
    const sonidos = !!ajustesApp?.sonidos;
    const tema = ajustesApp?.tema || "oscuro";

    return `
      <div class="rehabV40Card">
        <div class="rehabV40SecTitulo">PREFERENCIAS</div>

        <div class="rehabV40Switch">
          <div>
            <strong>Sonidos</strong>
            <div style="font-size:.8rem;opacity:.63;margin-top:3px">
              Aciertos, errores y cuenta regresiva.
            </div>
          </div>
          <input id="rehabV40Sonidos" type="checkbox" ${sonidos ? "checked" : ""}>
        </div>

        <div class="rehabV40Campo">
          <label>TEMA</label>
          <select id="rehabV40Tema">
            <option value="oscuro" ${tema === "oscuro" ? "selected" : ""}>Oscuro</option>
            <option value="claro" ${tema === "claro" ? "selected" : ""}>Claro</option>
          </select>
        </div>
      </div>
    `;
  }

  function v40HtmlSesion() {
    if (!v40User) return "";

    return `
      <div class="rehabV40Card">
        <div class="rehabV40SecTitulo">SESIÓN</div>
        <div class="rehabV40Aviso">
          Tu información Cloud permanece guardada al cerrar sesión. Podrás volver a entrar
          con el mismo correo y contraseña.
        </div>
        <div class="rehabV40Acciones">
          <button id="rehabV40CerrarSesion" class="rehabV40Btn peligro" type="button">
            CERRAR SESIÓN
          </button>
        </div>
      </div>
    `;
  }

  function v40HtmlPrivacidad() {
    return `
      <div class="rehabV40Card">
        <div class="rehabV40SecTitulo">PRIVACIDAD Y DATOS</div>
        <div style="font-size:.82rem;opacity:.75;line-height:1.5;margin-bottom:10px">
          Puedes descargar todo lo que RehabPod guarda del perfil activo,
          o eliminarlo por completo de este dispositivo.
        </div>
        <button id="rehabV40Descargar" class="rehabV40Btn sec" type="button" style="width:100%;margin-bottom:8px">
          ⬇️ Descargar mis datos
        </button>
        <button id="rehabV40EliminarDatos" class="rehabV40Btn peligro" type="button" style="width:100%">
          🗑️ Eliminar mi cuenta y mis datos
        </button>
      </div>
    `;
  }

  function v40HtmlAcerca() {
    return `
      <div class="rehabV40Card">
        <div class="rehabV40SecTitulo">ACERCA DE REHABPOD</div>
        <div class="rehabV40Dato">
          <span>Versión</span>
          <strong>RehabPod v0.3</strong>
        </div>
        <div style="font-size:.8rem;opacity:.62;line-height:1.45;margin-top:9px">
          Aplicación experimental para entrenamiento de reacción,
          velocidad, coordinación y rehabilitación.
        </div>
      </div>
    `;
  }

  async function v40Render(contentId = "rehabV35ContenidoCuenta") {
    const c = document.getElementById(contentId);
    if (!c) throw new Error("No se encontró la pantalla Cuenta.");

    c.innerHTML = `<div class="rehabV40Aviso">Cargando cuenta...</div>`;

    try {
      const tieneCloud = await v40CargarCloud();

      c.innerHTML = `
        <div class="rehabV40Wrap">
          ${v40HtmlLocal()}
          ${tieneCloud ? v40HtmlCloud() : v40HtmlSinCloud()}
          ${tieneCloud ? v40HtmlRelaciones() : ""}
          ${tieneCloud ? v40HtmlSeguridad() : ""}
          ${v40HtmlPreferencias()}
          ${tieneCloud ? v40HtmlSesion() : ""}
          ${v40HtmlPrivacidad()}
          ${v40HtmlAcerca()}
        </div>
      `;

      v40ActivarEventos(contentId);
    } catch (error) {
      console.error("RehabPod V40:", error);
      c.innerHTML = `
        <div class="rehabV40Wrap">
          ${v40HtmlLocal()}
          <div class="rehabV40Aviso">${v40Esc(rehabMensajeError(error))}</div>
          ${v40HtmlPreferencias()}
          ${v40HtmlPrivacidad()}
          ${v40HtmlAcerca()}
        </div>
      `;
      v40ActivarEventos(contentId);
    }
  }

  function v40ActivarEventos(contentId) {
    const descargar = document.getElementById("rehabV40Descargar");
    if (descargar) {
      descargar.onclick = function () {
        if (typeof descargarMisDatos === "function") descargarMisDatos();
      };
    }

    const eliminarDatos = document.getElementById("rehabV40EliminarDatos");
    if (eliminarDatos) {
      eliminarDatos.onclick = function () {
        if (typeof eliminarMiCuentaYDatos === "function") eliminarMiCuentaYDatos();
      };
    }

    const perfiles = document.getElementById("rehabV40Perfiles");
    if (perfiles) {
      perfiles.onclick = function () {
        try {
          if (typeof mostrarPerfiles === "function") mostrarPerfiles();
          if (
            typeof mostrarPantalla === "function" &&
            typeof pantallaPerfiles !== "undefined"
          ) {
            mostrarPantalla(pantallaPerfiles);
          }
        } catch (error) {
          console.error("V40 perfiles:", error);
        }
      };
    }

    const login = document.getElementById("rehabV40Login");
    if (login) {
      login.onclick = function () {
        if (typeof window.rehabCloudAbrir === "function") {
          window.rehabCloudAbrir();
        }
      };
    }

    const editar = document.getElementById("rehabV40EditarPerfil");
    const editor = document.getElementById("rehabV40EditorPerfil");
    const cancelar = document.getElementById("rehabV40CancelarPerfil");

    if (editar && editor) {
      editar.onclick = () => {
        editor.hidden = false;
        editar.hidden = true;
      };
    }

    if (cancelar && editor && editar) {
      cancelar.onclick = () => {
        editor.hidden = true;
        editar.hidden = false;
        v40Mensaje("rehabV40MensajePerfil", "");
      };
    }

    const rolSelect = document.getElementById("rehabV40Rol");
    const especialidadSelect = document.getElementById("rehabV40Especialidad");
    if (rolSelect && especialidadSelect) {
      rolSelect.onchange = () => {
        especialidadSelect.innerHTML = v40OpcionesEspecialidad(rolSelect.value, null);
      };
    }

    const guardarPerfil = document.getElementById("rehabV40GuardarPerfil");
    if (guardarPerfil) {
      guardarPerfil.onclick = async function () {
        const nombre = String(
          document.getElementById("rehabV40Nombre")?.value || ""
        ).trim();
        const rol = String(
          document.getElementById("rehabV40Rol")?.value || v40Perfil.role
        ).trim();
        const specialty = String(
          document.getElementById("rehabV40Especialidad")?.value || ""
        ).trim();

        if (nombre.length < 2) {
          v40Mensaje(
            "rehabV40MensajePerfil",
            "Escribe un nombre de al menos 2 caracteres.",
            "error"
          );
          return;
        }

        guardarPerfil.disabled = true;

        try {
          const { error } = await v40Cloud
            .from("rehab_profiles")
            .update({
              full_name: nombre,
              role: rol,
              specialty: specialty || "other",
            })
            .eq("user_id", v40User.id);

          if (error) throw error;

          // V42: el nombre Cloud también actualiza el perfil local activo.
          // Así Inicio, Entrenamiento, Resultados y Progreso muestran el mismo nombre.
          try {
            if (typeof obtenerPerfilActivo === "function") {
              const perfilLocalActivo = obtenerPerfilActivo();

              if (perfilLocalActivo) {
                perfilLocalActivo.nombre = nombre;

                if (typeof guardarDatos === "function") {
                  guardarDatos();
                }

                if (typeof actualizarNombresPerfil === "function") {
                  actualizarNombresPerfil();
                }
              }
            }
          } catch (syncNombreError) {
            console.warn("V42 sincronizar nombre local:", syncNombreError);
          }

          v40Mensaje("rehabV40MensajePerfil", "Datos actualizados correctamente.", "ok");

          setTimeout(() => v40Render(contentId), 500);
        } catch (error) {
          v40Mensaje("rehabV40MensajePerfil", rehabMensajeError(error), "error");
        } finally {
          guardarPerfil.disabled = false;
        }
      };
    }

    const cambiarPassword = document.getElementById("rehabV40CambiarPassword");
    if (cambiarPassword) {
      cambiarPassword.onclick = async function () {
        const p1 = String(document.getElementById("rehabV40Password1")?.value || "");
        const p2 = String(document.getElementById("rehabV40Password2")?.value || "");

        if (p1.length < 8) {
          v40Mensaje(
            "rehabV40MensajePassword",
            "La contraseña debe tener al menos 8 caracteres.",
            "error"
          );
          return;
        }

        if (p1 !== p2) {
          v40Mensaje("rehabV40MensajePassword", "Las contraseñas no coinciden.", "error");
          return;
        }

        cambiarPassword.disabled = true;

        try {
          const { error } = await v40Cloud.auth.updateUser({
            password: p1,
          });

          if (error) throw error;

          document.getElementById("rehabV40Password1").value = "";
          document.getElementById("rehabV40Password2").value = "";

          v40Mensaje(
            "rehabV40MensajePassword",
            "Contraseña actualizada correctamente.",
            "ok"
          );
        } catch (error) {
          v40Mensaje("rehabV40MensajePassword", rehabMensajeError(error), "error");
        } finally {
          cambiarPassword.disabled = false;
        }
      };
    }

    const sonidos = document.getElementById("rehabV40Sonidos");
    if (sonidos) {
      sonidos.onchange = function () {
        ajustesApp.sonidos = sonidos.checked;

        try {
          if (typeof ajusteSonidos !== "undefined" && ajusteSonidos) {
            ajusteSonidos.checked = sonidos.checked;
          }
          if (typeof sonidosActivados !== "undefined" && sonidosActivados) {
            sonidosActivados.checked = sonidos.checked;
          }
          guardarAjustes();
        } catch (error) {
          console.warn("V40 sonidos:", error);
        }
      };
    }

    const tema = document.getElementById("rehabV40Tema");
    if (tema) {
      tema.onchange = function () {
        ajustesApp.tema = tema.value;

        try {
          if (typeof ajusteTema !== "undefined" && ajusteTema) {
            ajusteTema.value = tema.value;
          }
          aplicarTema(tema.value);
          guardarAjustes();
        } catch (error) {
          console.warn("V40 tema:", error);
        }
      };
    }

    document.querySelectorAll("[data-v40-desvincular]").forEach((btn) => {
      btn.onclick = async function () {
        const otroId = btn.dataset.v40Desvincular;
        const nombre = btn.dataset.v40Nombre || "esta cuenta";

        let confirmar = false;

        if (typeof window.v36ConfirmarDesvinculacion === "function") {
          confirmar = await window.v36ConfirmarDesvinculacion(nombre);
        } else {
          confirmar = confirm(`¿Desvincular a ${nombre}?`);
        }

        if (!confirmar) return;

        try {
          const { data, error } = await v40Cloud.rpc("rehab_unlink_relationship", {
            p_other_user_id: otroId,
          });

          if (error) throw error;
          if (!data) throw new Error("No se encontró una vinculación activa.");

          if (typeof window.rehabV33ActualizarInterfaz === "function") {
            await window.rehabV33ActualizarInterfaz();
          }

          await v40Render(contentId);
        } catch (error) {
          alert(rehabMensajeError(error));
        }
      };
    });

    const cerrar = document.getElementById("rehabV40CerrarSesion");
    if (cerrar) {
      cerrar.onclick = async function () {
        const confirmar = confirm(
          "¿Cerrar sesión en RehabPod?\n\nTus datos Cloud permanecerán guardados."
        );

        if (!confirmar) return;

        cerrar.disabled = true;

        try {
          const { error } = await v40Cloud.auth.signOut();
          if (error) throw error;

          if (typeof window.rehabV33ActualizarInterfaz === "function") {
            await window.rehabV33ActualizarInterfaz();
          }

          await v40Render(contentId);
        } catch (error) {
          alert(rehabMensajeError(error));
        } finally {
          cerrar.disabled = false;
        }
      };
    }
  }

  async function v40AbrirCuenta() {
    try {
      if (typeof window.rehabV38Cuenta === "function") {
        await window.rehabV38Cuenta();
      } else if (typeof window.rehabV35AbrirCuenta === "function") {
        await window.rehabV35AbrirCuenta();
      }

      await v40Render("rehabV35ContenidoCuenta");
    } catch (error) {
      console.error("V40 abrir Cuenta:", error);
    }
  }

  function v40Iniciar() {
    v40AgregarEstilos();
    window.rehabV40RenderCuenta = v40Render;

    console.log(
      "RehabPod V40: Cuenta mejorada con edición de perfil, seguridad y sesión."
    );
  }

  v40Iniciar();

  window.rehabV40AbrirCuenta = v40AbrirCuenta;
})();

// =====================================================
// REHABPOD V41
// ESTADOS AVANZADOS DE RUTINAS + CENTRO DE NOTIFICACIONES
//
// Estados visuales:
// - Pendiente
// - Para hoy
// - Atrasada
// - En progreso
// - Completada
// - Cancelada
//
// Notificaciones Cloud:
// - Nueva rutina asignada -> Usuario
// - Usuario inicia rutina -> Profesional
// - Usuario completa rutina -> Profesional
// - Rutina cancelada -> contraparte
//
// La campana muestra notificaciones dentro de RehabPod.
// Si el navegador tiene permiso, también muestra un aviso mientras
// RehabPod está abierto. Las notificaciones push con la app cerrada
// se implementarán más adelante.
// =====================================================

(function () {
  let v41Cloud = null;
  let v41User = null;
  let v41Intervalo = null;
  let v41UltimosIds = new Set();

  function v41Esc(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")

      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function v41Cliente() {
    if (typeof window.rehabGetSupabaseClient !== "function") return null;

    try {
      v41Cloud = await window.rehabGetSupabaseClient();
      const { data } = await v41Cloud.auth.getSession();
      v41User = data?.session?.user || null;
      return v41Cloud;
    } catch (error) {
      console.warn("V41 Cloud:", error);
      return null;
    }
  }

  function v41AgregarEstilos() {
    if (document.getElementById("rehabV41Estilos")) return;

    const st = document.createElement("style");
    st.id = "rehabV41Estilos";
    st.textContent = `
      #rehabV41Bell{
        position:fixed;top:14px;right:14px;z-index:100650;
        width:46px;height:46px;border-radius:50%;border:1px solid var(--borde);
        background:var(--tarjeta);color:var(--texto);cursor:pointer;
        display:none;align-items:center;justify-content:center;font-size:20px;
        box-shadow:0 9px 25px rgba(0,0,0,.24);backdrop-filter:blur(10px)
      }
      .tema-claro #rehabV41Bell{background:var(--tarjeta);color:var(--texto)}
      #rehabV41Badge{
        position:absolute;right:-2px;top:-3px;min-width:19px;height:19px;
        padding:0 4px;border-radius:999px;background:#ef4444;color:#fff;
        display:none;align-items:center;justify-content:center;
        font-size:10px;font-weight:950;border:2px solid rgba(15,23,42,.9)
      }
      .rehabV41Overlay{
        position:fixed;inset:0;z-index:100900;background:rgba(2,6,23,.84);
        backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:16px
      }
      .rehabV41Overlay[hidden]{display:none!important}
      .rehabV41Modal{
        width:min(620px,100%);max-height:88vh;overflow:auto;border-radius:24px;padding:18px;
        background:var(--tarjeta);color:inherit;
        border:1px solid rgba(148,163,184,.22);box-shadow:0 26px 80px rgba(0,0,0,.45)
      }
      .tema-claro .rehabV41Modal{background:#fff}
      .rehabV41Head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
      .rehabV41Cerrar{
        width:40px;height:40px;border-radius:11px;border:1px solid rgba(148,163,184,.24);
        background:rgba(148,163,184,.08);color:inherit;font-size:20px;cursor:pointer
      }
      .rehabV41Acciones{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
      .rehabV41Btn{
        border:0;border-radius:11px;padding:9px 12px;font-weight:900;cursor:pointer;
        background:var(--acento);color:var(--acento-tinta)
      }
      .rehabV41Btn.sec{
        background:rgba(148,163,184,.14);color:inherit;border:1px solid rgba(148,163,184,.24)
      }
      .rehabV41Item{
        padding:12px;border-radius:14px;margin:8px 0;
        border:1px solid rgba(148,163,184,.16);background:rgba(148,163,184,.045)
      }
      .rehabV41Item.nueva{
        border-color:rgba(59,130,246,.30);background:rgba(59,130,246,.08)
      }
      .rehabV41Item small{display:block;opacity:.62;margin-top:5px}
      .rehabV41Vacio{
        padding:18px;text-align:center;border-radius:14px;
        border:1px dashed rgba(148,163,184,.22);opacity:.72
      }
    `;
    document.head.appendChild(st);
  }

  function v41CrearUI() {
    if (!document.getElementById("rehabV41Bell")) {
      const bell = document.createElement("button");
      bell.id = "rehabV41Bell";
      bell.type = "button";
      bell.setAttribute("aria-label", "Notificaciones");
      bell.innerHTML = `🔔<span id="rehabV41Badge"></span>`;
      bell.onclick = v41AbrirCentro;
      document.body.appendChild(bell);
    }

    if (!document.getElementById("rehabV41Overlay")) {
      const ov = document.createElement("div");
      ov.id = "rehabV41Overlay";
      ov.className = "rehabV41Overlay";
      ov.hidden = true;
      ov.innerHTML = `
        <div class="rehabV41Modal">
          <div class="rehabV41Head">
            <div>
              <div style="font-size:.72rem;opacity:.62;font-weight:900">REHABPOD</div>
              <h2 style="margin:0">Notificaciones</h2>
            </div>
            <button id="rehabV41Cerrar" class="rehabV41Cerrar" type="button">×</button>
          </div>
          <div class="rehabV41Acciones">
            <button id="rehabV41LeerTodas" class="rehabV41Btn sec" type="button">
              MARCAR TODO COMO LEÍDO
            </button>
            <button id="rehabV41Permiso" class="rehabV41Btn sec" type="button">
              ACTIVAR AVISOS
            </button>
          </div>
          <div id="rehabV41Lista">Cargando...</div>
        </div>
      `;
      document.body.appendChild(ov);

      document.getElementById("rehabV41Cerrar").onclick = () => {
        ov.hidden = true;
      };

      ov.addEventListener("click", (e) => {
        if (e.target === ov) ov.hidden = true;
      });

      document.getElementById("rehabV41LeerTodas").onclick = v41MarcarTodasLeidas;
      document.getElementById("rehabV41Permiso").onclick = v41PedirPermiso;
    }
  }

  function v41Fecha(valor) {
    if (!valor) return "";
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  }

  async function v41ObtenerNotificaciones(limite = 40) {
    const cloud = await v41Cliente();
    if (!cloud || !v41User) return [];

    const { data, error } = await cloud
      .from("rehab_notifications")
      .select("id, type, title, message, read_at, created_at, assignment_id")
      .eq("user_id", v41User.id)
      .order("created_at", { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data || [];
  }

  async function v41ActualizarBadge(mostrarAvisos = false) {
    const bell = document.getElementById("rehabV41Bell");
    const badge = document.getElementById("rehabV41Badge");
    if (!bell || !badge) return;

    try {
      const cloud = await v41Cliente();

      if (!cloud || !v41User) {
        bell.style.display = "none";
        badge.style.display = "none";
        return;
      }

      bell.style.display = "flex";

      const notificaciones = await v41ObtenerNotificaciones(30);
      const nuevas = notificaciones.filter((n) => !n.read_at);

      badge.textContent = nuevas.length > 99 ? "99+" : String(nuevas.length);
      badge.style.display = nuevas.length ? "flex" : "none";

      if (mostrarAvisos && typeof Notification !== "undefined") {
        if (Notification.permission === "granted") {
          for (const n of nuevas) {
            if (v41UltimosIds.has(n.id)) continue;
            v41UltimosIds.add(n.id);

            try {
              new Notification(n.title || "RehabPod", {
                body: n.message || "",
                icon: "logo-icon.png",
              });
            } catch (_) {}
          }
        }
      }

      // Primera carga: registramos ids sin disparar avisos antiguos.
      if (!v41UltimosIds.size) {
        notificaciones.forEach((n) => v41UltimosIds.add(n.id));
      }
    } catch (error) {
      console.warn("V41 badge:", error);
    }
  }

  async function v41AbrirCentro() {
    const ov = document.getElementById("rehabV41Overlay");
    const host = document.getElementById("rehabV41Lista");
    if (!ov || !host) return;

    ov.hidden = false;
    host.innerHTML = `<div class="rehabV41Vacio">Cargando...</div>`;

    try {
      const lista = await v41ObtenerNotificaciones(50);

      if (!lista.length) {
        host.innerHTML = `
          <div class="rehabV41Vacio">
            No tienes notificaciones todavía.
          </div>
        `;
        return;
      }

      host.innerHTML = lista
        .map(
          (n) => `
          <div class="rehabV41Item ${n.read_at ? "" : "nueva"}">
            <strong>${v41Esc(n.title || "RehabPod")}</strong>
            <div style="margin-top:4px;line-height:1.45">${v41Esc(n.message || "")}</div>
            <small>${v41Esc(v41Fecha(n.created_at))}</small>
          </div>
        `
        )
        .join("");
    } catch (error) {
      host.innerHTML = `
        <div class="rehabV41Vacio">
          ${v41Esc(rehabMensajeError(error))}
        </div>
      `;
    }
  }

  async function v41MarcarTodasLeidas() {
    try {
      const cloud = await v41Cliente();
      if (!cloud || !v41User) return;

      const { error } = await cloud
        .from("rehab_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", v41User.id)
        .is("read_at", null);

      if (error) throw error;

      await v41AbrirCentro();
      await v41ActualizarBadge(false);
    } catch (error) {
      alert(rehabMensajeError(error));
    }
  }

  async function v41PedirPermiso() {
    if (typeof Notification === "undefined") {
      alert("Este navegador no admite avisos del sistema.");
      return;
    }

    try {
      const permiso = await Notification.requestPermission();

      if (permiso === "granted") {
        alert(
          "Avisos activados. RehabPod podrá mostrar notificaciones mientras la app esté abierta."
        );
      } else {
        alert("Los avisos no fueron autorizados.");
      }
    } catch (error) {
      alert(rehabMensajeError(error));
    }
  }

  async function v41CancelarAsignacion(assignmentId) {
    const razon = prompt("Motivo de cancelación (opcional):", "");

    // Si se pulsa Cancelar en prompt, no hacemos nada.
    if (razon === null) return;

    const confirmar = confirm(
      "¿Confirmas que deseas cancelar esta rutina asignada?\n\n" +
        "La rutina dejará de aparecer como pendiente y la otra persona recibirá una notificación."
    );

    if (!confirmar) return;

    try {
      const cloud = await v41Cliente();
      if (!cloud || !v41User) {
        throw new Error("Primero inicia sesión.");
      }

      const { data, error } = await cloud.rpc("rehab_cancel_assignment", {
        p_assignment_id: assignmentId,
        p_reason: String(razon || "").trim() || null,
      });

      if (error) throw error;
      if (!data) throw new Error("No se pudo cancelar la asignación.");

      if (typeof window.rehabV28Abrir === "function") {
        await window.rehabV28Abrir();
      }

      await v41ActualizarBadge(false);
    } catch (error) {
      alert(rehabMensajeError(error));
    }
  }

  function v41ActivarCancelaciones() {
    document.addEventListener("click", function (e) {
      const btn = e.target.closest?.("[data-v41-cancel-assignment]");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      v41CancelarAsignacion(btn.dataset.v41CancelAssignment);
    });
  }

  async function v41PrepararAuth() {
    const cloud = await v41Cliente();
    if (!cloud) return;

    try {
      cloud.auth.onAuthStateChange(function () {
        setTimeout(() => {
          v41ActualizarBadge(false);
        }, 120);
      });
    } catch (_) {}
  }

  function v41IniciarPolling() {
    if (v41Intervalo) clearInterval(v41Intervalo);

    v41Intervalo = setInterval(() => {
      v41ActualizarBadge(true);
    }, 60000);

    window.addEventListener("focus", () => {
      v41ActualizarBadge(true);
    });
  }

  async function v41Iniciar() {
    v41AgregarEstilos();
    v41CrearUI();
    v41ActivarCancelaciones();
    await v41PrepararAuth();
    await v41ActualizarBadge(false);
    v41IniciarPolling();

    console.log("RehabPod V41: estados avanzados + centro de notificaciones activados.");
  }

  v41Iniciar();

  window.rehabV41AbrirNotificaciones = v41AbrirCentro;
  window.rehabV41ActualizarNotificaciones = v41ActualizarBadge;
})();

// =====================================================
// REHABPOD V42
// SINCRONIZACION / OFFLINE - FASE 1
//
// - Cachea la estructura principal de la app con Service Worker.
// - Cola local para resultados Cloud que no pudieron enviarse.
// - Reintenta automáticamente al recuperar Internet.
// - Evita duplicar una sesión: comprueba assignment_id antes de insertar.
// - Indicador pequeño: En línea / Sin conexión / Pendientes.
// - Nombre Cloud y perfil local se mantienen sincronizados (parche V40).
//
// IMPORTANTE:
// Esta fase protege especialmente el RESULTADO del entrenamiento.
// La primera carga de RehabPod y la descarga de rutinas nuevas todavía
// requieren haber tenido conexión previamente.
// =====================================================

(function () {
  const V42_QUEUE_KEY = "rehabpodSyncQueueV42";
  let v42Sincronizando = false;

  function v42LeerCola() {
    try {
      const raw = localStorage.getItem(V42_QUEUE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  }

  function v42GuardarCola(cola) {
    localStorage.setItem(V42_QUEUE_KEY, JSON.stringify(cola || []));
    v42ActualizarIndicador();
  }

  function v42Id() {
    if (crypto?.randomUUID) return crypto.randomUUID();
    return "sync_" + Date.now() + "_" + Math.random().toString(16).slice(2);
  }

  function v42EncolarSesion(payload) {
    if (!payload?.assignment_id || !payload?.user_id) return false;

    const cola = v42LeerCola();

    // Una sola entrada pendiente por asignación.
    const existente = cola.find(
      (x) =>
        x.tipo === "routine_session" && x.payload?.assignment_id === payload.assignment_id
    );

    if (existente) {
      existente.payload = payload;
      existente.updated_at = new Date().toISOString();
    } else {
      cola.push({
        id: v42Id(),
        tipo: "routine_session",
        payload,
        created_at: new Date().toISOString(),
        intentos: 0,
        ultimo_error: null,
      });
    }

    v42GuardarCola(cola);
    console.log("RehabPod V42: resultado guardado en cola offline.");
    return true;
  }

  async function v42Cliente() {
    if (typeof window.rehabGetSupabaseClient !== "function") return null;
    return await window.rehabGetSupabaseClient();
  }

  async function v42SincronizarSesion(cloud, item) {
    const p = item.payload;

    const { data: sesion } = await cloud.auth.getSession();
    const authUser = sesion?.session?.user || null;

    if (!authUser) {
      throw new Error("Debes iniciar sesión para sincronizar.");
    }

    if (authUser.id !== p.user_id) {
      throw new Error("La cola pertenece a otra cuenta.");
    }

    // Si la sesión ya llegó a Supabase antes de un fallo posterior,
    // no la insertamos de nuevo.
    const { data: existente, error: buscarError } = await cloud
      .from("rehab_routine_sessions")
      .select("id")
      .eq("assignment_id", p.assignment_id)
      .eq("user_id", p.user_id)
      .limit(1);

    if (buscarError) throw buscarError;

    if (!Array.isArray(existente) || existente.length === 0) {
      const { error: insertError } = await cloud.from("rehab_routine_sessions").insert(p);

      if (insertError) throw insertError;
    }

    const { error: estadoError } = await cloud
      .from("rehab_assignments")
      .update({ status: "completed" })
      .eq("id", p.assignment_id)
      .eq("user_id", p.user_id);

    if (estadoError) throw estadoError;

    return true;
  }

  async function v42Sincronizar() {
    if (v42Sincronizando || !navigator.onLine) return;

    const colaInicial = v42LeerCola();
    if (!colaInicial.length) {
      v42ActualizarIndicador();
      return;
    }

    v42Sincronizando = true;
    v42ActualizarIndicador("sync");

    try {
      const cloud = await v42Cliente();
      if (!cloud) throw new Error("Supabase no disponible.");

      const pendientes = v42LeerCola();
      const conservar = [];

      for (const item of pendientes) {
        try {
          if (item.tipo === "routine_session") {
            await v42SincronizarSesion(cloud, item);
          } else {
            conservar.push(item);
          }
        } catch (error) {
          item.intentos = Number(item.intentos || 0) + 1;
          item.ultimo_error = String(error?.message || error || "Error");
          item.updated_at = new Date().toISOString();
          conservar.push(item);
          console.warn("V42 sincronización pendiente:", error);
        }
      }

      v42GuardarCola(conservar);

      if (conservar.length === 0) {
        console.log("RehabPod V42: sincronización completada.");

        if (typeof window.rehabV41ActualizarNotificaciones === "function") {
          window.rehabV41ActualizarNotificaciones(false);
        }
      }
    } finally {
      v42Sincronizando = false;
      v42ActualizarIndicador();
    }
  }

  function v42CrearIndicador() {
    if (document.getElementById("rehabV42Estado")) return;

    const st = document.createElement("style");
    st.id = "rehabV42Estilos";
    st.textContent = `
      #rehabV42Estado{
        position:fixed;left:14px;top:14px;z-index:100640;
        padding:7px 10px;border-radius:999px;font-size:11px;font-weight:900;
        border:1px solid var(--borde);
        background:var(--tarjeta);color:var(--texto);
        box-shadow:0 7px 22px rgba(0,0,0,.18);
        backdrop-filter:blur(8px);cursor:pointer
      }
      .tema-claro #rehabV42Estado{background:var(--tarjeta);color:var(--texto)}
    `;
    document.head.appendChild(st);

    const el = document.createElement("button");
    el.id = "rehabV42Estado";
    el.type = "button";
    el.title = "Estado de sincronización";
    el.onclick = function () {
      const n = v42LeerCola().length;
      if (!navigator.onLine) {
        alert(
          `RehabPod está sin conexión.\n\nResultados pendientes: ${n}\n\n` +
            "Puedes seguir con funciones locales. Al recuperar Internet se intentará sincronizar automáticamente."
        );
      } else if (n > 0) {
        alert(
          `Hay ${n} resultado(s) pendiente(s) de sincronizar.\n\n` +
            "RehabPod volverá a intentarlo automáticamente."
        );
        v42Sincronizar();
      } else {
        alert("RehabPod está en línea y no hay resultados pendientes.");
      }
    };
    document.body.appendChild(el);
  }

  function v42ActualizarIndicador(forzado = "") {
    const el = document.getElementById("rehabV42Estado");
    if (!el) return;

    const pendientes = v42LeerCola().length;

    if (forzado === "sync" || v42Sincronizando) {
      el.textContent = "↻ Sincronizando";
      return;
    }

    if (!navigator.onLine) {
      el.textContent = pendientes
        ? `● Sin conexión · ${pendientes} pendiente${pendientes === 1 ? "" : "s"}`
        : "● Sin conexión";
      return;
    }

    el.textContent = pendientes
      ? `● En línea · ${pendientes} pendiente${pendientes === 1 ? "" : "s"}`
      : "● En línea";
  }

  async function v42RegistrarServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.register("./sw-rehabpod.js", {
        scope: "./",
      });
      console.log("RehabPod V42: Service Worker activo.", reg.scope);
    } catch (error) {
      console.warn("V42 Service Worker:", error);
    }
  }

  async function v42Iniciar() {
    v42CrearIndicador();
    v42ActualizarIndicador();
    await v42RegistrarServiceWorker();

    window.addEventListener("online", function () {
      v42ActualizarIndicador();
      setTimeout(v42Sincronizar, 700);
    });

    window.addEventListener("offline", function () {
      v42ActualizarIndicador();
    });

    window.addEventListener("focus", function () {
      v42ActualizarIndicador();
      if (navigator.onLine) v42Sincronizar();
    });

    setTimeout(v42Sincronizar, 1800);

    console.log("RehabPod V42: sincronización offline + cola de resultados activadas.");
  }

  window.rehabV42EncolarSesion = v42EncolarSesion;
  window.rehabV42Sincronizar = v42Sincronizar;
  window.rehabV42Pendientes = () => v42LeerCola();

  v42Iniciar();
})();