import { ipcMain } from 'electron';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getVideoFileNames } from '../services/videoFilesService/videosFiles';
import { IPC_CHANNELS } from '../../shared/ipcChannels';
import config from '../../../config.json';
import { dailyLogger } from '../services/loggingService/loggingService';

const videoFilesIpcHandler = (): void => {
  ipcMain.handle(IPC_CHANNELS.VIDEO_GET_FILES, async (): Promise<string[]> => {
    return getVideoFileNames();
  });

  ipcMain.handle(
    IPC_CHANNELS.VIDEO_GET_CONTENT,
    async (_, filename: string): Promise<string | null> => {
      try {
        const fullPath =
          config.videoFilePath.startsWith('/') || config.videoFilePath.match(/^[A-Z]:/)
            ? join(config.videoFilePath, filename) // Absolute path
            : join(process.cwd(), config.videoFilePath, filename); // Relative path
        const buffer = await readFile(fullPath);
        const base64 = buffer.toString('base64');
        return `data:video/mp4;base64,${base64}`;
      } catch (error) {
        dailyLogger.error({
          level: 'error',
          message: 'Error reading video file',
          component: 'videoFilesIpcHandler',
          data: error
        });
        return null;
      }
    }
  );
};

export default videoFilesIpcHandler;
