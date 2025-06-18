import { ipcMain } from 'electron';
import { getVideoFileNames } from '../electronUtils/videoUtils/videosUtils';
import { IPC_CHANNELS } from '../../shared/ipcChannels';

const videoFilesHandler = () => {
  ipcMain.handle(IPC_CHANNELS.VIDEO.GET_FILES, async (): Promise<string[]> => {
    return getVideoFileNames();
  });
};

export { videoFilesHandler };
