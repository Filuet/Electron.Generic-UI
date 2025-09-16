import { ipcMain } from 'electron';
import { dailyLogger, performanceLogger } from '../services/loggingService/loggingService';
import { IPC_CHANNELS } from '../../shared/ipcChannels';

const loggingIpcHandler = () => {
  ipcMain.handle(IPC_CHANNELS.LOG_GENERIC, (_e, { level, message, component, data, timestamp }) => {
    dailyLogger.log(level, message, { component, data, timestamp });
  });

  ipcMain.handle(
    IPC_CHANNELS.LOG_PERFORMANCE,
    (_e, { level, message, component, data, timestamp }) => {
      performanceLogger.log(level, message, { component, data, timestamp });
    }
  );
};

export default loggingIpcHandler;
