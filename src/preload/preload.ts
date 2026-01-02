import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI as toolkitAPI } from '@electron-toolkit/preload';
import { createVideoFilesBridge } from './bridge/videoFilesBridge';
import { createLoggerBridge } from './bridge/loggerBridge';
import { createExpoBridge } from './bridge/expoBridge';
import { ElectronBridgeAPI, LogLevel } from '../shared/sharedTypes';
import createPaymentWindowBridge from './bridge/paymentWindowBridge';
import { dailyLogger } from '../main/services/loggingService/loggingService';
import { createTestConfigBridge } from './bridge/testConfigBridge';
import { createAppStatusBridge } from './bridge/appStatusBridge';

const electronAPI: ElectronBridgeAPI = {
  ...toolkitAPI,
  videoFilesUtil: createVideoFilesBridge(ipcRenderer),
  logs: createLoggerBridge(ipcRenderer),
  expo: createExpoBridge(ipcRenderer),
  payment: createPaymentWindowBridge(ipcRenderer),
  testingConfig: createTestConfigBridge(ipcRenderer),
  expoStatus: createAppStatusBridge(ipcRenderer)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
  } catch (error) {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Preload contextBridge error',
      component: 'preload',
      error: error
    });
  }
} else {
  // Fallback for non-isolated context
  // @ts-ignore (define in dts)
  window.electron = toolkitAPI;
}
