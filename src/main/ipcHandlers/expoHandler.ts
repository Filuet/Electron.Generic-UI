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

const expoHandler = () => {
  ipcMain.handle(IPC_CHANNELS.EXPO.DISPENSE_STATUS, async () => {
    try {
      const result = await getDispenseStatus();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.EXPO.DISPENSE_PRODUCT,
    async (_e, dispenseProducts: ExpoDispenseModal[]) => {
      try {
        const result = await dispenseProduct(dispenseProducts);
        return result;
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.EXPO.PLANOGRAM_JSON, async (_e, routes: PogRoute[]) => {
    try {
      const result = await updatePlanogramJson(routes);
      return { success: result };
    } catch (error) {
      return { success: false, error };
    }
  });

  ipcMain.handle(IPC_CHANNELS.EXPO.STOCK_STATUS, async () => {
    try {
      const result = await getStockStatus();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  });

  ipcMain.handle(IPC_CHANNELS.EXPO.TEST_MACHINE, async () => {
    try {
      const result = await testMachine();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.EXPO.UNLOCK_MACHINE, async (_e, machineId: number) => {
    try {
      const result = await unlockMachine(machineId);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.EXPO.PLANOGRAM_UPDATE,
    async (_e, updateRequest: RouteUpdateRequest) => {
      try {
        const result = await updatePlanogram(updateRequest);
        return { success: result };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.EXPO.RESET_STATUS, async () => {
    try {
      const result = await resetStatus();
      return { success: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.EXPO.ALL_STATUSES, async () => {
    try {
      const result = await getAllStatuses();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });
};

export default expoHandler;
