/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { promisify } from 'util';
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
  private portName!: string;
  private fqbn!: ArduinoBoard;
  private ready: boolean;

  private constructor() {
    this.ready = false;
  }

  static getInstance() {
    if (!ArduinoCli.instance) this.instance = new ArduinoCli();
    return this.instance;
  }

  init(fqbn: ArduinoBoard, portName: string) {
    this.fqbn = fqbn;
    this.portName = portName;
    this.ready = true;
  }

  get platform(): string {
    this.checkIfReady();
    return this.fqbn.toString();
  }

  get port(): string {
    this.checkIfReady();
    return this.portName;
  }

  /**
   * Get version of Arduino-cli
   * @returns {Promise<string>} containing the stdout
   */
  version(): Promise<string> {
    return this.run(`version`, this.root());
  }

  /**
   * Check whether the Arduino-cli is installed
   * @returns true or false whether it is installed or not
   */
  async isInstalled(): Promise<boolean> {
    try {
      await this.run('', this.root());
      return true;
    } catch (err) {
      return false; // if it fails, it is not installed
    }
  }

  /**
   * Install the platform via `arduino-cli core install`
   * @param board - the board used to infer which platform to isntall
   * @returns a string containing the stdout
   */
  installPlatform(platform: ArduinoPlatform): Promise<string> {
    return this.run(`core install ${platform}`, this.root());
  }

  /**
   * Install the platform via `arduino-cli core install` for the current baord
   * @returns a string containing the stdout
   */
  installCurrentPlatform(): Promise<string> {
    const platform = this.fqbn
      .split(':')
      .slice(0, 2)
      .join(':') as ArduinoPlatform; // arduino:avr:uno -> arduino:avr

    // return this.installPlatform(this.fqbn);
    return this.installPlatform(platform);
  }

  compileSketch(sketchFolder: vscode.Uri): Promise<string> {
    if (!sketchFolder)
      throw new Error(`Sketch folder ${sketchFolder} is invalid`);

    this.checkIfReady(); // will throw an error if not initialized
    return this.run(`compile -b ${this.fqbn}`, sketchFolder);
  }

  uploadSketch(sketchFolder: vscode.Uri): Promise<string> {
    if (!sketchFolder)
      throw new Error(`Sketch folder ${sketchFolder} is invalid`);

    this.checkIfReady(); // will throw an error if not initialized
    return this.run(
      `upload --port ${this.portName} --fqbn ${this.fqbn}`,
      sketchFolder
    );
  }

  listAvailablePorts(): Promise<string[]> {
    return new Promise(async (resolve) => {
      const res = await this.run(`board list --format json`, this.root());
      const resObj = JSON.parse(res);
      const ports = resObj.map((val: any) => val.port!.address);
      resolve(ports);
    });
  }

  // Private methods

  private root(): vscode.Uri {
    return vscode.Uri.file('/');
  }

  private checkIfReady(): void | never {
    if (!this.ready) throw new Error(`Arduino board not initalized`);
  }

  /**
   *
   * @param command - the command to execute appended to `arduino-cli`
   * @param baseDirectoryPath - the location of the sketch (default none)
   * @returns a string containing the stdout
   */
  private run(
    command: string,
    baseDirectoryPath: vscode.Uri
  ): Promise<string> | never {
    return new Promise(async (res, rej) => {
      const workingDir = { cwd: baseDirectoryPath.fsPath };
      try {
        const { stdout, stderr }: { stdout: string; stderr: string } =
          await exec(`arduino-cli ${command}`, workingDir);
        if (stdout) res(stdout);
        else res(stderr);
      } catch (err) {
        rej(`Error: ${err}`);
      }
    });
  }
}

export { ArduinoBoard, ArduinoCli, ArduinoPlatform };
