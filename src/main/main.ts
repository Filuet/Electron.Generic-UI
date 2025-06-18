import { app, BrowserWindow } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { videoFilesHandler } from './ipc/videoFilesHandler';
import { loggingIpcHandler } from './ipc/loggingHandler';
import { setupVideoWatcher } from './electronUtils/videoUtils/videoFilesWatcher';
import { electronMainWindowObject } from './electronUtils/electronMainWindowObject';

app.commandLine.appendSwitch('ignore-certificate-errors');

let mainWindow: BrowserWindow | null = null;

const registerAllIpcHandlers = () => {
  videoFilesHandler();
  loggingIpcHandler();
};

app.whenReady().then(() => {
  electronApp.setAppUserModelId('Generic-UI');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  mainWindow = electronMainWindowObject();

  registerAllIpcHandlers();

  if (mainWindow) setupVideoWatcher(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = electronMainWindowObject();
      setupVideoWatcher(mainWindow);
    }
  });
});
