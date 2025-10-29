import { CartProduct } from '@/redux/features/cart/cartTypes';
import { machineInoperableEndpoint } from './endpoints';
import { postData } from '@/services/axiosWrapper/apiService';
import loggingService from './loggingService';
import {
  ExpoDispenseModal,
  LogLevel,
  MachineStatus,
  MachineTestResult,
  PogRoute
  // ProductStock
  // RouteUpdateRequest
} from '../../../shared/sharedTypes';
import { MachineInoperableModal } from '@/interfaces/modal';

// random array to simulate inoperable machines for cert error email payload
const CERTS_ERROR_EMAIL_PAYLOAD = [121, 121];

const ELECTRON_EXPO_API_PATH = window.electron.expo;

const sendCertificatesErrorNotification = async (inoperableMachines: number[]): Promise<void> => {
  const inoperableMachineRequest: MachineInoperableModal = {
    kioskName: import.meta.env.VITE_KIOSK_NAME,
    machineIds: inoperableMachines
  };

  await postData<MachineInoperableModal, void>(machineInoperableEndpoint, inoperableMachineRequest)
    .then(() => {
      loggingService.log({
        level: LogLevel.INFO,
        message: 'Certificates error notification mail send successfully',
        component: 'expoUtils.ts',
        data: inoperableMachineRequest
      });
    })
    .catch((error) => {
      loggingService.log({
        level: LogLevel.ERROR,
        message: 'Error in sending certificates error notification mail',
        component: 'expoUtils.ts',
        data: { error, inoperableMachineRequest }
      });
    });
};

export const dispenseProduct = async (cartProducts: CartProduct[]): Promise<void> => {
  const dispenseSkuAndQuantity: ExpoDispenseModal[] = cartProducts.map((product) => ({
    sku: product.skuCode,
    qty: product.productCount
  }));
  return ELECTRON_EXPO_API_PATH.dispenseProduct(dispenseSkuAndQuantity);
};

export const getDispenseStatus = async (): Promise<MachineStatus> => {
  return ELECTRON_EXPO_API_PATH.getDispenseStatus()
    .then((response) => response)
    .catch((err) => {
      if (err === 'self signed certificate') {
        sendCertificatesErrorNotification(CERTS_ERROR_EMAIL_PAYLOAD);
      }
      throw err;
    });
};

export const updatePlanogramJson = async (pogRoutesRequest: PogRoute[]): Promise<string> => {
  return ELECTRON_EXPO_API_PATH.updatePlanogramJson(pogRoutesRequest)
    .then((response) => response)
    .catch((error) => {
      loggingService.log({
        level: LogLevel.ERROR,
        message: 'Error updating planogram json',
        component: 'expoApiUtils.ts',
        data: { error }
      });
      throw error;
    });
};
// not using anywhere
// export const getStockStatus = async (): Promise<ProductStock[]> => {
//   return ELECTRON_EXPO_API_PATH.getStockStatus();
// };

export const testMachine = async (): Promise<MachineTestResult[]> => {
  return ELECTRON_EXPO_API_PATH.testMachine();
};

export const unlockMachine = async (machineId: number): Promise<void> => {
  return ELECTRON_EXPO_API_PATH.unlockMachine(machineId);
};

// note used currently
// export const updatePlanogram = async (routeUpdateRequest: RouteUpdateRequest): Promise<number> => {
//   return ELECTRON_EXPO_API_PATH.updatePlanogram(routeUpdateRequest);
// };

export const resetStatus = async (): Promise<string> => {
  return ELECTRON_EXPO_API_PATH.resetStatus()
    .then((response) => response)
    .catch((error) => {
      loggingService.log({
        level: LogLevel.ERROR,
        message: 'Error resetting machine status',
        component: 'expoApiUtils.ts',
        data: { error }
      });
      throw error;
    });
};

export const getAllStatuses = async (): Promise<MachineStatus[]> => {
  return ELECTRON_EXPO_API_PATH.getAllStatuses()
    .then((response) => response)
    .catch((error) => {
      loggingService.log({
        level: LogLevel.ERROR,
        message: 'Error fetching all machine statuses',
        component: 'expoApiUtils.ts',
        data: { error }
      });
      throw error;
    });
};
