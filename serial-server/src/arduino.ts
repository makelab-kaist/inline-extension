import { ArduinoBoard, ArduinoCli } from './arduino-cli';
import { SimpleSerial } from './serial';

class Arduino {
  private static instance: Arduino;
  private _board: ArduinoBoard = ArduinoBoard.Arduino_Uno;
  private _serial?: SimpleSerial;

  private constructor() {}

  static getInstance() {
    if (!Arduino.instance) this.instance = new Arduino();
    return this.instance;
  }

  /**
   * Get the list of ports
   * @returns {string[]}
   */
  listSerialPorts(): Promise<string[]> {
    return ArduinoCli.getInstance().listAvailablePorts();
  }

  /**
   * Initialize (and connect) to serial
   * @param port the port
   * @param baud baud rate
   * @param onDataReadCallback the callabck to be called when serial gets data
   * @param autoconnect
   * @returns
   */
  begin(
    port: string,
    baud: number,
    onDataReadCallback: (data: string) => void,
    autoconnect: boolean
  ): Promise<string> {
    // already connected -> ignore
    if (this._serial?.isSerialConnected())
      return new Promise((_, reject) => reject('Alraedy connected'));

    // Init the CLI
    ArduinoCli.getInstance().initialize(port, this._board);

    // Init serial
    this._serial = new SimpleSerial(port, baud, onDataReadCallback);

    // Autoconnect?
    if (autoconnect) {
      return this.connect(); // might throw an error
    }

    // Return an empty promise
    return new Promise((res) => res('Board initialized'));
  }

  /**
   * Connect to serial
   * @returns {Promise<string>} possible errors
   */
  connect(): Promise<string> {
    if (!this._serial)
      return new Promise((_, reject) => reject('Board not initialized'));

    if (this._serial?.isSerialConnected())
      return new Promise((_, reject) => reject('Board already connected'));

    return this._serial?.connectSerial();
  }

  /**
   * Disconnect  serial
   * @returns {string} message if disconnected
   */
  disconnect() {
    if (this._serial?.isSerialConnected()) {
      this._serial.disconnectSerial();
      return 'Disconnected';
    }
    throw new Error('Board already disconnected');
  }

  /**
   * Reset the board (disconnect)
   */
  reset() {
    try {
      this.disconnect();
    } catch (err) {
      //silent
    }
  }

  /**
   * Compile and upload the sketch + connect (if autoconnect)
   * @param sketchPath
   * @param autoconnect
   * @returns {Promise<string>} info or errors for compilation/upload
   */
  compileAndUpload(sketchPath: string, autoconnect: boolean): Promise<string> {
    return new Promise(async (res, rej) => {
      if (this._serial?.isSerialConnected()) this._serial.disconnectSerial();

      try {
        const result = await ArduinoCli.getInstance().compileAndUpload(
          sketchPath
        );
        // reconnect
        if (autoconnect) {
          await this.connect();
        }
        res(result);
      } catch (err) {
        rej(err as string);
      }
    });
  }
}

export { Arduino };
