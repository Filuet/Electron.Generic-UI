import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { setupVideoWatcher } from './services/advertisementService/videoFilesWatcher';
import registerAllIpcHandlers from './ipcHandlers/registerAllIpcHandlers';
import { mainWindowObject } from './windows/mainWindow/mainWindowObject';
import { dailyLogger } from './services/loggingService/loggingService';
import { ExpoStatuses, LogLevel } from '../shared/sharedTypes';
import { expoProcessManager } from './services/expoService/expoProcessManager';
import { IPC_CHANNELS } from '../shared/ipcChannels';
import { electronErrorHandling } from './services/electronErrorHandling';
import { setupAutoUpdater } from './services/autoUpdaterService';

let mainWindow: BrowserWindow | null = null;

// ----------------------------
// SETUP GLOBAL ERROR HANDLING
// ----------------------------
electronErrorHandling();

// ----------------------------
// SINGLE INSTANCE ENFORCEMENT
// ----------------------------
const gotTheLock = app.requestSingleInstanceLock();

const COMPONENT_NAME = 'main.ts';

if (!gotTheLock) {
  dailyLogger.log({
    level: LogLevel.INFO,
    message: 'Another instance detected. Quitting this instance.',
    component: COMPONENT_NAME
  });
  app.quit();
} else {
  app.on('second-instance', () => {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'Second instance detected; focusing existing window.',
      component: COMPONENT_NAME
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
      component: COMPONENT_NAME
    });

    try {
      electronApp.setAppUserModelId('Generic-UI');

      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
      });

      mainWindow = mainWindowObject();

      let currentAppStatus: ExpoStatuses = 'loading';

      ipcMain.handle(IPC_CHANNELS.EXPO_PROCESS_GET_STATUS, () => {
        return currentAppStatus;
      });

      if (mainWindow) {
        dailyLogger.log({
          level: LogLevel.INFO,
          message: 'Main window created successfully.',
          component: COMPONENT_NAME
        });

        registerAllIpcHandlers();
        dailyLogger.log({
          level: LogLevel.INFO,
          message: 'IPC handlers registered successfully.',
          component: COMPONENT_NAME
        });

        const updateStatus = (status: 'loading' | 'ready' | 'error'): void => {
          currentAppStatus = status;
          if (mainWindow) {
            mainWindow.webContents.send(IPC_CHANNELS.EXPO_PROCESS_STATUS, status);
          }
        };

        // Subscribe to Expo Process Status Changes
        expoProcessManager.on('status-change', (status: ExpoStatuses) => {
          updateStatus(status);
        });

        // Initialize with current status
        updateStatus(expoProcessManager.getCurrentStatus());

        // VIDEO WATCHER INITIALIZATION
        setupVideoWatcher(mainWindow);

        // EXPO SERVER INITIALIZATION
        try {
          dailyLogger.log({
            level: LogLevel.INFO,
            message: 'Initializing Expo process manager...',
            component: COMPONENT_NAME
          });

          // 2. Await actual readiness
          await expoProcessManager.initialize();

          dailyLogger.log({
            level: LogLevel.INFO,
            message: 'Expo Server ready. Application startup complete.',
            component: COMPONENT_NAME
          });
        } catch (err) {
          dailyLogger.log({
            level: LogLevel.ERROR,
            message: 'Critical Service Initialization Failed',
            component: COMPONENT_NAME,
            error: err
          });
          // Status update is handled by expoProcessManager emitting 'status-change' with 'error'
        }

        // AUTO-UPDATER INITIALIZATION
        setupAutoUpdater();
      }

      // MACOS ACTIVATE EVENT
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          mainWindow = mainWindowObject();
          setupVideoWatcher(mainWindow);
          dailyLogger.log({
            level: LogLevel.INFO,
            message: 'Main window recreated on macOS activate.',
            component: COMPONENT_NAME
          });
        }
      });
    } catch (error) {
      dailyLogger.log({
        level: LogLevel.ERROR,
        message: 'Error during app initialization',
        component: COMPONENT_NAME,
        error
      });
      app.quit();
    }
  });
}

// WINDOW ALL CLOSED HANDLER
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    dailyLogger.log({
      level: LogLevel.INFO,
      message: 'All windows closed. Quitting app...',
      component: COMPONENT_NAME
    });
    app.quit();
  }
});

// CERTIFICATE ERROR HANDLER
app.on('certificate-error', (event, _webContents, url, error, certificate, callback) => {
  const certInfo = JSON.stringify(certificate, null, 2);

  dailyLogger.log({
    level: LogLevel.ERROR,
    message: `Certificate error on URL: ${url}`,
    component: COMPONENT_NAME,
    data: `Error: ${error}, Certificate: ${certInfo}`
  });

  if (url.startsWith('https://localhost')) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// BEFORE QUIT HANDLER
app.on('before-quit', () => {
  dailyLogger.log({
    level: LogLevel.INFO,
    message: 'App is quitting...',
    component: COMPONENT_NAME
  });

  if (mainWindow) {
    mainWindow.removeAllListeners();
    mainWindow = null;
    expoProcessManager.stop();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

process.on('exit', (code) => {
  dailyLogger.log({
    level: LogLevel.INFO,
    message: `Main process exiting with code ${code}`,
    component: COMPONENT_NAME
  });
});
