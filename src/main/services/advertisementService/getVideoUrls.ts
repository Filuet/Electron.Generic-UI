import { readFile } from 'fs/promises';
import { join } from 'path';
import config from '../../../../config.json';
import { dailyLogger } from '../loggingService/loggingService';
import { LogLevel } from '../../../shared/sharedTypes';

export const getVideoContent = async (filename: string): Promise<string | null> => {
  try {
    const isAbsolute =
      config.videoFilePath.startsWith('/') || /^[A-Z]:/i.test(config.videoFilePath);

    const fullPath = isAbsolute
      ? join(config.videoFilePath, filename)
      : join(process.cwd(), config.videoFilePath, filename);
    const buffer = await readFile(fullPath);
    const base64 = buffer.toString('base64');
    return `data:video/mp4;base64,${base64}`;
  } catch (error) {
    dailyLogger.error({
      level: LogLevel.ERROR,
      message: 'Error reading video file',
      component: 'getVideoContent.ts',
      data: error
    });
    return null;
  }
};
