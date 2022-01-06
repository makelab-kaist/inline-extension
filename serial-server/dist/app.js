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
const arduino_cli_1 = require("./arduino-cli");
var path = require('path');
const s = new serial_1.SimpleSerial();
// Disconnect serial on connection
if (s.isConnected())
    s.disconnect();
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
    console.log('Connected');
    // socket.on('listSerials', async () => {
    //   console.log('listSerials');
    //   const ls: string[] = await s.listAvailablePorts();
    //   socket.emit('listSerialsData', ls);
    // });
    // socket.on(
    //   'connectSerial',
    //   async ({ port, baud = 115200 }: { port: string; baud: number }) => {
    //     console.log('connectSerial');
    //     console.log(port, baud);
    //     try {
    //       if (s.isConnected()) return;
    //       await s.connect(port, baud);
    //       s.onReadData((data: string) => {
    //         socket.emit('serialData', data);
    //       });
    //     } catch (error) {
    //       console.log(error);
    //       // throw error;
    //     }
    //   }
    // );
    // socket.on('disconnectSerial', () => {
    //   console.log('disconnectSerial');
    //   if (s.isConnected()) s.disconnect();
    // });
    // socket.on('sendMessage', (msg: string) => {
    //   console.log('sendMessage');
    //   s.send(msg);
    // });
});
http.listen(port, function () {
    console.log('Server listening at port %d', port);
});
arduino_cli_1.ArduinoCli.getInstance().init(arduino_cli_1.ArduinoBoard.Arduino_Uno, '/dev/tty.usbmodem544101');
setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
    var sketch = path.join(__dirname, '..', 'test_sketch');
    console.log('start');
    try {
        const res = yield arduino_cli_1.ArduinoCli.getInstance().compileAndUpload(sketch);
        console.log(res);
    }
    catch (err) {
        console.log(err);
    }
}), 100);
//# sourceMappingURL=app.js.map