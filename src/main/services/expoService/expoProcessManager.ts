import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { ChildProcess, spawn, exec } from 'child_process';
import { testMachine } from './expoApis';
import { dailyLogger } from '../loggingService/loggingService';
import { LogLevel, ExpoStatuses } from '../../../shared/sharedTypes';
import config from '../../../../config.json';

const COMPONENT_NAME = 'expoProcessManager';
const EXPO_EXE_FILE_NAME = 'Filuet.Hardware.Dispenser.exe';
const EXPO_EXE_PATH = path.join(config.expoExePath, EXPO_EXE_FILE_NAME);

class ExpoProcessManager extends EventEmitter {
  private child: ChildProcess | null = null;
  private isRestarting = false;
  private isFirstTimeRunning = false;
  private currentStatus: ExpoStatuses = 'loading';

  constructor() {
    super();
    // setConnectionErrorHandler(() => {
    //   this.handleConnectionError();
    // });
  }

  private setStatus(status: ExpoStatuses): void {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.emit('status-change', status);
    }
  }

  public getStatus(): ExpoStatuses {
    return this.currentStatus;
  }

  public async initialize(): Promise<void> {
    this.isFirstTimeRunning = true;
    this.setStatus('loading');

    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Initializing Expo Server Manager...',
      component: COMPONENT_NAME
    });

    try {
      await this.killExistingProcess();

      if (!fs.existsSync(EXPO_EXE_PATH)) {
        dailyLogger.log({
          level: LogLevel.ERROR,
          message: `Expo path not found at: ${EXPO_EXE_PATH}`,
          component: COMPONENT_NAME
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      await this.spawnExpoProcess();
    } catch (error) {
      dailyLogger.log({
        level: LogLevel.ERROR,
        message: 'Failed to initialize Expo Server',
        component: COMPONENT_NAME,
        data: error
      });
      this.setStatus('error');
      throw error;
    }
  }

  private spawnExpoProcess(): Promise<void> {
    if (!this.isFirstTimeRunning) return Promise.resolve();

    dailyLogger.log({
      level: LogLevel.INFO,
      message: `Spawning Expo process at: ${EXPO_EXE_PATH}`,
      component: COMPONENT_NAME
    });

    this.child = spawn(EXPO_EXE_PATH, [], {
      cwd: path.dirname(EXPO_EXE_PATH),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });

    return new Promise<void>((resolve, reject) => {
      if (!this.child) {
        dailyLogger.log({
          level: LogLevel.ERROR,
          message: 'Child process failed to create',
          component: COMPONENT_NAME
        });
        this.setStatus('error');
        return;
      }

      if (this.child.stdout) {
        this.child.stdout.on('data', (data) => {
          dailyLogger.log({
            level: LogLevel.INFO,
            message: `Expo Process Output: ${data.toString()}`,
            component: COMPONENT_NAME
          });
        });
      }

      if (this.child.stderr) {
        this.child.stderr.on('data', (data) => {
          dailyLogger.log({
            level: LogLevel.ERROR,
            message: `Expo Process Error: ${data.toString()}`,
            component: COMPONENT_NAME
          });
        });
      }

      this.child.on('spawn', async () => {
        dailyLogger.log({
          level: LogLevel.INFO,
          message: 'Expo process spawned successfully. Waiting for API readiness...',
          component: COMPONENT_NAME
        });
        await new Promise((resolve) => setTimeout(resolve, 4000));

        try {
          await this.waitForApiReady();
          this.setStatus('ready');
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.child.on('error', (err) => {
        dailyLogger.log({
          level: LogLevel.ERROR,
          message: 'Failed to spawn Expo process',
          component: COMPONENT_NAME,
          data: err
        });
        this.scheduleRestart();
      });

      this.child.on('exit', (code, signal) => {
        dailyLogger.log({
          level: LogLevel.WARN,
          message: `Expo process exited with code ${code} and signal ${signal}`,
          component: COMPONENT_NAME
        });
        this.child = null;

        if (this.isFirstTimeRunning) {
          dailyLogger.log({
            level: LogLevel.INFO,
            message: 'Process died unexpectedly. Restarting immediately...',
            component: COMPONENT_NAME
          });
          this.scheduleRestart();
        }
      });
    });
  }

  private async waitForApiReady(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 10;
    const intervalMs = 3000;

    return new Promise<void>((resolve, reject) => {
      const check = async (): Promise<void> => {
        if (!this.isFirstTimeRunning) {
          resolve();
          return;
        }

        attempts++;
        try {
          await testMachine();
          dailyLogger.log({
            level: LogLevel.INFO,
            message: 'Expo API is responding. Server is ready.',
            component: COMPONENT_NAME
          });
          resolve();
        } catch (error) {
          if (attempts >= maxAttempts) {
            const msg = 'Expo API failed to become ready within timeout.';
            dailyLogger.log({
              level: LogLevel.ERROR,
              message: msg,
              component: COMPONENT_NAME,
              data: error
            });

            this.handleConnectionError();
            reject(new Error(msg));
          } else {
            setTimeout(check, intervalMs);
          }
        }
      };
      check();
    });
  }

  public async handleConnectionError(): Promise<void> {
    if (this.isRestarting || !this.isFirstTimeRunning) return;

    this.isRestarting = true;
    this.setStatus('loading');

    dailyLogger.log({
      level: LogLevel.WARN,
      message: 'Handling connection error: Restarting Expo Service...',
      component: COMPONENT_NAME
    });

    try {
      this.killChild();
      await this.killExistingProcess();

      setTimeout(() => {
        this.isRestarting = false;
        this.spawnExpoProcess();
      }, 2000);
    } catch {
      this.isRestarting = false;
    }
  }

  private scheduleRestart(): void {
    if (this.isRestarting) return;
    this.isRestarting = true;
    this.setStatus('loading');

    setTimeout(() => {
      this.isRestarting = false;
      this.spawnExpoProcess();
    }, 7000);
  }

  private killChild(): void {
    if (this.child) {
      this.child.removeAllListeners();
      this.child.kill();
      this.child = null;
      dailyLogger.log({
        level: LogLevel.INFO,
        message: 'Killed Expo child process.',
        component: COMPONENT_NAME
      });
    }
  }

  private killExistingProcess(): Promise<void> {
    return new Promise<void>((resolve) => {
      exec(`taskkill /F /IM "${EXPO_EXE_FILE_NAME}"`, (err) => {
        if (!err) {
          dailyLogger.log({
            level: LogLevel.INFO,
            message: `Killed existing ${EXPO_EXE_FILE_NAME} process via taskkill.`,
            component: COMPONENT_NAME
          });
        }
        resolve();
      });
    });
  }

  public stop(): void {
    this.isFirstTimeRunning = false;
    this.isRestarting = false;
    this.killChild();
    this.killExistingProcess();
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Expo Service has been stopped.',
      component: 'main.ts'
    });
  }
}

export const expoProcessManager = new ExpoProcessManager();
