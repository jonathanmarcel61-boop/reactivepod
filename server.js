const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const helmet = require("helmet");

const app = express();

app.use(helmet());

const server = http.createServer(app);

// Límite de tamaño de mensaje (64 KB): estos son solo mensajes de control
// cortos (registrar pod, pulsación, color). Sin este límite, cualquiera
// que se conecte al WebSocket podría mandar mensajes enormes y agotar la
// memoria del servidor (ataque de denegación de servicio).
const wss = new WebSocket.Server({ server, maxPayload: 64 * 1024 });

app.use(express.static("public"));

let pod1 = null;

wss.on("connection", (ws) => {

    console.log("Nuevo dispositivo conectado");

    ws.on("message", (message) => {

        const texto = message.toString();

        console.log("Mensaje recibido:", texto);

        let data;

        try {
            data = JSON.parse(texto);
        } catch (error) {
            console.log("Mensaje no válido");
            return;
        }

        // Registrar POD
         if (data.type === "register" && data.podId === 1) {

            pod1 = ws;

           console.log("POD 1 registrado");

           return;
        }

        // Pulsación del POD
        if (data.type === "press") {

            enviarATodos({
                type: "podPress",
                podId: data.podId
            });

        }

        // Mensaje enviado desde la WEB
        if (data.type === "setColor") {

            if (pod1 && pod1.readyState === WebSocket.OPEN) {

                pod1.send(JSON.stringify({
                    type: "setColor",
                    color: data.color
                }));

            }
        }

    });

    ws.on("close", () => {

        if (ws === pod1) {
            pod1 = null;
            console.log("POD 1 desconectado");
        }

    });

});

function enviarATodos(data) {

    const mensaje = JSON.stringify(data);

    wss.clients.forEach((cliente) => {

        if (cliente.readyState === WebSocket.OPEN) {
            cliente.send(mensaje);
        }

    });

}

server.listen(3000, () => {

    console.log("Servidor ReactiPod iniciado");
    console.log("Abrir en: http://localhost:3000");

});