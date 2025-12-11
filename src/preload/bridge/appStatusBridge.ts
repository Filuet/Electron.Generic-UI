import { IpcRenderer } from 'electron';
import { ExpoStatuses, ExpoStatusBridge } from '../../shared/sharedTypes';
import { IPC_CHANNELS } from '../../shared/ipcChannels';

export const createAppStatusBridge = (ipcRenderer: IpcRenderer): ExpoStatusBridge => ({
  onExpoRunningStatusChange: (callback: (status: ExpoStatuses) => void) => {
    const subscription = (_event: unknown, status: ExpoStatuses): void => callback(status);
    ipcRenderer.on(IPC_CHANNELS.EXPO_PROCESS_STATUS, subscription);

    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.EXPO_PROCESS_STATUS, subscription);
    };
  },
  getExpoRunningStatus: () => ipcRenderer.invoke(IPC_CHANNELS.EXPO_PROCESS_GET_STATUS)
});
