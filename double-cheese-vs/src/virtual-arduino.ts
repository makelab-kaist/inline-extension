/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { io, Socket } from 'socket.io-client';

const SERVER = 'http://localhost:3000';

class VirtualArduino {
  private static instance: VirtualArduino;
  private _baud = 115200;
  private _port = '';
  // private _callback: (data: string) => void = (data) => {};
  private _connected: boolean = false;
  private socket: Socket;

  private constructor() {
    this.socket = io(SERVER, {
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
    if (!VirtualArduino.instance) this.instance = new VirtualArduino();
    return this.instance;
  }

  connectToServer(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.socket.connected) resolve('Connected'); //done
      this.socket.connect();
      setTimeout(() => {
        if (this.socket.disconnected) reject('Cannot connet to server');
        else resolve('Connected');
      }, 200);
    });
  }

  getAvailableBuadRate(): string[] {
    const baudRates = ['115200', '57600', '38400', '9600'];
    return baudRates;
  }

  configure(
    baud: number,
    port: string,
    onDataCallback: (data: string) => void
  ) {
    if (this.socket.disconnected) throw new Error('Cannot connet to server');
    if (!this.getAvailableBuadRate().includes(baud.toString()))
      throw new Error('Baud rate not available');
    this._baud = baud;
    this._port = port;
    this.socket.removeAllListeners();
    this.socket.on('serialData', onDataCallback);
  }

  connectSerial() {
    if (this.socket.disconnected) throw new Error('Cannot connet to server');
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
    if (this.socket.disconnected) throw new Error('Cannot connet to server');
    if (this._connected) {
      this.sendCommand('disconnectSerial');
      this._connected = false;
    } else {
      throw new Error('Already not connected');
    }
  }

  private sendCommand(cmd: string, params: {} = {}) {
    this.socket?.emit(cmd, params);
  }
}

export { VirtualArduino };
