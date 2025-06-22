import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI as toolkitAPI } from '@electron-toolkit/preload';
import { createVideoFilesBridge } from './bridge/videoFilesBridge';
import { createLoggerBridge } from './bridge/loggerBridge';
import { createExpoBridge } from './bridge/expoBridge';
import { ElectronBridgeAPI } from '../shared/sharedTypes';

const electronAPI: ElectronBridgeAPI = {
  ...toolkitAPI,
  videoFilesUtil: createVideoFilesBridge(ipcRenderer),
  logs: createLoggerBridge(ipcRenderer),
  expo: createExpoBridge(ipcRenderer)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
  } catch (error) {
    console.error('Preload contextBridge error:', error);
  }
} else {
  // Fallback for non-isolated context
  // @ts-ignore (define in dts)
  window.electron = toolkitAPI;
}
