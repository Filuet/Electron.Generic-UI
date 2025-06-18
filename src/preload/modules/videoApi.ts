import { IPC_CHANNELS } from '../../shared/ipcChannels';

export function createVideoApi(ipc: Electron.IpcRenderer) {
  return {
    getFiles: (): Promise<string[]> => ipc.invoke(IPC_CHANNELS.VIDEO.GET_FILES),

    onFolderChange: (callback: () => void): void => {
      ipc.on(IPC_CHANNELS.VIDEO.FOLDER_UPDATED, callback);
    },

    removeFolderListener: (callback: () => void): void => {
      ipc.removeListener(IPC_CHANNELS.VIDEO.FOLDER_UPDATED, callback);
    }
  };
}
