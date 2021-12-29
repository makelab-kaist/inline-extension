import express from 'express';
import { SimpleSerial, BoardInfo } from './serial';

const s = new SimpleSerial();
// Disconnect serial on connection
if (s.isConnected()) s.disconnect();

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

io.on('connection', function (socket: any) {
  console.log('Connected');

  socket.on('listSerials', async () => {
    console.log('listSerials');

    const ls: string[] = await s.listAvailablePorts();
    socket.emit('listSerialsData', ls);
  });

  socket.on(
    'connectSerial',
    async ({ port, baud = 115200 }: { port: string; baud: number }) => {
      console.log('connectSerial');
      console.log(port, baud);

      try {
        if (s.isConnected()) return;
        await s.connect(port, baud);

        s.onReadData((data: string) => {
          socket.emit('serialData', data);
        });
      } catch (error) {
        console.log(error);
        // throw error;
      }
    }
  );

  socket.on('disconnectSerial', () => {
    console.log('disconnectSerial');
    if (s.isConnected()) s.disconnect();
  });

  socket.on('sendMessage', (msg: string) => {
    console.log('sendMessage');
    s.send(msg);
  });
});

http.listen(port, function () {
  console.log('Server listening at port %d', port);
});
