import {
  DispenseResponse,
  ExpoDispenseModal,
  MachineTestResult,
  ProductStock,
  RouteUpdateRequest,
  MachineStatus,
  PogRoute
} from '@/interfaces/modal';
import { CartProduct } from '@/redux/features/cart/cartTypes';

export const dispenseProduct = async (cartProducts: CartProduct[]): Promise<DispenseResponse> => {
  const dispenseSkuAndQuantity: ExpoDispenseModal[] = cartProducts.map((product) => ({
    sku: product.skuCode,
    qty: product.productCount
  }));
  const response = await window.electron.expo.dispenseProduct(dispenseSkuAndQuantity);
  return response;
};

export const getDispenseStatus = async (): Promise<MachineStatus> => {
  const response = await window.electron.expo.getDispenseStatus();
  return response;
};

export const updatePlanogramJson = async (pogRoutesRequest: PogRoute[]): Promise<boolean> => {
  const response = await window.electron.expo.updatePlanogramJson(pogRoutesRequest);
  return response;
};
export const getStockStatus = async (): Promise<ProductStock[]> => {
  const response = await window.electron.expo.getStockStatus();
  return response;
};

export const testMachine = async (): Promise<MachineTestResult[]> => {
  const response = await window.electron.expo.testMachine();
  return response;
};

export const unlockMachine = async (machineId: number): Promise<{ success: boolean }> => {
  const response = await window.electron.expo.unlockMachine(machineId);
  return response;
};

export const updatePlanogram = async (routeUpdateRequest: RouteUpdateRequest): Promise<boolean> => {
  const response = await window.electron.expo.updatePlanogram(routeUpdateRequest);
  return response === 200;
};
export const resetStatus = async (): Promise<boolean> => {
  const response = await window.electron.expo.resetDispenseStatus();
  return response === 200;
};
export const getAllStatuses = async (): Promise<MachineStatus[]> => {
  const response = await window.electron.expo.getAllStatuses();
  return response;
};
