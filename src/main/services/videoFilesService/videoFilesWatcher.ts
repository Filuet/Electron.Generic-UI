import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import config from '../../../../config.json';

const setupVideoWatcher = (win: BrowserWindow) => {
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
};
export { setupVideoWatcher };
