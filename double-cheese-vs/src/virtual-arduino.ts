/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { io, Socket } from 'socket.io-client';

const SERVER = 'http://localhost:3000';

class VirtualArduino {
  private static instance: VirtualArduino;
  private _baud = 9600;
  private _port = '';
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
      if (this.socket?.connected) this.socket?.disconnect();
      this.socket?.connect();
    });
  }

  static getInstance() {
    if (!VirtualArduino.instance) this.instance = new VirtualArduino();
    return this.instance;
  }

  getAvailableBuadRate(): string[] {
    const baudRates = ['115200', '57600', '38400', '9600'];
    return baudRates;
  }

  connect(baud: number, port: string, onDataCallback: (data: string) => void) {
    if (!this.getAvailableBuadRate().includes(baud.toString()))
      throw new Error('Baud rate not available');

    if (this.socket?.disconnected) this.socket.connect();
    this.sendCommand('connectSerial', { port: port, baud: baud });
    this.socket.on('serialData', onDataCallback);
  }

  disconnect() {
    this.socket?.disconnect();
  }

  private sendCommand(cmd: string, params: {}) {
    this.socket?.emit(cmd, params);
  }
}

export { VirtualArduino };
