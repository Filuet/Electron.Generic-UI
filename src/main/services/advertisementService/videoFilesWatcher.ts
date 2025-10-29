import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import config from '../../../../config.json';
import { dailyLogger } from '../loggingService/loggingService';
import { LogLevel } from '../../../shared/sharedTypes';

const setupVideoWatcher = (win: BrowserWindow): void => {
  if (!config.videoFilePath || typeof config.videoFilePath !== 'string') {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Invalid or missing VIDEO_FILE_PATH in config',
      component: 'videoFilesWatcher.ts',
      data: config.videoFilePath
    });
    return;
  }

  if (!Array.isArray(config.supportedVideoFormats) || config.supportedVideoFormats.length === 0) {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Invalid or missing supportedVideoFormats in config',
      component: 'videoFilesWatcher.ts',
      data: config.supportedVideoFormats
    });
    return;
  }

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
      level: LogLevel.ERROR,
      message: 'Error setting up video file watcher',
      data: err
    });
  }
};
export { setupVideoWatcher };
