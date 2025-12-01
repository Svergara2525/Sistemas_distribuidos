"use strict";

const zmq = require("zeromq");
const { Level } = require("level");

const sock = zmq.socket("dealer");
const db = new Level(`./${process.argv[3]}`);

sock.identity = process.argv[2];
sock.connect("tcp://127.0.0.1:2221");

sock.on("message", function (...args) {
  const message = JSON.parse(args[1].toString());
  if (!message) {
    console.error("Invalid message format.");
    return;
  }
  console.log(message);

  if (message.tag == "REQUEST") {
    const resp_message = {
      OJ: sock.identity,
      source: message.CI,
      tag: "REPLY",
      cmd: message.cmd,
      res: null,
    };
    executeinBD(message.cmd.op, resp_message);
  }
});

function executeinBD(op, resp_message) {
  if (op.operacion == "get") {
    db.get(op.valor, (err, value) => {
      resp_message.res = err ? "error" : value;
      sock.send(["", JSON.stringify(resp_message)]);
    });
  } else if (op.operacion == "put") {
    const [key, value] = op.valor.split(" ");
    db.put(key, value, (err) => {
      resp_message.res = err ? "error" : "OK";
      sock.send(["", JSON.stringify(resp_message)]);
    });
  }
}

process.on("SIGINT", function () {
  console.log("Shutting down server...");
  sock.close();
});
