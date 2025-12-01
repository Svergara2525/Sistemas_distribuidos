"use strict";

const zmq = require("zeromq");

// Direcciones para los sockets del frontend y backend
const frontend = "tcp://127.0.0.1:1112";
const backend = "tcp://127.0.0.1:2221";

// Inicialización del router backend
const backRouter = zmq.socket("router");
backRouter.bind(backend, function (err) {
  if (err) throw err;
  console.log(`Backend router bound to ${backend}`);
});

// Inicialización del router frontend
const frontRouter = zmq.socket("router");
frontRouter.bind(frontend, function (err) {
  if (err) throw err;
  console.log(`Frontend router bound to ${frontend}`);
});

// Función de callback para el router backend
backRouter.on("message", function (...args) {
  const [id, , messageBuffer] = args;
  try {
    const message = JSON.parse(messageBuffer.toString());
    console.log(`Received from backend: ${JSON.stringify(message)}`);
    frontRouter.send([message.cmd.CI, "", messageBuffer]);
  } catch (err) {
    console.error("Failed to parse JSON from backend:", err);
  }
});

// Función de callback para el router frontend
frontRouter.on("message", function (...args) {
  const [id, , messageBuffer] = args;
  try {
    const message = JSON.parse(messageBuffer.toString());
    console.log(`Received from frontend: ${JSON.stringify(message)}`);
    backRouter.send([message.dest, "", messageBuffer]);
  } catch (err) {
    console.error("Failed to parse JSON from frontend:", err);
  }
});

// Manejo de la señal de interrupción para cerrar los sockets correctamente
process.on("SIGINT", function () {
  console.log("Shutting down...");
  backRouter.close();
  frontRouter.close();
});
