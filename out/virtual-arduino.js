"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualArduino = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const socket_io_client_1 = require("socket.io-client");
const SERVER = 'http://localhost:3000';
class VirtualArduino {
    constructor() {
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
        return new Promise((resolve, reject) => {
            if (this.socket.connected)
                resolve('Connected'); //done
            this.socket.connect();
            this.socket.on('info', ({ msg }) => {
                resolve(msg);
            });
            setTimeout(() => {
                if (this.socket.disconnected)
                    reject('Cannot connet to server');
            }, 200);
        });
    }
    getAvailableBuadRate() {
        const baudRates = ['115200', '57600', '38400', '9600'];
        return baudRates;
    }
    getAvailablePorts() {
        return new Promise((resolve, reject) => {
            if (!this.socket)
                reject([]); // no ports available
            this.socket.emit('listSerials');
            this.socket.on('listSerialsData', (ports) => {
                resolve(ports);
            });
        });
    }
    beginSerial(port, baud, onDataCallback) {
        return new Promise((resolve, reject) => {
            if (!this.socket)
                reject('Connection unavailable');
            this.socket.removeAllListeners();
            this.socket.on('serialData', onDataCallback);
            this.sendToServer('beginSerial', { port, baud, autoconnect: true })
                .then(resolve)
                .catch(reject);
        });
    }
    connectSerial() {
        return this.sendToServer('connectSerial');
    }
    disconnectSerial() {
        return this.sendToServer('disconnectSerial');
    }
    sendToServer(command, params = {}) {
        return new Promise((resolve, reject) => {
            this.socket.emit(command, params);
            this.socket.on('info', ({ msg }) => {
                resolve(msg);
            });
            this.socket.on('error', ({ msg }) => {
                reject(msg);
            });
        });
    }
}
exports.VirtualArduino = VirtualArduino;
//# sourceMappingURL=virtual-arduino.js.map