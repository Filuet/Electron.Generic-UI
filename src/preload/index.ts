import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('electronAPI', {
      getVideoFiles: () => ipcRenderer.invoke('get-video-files'),
      onVideoFolderChange: (callback: () => void) => {
        ipcRenderer.on('video-folder-updated', callback);
      },
      removeVideoChangeListener: (callback: () => void) => {
        ipcRenderer.removeListener('video-folder-updated', callback);
      }
    });
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
}
