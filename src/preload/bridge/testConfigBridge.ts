import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { TestingConfigJsonObject } from '../../shared/sharedTypes';

export const createTestConfigBridge = (
  ipc: Electron.IpcRenderer
): Promise<TestingConfigJsonObject> => {
  return ipc.invoke(IPC_CHANNELS.TESTING_CONFIG);
};
