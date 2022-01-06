/* eslint-disable @typescript-eslint/naming-convention */
import { promisify } from 'util';
import fs from 'fs';
const exec = promisify(require('child_process').exec);

// Default platforms
enum ArduinoPlatform {
  avr = 'arduino:avr',
}

// Default baords
enum ArduinoBoard {
  Arduino_Uno = 'arduino:avr:uno',
  Adafruit_CircuitPlayground = 'arduino:avr:circuitplay32u4cat',
  Arduino_BT = 'arduino:avr:bt',
  Arduino_Duemilanove_or_Diecimila = 'arduino:avr:diecimila',
  Arduino_Esplora = 'arduino:avr:esplora',
  Arduino_Ethernet = 'arduino:avr:ethernet',
  Arduino_Fio = 'arduino:avr:fio',
  Arduino_Gemma = 'arduino:avr:gemma',
  Arduino_Industrial_101 = 'arduino:avr:chiwawa',
  Arduino_Leonardo = 'arduino:avr:leonardo',
  Arduino_Leonardo_ETH = 'arduino:avr:leonardoeth',
  Arduino_Mega_ADK = 'arduino:avr:megaADK',
  Arduino_Mega_or_Mega_2560 = 'arduino:avr:mega',
  Arduino_Micro = 'arduino:avr:micro',
  Arduino_Mini = 'arduino:avr:mini',
  Arduino_NG_or_older = 'arduino:avr:atmegang',
  Arduino_Nano = 'arduino:avr:nano',
  Arduino_Pro_or_Pro_Mini = 'arduino:avr:pro',
  Arduino_Robot_Control = 'arduino:avr:robotControl',
  Arduino_Robot_Motor = 'arduino:avr:robotMotor',
  Arduino_Uno_Mini = 'arduino:avr:unomini',
  Arduino_Uno_WiFi = 'arduino:avr:unowifi',
  Arduino_Yun = 'arduino:avr:yun',
  Arduino_Yun_Mini = 'arduino:avr:yunmini',
  LilyPad_Arduino = 'arduino:avr:lilypad',
  LilyPad_Arduino_USB = 'arduino:avr:LilyPadUSB',
  Linino_One = 'arduino:avr:one',
}

class ArduinoCli {
  private static instance: ArduinoCli;
  private portName: string = '';
  private fqbn: ArduinoBoard = ArduinoBoard.Arduino_Uno;

  private constructor() {}

  static getInstance() {
    if (!ArduinoCli.instance) this.instance = new ArduinoCli();
    return this.instance;
  }

  /**
   * Return the current board platform
   * @returns {string} with the platfrom name
   */
  get platform(): string {
    return this.fqbn.toString();
  }

  /**
   * Initialize the Arduino CLI
   * @param port to connect to
   * @param board to use
   */
  initialize(port: string, board: ArduinoBoard) {
    this.portName = port;
    this.fqbn = board;
  }
  /**
   * Get version of Arduino CLI
   * @returns {Promise<string>} containing the stdout
   */
  version(): Promise<string> {
    return this.run(`version`, __dirname);
  }

  /**
   * Check whether the Arduino CLI is installed
   * @returns {Promise<boolean>} true or false whether it is installed or not
   */
  async isInstalled(): Promise<boolean> {
    try {
      await this.run('', __dirname);
      return true;
    } catch (err) {
      return false; // if it fails, it is not installed
    }
  }

  /**
   * Install the platform via `arduino-cli core install`
   * @param board - the board used to infer which platform to isntall
   * @returns {Promise<string>} string containing the stdout
   */
  installPlatform(platform: ArduinoPlatform): Promise<string> {
    return this.run(`core install ${platform}`, __dirname);
  }

  /**
   * Install the platform via `arduino-cli core install` for the current baord
   * @returns {Promise<string>} a string containing the stdout
   */
  installCurrentPlatform(): Promise<string> {
    const platform = this.fqbn
      .split(':')
      .slice(0, 2)
      .join(':') as ArduinoPlatform; // arduino:avr:uno -> arduino:avr

    // return this.installPlatform(this.fqbn);
    return this.installPlatform(platform);
  }

  /**
   * Returns available ports
   * @returns {Promise<string[]>} list of ports
   */
  listAvailablePorts(): Promise<string[]> {
    return new Promise(async (resolve) => {
      const res = await this.run(`board list --format json`, __dirname);
      const resObj = JSON.parse(res);
      const ports = resObj.map((val: any) => val.port!.address);
      resolve(ports);
    });
  }

  /**
   * Compile and upload
   * @param sketchPath
   * @returns {Promise<string>} result of compilation or upload
   */
  compileAndUpload(sketchPath: string): Promise<string> {
    let report = '';
    return this.compileSketch(sketchPath)
      .then((msg) => {
        report += msg;
        return this.uploadSketch(sketchPath);
      })
      .then((msg) => {
        report += msg;
        return new Promise((resolve) => resolve(report));
      });
  }

  // Private methods

  /**
   * Compile the sketch
   * @param sketchPath
   * @returns {Promise<string>} of output for compilation
   */
  private compileSketch(sketchPath: string): Promise<string> {
    if (!fs.existsSync(sketchPath))
      return new Promise((_, reject) =>
        reject(`Sketch folder ${sketchPath} is invalid`)
      );

    if (!this.isReady())
      return new Promise((_, reject) => reject(`Board not initialized`));

    return this.run(`compile -b ${this.fqbn}`, sketchPath);
  }

  /**
   * Upload the sketch
   * @param sketchPath
   * @returns {Promise<string>} of output for upload
   */
  private uploadSketch(sketchPath: string): Promise<string> {
    if (!fs.existsSync(sketchPath))
      return new Promise((_, reject) =>
        reject(`Sketch folder ${sketchPath} is invalid`)
      );

    if (!this.isReady())
      return new Promise((_, reject) => reject(`Board not initialized`));

    return this.run(
      `upload --port ${this.portName} --fqbn ${this.fqbn} -v`,
      sketchPath
    );
  }

  /**
   * Check whether baord is initialized
   * @returns {boolean}
   */
  private isReady(): boolean {
    return (
      this.portName !== undefined &&
      this.portName !== '' &&
      this.fqbn !== undefined
    );
  }

  /**
   *
   * @param command - the command to execute appended to `arduino-cli`
   * @param baseDirectoryPath - the location of the sketch (default none)
   * @returns a string containing the stdout
   */
  private run(
    command: string,
    baseDirectoryPath: string
  ): Promise<string> | never {
    return new Promise(async (resolve, reject) => {
      const workingDir = { cwd: baseDirectoryPath };
      try {
        const { stdout, stderr }: { stdout: string; stderr: string } =
          await exec(`arduino-cli ${command}`, workingDir);
        resolve(stdout + stderr);
      } catch (err) {
        reject(`Error: ${err}`);
      }
    });
  }
}

export { ArduinoBoard, ArduinoCli, ArduinoPlatform };
