"use strict";

const zmq = require("zeromq");
const { Level } = require("level");

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
        : `${Math.floor(Math.random() * 10) + 1} valor_${Math.floor(
            Math.random() * 100
          )}`,
  };
  return op;
}

sock.on("message", function (...args) {
  const message = JSON.parse(args[1].toString());
  console.log("Mensaje recibido servidor: ", JSON.stringify(message));
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
}

process.on("SIGINT", function () {
  console.log("Closing client socket...");
  sock.close();
});
