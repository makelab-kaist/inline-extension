import SerialPort, { parsers } from 'serialport';

type BoardInfo = {
  productId?: number;
  vendorId?: number;
};

class SimpleSerial {
  serialPort: SerialPort | undefined;
  parser: SerialPort.parsers.Readline | undefined;

  constructor() {}

  listAvailablePorts(boardInfo: BoardInfo = {}): Promise<string[]> | never {
    return new Promise<string[]>((resolve, reject) => {
      // Get all the ports
      SerialPort.list().then((ports: SerialPort.PortInfo[]) => {
        // Filter the ports
        const { productId: pid, vendorId: vid } = boardInfo;
        let filteredPorts = ports
          .filter(({ vendorId }) => {
            if (vendorId && vid) return vid == parseInt(vendorId, 16); // hex
            // else
            return true;
          })
          .filter(({ productId }) => {
            if (productId && pid) return pid == parseInt(productId, 16); // hex
            // else
            return true;
          });
        // Extract the port names
        const paths = filteredPorts.map(({ path }) => path);
        if (paths.length > 0) resolve(paths);
        else reject(new Error('No serial found'));
      });
    });
  }

  isConnected(): boolean {
    return this.serialPort?.isOpen || false;
  }

  connect(
    portName: string,
    baud: number = 115200,
    delayAtStart: number = 100
  ): Promise<string[]> | never {
    return new Promise((resolve: Function, reject: Function) => {
      // Already connected?
      if (this.isConnected()) {
        reject('Serial port already open');
      }

      this.serialPort = new SerialPort(portName, {
        baudRate: baud,
      }); // this might throw an error

      this.serialPort.on('open', () => {
        setTimeout(() => {
          resolve();
        }, delayAtStart); // let's give it some time to wake up
      });
    });
  }

  onReadData(callback: (s: string) => void): void {
    if (!this.isConnected()) return;

    this.parser = this.serialPort!.pipe(
      new parsers.Readline({ delimiter: '\r\n' })
    );
    // Switches the port into "flowing mode"
    this.parser.on('data', function (data) {
      callback(data);
    });
  }

  stopListening(): void {
    if (!this.isConnected()) return;
    this.parser?.removeAllListeners();
  }

  disconnect(): void | never {
    if (!this.isConnected()) {
      throw new Error('Serial port not connected');
    }
    this.serialPort?.close();
  }

  send(commandString: string): void {
    this.serialPort?.write(`${commandString}\n\r`);
  }
}

export { BoardInfo, SimpleSerial };
