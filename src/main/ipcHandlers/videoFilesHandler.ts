import { ipcMain } from 'electron';
import { getVideoFileNames } from '../services/videoFilesService/videosFiles';
import { IPC_CHANNELS } from '../../shared/ipcChannels';

const videoFilesHandler = () => {
  ipcMain.handle(IPC_CHANNELS.VIDEO_GET_FILES, async (): Promise<string[]> => {
    return getVideoFileNames();
  });
};

export default videoFilesHandler;
