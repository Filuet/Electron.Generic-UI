import { LogEntry } from '../../shared/sharedTypes';

export function createLogApi(ipc: Electron.IpcRenderer) {
  return {
    generic: (entry: LogEntry): Promise<void> => ipc.invoke('log:generic', entry),
    performance: (entry: LogEntry): Promise<void> => ipc.invoke('log:performance', entry)
  };
}
