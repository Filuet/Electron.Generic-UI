import axios from 'axios';
import config from '../../../../../config.json';
import { dailyLogger } from '../logger';
import {
  DISPENSE_PRODUCT,
  DISPENSE_STATUS,
  GET_ALL_STATUS,
  GET_STOCK_STATUS,
  RESET_STATUS,
  TEST_MACHINE,
  UNLOCK_MACHINE_STATUS,
  UPDATE_PLANOGRAM,
  UPDATE_PLANOGRAM_JSON
} from './expoEndpoints';
import {
  DispenseResponse,
  ExpoDispenseModal,
  MachineStatus,
  MachineTestResult,
  PogRoute,
  ProductStock,
  RouteUpdateRequest
} from '../../../../shared/sharedTypes';

const EXPO_BASE_URL = config.expoBaseUrl;

const handleError = (error: unknown, operation: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data.error === 'ECONNREFUSED') {
      throw new Error(error.response?.data.error);
    }
    console.error(`${operation} API Error:`, error.response?.data);
  } else {
    console.error(`${operation} error:`, error);
  }
  throw new Error(`Failed to ${operation.toLowerCase()}`);
};

const axiosInstance = axios.create({
  baseURL: EXPO_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const dispenseProduct = async (
  dispenseSkuAndQuantity: ExpoDispenseModal[]
): Promise<DispenseResponse> => {
  try {
    const response = await axiosInstance.post(DISPENSE_PRODUCT, dispenseSkuAndQuantity);
    return response.data;
  } catch (error) {
    dailyLogger.log({
      level: 'error',
      component: 'expoApiUtils',
      message: `${EXPO_BASE_URL}${DISPENSE_PRODUCT} API failed`,
      data: error
    });
    return handleError(error, 'Dispense Product');
  }
};

export const getDispenseStatus = async (): Promise<MachineStatus> => {
  try {
    const response = await axiosInstance.get<MachineStatus>(DISPENSE_STATUS);
    return response.data;
  } catch (error) {
    dailyLogger.log({
      level: 'error',
      message: `${EXPO_BASE_URL}${DISPENSE_STATUS} API failed`,
      component: 'ExpoApiUtils',
      data: error
    });
    return handleError(error, 'Get Dispense Status');
  }
};

export const updatePlanogramJson = async (pogRoutesRequest: PogRoute[]): Promise<boolean> => {
  try {
    const response = await axiosInstance.post(UPDATE_PLANOGRAM_JSON, pogRoutesRequest);
    return response.status === 200;
  } catch (error) {
    dailyLogger.log({
      level: 'error',
      message: `${EXPO_BASE_URL}${UPDATE_PLANOGRAM_JSON} API failed`,
      component: 'ExpoApiUtils',
      data: error
    });
    return handleError(error, 'Update Planogram Json');
  }
};

export const getStockStatus = async (): Promise<ProductStock[]> => {
  try {
    const response = await axiosInstance.get<ProductStock[]>(GET_STOCK_STATUS);
    return response.data;
  } catch (error) {
    dailyLogger.log({
      level: 'error',
      message: `${EXPO_BASE_URL}${GET_STOCK_STATUS} API failed`,
      component: 'ExpoApiUtils',
      data: error
    });
    return handleError(error, 'Get Stock Status');
  }
};

export const testMachine = async (): Promise<MachineTestResult[]> => {
  try {
    const response = await axiosInstance.get<MachineTestResult[]>(TEST_MACHINE);
    return response.data;
  } catch (error) {
    dailyLogger.log({
      level: 'error',
      message: `${EXPO_BASE_URL}${TEST_MACHINE} API failed`,
      component: 'ExpoApiUtils',
      data: error
    });
    return [];
  }
};

export const unlockMachine = async (machineId: number): Promise<{ success: boolean }> => {
  try {
    const url = `${UNLOCK_MACHINE_STATUS}/${machineId}`;
    const response = await axiosInstance.get<{ success: boolean }>(url);
    return response.data;
  } catch (error) {
    dailyLogger.log({
      level: 'error',
      message: `${EXPO_BASE_URL}${UNLOCK_MACHINE_STATUS}/${machineId} API failed`,
      component: 'ExpoApiUtils',
      data: error
    });
    return handleError(error, 'Unlock Machine');
  }
};

export const updatePlanogram = async (routeUpdateRequest: RouteUpdateRequest): Promise<number> => {
  try {
    const response = await axiosInstance.post(UPDATE_PLANOGRAM, routeUpdateRequest);
    return response.status;
  } catch (error) {
    dailyLogger.log({
      level: 'error',
      message: `${EXPO_BASE_URL}${UPDATE_PLANOGRAM} API failed`,
      component: 'ExpoApiUtils',
      data: error
    });
    return handleError(error, 'Update Planogram');
  }
};

export const resetStatus = async (): Promise<number> => {
  try {
    const response = await axiosInstance.post(RESET_STATUS);
    return response.status;
  } catch (error) {
    dailyLogger.log({
      level: 'error',
      message: `${EXPO_BASE_URL}${RESET_STATUS} API failed`,
      component: 'ExpoApiUtils',
      data: error
    });
    return handleError(error, 'Reset Status');
  }
};

export const getAllStatuses = async (): Promise<MachineStatus[]> => {
  try {
    const response = await axiosInstance.get(GET_ALL_STATUS);
    return response.data;
  } catch (error) {
    dailyLogger.log({
      level: 'error',
      message: `${EXPO_BASE_URL}${GET_ALL_STATUS} API failed`,
      component: 'ExpoApiUtils',
      data: error
    });
    return handleError(error, 'Get All Statuses');
  }
};
