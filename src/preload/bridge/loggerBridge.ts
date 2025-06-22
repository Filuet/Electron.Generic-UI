import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { LogEntry } from '../../shared/sharedTypes';

export function createLoggerBridge(ipc: Electron.IpcRenderer) {
  return {
    generic: (entry: LogEntry): Promise<void> => ipc.invoke(IPC_CHANNELS.LOG_GENERIC, entry),
    performance: (entry: LogEntry): Promise<void> => ipc.invoke(IPC_CHANNELS.LOG_PERFORMANCE, entry)
  };
}
