import { is } from '@electron-toolkit/utils';
import { BrowserWindow, BrowserWindowConstructorOptions, shell } from 'electron';
import { windowDevSettings } from '../windowConfig/windowDevSettings';
import { windowProdSettings } from '../windowConfig/windowProdSettings';
import { resolve } from 'path';

export const mainWindowObject = (): BrowserWindow => {
  const windowConfig: BrowserWindowConstructorOptions = !is.dev
    ? windowDevSettings
    : windowProdSettings;

  const mainWindow: BrowserWindow = new BrowserWindow(windowConfig);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // Below line is saying that any url or the link that are being opens with window.open or target= "_blank" will open in user's default browser;
    shell.openExternal(details.url);
    // Below line is preventing the url to be opened in a new BrowserWindow of electron app
    return { action: 'deny' };
  });
  if (is.dev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(resolve(__dirname, '../../out/renderer/index.html'));
  }
  return mainWindow;
};
