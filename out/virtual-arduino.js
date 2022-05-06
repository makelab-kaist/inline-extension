"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualArduino = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const socket_io_client_1 = require("socket.io-client");
const SERVER = 'http://localhost:3000';
class VirtualArduino {
    constructor() {
        this._connected = false;
        this._ready = false;
        this._socket = (0, socket_io_client_1.io)(SERVER, {
            reconnection: true,
        });
        this._socket.on('connect', function () {
            console.log('Connected!');
        });
        this._socket.once('connect_error', () => {
            console.log('Not connected!');
        });
    }
    static getInstance() {
        if (!VirtualArduino._instance)
            this._instance = new VirtualArduino();
        return this._instance;
    }
    connectToServer(timeoutms = 200) {
        return new Promise((resolve, reject) => {
            if (this._socket.connected)
                return resolve('Connected to server'); //done
            this._socket.connect();
            // are we connected after timeout
            setTimeout(() => {
                if (this._socket.disconnected)
                    reject('Cannot connet to server');
                else
                    resolve('Client connected to server');
            }, timeoutms);
        });
    }
    getAvailableBuadRate() {
        const baudRates = ['115200', '57600', '38400', '9600'];
        return baudRates;
    }
    getAvailablePorts() {
        return new Promise((resolve, reject) => {
            if (!this._socket)
                reject([]); // no ports available
            this._socket.emit('listSerials');
            this._socket.on('listSerialsData', ({ message, success }) => {
                if (success)
                    resolve(message);
                else
                    reject('No port found');
            });
        });
    }
    beginSerial({ portName, baud, autoConnect, }, onDataCallback) {
        return new Promise((resolve, reject) => {
            if (!this._socket)
                reject('Connection unavailable');
            this._socket.removeAllListeners();
            this._socket.on('serialData', onDataCallback);
            this.sendToServer('beginSerial', { portName, baud, autoConnect })
                .then(({ message }) => {
                this._ready = true;
                resolve(message);
            })
                .catch(reject);
        });
    }
    connectSerial() {
        if (!this._ready)
            return Promise.reject('Need to initialize connection first');
        return this.sendToServer('connectSerial').then(({ message }) => message);
    }
    disconnectSerial() {
        if (!this._ready)
            return Promise.reject('Need to initialize connection first');
        return this.sendToServer('disconnectSerial').then(({ message }) => message);
    }
    compileAndUpload(sketchCode) {
        if (!this._ready)
            return Promise.reject('Need to initialize connection first');
        return this.sendToServer('compileAndUploadCode', {
            code: sketchCode,
        }).then(({ message }) => message);
    }
    sendToServer(command, params = {}) {
        return new Promise((resolve, reject) => {
            this._socket.on('info', (ack) => {
                resolve(ack);
            });
            this._socket.on('error', ({ message }) => {
                reject(message);
            });
            this._socket.emit(command, params);
        });
    }
}
exports.VirtualArduino = VirtualArduino;
//# sourceMappingURL=virtual-arduino.js.map