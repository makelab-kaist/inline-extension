/* eslint-disable @typescript-eslint/naming-convention */
import { io, Socket } from 'socket.io-client';

const SERVER = 'http://localhost:3000';

export type ArduinoAck = {
  message: unknown;
  success: boolean;
};

class VirtualArduino {
  private static _instance: VirtualArduino;
  private _connected: boolean = false;
  private _socket: Socket;
  private _ready: boolean = false;

  static getInstance() {
    if (!VirtualArduino._instance) this._instance = new VirtualArduino();
    return this._instance;
  }

  private constructor() {
    this._socket = io(SERVER, {
      reconnection: true,
    });

    this._socket.on('connect', function () {
      console.log('Connected!');
    });

    this._socket.once('connect_error', () => {
      console.log('Not connected!');
    });
  }

  connectToServer(timeoutms: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this._socket.connected) return resolve('Connected to server'); //done
      this._socket.connect();

      // are we connected after timeout
      setTimeout(() => {
        if (this._socket.disconnected) reject('Cannot connet to server');
        else resolve('Client connected to server');
      }, timeoutms);
    });
  }

  getAvailableBuadRate(): string[] {
    const baudRates = ['9600', '38400', '57600', '115200'];
    return baudRates;
  }

  getAvailablePorts(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this._socket) reject([]); // no ports available

      this._socket.emit('listSerials');
      this._socket.on('listSerialsData', ({ message, success }: ArduinoAck) => {
        if (success) resolve(message as string[]);
        else reject('No port found');
      });
    });
  }

  beginSerial(
    {
      portName,
      baud,
      autoConnect,
    }: {
      portName: string;
      baud: number;
      autoConnect: boolean;
    },
    onDataCallback: (data: ArduinoAck) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._socket) reject('Connection unavailable');

      this._socket.removeAllListeners();
      this._socket.on('serialData', onDataCallback);
      this.sendToServer('beginSerial', { portName, baud, autoConnect })
        .then(({ message }) => {
          this._ready = true;
          resolve(message as string);
        })
        .catch(reject);
    });
  }

  connectSerial(): Promise<string> {
    if (!this._ready)
      return Promise.reject('Need to initialize connection first');
    return this.sendToServer('connectSerial').then(
      ({ message }) => message as string
    );
  }

  disconnectSerial(): Promise<string> {
    if (!this._ready)
      return Promise.reject('Need to initialize connection first');
    return this.sendToServer('disconnectSerial').then(
      ({ message }) => message as string
    );
  }

  compileAndUpload(sketchCode: string): Promise<string[]> {
    if (!this._ready)
      return Promise.reject('Need to initialize connection first');
    return this.sendToServer('compileAndUploadCode', {
      code: sketchCode,
    }).then(({ message }) => message as string[]);
  }

  private sendToServer(command: string, params: {} = {}): Promise<ArduinoAck> {
    return new Promise((resolve, reject) => {
      this._socket.on('info', (ack: ArduinoAck) => {
        resolve(ack);
      });
      this._socket.on('error', ({ message }: ArduinoAck) => {
        reject(message);
      });
      this._socket.emit(command, params);
    });
  }
}

export { VirtualArduino };
