import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { LogEntry } from '../../shared/sharedTypes';

export function createLogApi(ipc: Electron.IpcRenderer) {
  return {
    generic: (entry: LogEntry): Promise<void> => ipc.invoke(IPC_CHANNELS.LOG.GENERIC, entry),
    performance: (entry: LogEntry): Promise<void> => ipc.invoke(IPC_CHANNELS.LOG.PERFORMANCE, entry)
  };
}
