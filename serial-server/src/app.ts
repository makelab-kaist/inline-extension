import express from 'express';
import { SimpleSerial } from './serial';
import { Arduino } from './arduino';
import { ArduinoCli } from './arduino-cli';

var path = require('path');

let serial: SimpleSerial;

// Server
const port = process.env.PORT || 3000;

const app = express();
const http = require('http').createServer(app);
// socket.io
var io = require('socket.io')(http, {
  cors: {
    origin: '*',
  },
});

function emitError(msg: string, socket: any) {
  socket.emit('error', { msg });
  console.log('ERROR', msg);
}

function emitInfo(msg: string, socket: any) {
  socket.emit('info', { msg });
  console.log('INFO', msg);
}

// CONNECT
io.on('connection', function (socket: any) {
  // Disconnect serial on connection
  emitInfo('Connected', socket);
  Arduino.getInstance().reset();

  // Disconnect
  socket.on('disconnect', function () {
    console.log('Disconnected');
  });

  // List available serial ports
  socket.on('listSerials', async function () {
    const list: string[] = await Arduino.getInstance().listSerialPorts();
    socket.emit('listSerialsData', list);
    console.log('listSerialsData', list);
  });

  // Initialize serial
  socket.on(
    'beginSerial',
    async ({
      port,
      baud = 115200,
      autoconnect = true,
    }: {
      port: string;
      baud: number;
      autoconnect: boolean;
    }) => {
      try {
        const result = await Arduino.getInstance().begin(
          port,
          baud,
          (data: string) => {
            socket?.emit('serialData', data);
          },
          autoconnect
        );
        emitInfo(result, socket);
      } catch (err) {
        emitError(err as string, socket);
      }
    }
  );

  // Connect serial
  socket.on('connectSerial', async () => {
    try {
      const result = await Arduino.getInstance().connect();
      emitInfo(result, socket);
    } catch (errmsg) {
      emitError(errmsg as string, socket);
    }
  });

  socket.on('disconnectSerial', () => {
    try {
      const result = Arduino.getInstance().disconnect();
      emitInfo(result, socket);
    } catch (err) {
      emitError((err as Error).message, socket);
    }
  });

  socket.on(
    'compileAndUpload',
    async ({
      sketchPath,
      autoconnect = true,
    }: {
      sketchPath: string;
      autoconnect: boolean;
    }) => {
      try {
        const result = await Arduino.getInstance().compileAndUpload(
          sketchPath,
          autoconnect
        );
        emitInfo(result, socket);
      } catch (err) {
        emitError(err as string, socket);
      }
    }
  );
});

http.listen(port, function () {
  console.log('Server listening at port %d', port);
});
