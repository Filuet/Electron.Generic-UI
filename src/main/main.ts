import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { setupVideoWatcher } from './services/advertisementService/videoFilesWatcher';
import registerAllIpcHandlers from './ipcHandlers/registerAllIpcHandlers';
import { mainWindowObject } from './windows/mainWindow/mainWindowObject';
import { dailyLogger } from './services/loggingService/loggingService';
import { LogLevel } from '../shared/sharedTypes';

let mainWindow: BrowserWindow | null = null;

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
      // AUTO-UPDATER CONFIGURATION
      // ----------------------------
      autoUpdater.autoDownload = true;
      autoUpdater.autoInstallOnAppQuit = true;

      dailyLogger.log({
        level: LogLevel.INFO,
        message: 'Starting update check...',
        component: 'autoUpdater'
      });

      await autoUpdater.checkForUpdatesAndNotify().catch((err) => {
        dailyLogger.log({
          level: LogLevel.ERROR,
          message: 'Failed to check for updates',
          component: 'autoUpdater',
          data: JSON.stringify(err)
        });
      });

      dailyLogger.log({
        level: LogLevel.INFO,
        message: 'Update check complete.',
        component: 'autoUpdater'
      });

      // ----------------------------
      // AUTO-UPDATER EVENT HANDLERS
      // ----------------------------
      autoUpdater.on('checking-for-update', () => {
        dailyLogger.log({
          level: LogLevel.INFO,
          message: 'Checking for update...',
          component: 'autoUpdater'
        });
      });

      autoUpdater.on('update-available', (info) => {
        dailyLogger.log({
          level: LogLevel.INFO,
          message: 'Update available.',
          component: 'autoUpdater',
          data: JSON.stringify(info)
        });
      });
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'Filuet',
        repo: 'Electron.Generic-UI'
      });
      autoUpdater.on('update-not-available', (info) => {
        dailyLogger.log({
          level: LogLevel.INFO,
          message: 'No updates available.',
          component: 'autoUpdater',
          data: JSON.stringify(info)
        });
      });

      autoUpdater.on('download-progress', (progressObj) => {
        dailyLogger.log({
          level: LogLevel.INFO,
          message: 'Download progress.',
          component: 'autoUpdater',
          data: JSON.stringify(progressObj)
        });
      });

      autoUpdater.on('update-downloaded', () => {
        dailyLogger.log({
          level: LogLevel.INFO,
          message: 'Update downloaded successfully. Installing...',
          component: 'autoUpdater'
        });
        autoUpdater.quitAndInstall(false, true);
      });

      autoUpdater.on('error', (error) => {
        dailyLogger.log({
          level: LogLevel.ERROR,
          message: 'Error in auto-updater',
          component: 'autoUpdater',
          data: JSON.stringify(error)
        });
      });

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

process.on('exit', (code) => {
  dailyLogger.log({
    level: LogLevel.INFO,
    message: `Main process exiting with code ${code}`,
    component: 'main.ts'
  });
});
