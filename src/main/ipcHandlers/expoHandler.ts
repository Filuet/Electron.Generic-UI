import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { ExpoDispenseModal, PogRoute, RouteUpdateRequest } from '../../shared/sharedTypes';
import {
  getDispenseStatus,
  dispenseProduct,
  updatePlanogramJson,
  getStockStatus,
  testMachine,
  unlockMachine,
  updatePlanogram,
  resetStatus,
  getAllStatuses
} from '../services/expoService/expoApis';

const expoIpcHandler = (): void => {
  ipcMain.handle(IPC_CHANNELS.EXPO_DISPENSE_STATUS, async () => {
    return getDispenseStatus();
  });

  ipcMain.handle(
    IPC_CHANNELS.EXPO_DISPENSE_PRODUCT,
    async (_e, dispenseProducts: ExpoDispenseModal[]) => {
      return dispenseProduct(dispenseProducts);
    }
  );

  ipcMain.handle(IPC_CHANNELS.EXPO_PLANOGRAM_JSON, async (_e, routes: PogRoute[]) => {
    return updatePlanogramJson(routes);
  });

  ipcMain.handle(IPC_CHANNELS.EXPO_STOCK_STATUS, async () => {
    return getStockStatus();
  });

  ipcMain.handle(IPC_CHANNELS.EXPO_TEST_MACHINE, async () => {
    return testMachine();
  });

  ipcMain.handle(IPC_CHANNELS.EXPO_UNLOCK_MACHINE, async (_e, machineId: number) => {
    return unlockMachine(machineId);
  });

  ipcMain.handle(
    IPC_CHANNELS.EXPO_PLANOGRAM_UPDATE,
    async (_e, updateRequest: RouteUpdateRequest) => {
      return updatePlanogram(updateRequest);
    }
  );

  ipcMain.handle(IPC_CHANNELS.EXPO_RESET_STATUS, async () => {
    return resetStatus();
  });

  ipcMain.handle(IPC_CHANNELS.EXPO_ALL_STATUSES, async () => {
    return getAllStatuses();
  });
};

export default expoIpcHandler;
