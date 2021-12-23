"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serial_1 = require("./serial");
const s = new serial_1.SimpleSerial();
// Server
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
const http = require('http').createServer(app);
// socket.io
var io = require('socket.io')(http, {
    cors: {
        origin: '*',
    },
});
io.on('connection', function (socket) {
    socket.on('listSerials', () => __awaiter(this, void 0, void 0, function* () {
        console.log('listSerials');
        const ls = yield s.listAvailablePorts();
        socket.emit('listSerialsData', ls);
    }));
    socket.on('connectSerial', ({ port, baud }) => __awaiter(this, void 0, void 0, function* () {
        console.log('connectSerial');
        try {
            if (s.isConnected())
                return;
            yield s.connect(port, baud);
            s.onReadData((data) => {
                socket.emit('serialData', data);
            });
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }));
    socket.on('disconnectSerial', () => {
        console.log('disconnectSerial');
        if (s.isConnected())
            s.disconnect();
    });
    socket.on('sendMessage', (msg) => {
        console.log('sendMessage');
        s.send(msg);
    });
});
http.listen(port, function () {
    console.log('Server listening at port %d', port);
});
const Arduino = {
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
//# sourceMappingURL=app.js.map