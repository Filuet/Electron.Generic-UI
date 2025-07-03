import { IPC_CHANNELS } from '../../shared/ipcChannels';

export function createVideoFilesBridge(ipc: Electron.IpcRenderer) {
  return {
    getFiles: (): Promise<string[]> => ipc.invoke(IPC_CHANNELS.VIDEO_GET_FILES),

    getVideoContent: (filename: string): Promise<string | null> =>
      ipc.invoke(IPC_CHANNELS.VIDEO_GET_CONTENT, filename),

    onFolderChange: (callback: () => void): void => {
      ipc.on(IPC_CHANNELS.VIDEO_FOLDER_UPDATED, callback);
    },

    removeFolderListener: (callback: () => void): void => {
      ipc.removeListener(IPC_CHANNELS.VIDEO_FOLDER_UPDATED, callback);
    }
  };
}
