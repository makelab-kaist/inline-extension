"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualArduino = void 0;
const socket_io_client_1 = require("socket.io-client");
const SERVER = 'http://localhost:3000';
class VirtualArduino {
    constructor() {
        this._baud = 9600;
        this._port = '';
        this.socket = (0, socket_io_client_1.io)(SERVER, {
            reconnection: true,
        });
        this.socket.on('connect', function () {
            console.log('Connected!');
        });
        this.socket.once('connect_error', () => {
            console.log('Not connected!');
            if (this.socket?.connected)
                this.socket?.disconnect();
            this.socket?.connect();
        });
    }
    static getInstance() {
        if (!VirtualArduino.instance)
            this.instance = new VirtualArduino();
        return this.instance;
    }
    getAvailableBuadRate() {
        const baudRates = ['115200', '57600', '38400', '9600'];
        return baudRates;
    }
    connect(baud, port, onDataCallback) {
        if (!this.getAvailableBuadRate().includes(baud.toString()))
            throw new Error('Baud rate not available');
        if (this.socket?.disconnected)
            this.socket.connect();
        this.sendCommand('connectSerial', { port: port, baud: baud });
        this.socket.on('serialData', onDataCallback);
    }
    disconnect() {
        this.socket?.disconnect();
    }
    sendCommand(cmd, params) {
        this.socket?.emit(cmd, params);
    }
}
exports.VirtualArduino = VirtualArduino;
//# sourceMappingURL=virtual-arduino.js.map