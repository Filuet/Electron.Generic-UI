import { IPC_CHANNELS } from '../../shared/ipcChannels';
import {
  ExpoBridge,
  ExpoDispenseModal,
  PogRoute,
  RouteUpdateRequest
} from '../../shared/sharedTypes';

export function createExpoBridge(ipc: Electron.IpcRenderer): ExpoBridge {
  return {
    getDispenseStatus: () => ipc.invoke(IPC_CHANNELS.EXPO_DISPENSE_STATUS),
    updatePlanogramJson: (routes: PogRoute[]) =>
      ipc.invoke(IPC_CHANNELS.EXPO_PLANOGRAM_JSON, routes),
    getStockStatus: () => ipc.invoke(IPC_CHANNELS.EXPO_STOCK_STATUS),
    testMachine: () => ipc.invoke(IPC_CHANNELS.EXPO_TEST_MACHINE),
    dispenseProduct: (products: ExpoDispenseModal[]) =>
      ipc.invoke(IPC_CHANNELS.EXPO_DISPENSE_PRODUCT, products),
    unlockMachine: (id: number) => ipc.invoke(IPC_CHANNELS.EXPO_UNLOCK_MACHINE, id),
    updatePlanogram: (req: RouteUpdateRequest) =>
      ipc.invoke(IPC_CHANNELS.EXPO_PLANOGRAM_UPDATE, req),
    resetDispenseStatus: () => ipc.invoke(IPC_CHANNELS.EXPO_RESET_STATUS),
    getAllStatuses: () => ipc.invoke(IPC_CHANNELS.EXPO_ALL_STATUSES)
  };
}
