import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { getTestConfig } from '../services/testingService/getTestingConfig';

const testingConfigIpcHandler = (): void => {
  ipcMain.handle(IPC_CHANNELS.TESTING_CONFIG, async () => getTestConfig());
};
export default testingConfigIpcHandler;
