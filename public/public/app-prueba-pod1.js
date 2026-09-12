// =====================================================
// REACTIPOD - PRUEBA COMPLETA POD 1
// ANDROID + CAPACITOR BLE
// =====================================================


// =====================================================
// UUID
// =====================================================

const SERVICE_UUID =
    "12345678-1234-1234-1234-123456789000";

const COMMAND_UUID =
    "12345678-1234-1234-1234-123456789001";

const BUTTON_UUID =
    "12345678-1234-1234-1234-123456789002";


// =====================================================
// PLUGIN BLE
// =====================================================

const BluetoothLe =
    window.Capacitor?.Plugins?.BluetoothLe;


// =====================================================
// VARIABLES POD 1
// =====================================================

let bluetoothInicializado = false;

let pod1 = {

    deviceId: null,

    nombre: "ReactiPod-1",

    conectado: false

};


// =====================================================
// MENSAJES EN PANTALLA
// =====================================================

function estado(texto) {

    console.log(texto);

    const caja =
        document.getElementById(
            "estadoBLE"
        );

    if (caja) {

        caja.textContent =
            texto;
    }
}


// =====================================================
// CONVERTIR TEXTO A HEX
// Para escribir en BLE
// =====================================================

function textoAHex(texto) {

    const encoder =
        new TextEncoder();

    const bytes =
        encoder.encode(
            texto
        );

    return Array.from(
        bytes
    )
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(
                        2,
                        "0"
                    )
        )
        .join("");
}


// =====================================================
// CONVERTIR HEX RECIBIDO A TEXTO
// =====================================================

function hexATexto(hex) {

    if (!hex) {

        return "";
    }

    const bytes = [];

    for (
        let i = 0;
        i < hex.length;
        i += 2
    ) {

        bytes.push(

            parseInt(
                hex.substring(
                    i,
                    i + 2
                ),
                16
            )

        );
    }

    return new TextDecoder()
        .decode(
            new Uint8Array(
                bytes
            )
        );
}


// =====================================================
// INICIALIZAR BLUETOOTH
// =====================================================

async function inicializarBluetooth() {

    try {

        if (!BluetoothLe) {

            estado(
                "❌ Plugin BLE no disponible"
            );

            return false;
        }


        if (
            bluetoothInicializado
        ) {

            estado(
                "✅ Bluetooth ya inicializado"
            );

            return true;
        }


        estado(
            "Inicializando Bluetooth..."
        );


        await BluetoothLe.initialize({

            androidNeverForLocation:
                true

        });


        bluetoothInicializado =
            true;


        estado(
            "✅ Bluetooth inicializado"
        );


        return true;

    }

    catch (error) {

        console.error(
            error
        );


        estado(
            "❌ Error inicializando Bluetooth"
        );


        return false;
    }
}


// =====================================================
// BUSCAR Y CONECTAR POD 1
// =====================================================

async function conectarPod1() {

    try {

        const listo =
            await inicializarBluetooth();


        if (!listo) {

            return;
        }


        estado(
            "Buscando ReactiPod-1..."
        );


        // Mostrar selector BLE.
        const resultado =
            await BluetoothLe.requestDevice({

                services: [

                    SERVICE_UUID

                ],

                optionalServices: [

                    SERVICE_UUID

                ]

            });


        console.log(
            "Dispositivo seleccionado:",
            resultado
        );


        const deviceId =
            resultado.deviceId;


        if (!deviceId) {

            estado(
                "❌ No se obtuvo deviceId"
            );

            return;
        }


        pod1.deviceId =
            deviceId;


        estado(
            "Conectando..."
        );


        // Intentamos desconectar primero
        // por si Android cree que sigue conectado.
        try {

            await BluetoothLe.disconnect({

                deviceId:
                    deviceId

            });

        }

        catch (error) {

            // No pasa nada si no estaba conectado.
        }


        await BluetoothLe.connect({

            deviceId:
                deviceId

        });


        pod1.conectado =
            true;


        estado(
            "✅ ReactiPod-1 conectado"
        );


        document
            .getElementById(
                "btnConectar"
            )
            .textContent =
            "✅ POD 1 CONECTADO";


        // Suscribirse al botón.
        await iniciarNotificacionesBoton();

    }

    catch (error) {

        console.error(
            "Error conectando:",
            error
        );


        estado(
            "❌ No se pudo conectar ReactiPod-1"
        );
    }
}


