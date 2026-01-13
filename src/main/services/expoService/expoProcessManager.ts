import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { ChildProcess, spawn, exec } from 'child_process';
import { getExpoRunningStatus } from './expoApis';
import { dailyLogger } from '../loggingService/loggingService';
import { LogLevel, ExpoStatuses } from '../../../shared/sharedTypes';
import config from '../../../../config.json';

const COMPONENT_NAME = 'expoProcessManager.ts';
const EXPO_EXE_FILE_NAME = 'Filuet.Hardware.Dispenser.exe';
const EXPO_EXE_PATH = path.join(config.expoExePath, EXPO_EXE_FILE_NAME);

class ExpoProcessManager extends EventEmitter {
  private child: ChildProcess | null = null;
  private isRestarting = false;
  private currentStatus: ExpoStatuses = 'loading';
  private isAppQuitting = false;

  constructor() {
    super();
  }

  private setStatus(status: ExpoStatuses): void {
    // set status only if it has changed
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.emit('status-change', status);
      dailyLogger.log({
        level: LogLevel.INFO,
        message: `Expo Status changed to: ${status}`,
        component: COMPONENT_NAME
      });
    }
  }

  public getCurrentStatus(): ExpoStatuses {
    return this.currentStatus;
  }
  // this function is used to handle process termination and called on exit and error events
  private handleProcessTermination(level: LogLevel, message: string, data?: unknown): void {
    if (this.isAppQuitting) return;

    dailyLogger.log({
      level,
      message,
      component: COMPONENT_NAME,
      data
    });
    this.setStatus('error');
    this.handleConnectionError();
  }

  /*
   * Initializes the Expo Manager.
   * If initialization fails, the background retry logic (handleConnectionError) will attempt to recover.
   */
  public async initialize(): Promise<void> {
    this.setStatus('loading');

    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Initializing Expo Process Manager',
      component: COMPONENT_NAME,
      data: { expoExePath: EXPO_EXE_PATH }
    });

    try {
      // 1. Always ensure a clean slate
      await this.killExistingProcess().then(
        () => new Promise((resolve) => setTimeout(resolve, 3000))
      );

      // 2. validate path
      if (!fs.existsSync(EXPO_EXE_PATH)) {
        dailyLogger.log({
          level: LogLevel.ERROR,
          message: `Expo path not found at: ${EXPO_EXE_PATH}`,
          component: COMPONENT_NAME
        });
      }

      await this.spawnExpoProcess();
    } catch (error) {
      // Do NOT rethrow. Swallow error to prevent App Crash.
      dailyLogger.log({
        level: LogLevel.ERROR,
        message: 'Initial Expo Server spawn failed. Relying on retry mechanism.',
        component: COMPONENT_NAME,
        data: error
      });
      // We manually trigger connection error handling if spawn failed completely
      this.setStatus('error');
      this.handleConnectionError();
    }
  }

  /*
   * Spawns the child process and binds all necessary listeners.
   * Returns a promise that resolves when the API is confirmed READY.
   */
  private spawnExpoProcess(): Promise<void> {
    if (this.isAppQuitting) return Promise.resolve();

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

    // logging child process output
    if (this.child.stdout) {
      this.child.stdout.on('data', (data) => {
        dailyLogger.log({
          level: LogLevel.INFO,
          message: `Expo Output: ${data.toString()}`,
          component: COMPONENT_NAME
        });
      });
    }

    // logging child process error output
    // if (this.child.stderr) {
    //   this.child.stderr.on('data', (data) => {
    //     if (this.currentStatus !== 'ready') {
    //       dailyLogger.log({
    //         level: LogLevel.ERROR,
    //         message: `Expo Error Output: ${data.toString()}`,
    //         component: COMPONENT_NAME
    //       });
    //     }
    //   });
    // }

    this.child.on('error', (err) => {
      this.handleProcessTermination(LogLevel.ERROR, 'Expo process returned an error event', err);
    });

    this.child.on('exit', (code, signal) => {
      this.child = null;
      this.handleProcessTermination(
        LogLevel.WARN,
        `Expo process exited (Code: ${code}, Signal: ${signal}).`
      );
    });

    return new Promise<void>((resolve, reject) => {
      if (!this.child) {
        return reject(new Error('Child process was null immediately after spawn'));
      }

      // this event is emitted when the child process has been successfully spawned
      this.child.on('spawn', async () => {
        dailyLogger.log({
          level: LogLevel.INFO,
          message: 'Expo process spawned. Verifying API readiness...',
          component: COMPONENT_NAME
        });

        await new Promise((resolve) => setTimeout(resolve, 4000));

        try {
          await this.waitForApiReady();
          this.setStatus('ready');
          return resolve();
        } catch (error) {
          dailyLogger.log({
            level: LogLevel.ERROR,
            message: 'Expo API failed readiness check after spawn.',
            component: COMPONENT_NAME,
            data: error
          });
          // Note: waitForApiReady calls handleConnectionError on failure,
          // so we just reject this promise to finish this function execution.
          return reject(error);
        }
      });
    });
  }

  /*
   * Polls the Expo API to check if it is ready.
   */
  private async waitForApiReady(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 10;
    const intervalMs = 3000;

    return new Promise<void>((resolve, reject) => {
      const check = async (): Promise<void> => {
        if (this.isAppQuitting) {
          return resolve();
        }

        attempts++;
        try {
          await getExpoRunningStatus();
          dailyLogger.log({
            level: LogLevel.INFO,
            message: 'Expo API is ready and responding.',
            component: COMPONENT_NAME
          });
          resolve();
        } catch (error) {
          if (attempts >= maxAttempts) {
            const msg = 'Expo API failed to become ready within the timeout period.';
            dailyLogger.log({
              level: LogLevel.ERROR,
              message: msg,
              component: COMPONENT_NAME,
              data: error
            });
            // Trigger restart
            this.handleConnectionError();
            reject(new Error(msg));
          } else {
            setTimeout(() => {
              dailyLogger.log({
                level: LogLevel.INFO,
                message: `Waiting for Expo API to be ready... (Attempt ${attempts}/${maxAttempts})`,
                component: COMPONENT_NAME
              });
              check();
            }, intervalMs);
          }
        }
      };
      check();
    });
  }

  // Handles restarts cleanly.

  public async handleConnectionError(): Promise<void> {
    if (this.isAppQuitting) return;
    if (this.isRestarting) {
      dailyLogger.log({
        level: LogLevel.WARN,
        message: 'Restart already in progress.',
        component: COMPONENT_NAME
      });
      return;
    }

    this.isRestarting = true;
    this.setStatus('loading');

    dailyLogger.log({
      level: LogLevel.WARN,
      message: 'Initiating Expo Service Restart...',
      component: COMPONENT_NAME
    });

    try {
      this.killChild();
      await this.killExistingProcess();

      // Wait a bit before re-spawning to ensure cleanup
      setTimeout(async () => {
        try {
          await this.spawnExpoProcess();
        } catch (error) {
          dailyLogger.log({
            level: LogLevel.ERROR,
            message: 'Restart spawn failed.',
            component: COMPONENT_NAME,
            data: error
          });
        } finally {
          this.isRestarting = false;
        }
      }, 3000);
    } catch (err) {
      dailyLogger.log({
        level: LogLevel.ERROR,
        message: 'Error during restart sequence',
        component: COMPONENT_NAME,
        data: err
      });
      this.isRestarting = false;
    }
  }

  private killChild(): void {
    if (this.child) {
      this.child.removeAllListeners(); // Prevent triggering exit/error again
      this.child.kill();
      this.child = null;
      dailyLogger.log({
        level: LogLevel.INFO,
        message: 'Child process killed internally.',
        component: COMPONENT_NAME
      });
    }
  }

  private killExistingProcess(): Promise<void> {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: `Scanning for existing ${EXPO_EXE_FILE_NAME}...`,
      component: COMPONENT_NAME
    });
    return new Promise<void>((resolve) => {
      exec(`taskkill /F /IM "${EXPO_EXE_FILE_NAME}"`, (err) => {
        if (!err) {
          dailyLogger.log({
            level: LogLevel.INFO,
            message: `Terminated existing ${EXPO_EXE_FILE_NAME}.`,
            component: COMPONENT_NAME
          });
        }
        resolve();
      });
    });
  }

  public async stop(): Promise<void> {
    this.isAppQuitting = true;
    this.isRestarting = false;
    this.killChild();
    await this.killExistingProcess();
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Expo Service stopped (App Quit).',
      component: COMPONENT_NAME
    });
  }
}

export const expoProcessManager = new ExpoProcessManager();
