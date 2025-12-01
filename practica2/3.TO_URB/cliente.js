"use strict";

const zmq = require("zeromq");

if (process.argv[2] == null) {
  console.error("Introduce un id válido para el cliente.");
  return;
}

const sock = zmq.socket("dealer");
sock.identity = process.argv[2];
sock.connect("tcp://127.0.0.1:1112");

let message = {
  origen: sock.identity,
  content: "Hola Mundo",
  seq: 0,
};

function TO_broadcast(message) {
  message.seq += 1;
  sock.send(["", JSON.stringify(message)]);
}

setInterval(() => {
  TO_broadcast(message);
}, 4000);

sock.on("message", async function (...args) {
  const message = JSON.parse(args[1].toString());
  console.log(
    `Message ${message.seq}: ${message.content}, from ${message.origen}`
  );
});

process.on("SIGINT", function () {
  console.log("Closing client socket...");
  sock.close();
});
