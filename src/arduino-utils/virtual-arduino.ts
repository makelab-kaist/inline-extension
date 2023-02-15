/* eslint-disable @typescript-eslint/naming-convention */
import { io, Socket } from 'socket.io-client';

const PORT = 3000;
let server = `http://localhost:${PORT}`; // default local server

// Internal data structure to get messages from the Arduino
type ArduinoAck = {
  message: unknown;
  success: boolean;
};

export class VirtualArduino {
  private static instance: VirtualArduino;
  private connected: boolean = false;
  private socket: Socket;
  private ready: boolean = false;

  // A singleton
  static getInstance() {
    if (!VirtualArduino.instance) this.instance = new VirtualArduino();
    return this.instance;
  }

  // Private construttor to start socket with server
  private constructor() {
    this.socket = io(server, {
      reconnection: true,
    });

    this.socket.on('connect', function () {
      console.log('Connected!');
    });

    this.socket.once('connect_error', () => {
      console.log('Not connected!');
    });
  }

  // Changer server (ip and port)
  static changeServerIp(ip: string) {
    server = `${ip}:${PORT}`;
    this.instance = new VirtualArduino();
  }

  // Connect to server
  connectToServer(timeoutms: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.socket.connected) return resolve('Connected to server'); //done
      this.socket.connect();

      // are we connected after timeout
      setTimeout(() => {
        if (this.socket.disconnected) reject('Cannot connet to server');
        else resolve('Client connected to server');
      }, timeoutms);
    });
  }

  // Get available baud rates
  getAvailableBuadRate(): string[] {
    const baudRates = ['9600', '38400', '57600', '115200'];
    return baudRates;
  }

  // Get available ports
  getAvailablePorts(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) reject([]); // no ports available

      this.socket.emit('listSerials');
      this.socket.on('listSerialsData', ({ message, success }: ArduinoAck) => {
        if (success) resolve(message as string[]);
        else reject('No port found');
      });
    });
  }

  // Get available boards
  getAvailableBoards(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) reject([]); // no boards available

      this.socket.emit('listBoards');
      this.socket.on('listBoardsData', ({ message, success }: ArduinoAck) => {
        if (success) resolve(message as string[]);
        else reject('No port found');
      });
    });
  }

  // Start the serial
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
    onDataCallback: (data: string) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) reject('Connection unavailable');

      this.socket.removeAllListeners();
      this.socket.on('serialData', (ack: ArduinoAck) => {
        if (!ack.success) return;
        const data = ack.message as string;
        onDataCallback(data);
      });

      this.sendToServer('beginSerial', { portName, baud, autoConnect })
        .then(({ message }) => {
          this.ready = true;
          resolve(message as string);
        })
        .catch(reject);
    });
  }

  // Select board
  // Connect to serial
  async selectBoard(board: string): Promise<string> {
    return this.sendToServer('selectBoard', { board }).then(
      ({ message }) => message as string
    );
  }

  // Connect to serial
  async connectSerial(): Promise<string> {
    if (!this.ready)
      return Promise.reject('Need to initialize connection first');
    return this.sendToServer('connectSerial').then(
      ({ message }) => message as string
    );
  }

  // Disconnect to serial
  async disconnectSerial(): Promise<string> {
    if (!this.ready)
      return Promise.reject('Need to initialize connection first');
    return this.sendToServer('disconnectSerial').then(
      ({ message }) => message as string
    );
  }

  // Compile code and upload it to the Arduino
  async compileAndUpload(sketchCode: string): Promise<string[]> {
    if (!this.ready)
      return Promise.reject('Need to initialize connection first');
    return this.sendToServer('compileAndUploadCode', {
      code: sketchCode,
    }).then(({ message }) => message as string[]);
  }

  // PRIVATE

  // Utility to send messages (emit) to server and receive back an info or error
  private sendToServer(command: string, params: {} = {}): Promise<ArduinoAck> {
    return new Promise((resolve, reject) => {
      this.socket.on('info', (ack: ArduinoAck) => {
        resolve(ack);
      });
      this.socket.on('error', ({ message }: ArduinoAck) => {
        reject(message);
      });
      this.socket.emit(command, params);
    });
  }
}
