import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import config from '../../../../config.json';
import { dailyLogger } from '../loggingService/loggingService';
import { LogLevel } from '../../../shared/sharedTypes';

const setupVideoWatcher = (win: BrowserWindow): void => {
  const COMPONENT = 'videoFilesWatcher.ts';

  // Validating config values
  if (!config.videoFilePath || typeof config.videoFilePath !== 'string') {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Invalid or missing VIDEO_FILE_PATH in config',
      component: COMPONENT,
      data: config.videoFilePath
    });
    return;
  }

  if (!Array.isArray(config.supportedVideoFormats) || config.supportedVideoFormats.length === 0) {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Invalid or missing supportedVideoFormats in config',
      component: COMPONENT,
      data: config.supportedVideoFormats
    });
    return;
  }

  const VIDEO_FILE_PATH = path.resolve(config.videoFilePath);
  const SUPPORTED_FORMATS = config.supportedVideoFormats.map((ext: string) => ext.toLowerCase());

  try {
    // checking if directory exists, if not, create it
    if (!fs.existsSync(VIDEO_FILE_PATH)) {
      dailyLogger.log({
        level: LogLevel.WARN,
        message: `Video directory not found at "${VIDEO_FILE_PATH}". Attempting to create it...`,
        component: COMPONENT
      });

      try {
        fs.mkdirSync(VIDEO_FILE_PATH, { recursive: true });
        dailyLogger.log({
          level: LogLevel.INFO,
          message: `Successfully created missing video directory: ${VIDEO_FILE_PATH}`,
          component: COMPONENT
        });
      } catch (createErr) {
        dailyLogger.log({
          level: LogLevel.ERROR,
          message: `Failed to create video directory: ${VIDEO_FILE_PATH}`,
          component: COMPONENT,
          data: createErr
        });
      }
    }

    const watcher = fs.watch(VIDEO_FILE_PATH, (eventType, fileName) => {
      if (!fileName) return;

      const ext = path.extname(fileName).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        dailyLogger.log({
          level: LogLevel.INFO,
          message: `Detected change in video folder (${eventType}): ${fileName}`,
          component: COMPONENT
        });

        if (win && !win.isDestroyed()) {
          win.webContents.send('video-folder-updated');
        }
      }
    });

    // Handle watcher errors
    watcher.on('error', (err) => {
      dailyLogger.log({
        level: LogLevel.ERROR,
        message: 'File watcher encountered an error',
        component: COMPONENT,
        data: err
      });
    });

    // Clean up on app quit
    app.on('will-quit', () => {
      watcher.close();
      dailyLogger.log({
        level: LogLevel.INFO,
        message: 'Video file watcher closed on app quit',
        component: COMPONENT
      });
    });

    dailyLogger.log({
      level: LogLevel.INFO,
      message: `Video file watcher successfully initialized at: ${VIDEO_FILE_PATH}`,
      component: COMPONENT
    });
  } catch (err) {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Unexpected error setting up video file watcher',
      component: COMPONENT,
      data: err
    });
  }
};

export { setupVideoWatcher };
