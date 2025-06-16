// types/index.d.ts
import { ElectronAPI } from '@electron-toolkit/preload';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  component?: string;
  data?: unknown;
  timestamp?: string;
}

declare global {
  interface Window {
    electron: ElectronAPI;

    electronAPI: {
      getVideoFiles: () => Promise<string[]>;

      onVideoFolderChange: (callback: () => void) => void;

      removeVideoChangeListener: (callback: () => void) => void;

      logGeneric: (entry: LogEntry) => Promise<void>;

      logPerformance: (entry: LogEntry) => Promise<void>;
    };
  }
}
