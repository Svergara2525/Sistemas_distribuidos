"use strict";

const zmq = require("zeromq");

const frontend = "tcp://127.0.0.1:1112";

const frontRouter = zmq.socket("router");

let client_list = new Set(["C1", "C2", "C3"]);

frontRouter.bind(frontend, function (err) {
  if (err) throw err;
  console.log(`Frontend router bound to ${frontend}`);
});

frontRouter.on("message", function (...args) {
  const [id, , messageBuffer] = args;
  try {
    const message = JSON.parse(messageBuffer.toString());
    console.log(`Message: ${message.content} from ${message.origen}`);
    for (const destId of client_list) {
      frontRouter.send([`${destId}`, "", JSON.stringify(message)]);
    }
  } catch (err) {
    console.error("Failed to parse JSON from backend:", err);
  }
});

process.on("SIGINT", function () {
  console.log("Shutting down...");
  frontRouter.close();
});
