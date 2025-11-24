import { ElectronBridgeAPI } from '../shared/sharedTypes';
// types/index.d.ts

declare global {
  interface Window {
    electron: ElectronBridgeAPI;
  }
}
