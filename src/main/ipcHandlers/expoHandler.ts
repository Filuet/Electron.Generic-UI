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

const expoIpcHandler = () => {
  ipcMain.handle(IPC_CHANNELS.EXPO_DISPENSE_STATUS, async () => {
    const result = await getDispenseStatus();
    return { success: result.status, data: result.data, error: result.error };
  });

  ipcMain.handle(
    IPC_CHANNELS.EXPO_DISPENSE_PRODUCT,
    async (_e, dispenseProducts: ExpoDispenseModal[]) => {
      const result = await dispenseProduct(dispenseProducts);
      return { success: result.status, data: result.data, error: result.error };
    }
  );

  ipcMain.handle(IPC_CHANNELS.EXPO_PLANOGRAM_JSON, async (_e, routes: PogRoute[]) => {
    const result = await updatePlanogramJson(routes);
    return { success: result.status, data: result.data, error: result.error };
  });

  ipcMain.handle(IPC_CHANNELS.EXPO_STOCK_STATUS, async () => {
    const result = await getStockStatus();
    return { success: result.status, data: result.data, error: result.error };
  });

  ipcMain.handle(IPC_CHANNELS.EXPO_TEST_MACHINE, async () => {
    const result = await testMachine();
    return { success: result.status, data: result.data, error: result.error };
  });

  ipcMain.handle(IPC_CHANNELS.EXPO_UNLOCK_MACHINE, async (_e, machineId: number) => {
    const result = await unlockMachine(machineId);
    return { success: result.status, data: result.data, error: result.error };
  });

  ipcMain.handle(
    IPC_CHANNELS.EXPO_PLANOGRAM_UPDATE,
    async (_e, updateRequest: RouteUpdateRequest) => {
      const result = await updatePlanogram(updateRequest);
      return { success: result.status, data: result.data, error: result.error };
    }
  );

  ipcMain.handle(IPC_CHANNELS.EXPO_RESET_STATUS, async () => {
    const result = await resetStatus();
    return { success: result.status, data: result.data, error: result.error };
  });

  ipcMain.handle(IPC_CHANNELS.EXPO_ALL_STATUSES, async () => {
    const result = await getAllStatuses();
    return { success: result.status, data: result.data, error: result.error };
  });
};

export default expoIpcHandler;
