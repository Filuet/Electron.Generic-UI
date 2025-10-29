import { ipcMain } from 'electron';
import { getVideoFileNames } from '../services/advertisementService/getVideoFileName';
import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { getVideoContent } from '../services/advertisementService/getVideoUrls';

const videoFilesIpcHandler = (): void => {
  ipcMain.handle(IPC_CHANNELS.VIDEO_GET_FILES, async (): Promise<string[]> => {
    return getVideoFileNames();
  });

  ipcMain.handle(
    IPC_CHANNELS.VIDEO_GET_CONTENT,
    async (_, filename: string): Promise<string | null> => {
      return getVideoContent(filename);
    }
  );
};

export default videoFilesIpcHandler;
