import { app } from 'electron';
import { dailyLogger } from '../services/loggingService/loggingService';
import { LogLevel } from '../../shared/sharedTypes';

export function setupGlobalErrorHandling(): void {
  // ----------------------------
  // GLOBAL ERROR HANDLING
  // ----------------------------
  process.on('uncaughtException', (err) => {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Uncaught Exception in main process',
      component: 'main.ts',
      error: err
    });

    app.quit();
  });

  process.on('unhandledRejection', (reason) => {
    let errorDetails = '';

    if (reason instanceof Error) {
      errorDetails = `${reason.name}: ${reason.message}\n${reason.stack}`;
    } else {
      try {
        errorDetails = JSON.stringify(reason, null, 2);
      } catch (jsonErr) {
        errorDetails = `Unserializable reason: ${String(reason)}, error during serialization: ${jsonErr}`;
      }
    }

    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Unhandled Promise Rejection',
      component: 'main.ts',
      error: errorDetails
    });

    app.quit();
  });
}
