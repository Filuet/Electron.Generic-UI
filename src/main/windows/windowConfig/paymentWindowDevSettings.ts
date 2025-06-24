import { BrowserWindowConstructorOptions } from 'electron';

export const paymentWindowDevSettings: BrowserWindowConstructorOptions = {
  kiosk: true,
  fullscreen: true,
  alwaysOnTop: true,
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
  }
};
