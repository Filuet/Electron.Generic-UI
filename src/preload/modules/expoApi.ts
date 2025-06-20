import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { ExpoDispenseModal, PogRoute, RouteUpdateRequest } from '../../shared/sharedTypes';

export function createExpoApi(ipc: Electron.IpcRenderer) {
  return {
    getDispenseStatus: () => ipc.invoke(IPC_CHANNELS.EXPO.DISPENSE_STATUS),
    updatePlanogramJson: (routes: PogRoute[]) =>
      ipc.invoke(IPC_CHANNELS.EXPO.PLANOGRAM_JSON, routes),
    getStockStatus: () => ipc.invoke(IPC_CHANNELS.EXPO.STOCK_STATUS),
    testMachine: () => ipc.invoke(IPC_CHANNELS.EXPO.TEST_MACHINE),
    dispenseProduct: (products: ExpoDispenseModal[]) =>
      ipc.invoke(IPC_CHANNELS.EXPO.DISPENSE_PRODUCT, products),
    unlockMachine: (id: number) => ipc.invoke(IPC_CHANNELS.EXPO.UNLOCK_MACHINE, id),
    updatePlanogram: (req: RouteUpdateRequest) =>
      ipc.invoke(IPC_CHANNELS.EXPO.PLANOGRAM_UPDATE, req),
    resetDispenseStatus: () => ipc.invoke(IPC_CHANNELS.EXPO.RESET_STATUS),
    getAllStatuses: () => ipc.invoke(IPC_CHANNELS.EXPO.ALL_STATUSES)
  };
}
