import SerialPort, { parsers } from 'serialport';

class SimpleSerial {
  private serialPort?: SerialPort;
  private parser?: SerialPort.parsers.Readline;

  constructor(
    private portName: string,
    private baud: number = 115200,
    private onIncomingData: (s: string) => void,
    private delayAtStart: number = 50
  ) {}

  connectSerial(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Already connected?
      if (this.isSerialConnected()) {
        reject('Serial port already open');
      }

      try {
        this.serialPort = new SerialPort(
          this.portName,
          {
            baudRate: this.baud,
          },
          function (err) {
            if (err) {
              reject(err.message);
            }
          }
        );

        // After opening, register the callback
        this.serialPort.on('open', () => {
          setTimeout(() => {
            this.parser = this.serialPort!.pipe(
              new parsers.Readline({ delimiter: '\r\n' })
            );
            // Switches the port into "flowing mode"
            this.parser.on('data', (data) => {
              this.onIncomingData(data);
            });

            // Resolve
            resolve(`Connected to ${this.portName}`);
          }, this.delayAtStart); // let's give it some time to wake up
        });
      } catch (err) {
        reject((err as Error).message);
      }
    });
  }

  disconnectSerial() {
    if (!this.isSerialConnected()) {
      return;
    }
    // stop listenting
    this.parser?.removeAllListeners();
    // close
    this.serialPort?.close();
  }

  isSerialConnected(): boolean {
    return this.serialPort?.isOpen || false;
  }

  send(commandString: string): void {
    this.serialPort?.write(`${commandString}\n\r`);
  }
}

export { SimpleSerial };
