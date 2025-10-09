// expoApi.ts
import axios, { AxiosError } from 'axios';
import https from 'https';
import fs from 'fs';
import config from '../../../../config.json';
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
  ApiResponse,
  DispenseResponse,
  ExpoDispenseModal,
  LogLevel,
  MachineStatus,
  MachineTestResult,
  PogRoute,
  ProductStock,
  RouteUpdateRequest
} from '../../../shared/sharedTypes';
import { expoDailyLogger } from '../loggingService/loggingService';
import path from 'path';
import { is } from '@electron-toolkit/utils';

const EXPO_BASE_URL = config.expoBaseUrl;

const CERTIFICATE_PATH = is.dev
  ? path.join(__dirname, '../../certificates/fullchain.pem')
  : path.join(process.resourcesPath, 'certificates', 'fullchain.pem');

const agent = new https.Agent({
  ca: fs.readFileSync(CERTIFICATE_PATH),
  rejectUnauthorized: true
});
const axiosInstance = axios.create({
  baseURL: EXPO_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  httpsAgent: agent
});

const handleError = (error: unknown, customMessage = 'API error'): string => {
  let message = 'Internal Server Error';
  if (error instanceof AxiosError) {
    message =
      error.response?.data?.message || error.response?.statusText || error.message || message;

    expoDailyLogger.log({
      level: 'error' as LogLevel,
      message: customMessage,
      data: {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        code: error.code,
        message
      }
    });

    if (error.code === 'ECONNREFUSED') {
      return 'Connection refused by server';
    }
  } else if (error instanceof Error) {
    message = error.message;
    expoDailyLogger.log({ level: 'error', message: customMessage, data: { message } });
  } else {
    expoDailyLogger.error('Unknown error occurred', {
      level: 'error',
      message: customMessage,
      data: { error }
    });
  }

  return message;
};

// 🧪 Each method below follows the same return pattern

export const dispenseProduct = async (
  dispenseSkuAndQuantity: ExpoDispenseModal[]
): Promise<ApiResponse<DispenseResponse>> => {
  try {
    const response = await axiosInstance.post(DISPENSE_PRODUCT, dispenseSkuAndQuantity);
    return { status: true, data: response.data, error: '' };
  } catch (error) {
    return {
      status: false,
      data: {} as DispenseResponse,
      error: handleError(error, 'Dispense Product')
    };
  }
};

export const getDispenseStatus = async (): Promise<ApiResponse<MachineStatus>> => {
  try {
    const response = await axiosInstance.get(DISPENSE_STATUS);
    return { status: true, data: response.data, error: '' };
  } catch (error) {
    return {
      status: false,
      data: {} as MachineStatus,
      error: handleError(error, 'Get Dispense Status')
    };
  }
};

export const updatePlanogramJson = async (
  pogRoutesRequest: PogRoute[]
): Promise<ApiResponse<boolean>> => {
  try {
    const response = await axiosInstance.post(UPDATE_PLANOGRAM_JSON, pogRoutesRequest);
    return { status: true, data: response.status === 200, error: '' };
  } catch (error) {
    return { status: false, data: false, error: handleError(error, 'Update Planogram JSON') };
  }
};

export const getStockStatus = async (): Promise<ApiResponse<ProductStock[]>> => {
  try {
    const response = await axiosInstance.get(GET_STOCK_STATUS);
    return { status: true, data: response.data, error: '' };
  } catch (error) {
    return { status: false, data: [], error: handleError(error, 'Get Stock Status') };
  }
};

export const testMachine = async (): Promise<ApiResponse<MachineTestResult[]>> => {
  try {
    const response = await axiosInstance.get(TEST_MACHINE);
    return { status: true, data: response.data, error: '' };
  } catch (error) {
    return { status: false, data: [], error: handleError(error, 'Test Machine') };
  }
};

export const unlockMachine = async (
  machineId: number
): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await axiosInstance.get(`${UNLOCK_MACHINE_STATUS}/${machineId}`);
    return { status: true, data: response.data, error: '' };
  } catch (error) {
    return {
      status: false,
      data: { success: false },
      error: handleError(error, 'Unlock Machine')
    };
  }
};

export const updatePlanogram = async (
  routeUpdateRequest: RouteUpdateRequest
): Promise<ApiResponse<number>> => {
  try {
    const response = await axiosInstance.post(UPDATE_PLANOGRAM, routeUpdateRequest);
    return { status: true, data: response.status, error: '' };
  } catch (error) {
    return { status: false, data: 500, error: handleError(error, 'Update Planogram') };
  }
};

export const resetStatus = async (): Promise<ApiResponse<number>> => {
  try {
    const response = await axiosInstance.post(RESET_STATUS);
    return { status: true, data: response.status, error: '' };
  } catch (error) {
    return { status: false, data: 500, error: handleError(error, 'Reset Status') };
  }
};

export const getAllStatuses = async (): Promise<ApiResponse<MachineStatus[]>> => {
  try {
    const response = await axiosInstance.get(GET_ALL_STATUS);
    return { status: true, data: response.data, error: '' };
  } catch (error) {
    return { status: false, data: [], error: handleError(error, 'Get All Statuses') };
  }
};
