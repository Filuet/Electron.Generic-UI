import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { getVideoFileNames } from './videosUtils';
import config from '../../config.json';
import fs from 'fs';
import { dailyLogger, performanceLogger } from './loggerUtils/logger';

// Handle certificate issues if needed
app.commandLine.appendSwitch('ignore-certificate-errors');

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    kiosk: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false // allow file access from renderer
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  setupIPCHandlers();
  setupVideoWatcher(mainWindow); //  attach file watcher
}

function setupIPCHandlers() {
  ipcMain.handle('get-video-files', async (): Promise<string[]> => {
    return getVideoFileNames();
  });

  ipcMain.handle('log:generic', (_e, { level, message, component, data, timestamp }) => {
    dailyLogger.log(level, message, { component, data, timestamp });
  });

  ipcMain.handle('log:performance', (_e, { level, message, component, data, timestamp }) => {
    performanceLogger.log(level, message, { component, data, timestamp });
  });
}

function setupVideoWatcher(win: BrowserWindow) {
  const VIDEO_FILE_PATH = config.videoFilePath;
  const SUPPORTED_FORMATS = config.supportedVideoFormats.map((ext: string) => ext.toLowerCase());

  try {
    const watcher = fs.watch(VIDEO_FILE_PATH, (eventType, fileName) => {
      if (!fileName) return;

      const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        console.log(`[WATCH] ${eventType.toUpperCase()} detected for: ${fileName}`);
        if (win && !win.isDestroyed()) {
          win.webContents.send('video-folder-updated');
        }
      }
    });

    app.on('will-quit', () => watcher.close());
  } catch (err) {
    console.error('[WATCH ERROR] Could not watch folder:', err);
  }
}

// 🔄 Lifecycle hooks
app.whenReady().then(() => {
  electronApp.setAppUserModelId('Generic-UI');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
