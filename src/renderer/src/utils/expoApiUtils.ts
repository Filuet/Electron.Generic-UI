import {
  DispenseResponse,
  ExpoDispenseModal,
  MachineTestResult,
  ProductStock,
  RouteUpdateRequest,
  MachineStatus,
  PogRoute,
  MachineInoperableModal,
  ApiResponse
} from '@/interfaces/modal';
import { CartProduct } from '@/redux/features/cart/cartTypes';
import { machineInoperableEndpoint } from './endpoints';
import { postData } from '@/services/axiosWrapper/apiService';
import loggingService from './loggingService';

// random array to simulate inoperable machines for cert error email payload
const CERTS_ERROR_EMAIL_PAYLOAD = [121, 121];
const sendCertificatesErrorNotification = async (inoperableMachines: number[]): Promise<void> => {
  const inoperableMachineRequest: MachineInoperableModal = {
    kioskName: import.meta.env.VITE_KIOSK_NAME,
    machineIds: inoperableMachines
  };

  await postData<MachineInoperableModal, void>(machineInoperableEndpoint, inoperableMachineRequest)
    .then(() => {
      loggingService.log({
        level: 'info',
        message: 'Certificates error notification mail send successfully ',
        component: 'expoUtils.ts',
        data: inoperableMachineRequest
      });
    })
    .catch((error) => {
      loggingService.log({
        level: 'error',
        message: 'Error in sending certificates error notification mail',
        component: 'expoUtils.ts',
        data: { error, inoperableMachineRequest }
      });
    });
};

export const dispenseProduct = async (
  cartProducts: CartProduct[]
): Promise<ApiResponse<DispenseResponse>> => {
  const dispenseSkuAndQuantity: ExpoDispenseModal[] = cartProducts.map((product) => ({
    sku: product.skuCode,
    qty: product.productCount
  }));
  const response = await window.electron.expo.dispenseProduct(dispenseSkuAndQuantity);
  return response;
};

export const getDispenseStatus = async (): Promise<ApiResponse<MachineStatus>> => {
  const response = await window.electron.expo.getDispenseStatus();
  if (!response.status && response.error) {
    if (response.error === 'self signed certificate') {
      sendCertificatesErrorNotification(CERTS_ERROR_EMAIL_PAYLOAD);
    }
  }
  return response;
};

export const updatePlanogramJson = async (
  pogRoutesRequest: PogRoute[]
): Promise<ApiResponse<boolean>> => {
  const response = await window.electron.expo.updatePlanogramJson(pogRoutesRequest);
  return response;
};

export const getStockStatus = async (): Promise<ApiResponse<ProductStock[]>> => {
  const response = await window.electron.expo.getStockStatus();
  return response;
};

export const testMachine = async (): Promise<ApiResponse<MachineTestResult[]>> => {
  const response = await window.electron.expo.testMachine();
  return response;
};

export const unlockMachine = async (
  machineId: number
): Promise<ApiResponse<{ success: boolean }>> => {
  const response = await window.electron.expo.unlockMachine(machineId);
  return response;
};

export const updatePlanogram = async (
  routeUpdateRequest: RouteUpdateRequest
): Promise<ApiResponse<number>> => {
  const response = await window.electron.expo.updatePlanogram(routeUpdateRequest);
  return response;
};

export const resetStatus = async (): Promise<number> => {
  const response = await window.electron.expo.resetDispenseStatus();
  return response.data;
};

export const getAllStatuses = async (): Promise<MachineStatus[]> => {
  const response = await window.electron.expo.getAllStatuses();
  return response.data;
};
