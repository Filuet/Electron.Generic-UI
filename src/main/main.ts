import { app, BrowserWindow } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { setupVideoWatcher } from './services/videoFilesService/videoFilesWatcher';
import registerAllIpcHandlers from './ipcHandlers/registerAllIpcHandlers';
import { mainWindowObject } from './windows/mainWindow/mainWindowObject';
import { dailyLogger } from './services/loggingService/loggingService';

let mainWindow: BrowserWindow | null = null;

// app.commandLine.appendSwitch('ignore-certificate-errors');

// Single instance lock true/false , true - this instance owns the lock , false --> another instance already has the lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // when gotTheLock is false then quit this app instance
  app.quit();
} else {
  // if this window has that lock means true , then focus this window
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('Generic-UI');

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    mainWindow = mainWindowObject();

    registerAllIpcHandlers();

    if (mainWindow) setupVideoWatcher(mainWindow);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = mainWindowObject();
        setupVideoWatcher(mainWindow);
      }
    });
  });
}

// Quit app on Windows/Linux when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  dailyLogger.log({
    level: 'error',
    message: `Error in certificates --> ${certificate}`,
    error: error,
    data: webContents
  });
  if (url.startsWith('https://localhost')) {
    event.preventDefault();
    callback(true); // Trust this cert
  } else {
    callback(false);
  }
});

// Optional cleanup before quitting
app.on('before-quit', () => {
  console.log('App is quitting...');
});

// Error handling
// both event will occur when main process may have some unexpected errors and stop working,
// but the renderer will not exit means the renderer may be accessible, for closing the window and whole app execution these event will be used
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
  if (err) {
    app.quit();
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  app.quit();
});
