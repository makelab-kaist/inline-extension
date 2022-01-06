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
const arduino_1 = require("./arduino");
var path = require('path');
let serial;
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
function emitError(msg, socket) {
    socket.emit('error', { msg });
    console.log('ERROR', msg);
}
function emitInfo(msg, socket) {
    socket.emit('info', { msg });
    console.log('INFO', msg);
}
// CONNECT
io.on('connection', function (socket) {
    // Disconnect serial on connection
    emitInfo('Connected', socket);
    arduino_1.Arduino.getInstance().reset();
    // Disconnect
    socket.on('disconnect', function () {
        console.log('Disconnected');
    });
    // List available serial ports
    socket.on('listSerials', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield arduino_1.Arduino.getInstance().listSerialPorts();
            socket.emit('listSerialsData', list);
            console.log('listSerialsData', list);
        });
    });
    // Initialize serial
    socket.on('beginSerial', ({ port, baud = 115200, autoconnect = true, }) => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield arduino_1.Arduino.getInstance().begin(port, baud, (data) => {
                socket === null || socket === void 0 ? void 0 : socket.emit('serialData', data);
            }, autoconnect);
            emitInfo(result, socket);
        }
        catch (err) {
            emitError(err, socket);
        }
    }));
    // Connect serial
    socket.on('connectSerial', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield arduino_1.Arduino.getInstance().connect();
            emitInfo(result, socket);
        }
        catch (errmsg) {
            emitError(errmsg, socket);
        }
    }));
    socket.on('disconnectSerial', () => {
        try {
            const result = arduino_1.Arduino.getInstance().disconnect();
            emitInfo(result, socket);
        }
        catch (err) {
            emitError(err.message, socket);
        }
    });
    socket.on('compileAndUpload', ({ sketchPath, autoconnect = true, }) => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield arduino_1.Arduino.getInstance().compileAndUpload(sketchPath, autoconnect);
            emitInfo(result, socket);
        }
        catch (err) {
            emitError(err, socket);
        }
    }));
});
http.listen(port, function () {
    console.log('Server listening at port %d', port);
});
//# sourceMappingURL=app.js.map