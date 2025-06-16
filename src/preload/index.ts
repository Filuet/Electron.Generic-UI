// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
interface LogEntry {
  level: LogLevel;
  message: string;
  component?: string;
  data?: unknown;
  timestamp?: string;
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('electronAPI', {
      getVideoFiles: (): Promise<string[]> => ipcRenderer.invoke('get-video-files'),

      onVideoFolderChange: (callback: () => void): void => {
        ipcRenderer.on('video-folder-updated', callback);
      },

      removeVideoChangeListener: (callback: () => void): void => {
        ipcRenderer.removeListener('video-folder-updated', callback);
      },

      logGeneric: (entry: LogEntry): Promise<void> => ipcRenderer.invoke('log:generic', entry),

      logPerformance: (entry: LogEntry): Promise<void> =>
        ipcRenderer.invoke('log:performance', entry)
    });
  } catch (error) {
    console.error('Preload contextBridge error:', error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
}
