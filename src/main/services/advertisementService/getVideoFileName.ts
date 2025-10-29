import fs from 'fs';
import config from '../../../../config.json';
import path from 'path';
import { dailyLogger } from '../loggingService/loggingService';
import { LogLevel } from '../../../shared/sharedTypes';

const SUPPORTED_FILE_EXTENSIONS = config.supportedVideoFormats || ['.mp4'];
const VIDEO_FILE_PATH = config.videoFilePath || './videos';

export const getVideoFileNames = (): string[] => {
  try {
    const files = fs.readdirSync(VIDEO_FILE_PATH);
    return files.filter((file) =>
      SUPPORTED_FILE_EXTENSIONS.includes(path.extname(file).toLowerCase())
    );
  } catch (error) {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Error reading video files',
      component: 'videoFiles',
      data: { error }
    });

    return [];
  }
};
