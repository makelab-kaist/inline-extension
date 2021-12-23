import express from 'express';
import { SimpleSerial, BoardInfo } from './serial';

const s = new SimpleSerial();

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
  // Disconnect serial on connection
  if (s.isConnected()) s.disconnect();

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
        if (!s.isConnected()) await s.connect(port, baud);
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

const Arduino: BoardInfo = {
  productId: 0x2341,
  vendorId: 0x0043,
};

/*
(async () => {
  
  const ls: string[] = await s.listAvailablePorts();
  console.log(ls);

  await s.connect(ls[1], 115200);
  console.log(s.isConnected());
  s.onReadData((data) => {
    console.log(data);
  });

  setTimeout(() => {
    s.stopListening();
  }, 6000);

  setTimeout(() => {
    s.onReadData((data) => {
      console.log(`again ${data}`);
    });
  }, 10000);
})();
*/
