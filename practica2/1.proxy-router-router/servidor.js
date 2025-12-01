"use strict"

const zmq = require('zeromq');
const { Level } = require('level');

// Configuración e inicialización del socket y la base de datos
const sock = zmq.socket('dealer');
const db = new Level(`./${process.argv[3]}`);

sock.identity = process.argv[2];
sock.connect("tcp://127.0.0.1:2221");

// Función para manejar mensajes recibidos
sock.on('message', function (...args) {
    const message = JSON.parse(args[1].toString());

    if (!message) {
        console.error("Invalid message format.");
        return;
    }

    console.log(message);

    // Preparar el mensaje de respuesta
    const resp_message = {
        ...message,
        fuente: sock.identity,
        destino: message.fuente
    };

    // Manejar operación 'get'
    if (message.op === 'get') {
        db.get(message.args, (err, value) => {
            resp_message.res = err ? `error: ${err.message}` : value;
            sock.send(['', JSON.stringify(resp_message)]);
        });
    }
    // Manejar operación 'put'
    else if (message.op === 'put') {
        const [key, value] = message.args.split(" ");
        db.put(key, value, (err) => {
            resp_message.res = err ? `error: ${err.message}` : 'OK';
            sock.send(['', JSON.stringify(resp_message)]);
        });
    } else {
        resp_message.res = `error: unsupported operation ${message.op}`;
        sock.send(['', JSON.stringify(resp_message)]);
    }
});

// Cierra el socket correctamente al recibir una señal de interrupción
process.on('SIGINT', function() {
    console.log('Shutting down server...');
    sock.close();
});
