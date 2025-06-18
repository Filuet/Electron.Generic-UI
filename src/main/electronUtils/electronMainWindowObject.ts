import { BrowserWindow, shell } from 'electron';
import { resolve } from 'path';
import { is } from '@electron-toolkit/utils';

export function electronMainWindowObject(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    kiosk: true, //locks the window in full screen, disables exit via keyboard
    fullscreen: true, // Ensures full screen even if kiosk fails
    frame: false, // Removes the OS window frame (title bar, borders  )
    alwaysOnTop: true, // Keeps it above other windows
    skipTaskbar: true, // Hides from the taskbar
    webPreferences: {
      preload: resolve(__dirname, '../../out/preload/preload.js'),
      sandbox: false,
      webSecurity: false // allow file access from renderer
    }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(resolve(__dirname, '../../out/renderer/index.html'));
  }

  return mainWindow;
}
