import { BrowserWindowConstructorOptions, app } from 'electron';
import { resolve } from 'path';

// Set Chromium command-line switches before app is ready
app.commandLine.appendSwitch('force-device-scale-factor', '2'); // Force 100% scaling regardless of system setting
app.commandLine.appendSwitch('high-dpi-support', '1'); // Enable high-DPI support without scaling

export const windowProdSettings: BrowserWindowConstructorOptions = {
  resizable: false, // Prevent window resizing
  width: 1080,
  height: 1920,
  kiosk: true, // open window in kiosk mode
  fullscreen: true,
  frame: false,
  show: false, // Don't show window until it's ready (use ready-to-show)
  center: true, // Center the window on the screen
  autoHideMenuBar: true, // Hide menu bar unless Alt key is pressed
  title: 'Generic-UI', // Window title
  webPreferences: {
    preload: resolve(__dirname, '../../out/preload/preload.js'), // Preload script path
    sandbox: false, // Disable sandbox for better compatibility (enable with caution)
    webSecurity: true, // Enable same-origin policy for security (using custom protocol for local files)
    contextIsolation: true, // Isolate preload script from renderer for security
    zoomFactor: 1.0, // Lock zoom level to 100%
    devTools: false,
    disableHtmlFullscreenWindowResize: true, // Prevent auto-resizing on HTML5 fullscreen
    safeDialogs: true // Prevent unexpected dialogs
  }
};