// =====================================================
// ESCUCHAR BOTÓN DEL POD
// =====================================================

async function iniciarNotificacionesBoton() {

    if (
        !pod1.deviceId
    ) {

        return;
    }


    try {

        await BluetoothLe.startNotifications(

            {

                deviceId:
                    pod1.deviceId,

                service:
                    SERVICE_UUID,

                characteristic:
                    BUTTON_UUID

            },

            evento => {

                console.log(
                    "Notificación:",
                    evento
                );

            }

        );


        /*
        Algunas versiones del bridge nativo
        trabajan mediante listeners en lugar
        de pasar callback directamente.

        Por eso agregamos también listener.
        */

        if (
            BluetoothLe.addListener
        ) {

            const nombreEvento =

                "notification|" +
                pod1.deviceId +
                "|" +
                SERVICE_UUID +
                "|" +
                BUTTON_UUID;


            await BluetoothLe.addListener(

                nombreEvento,

                evento => {

                    console.log(
                        "Valor recibido:",
                        evento
                    );


                    let texto = "";


                    if (
                        evento.value
                    ) {

                        texto =
                            hexATexto(
                                evento.value
                            );
                    }


                    console.log(
                        "Texto:",
                        texto
                    );


                    if (
                        texto.trim() ===
                        "PRESS"
                    ) {

                        podPresionado();
                    }

                }

            );
        }


        estado(
            "✅ Pod conectado y escuchando botón"
        );

    }

    catch (error) {

        console.error(
            "Error notificaciones:",
            error
        );


        estado(
            "⚠️ Conectado, pero error escuchando botón"
        );
    }
}


// =====================================================
// EVENTO CUANDO PRESIONAMOS EL POD
// =====================================================

function podPresionado() {

    console.log(
        "POD 1 PRESIONADO"
    );


    const indicador =
        document.getElementById(
            "indicadorPod"
        );


    indicador.style.background =
        "#22c55e";


    indicador.style.boxShadow =
        "0 0 40px #22c55e";


    document
        .getElementById(
            "ultimoEvento"
        )
        .textContent =
        "✅ PRESS recibido";


    setTimeout(
        () => {

            indicador.style.background =
                "#374151";


            indicador.style.boxShadow =
                "none";

        },
        300
    );
}


// =====================================================
// ENVIAR COMANDO
// =====================================================

async function enviarComando(
    comando
) {

    if (
        !pod1.conectado ||
        !pod1.deviceId
    ) {

        estado(
            "⚠️ Primero conecta ReactiPod-1"
        );

        return;
    }


    try {

        const valorHex =
            textoAHex(
                comando
            );


        await BluetoothLe.write({

            deviceId:
                pod1.deviceId,

            service:
                SERVICE_UUID,

            characteristic:
                COMMAND_UUID,

            value:
                valorHex

        });


        estado(
            `✅ Comando enviado: ${comando}`
        );

    }

    catch (error) {

        console.error(
            "Error escribiendo:",
            error
        );


        estado(
            `❌ Error enviando ${comando}`
        );
    }
}


// =====================================================
// DESCONECTAR
// =====================================================

async function desconectarPod1() {

    if (
        !pod1.deviceId
    ) {

        return;
    }


    try {

        await BluetoothLe.disconnect({

            deviceId:
                pod1.deviceId

        });

    }

    catch (error) {

        console.error(
            error
        );
    }


    pod1.conectado =
        false;


    pod1.deviceId =
        null;


    estado(
        "Pod desconectado"
    );


    document
        .getElementById(
            "btnConectar"
        )
        .textContent =
        "CONECTAR REACTIPOD-1";
}


// =====================================================
// INTERFAZ
// =====================================================

