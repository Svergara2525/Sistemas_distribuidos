"use strict";

const zmq = require("zeromq");
const { Level } = require("level");
const fs = require("fs");

if (process.argv[2] == null) {
  console.error("Introduce un id válido para el cliente.");
  return;
}

const sock = zmq.socket("dealer");
sock.identity = process.argv[2];
sock.connect("tcp://127.0.0.1:1112");

let cmd = {};
let ob;
let op;
let numop;
let message_log = {};

getFromServer();

function eligeOb(objetos) {
  const index = Math.floor(Math.random() * objetos.length);
  return objetos[index];
}

function genera_op() {
  const operaciones = ["get", "put"];
  const index = Math.floor(Math.random() * operaciones.length);
  let op = {
    operacion: operaciones[index],
    valor:
      operaciones[index] == "get"
        ? Math.floor(Math.random() * 10) + 1
        : `${Math.floor(Math.random() * 100)} valor_${Math.floor(
            Math.random() * 100
          )}`,
  };
  return op;
}

function writeLogMessage(message, tipo_e, file) {
  message_log = {
    tipo_e: tipo_e,
    op: message.cmd.op.operacion,
    clave:
      message.cmd.op.operacion == "put"
        ? message.cmd.op.valor.split(" ")[0]
        : message.cmd.op.valor,
    valor:
      message.cmd.op.operacion == "put"
        ? message.cmd.op.valor.split(" ")[1]
        : message.res,
    n: message.cmd.numop,
    id: message.cmd.CI,
    t: Date.now(),
  };
  fs.appendFileSync(file, ` ${JSON.stringify(message_log)}\n`);
}

sock.on("message", async function (...args) {
  const message = JSON.parse(args[1].toString());
  console.log("Mensaje recibido servidor: " + JSON.stringify(message));
  writeLogMessage(message, "res", "logs.txt");
  if (
    JSON.stringify(cmd) == JSON.stringify(message.cmd) &&
    message.tag == "REPLY"
  ) {
    ob = eligeOb([1, 2, 3]);
    op = genera_op();
    numop = numop + 1;
    cmd = {
      CI: sock.identity,
      numop: numop,
      op: op,
    };
    let message = {
      source: sock.identity,
      dest: ob,
      tag: "REQUEST",
      cmd: cmd,
      res: null,
    };
    console.log("Enviando: " + JSON.stringify(message));
    setTimeout(() => {
      sock.send(["", JSON.stringify(message)]);
      writeLogMessage(message, "inv", "logs.txt");
    }, 2000);
  }
});

function getFromServer() {
  ob = eligeOb([1, 2, 3]);
  op = genera_op();
  numop = 1;
  cmd = {
    CI: sock.identity,
    numop: numop,
    op: op,
  };
  let message = {
    source: sock.identity,
    dest: ob,
    tag: "REQUEST",
    cmd: cmd,
    res: null,
  };
  console.log("Enviando: " + JSON.stringify(message));
  sock.send(["", JSON.stringify(message)]);
  message_log = {
    tipo_e: "inv",
    op: message.cmd.op.operacion,
    clave:
      message.cmd.op.operacion == "put"
        ? message.cmd.op.valor.split(" ")[0]
        : message.cmd.op.valor,
    valor:
      message.cmd.op.operacion == "put"
        ? message.cmd.op.valor.split(" ")[1]
        : null,
    n: message.cmd.numop,
    id: message.source,
    t: Date.now(),
  };
  fs.appendFileSync("logs.txt", ` ${JSON.stringify(message_log)}\n`);
}

process.on("SIGINT", function () {
  console.log("Closing client socket...");
  sock.close();
});
