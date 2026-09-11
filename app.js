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

let datosApp = null;

let ajustesApp = {
  sonidos: true,

  dificultad: "media",

  coloresPods: ["red", "green", "blue", "yellow"],

  tema: "oscuro",
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
  ];

  pantallas.forEach((p) => p.classList.remove("activa"));

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

    console.log("🔎 Buscando ReactiPods...");

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

  const nuevo = {
    id: Date.now().toString(),

    nombre,

    historial: [],

    objetivo: 0.5,

    foto: "",
  };

  datosApp.perfiles.push(nuevo);

  datosApp.perfilActivoId = nuevo.id;

  guardarDatos();

  actualizarNombresPerfil();

  mostrarPerfiles();

  actualizarResumenInicio();
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
  const zonaObjetivoRef = nombreColor
    ? nombreColor.closest(".zonaObjetivo")
    : null;

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
        <div
            style="
                width:92px;
                height:92px;
                border-radius:28px;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#22c55e;
                color:#07111f;
                font-size:46px;
                font-weight:900;
                box-shadow:0 0 45px rgba(34,197,94,.35);
            "
        >
            R
        </div>
 
        <div
            style="
                font-size:30px;
                font-weight:800;
                letter-spacing:1px;
            "
        >
            ReactiPod
        </div>
 
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
  const zonaObjetivoRef = nombreColor
    ? nombreColor.closest(".zonaObjetivo")
    : null;

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
      estado.textContent = pod.nombre
        ? `Conectado · ${pod.nombre}`
        : "Conectado";
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

  await Promise.all(
    activos.map((indice) => enviarComandoPod(indice, comando))
  );

  await new Promise((resolver) => setTimeout(resolver, duracion));

  await Promise.all(
    activos.map((indice) => enviarComandoPod(indice, "off"))
  );

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
    activos.map((indice) =>
      enviarComandoPod(indice, coloresActuales[indice].comando)
    )
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
    activos.map((indice) =>
      enviarComandoPod(indice, coloresActuales[indice].comando)
    )
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

  var tiempo =
    (performance.now() - circuitoTiempoInicio - tiempoPausado) / 1000;

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
    estado: `Circuito ${circuitoOrden
      .map((i) => rehabNumeroVisiblePod(i))
      .join("-")}`,
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

var rehabModoVirtual =
  localStorage.getItem(REHABPOD_CLAVE_MODO_VIRTUAL) === "true";

var rehabColorMemoria =
  localStorage.getItem(REHABPOD_CLAVE_COLOR_MEMORIA) || "blue";

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
    catalogoColoresPersonalizados[rehabColorMemoria] ||
    catalogoColoresPersonalizados.blue
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
    estado.textContent = "SIMULACIÓN ACTIVADA · toca un Pod en pantalla para simular el golpe";
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

var rehabColorCaza =
  localStorage.getItem(REHABPOD_CLAVE_COLOR_CAZA) || "red";

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
    catalogoColoresPersonalizados[rehabColorCaza] ||
    catalogoColoresPersonalizados.red
  );
}

function rehabColoresCazaSecundarios() {
  return REHABPOD_COLORES_CAZA
    .filter(function (clave) {
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
      descripcion: "Los Pods cambian de estímulo automáticamente. Este modo sirve para desplazamientos, seguimiento visual y ejercicios guiados sin necesidad de tocar los Pods.",
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

  var tiempo =
    (performance.now() - tiempoInicio - tiempoPausado) / 1000;

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

  if (
    modoActual === "automatico" &&
    entrenamientoActivo &&
    estabaPausado &&
    !pausado
  ) {
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

  console.log(
    "RehabPod V19: Caza de color + Cambio automático activados."
  );
})();