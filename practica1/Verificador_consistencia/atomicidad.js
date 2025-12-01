"use strict";

// strict mode, does not allow undeclared variables
if (process.argv.length < 3) {
  console.error(
    "ERROR: Por favor, ejecutame con un primer argumento que especifique el fichero de logs con el que quieres trabajar."
  );
  return;
}

const lineReader = require("readline").createInterface({
  input: require("fs").createReadStream(process.argv[2]),
  output: process.stdout,
  terminal: false,
});

let reads = new Map();
let writes = {};
let zones = {};
let alpha = {};

let aux_s = 0;
let aux_f = 0;

lineReader.on("line", function (line) {
  let event = JSON.parse(line);
  let result = "good";
  let id = event.id + "_" + event.n;
  if (event.op == "put" && event.tipo_e == "inv") {
    writes[event.valor] = { s: event.t, f: Infinity };
    zones[event.valor] = { f: Infinity, s: event.t };
    alpha[event.valor] = null;
  } else if (event.op == "put" && event.tipo_e == "res") {
    writes[event.valor].f = event.t;
    zones[event.valor].f = Math.min(zones[event.valor].f, event.t);
    for (let key in writes) {
      if (writes[key].f < writes[event.valor].s && alpha[key] == null) {
        alpha[key] = new Map(reads);
        if (alpha[key].size == 0) {
          delete writes[key];
          delete zones[key];
          delete alpha[key];
        }
      }
    }
  } else if (event.op == "get" && event.tipo_e == "inv") {
    reads.set(id, event.t);
  } else if (event.op == "get" && event.tipo_e == "res") {
    if (!writes[event.valor]) {
      result = "bad, there is no dictating write";
    } else {
      aux_s = zones[event.valor].s;
      aux_f = zones[event.valor].f;
      zones[event.valor].s = Math.max(zones[event.valor].s, reads.get(id));
      zones[event.valor].f = Math.min(zones[event.valor].f, event.t);
      for (let key in zones) {
        if (
          zones[key].f !== Infinity &&
          key != event.valor &&
          ((zones[event.valor].s >= zones[key].f &&
            zones[key].s >= zones[event.valor].f) ||
            (zones[event.valor].s > zones[key].f &&
              zones[event.valor].f < zones[key].s))
        ) {
          result = "bad, zones conflict";
          if (
            zones[event.valor].s > zones[event.valor].f &&
            zones[key].s > zones[key].f
          ) {
            console.log(
              `Two forwards zones overlap [Z1-${key}][Z1.f=${
                zones[key].f
              }, Z1.s=${zones[key].s}] and [Z2-${event.valor}][Z2.f=${
                zones[event.valor].f
              }, Z2.s=${zones[event.valor].s}]`
            );
          } else {
            console.log(
              `A backward zone [Z1-${key}][Z1.f=${zones[key].f}, Z1.s=${
                zones[key].s
              }}] is contained inside a forward zone [Z2-${event.valor}][Z2.f=${
                zones[event.valor].f
              }, Z2.s=${zones[event.valor].s}]`
            );
          }
          zones[event.valor].s = aux_s;
          zones[event.valor].f = aux_f;
        }
      }
    }
    reads.delete(id);
    for (let key in alpha) {
      if (alpha[key] && alpha[key].has(id)) {
        alpha[key].delete(id);
        if (alpha[key].size == 0) {
          delete writes[key];
          delete zones[key];
          delete alpha[key];
        }
      }
    }
    console.log("Result for event", id, "is", result);
  }
});
