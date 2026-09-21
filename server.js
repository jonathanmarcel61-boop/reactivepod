"use strict";

const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const http = require("http");
const WebSocket = require("ws");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const WS_TOKEN = process.env.REHABPOD_WS_TOKEN || "";
const MAX_CLIENTS = 20;
const MAX_MESSAGES_PER_10S = 100;
const VALID_COLORS = new Set([
  "red", "green", "blue", "yellow", "purple", "orange", "cyan", "white", "off",
]);

if (HOST !== "127.0.0.1" && HOST !== "localhost" && WS_TOKEN.length < 24) {
  throw new Error(
    "Para exponer el servidor en la red define REHABPOD_WS_TOKEN con al menos 24 caracteres."
  );
}

const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
        frameSrc: [
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
          "https://player.vimeo.com",
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(express.static("public", { index: "index.html", maxAge: "1h", etag: true }));

const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  maxPayload: 4 * 1024,
  perMessageDeflate: false,
});
const pods = new Map();

function seguroIgual(a, b) {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function enteroPod(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id >= 1 && id <= 4 ? id : null;
}

function enviar(ws, data) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}

function difundir(data, excepto = null) {
  for (const cliente of wss.clients) {
    if (cliente !== excepto && cliente.autenticado) enviar(cliente, data);
  }
}

wss.on("connection", (ws) => {
  if (wss.clients.size > MAX_CLIENTS) {
    ws.close(1013, "Servidor ocupado");
    return;
  }

  ws.autenticado = !WS_TOKEN;
  ws.podId = null;
  ws.ventanaInicio = Date.now();
  ws.mensajesVentana = 0;

  const limiteAutenticacion = setTimeout(() => {
    if (!ws.autenticado) ws.close(1008, "Autenticación requerida");
  }, 5000);

  ws.on("message", (message) => {
    const ahora = Date.now();
    if (ahora - ws.ventanaInicio >= 10_000) {
      ws.ventanaInicio = ahora;
      ws.mensajesVentana = 0;
    }
    ws.mensajesVentana += 1;
    if (ws.mensajesVentana > MAX_MESSAGES_PER_10S) {
      ws.close(1008, "Demasiados mensajes");
      return;
    }

    let data;
    try {
      data = JSON.parse(message.toString("utf8"));
    } catch (_) {
      enviar(ws, { type: "error", code: "invalid_json" });
      return;
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) return;

    if (!ws.autenticado) {
      if (data.type !== "auth" || !seguroIgual(data.token, WS_TOKEN)) {
        ws.close(1008, "Credenciales inválidas");
        return;
      }
      ws.autenticado = true;
      clearTimeout(limiteAutenticacion);
      enviar(ws, { type: "authenticated" });
      return;
    }

    if (data.type === "register") {
      const podId = enteroPod(data.podId);
      if (!podId) return;
      ws.podId = podId;
      pods.set(podId, ws);
      enviar(ws, { type: "registered", podId });
      return;
    }

    if (data.type === "press") {
      const podId = ws.podId || enteroPod(data.podId);
      if (!podId) return;
      difundir({ type: "podPress", podId }, ws);
      return;
    }

    if (data.type === "setColor") {
      const podId = enteroPod(data.podId);
      const color = String(data.color || "").toLowerCase();
      if (!podId || !VALID_COLORS.has(color)) return;
      const pod = pods.get(podId);
      if (pod) enviar(pod, { type: "setColor", color });
    }
  });

  ws.on("close", () => {
    clearTimeout(limiteAutenticacion);
    if (ws.podId && pods.get(ws.podId) === ws) pods.delete(ws.podId);
  });

  ws.on("error", () => {});
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor RehabPod iniciado en http://${HOST}:${PORT}`);
  if (!WS_TOKEN) console.log("WebSocket sin token: permitido únicamente en localhost.");
});
