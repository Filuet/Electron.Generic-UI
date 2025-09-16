import { ipcMain } from 'electron';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getVideoFileNames } from '../services/videoFilesService/videosFiles';
import { IPC_CHANNELS } from '../../shared/ipcChannels';
import config from '../../../config.json';

const videoFilesIpcHandler = () => {
  ipcMain.handle(IPC_CHANNELS.VIDEO_GET_FILES, async (): Promise<string[]> => {
    return getVideoFileNames();
  });

  // Serve video content as base64 data URL
  ipcMain.handle(
    IPC_CHANNELS.VIDEO_GET_CONTENT,
    async (_, filename: string): Promise<string | null> => {
      try {
        const fullPath =
          config.videoFilePath.startsWith('/') || config.videoFilePath.match(/^[A-Z]:/)
            ? join(config.videoFilePath, filename) // Absolute path
            : join(process.cwd(), config.videoFilePath, filename); // Relative path

        console.log('Reading video file:', fullPath);
        const buffer = await readFile(fullPath);
        const base64 = buffer.toString('base64');
        return `data:video/mp4;base64,${base64}`;
      } catch (error) {
        console.error('Error reading video file:', error);
        return null;
      }
    }
  );
};

export default videoFilesIpcHandler;
