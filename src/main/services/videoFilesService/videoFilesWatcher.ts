import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import config from '../../../../config.json';
import { dailyLogger } from '../loggingService/loggingService';

const setupVideoWatcher = (win: BrowserWindow) => {
  const VIDEO_FILE_PATH = config.videoFilePath;
  const SUPPORTED_FORMATS = config.supportedVideoFormats.map((ext: string) => ext.toLowerCase());

  try {
    const watcher = fs.watch(VIDEO_FILE_PATH, (_eventType, fileName) => {
      if (!fileName) return;

      const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        if (win && !win.isDestroyed()) {
          win.webContents.send('video-folder-updated');
        }
      }
    });

    app.on('will-quit', () => watcher.close());
  } catch (err) {
    dailyLogger.log({
      level: 'error',
      message: 'Error setting up video file watcher',
      data: err
    });
  }
};
export { setupVideoWatcher };
