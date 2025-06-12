import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    electronAPI: {
      getVideoFiles: () => Promise<string[]>;
      onVideoFolderChange: (callback: () => void) => void;
      removeVideoChangeListener: (callback: () => void) => void;
    };
  }
}