function crearInterfaz() {

    document.body.innerHTML = `

        <div style="
            min-height:100vh;
            background:#07111f;
            color:white;
            font-family:Arial,sans-serif;
            padding:20px;
        ">

            <div style="
                max-width:500px;
                margin:auto;
            ">


                <h1 style="
                    text-align:center;
                    color:#22c55e;
                    margin-bottom:5px;
                ">
                    ReactiPod
                </h1>


                <p style="
                    text-align:center;
                    color:#9ca3af;
                    margin-bottom:25px;
                ">
                    Prueba Android BLE - Pod 1
                </p>


                <div style="
                    background:#111c2d;
                    padding:20px;
                    border-radius:18px;
                    margin-bottom:15px;
                    text-align:center;
                ">

                    <div
                        id="indicadorPod"
                        style="
                            width:100px;
                            height:100px;
                            margin:10px auto 20px;
                            border-radius:50%;
                            background:#374151;
                        "
                    ></div>


                    <h2>
                        ReactiPod-1
                    </h2>


                    <p
                        id="ultimoEvento"
                        style="
                            color:#9ca3af;
                        "
                    >
                        Esperando...
                    </p>

                </div>


                <button
                    id="btnConectar"
                    style="
                        width:100%;
                        padding:16px;
                        margin-bottom:12px;
                        border:none;
                        border-radius:12px;
                        background:#22c55e;
                        color:white;
                        font-weight:bold;
                        font-size:15px;
                    "
                >
                    CONECTAR REACTIPOD-1
                </button>


                <div style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:10px;
                ">

                    <button
                        id="btnRojo"
                        style="
                            padding:16px;
                            border:none;
                            border-radius:12px;
                            background:red;
                            color:white;
                            font-weight:bold;
                        "
                    >
                        ROJO
                    </button>


                    <button
                        id="btnVerde"
                        style="
                            padding:16px;
                            border:none;
                            border-radius:12px;
                            background:green;
                            color:white;
                            font-weight:bold;
                        "
                    >
                        VERDE
                    </button>


                    <button
                        id="btnAzul"
                        style="
                            padding:16px;
                            border:none;
                            border-radius:12px;
                            background:#2563eb;
                            color:white;
                            font-weight:bold;
                        "
                    >
                        AZUL
                    </button>


                    <button
                        id="btnAmarillo"
                        style="
                            padding:16px;
                            border:none;
                            border-radius:12px;
                            background:#d6a500;
                            color:white;
                            font-weight:bold;
                        "
                    >
                        AMARILLO
                    </button>

                </div>


                <button
                    id="btnApagar"
                    style="
                        width:100%;
                        padding:16px;
                        margin-top:10px;
                        border:none;
                        border-radius:12px;
                        background:#374151;
                        color:white;
                        font-weight:bold;
                    "
                >
                    APAGAR
                </button>


                <button
                    id="btnDesconectar"
                    style="
                        width:100%;
                        padding:16px;
                        margin-top:10px;
                        border:none;
                        border-radius:12px;
                        background:#b91c1c;
                        color:white;
                        font-weight:bold;
                    "
                >
                    DESCONECTAR
                </button>


                <div
                    id="estadoBLE"
                    style="
                        margin-top:20px;
                        padding:15px;
                        background:#172337;
                        border-radius:12px;
                        text-align:center;
                        color:#9ca3af;
                    "
                >
                    Bluetooth listo para probar
                </div>

            </div>

        </div>
    `;


    document
        .getElementById(
            "btnConectar"
        )
        .onclick =
        conectarPod1;


    document
        .getElementById(
            "btnRojo"
        )
        .onclick =
        () =>
            enviarComando(
                "red"
            );


    document
        .getElementById(
            "btnVerde"
        )
        .onclick =
        () =>
            enviarComando(
                "green"
            );


    document
        .getElementById(
            "btnAzul"
        )
        .onclick =
        () =>
            enviarComando(
                "blue"
            );


    document
        .getElementById(
            "btnAmarillo"
        )
        .onclick =
        () =>
            enviarComando(
                "yellow"
            );


    document
        .getElementById(
            "btnApagar"
        )
        .onclick =
        () =>
            enviarComando(
                "off"
            );


    document
        .getElementById(
            "btnDesconectar"
        )
        .onclick =
        desconectarPod1;
}


// =====================================================
// INICIO
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        crearInterfaz();

        inicializarBluetooth();

    }

);