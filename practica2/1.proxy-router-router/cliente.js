"use strict";

const zmq = require("zeromq");

// Crear un socket 'dealer' y establecer su identidad basada en el PID del proceso
const sock = zmq.socket("dealer");
sock.identity = `pid_${process.pid}`;
sock.connect("tcp://127.0.0.1:1112");

// Envía un mensaje al servidor basado en argumentos pasados al script
getFromServer(process.argv[2], process.argv[3], process.argv[4]);

// Escucha respuestas del servidor
sock.on("message", function (...args) {
  // Asume que el segundo argumento es el mensaje
  if (args[1]) {
    console.log(args[1].toString());
  } else {
    console.error("Unexpected message format.");
  }
});

/**
 * Envía un mensaje estructurado al servidor.
 * @param {string} server - El servidor de destino.
 * @param {string} op - La operación a realizar.
 * @param {string} args - Argumentos para la operación.
 */
function getFromServer(server, op, args) {
  const message = {
    fuente: sock.identity,
    destino: server,
    op: op,
    args: args,
  };
  sock.send(["", JSON.stringify(message)]);
}

// Cierra el socket correctamente al recibir una señal de interrupción
process.on("SIGINT", function () {
  console.log("Closing client socket...");
  sock.close();
});
