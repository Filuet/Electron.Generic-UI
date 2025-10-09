import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { LogEntry, LoggingServiceBridge } from '../../shared/sharedTypes';

export function createLoggerBridge(ipc: Electron.IpcRenderer): LoggingServiceBridge {
  return {
    generic: (entry: LogEntry): Promise<void> => ipc.invoke(IPC_CHANNELS.LOG_GENERIC, entry),
    performance: (entry: LogEntry): Promise<void> => ipc.invoke(IPC_CHANNELS.LOG_PERFORMANCE, entry)
  };
}
