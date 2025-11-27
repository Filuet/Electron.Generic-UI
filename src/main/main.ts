import { app, BrowserWindow } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { setupVideoWatcher } from './services/advertisementService/videoFilesWatcher';
import registerAllIpcHandlers from './ipcHandlers/registerAllIpcHandlers';
import { mainWindowObject } from './windows/mainWindow/mainWindowObject';
import { dailyLogger } from './services/loggingService/loggingService';
import { LogLevel } from '../shared/sharedTypes';
import { setupAutoUpdater } from './services/UpdateService';
import { setupGlobalErrorHandling } from './services/ErrorHandler';

let mainWindow: BrowserWindow | null = null;

// ----------------------------
// SETUP GLOBAL ERROR HANDLING
// ----------------------------
setupGlobalErrorHandling();

// ----------------------------
// SINGLE INSTANCE ENFORCEMENT
// ----------------------------
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  dailyLogger.log({
    level: LogLevel.INFO,
    message: 'Another instance detected. Quitting this instance.',
    component: 'main.ts'
  });
  app.quit();
} else {
  app.on('second-instance', () => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Second instance detected; focusing existing window.',
      component: 'main.ts'
    });

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // ----------------------------
  // APP READY EVENT
  // ----------------------------
  app.whenReady().then(async () => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'App initializing...',
      component: 'main.ts'
    });

    try {
      electronApp.setAppUserModelId('Generic-UI');

      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
      });

      mainWindow = mainWindowObject();
      dailyLogger.log({
        level: LogLevel.INFO,
        message: 'Main window created successfully.',
        component: 'main.ts'
      });

      registerAllIpcHandlers();
      dailyLogger.log({
        level: LogLevel.INFO,
        message: 'IPC handlers registered successfully.',
        component: 'main.ts'
      });

      if (mainWindow) {
        setupVideoWatcher(mainWindow);
        dailyLogger.log({
          level: LogLevel.INFO,
          message: 'Video watcher initialized.',
          component: 'main.ts'
        });
      }

      // ----------------------------
      // AUTO-UPDATER INITIALIZATION
      // ----------------------------
      setupAutoUpdater();

      // ----------------------------
      // MACOS ACTIVATE EVENT
      // ----------------------------
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          mainWindow = mainWindowObject();
          setupVideoWatcher(mainWindow);
          dailyLogger.log({
            level: LogLevel.INFO,
            message: 'Main window recreated on macOS activate.',
            component: 'main.ts'
          });
        }
      });
    } catch (error) {
      dailyLogger.log({
        level: LogLevel.ERROR,
        message: 'Error during app initialization',
        component: 'main.ts',
        error
      });
      app.quit();
    }
  });
}

// ----------------------------
// WINDOW ALL CLOSED HANDLER
// ----------------------------
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'All windows closed. Quitting app...',
      component: 'main.ts'
    });
    app.quit();
  }
});

// ----------------------------
// CERTIFICATE ERROR HANDLER
// ----------------------------
app.on('certificate-error', (event, _webContents, url, error, certificate, callback) => {
  const certInfo = JSON.stringify(certificate, null, 2);

  dailyLogger.log({
    level: LogLevel.ERROR,
    message: `Certificate error on URL: ${url}`,
    component: 'main.ts',
    data: `Error: ${error}, Certificate: ${certInfo}`
  });

  if (url.startsWith('https://localhost')) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// ----------------------------
// BEFORE QUIT HANDLER
// ----------------------------
app.on('before-quit', () => {
  dailyLogger.log({
    level: LogLevel.INFO,
    message: 'App is quitting...',
    component: 'main.ts'
  });

  if (mainWindow) {
    mainWindow.removeAllListeners();
    mainWindow = null;
  }
});

process.on('exit', (code) => {
  dailyLogger.log({
    level: LogLevel.INFO,
    message: `Main process exiting with code ${code}`,
    component: 'main.ts'
  });
});
