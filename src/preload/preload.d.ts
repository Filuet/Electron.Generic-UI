// types/index.d.ts

import type { ElectronAPI } from '@electron-toolkit/preload';
import {
  DispenseResponse,
  ExpoDispenseModal,
  LogEntry,
  MachineStatus,
  MachineTestResult,
  PogRoute,
  ProductStock,
  RouteUpdateRequest
} from '../shared/sharedTypes';

interface ElectronBridgeAPI extends ElectronAPI {
  videoFilesUtil: {
    getFiles: () => Promise<string[]>;
    onFolderChange: (callback: () => void) => void;
    removeFolderListener: (callback: () => void) => void;
  };
  logs: {
    generic: (entry: LogEntry) => Promise<void>;
    performance: (entry: LogEntry) => Promise<void>;
  };
  expo: {
    getDispenseStatus: () => Promise<MachineStatus>;
    updatePlanogramJson: (routes: PogRoute[]) => Promise<boolean>;
    getStockStatus: () => Promise<ProductStock[]>;
    testMachine: () => Promise<MachineTestResult[]>;
    unlockMachine: (machineId: number) => Promise<{ success: boolean }>;
    updatePlanogram: (req: RouteUpdateRequest) => Promise<number>;
    resetDispenseStatus: () => Promise<number>;
    getAllStatuses: () => Promise<MachineStatus[]>;
    dispenseProduct: (products: ExpoDispenseModal[]) => Promise<DispenseResponse>;
  };
}

declare global {
  interface Window {
    electron: ElectronBridgeAPI;
  }
}
