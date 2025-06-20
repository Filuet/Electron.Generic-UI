import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI as toolkitAPI } from '@electron-toolkit/preload';
import { createVideoApi } from './modules/videoApi';
import { createLogApi } from './modules/logApi';
import { createExpoApi } from './modules/expoApi';
import { ElectronBridgeAPI } from '../shared/sharedTypes';

const electronAPI: ElectronBridgeAPI = {
  ...toolkitAPI,
  videoFilesUtil: createVideoApi(ipcRenderer),
  logs: createLogApi(ipcRenderer),
  expo: createExpoApi(ipcRenderer)
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
  window.electron = electronAPI;
}
