"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualArduino = void 0;
const socket_io_client_1 = require("socket.io-client");
const SERVER = 'http://localhost:3000';
class VirtualArduino {
    constructor() {
        this._baud = 115200;
        this._port = '';
        // private _callback: (data: string) => void = (data) => {};
        this._connected = false;
        this.socket = (0, socket_io_client_1.io)(SERVER, {
            reconnection: true,
        });
        this.socket.on('connect', function () {
            console.log('Connected!');
        });
        this.socket.once('connect_error', () => {
            console.log('Not connected!');
        });
    }
    static getInstance() {
        if (!VirtualArduino.instance)
            this.instance = new VirtualArduino();
        return this.instance;
    }
    connectToServer() {
        if (this.socket.connected)
            return; //done
        this.socket.connect();
        if (this.socket.disconnected)
            throw new Error('Cannot connet to server');
    }
    getAvailableBuadRate() {
        const baudRates = ['115200', '57600', '38400', '9600'];
        return baudRates;
    }
    configure(baud, port, onDataCallback) {
        if (this.socket.disconnected)
            throw new Error('Cannot connet to server');
        if (!this.getAvailableBuadRate().includes(baud.toString()))
            throw new Error('Baud rate not available');
        this._baud = baud;
        this._port = port;
        this.socket.removeAllListeners();
        this.socket.on('serialData', onDataCallback);
    }
    connectSerial() {
        if (this.socket.disconnected)
            throw new Error('Cannot connet to server');
        if (this._connected) {
            throw new Error('Already connected');
        }
        if (this._port === '') {
            throw new Error('Hardware not configured');
        }
        this.sendCommand('connectSerial', { port: this._port, baud: this._baud });
        this._connected = true;
    }
    disconnectSerial() {
        if (this.socket.disconnected)
            throw new Error('Cannot connet to server');
        if (this._connected) {
            this.sendCommand('disconnectSerial');
            this._connected = false;
        }
        else {
            throw new Error('Already not connected');
        }
    }
    sendCommand(cmd, params = {}) {
        this.socket?.emit(cmd, params);
    }
}
exports.VirtualArduino = VirtualArduino;
//# sourceMappingURL=virtual-arduino.js.map