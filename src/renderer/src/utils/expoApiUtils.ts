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
import axios from 'axios';

const apiUrl = import.meta.env.VITE_NODE_SERVER_URL;
// this utils is created only to interact with the expo api

const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error handler with never return type
const handleError = (error: unknown, operation: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data.error === 'ECONNREFUSED' && import.meta.env.VITE_IS_PROD) {
      throw new Error(error.response?.data.error);
    }
    console.error(`${operation} API Error:`, error.response?.data);
  } else {
    console.error(`${operation} error:`, error);
  }
  throw new Error(`Failed to ${operation.toLowerCase()}`);
};

export const dispenseProduct = async (cartProducts: CartProduct[]): Promise<DispenseResponse> => {
  try {
    const dispenseSkuAndQuantity: ExpoDispenseModal[] = cartProducts.map((product) => ({
      sku: product.skuCode,
      qty: product.productCount
    }));
    const response = await axiosInstance.post<DispenseResponse>(
      '/dispense',
      dispenseSkuAndQuantity
    );
    return response.data;
  } catch (error) {
    return handleError(error, 'Dispense Product');
  }
};

export const getDispenseStatus = async (): Promise<MachineStatus> => {
  try {
    const response = await axiosInstance.get<MachineStatus>('/dispense/status');
    return response.data;
  } catch (error) {
    return handleError(error, 'Get Dispense Status');
  }
};
export const getVideoFileNames = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get<string[]>('video/filenames');
    return response.data;
  } catch (error) {
    return handleError(error, 'Get Video File Names');
  }
};
export const updatePlanogramJson = async (pogRoutesRequest: PogRoute[]): Promise<boolean> => {
  try {
    const response = await axiosInstance.post('/dispense/update-planogram', pogRoutesRequest);
    return response.status === 200;
  } catch (error) {
    return handleError(error, 'Update Planogram Json');
  }
};
export const getStockStatus = async (): Promise<ProductStock[]> => {
  try {
    const response = await axiosInstance.get<ProductStock[]>('/dispense/stock');
    return response.data;
  } catch (error) {
    return handleError(error, 'Get Stock Status');
  }
};

export const testMachine = async (): Promise<MachineTestResult[]> => {
  try {
    const response = await axiosInstance.get<MachineTestResult[]>('/dispense/test');
    return response.data;
  } catch (error) {
    return handleError(error, 'Test Machine');
  }
};

export const unlockMachine = async (machineId: number): Promise<{ success: boolean }> => {
  try {
    const response = await axiosInstance.get<{ success: boolean }>(`/dispense/unlock/${machineId}`);
    return response.data;
  } catch (error) {
    return handleError(error, 'Unlock Machine');
  }
};

export const updatePlanogram = async (routeUpdateRequest: RouteUpdateRequest): Promise<boolean> => {
  try {
    const response = await axiosInstance.post('/dispense/planogram', routeUpdateRequest);
    return response.status === 200;
  } catch (error) {
    return handleError(error, 'Update Planogram');
  }
};
export const resetStatus = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.post('/dispense/reset-status');
    return response.status === 200;
  } catch (error) {
    return handleError(error, 'Reset Status');
  }
};
export const getAllStatuses = async (): Promise<MachineStatus[]> => {
  try {
    const response = await axiosInstance.get('/dispense/all-statuses');
    return response.data;
  } catch (error) {
    return handleError(error, 'Reset Status');
  }
};
