/* eslint-disable @typescript-eslint/naming-convention */
import { io, Socket } from 'socket.io-client';

const SERVER = 'http://localhost:3000';

class VirtualArduino {
  private static instance: VirtualArduino;
  private _connected: boolean = false;
  private socket: Socket;

  static getInstance() {
    if (!VirtualArduino.instance) this.instance = new VirtualArduino();
    return this.instance;
  }

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

  connectToServer(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.socket.connected) resolve('Connected'); //done
      this.socket.connect();
      this.socket.on('info', ({ msg }: { msg: string }) => {
        resolve(msg);
      });

      setTimeout(() => {
        if (this.socket.disconnected) reject('Cannot connet to server');
      }, 200);
    });
  }

  getAvailableBuadRate(): string[] {
    const baudRates = ['115200', '57600', '38400', '9600'];
    return baudRates;
  }

  getAvailablePorts(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) reject([]); // no ports available

      this.socket.emit('listSerials');
      this.socket.on('listSerialsData', (ports: string[]) => {
        resolve(ports);
      });
    });
  }

  beginSerial(
    port: string,
    baud: number,
    onDataCallback: (data: string) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) reject('Connection unavailable');

      this.socket.removeAllListeners();
      this.socket.on('serialData', onDataCallback);
      this.sendToServer('beginSerial', { port, baud, autoconnect: true })
        .then(resolve)
        .catch(reject);
    });
  }

  connectSerial(): Promise<string> {
    return this.sendToServer('connectSerial');
  }

  disconnectSerial(): Promise<string> {
    return this.sendToServer('disconnectSerial');
  }

  compileAndUpload(sketchPath: string): Promise<string> {
    return this.sendToServer('compileAndUpload', {
      sketchPath,
      autoconnect: true,
    });
  }

  private sendToServer(command: string, params: {} = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket.emit(command, params);
      this.socket.on('info', ({ msg }: { msg: string }) => {
        resolve(msg);
      });
      this.socket.on('error', ({ msg }: { msg: string }) => {
        reject(msg);
      });
    });
  }
}

export { VirtualArduino };
