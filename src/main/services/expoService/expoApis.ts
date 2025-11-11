// expoApi.ts
import axios, { AxiosError } from 'axios';
import https from 'https';
import fs from 'fs';
import config from '../../../../config.json';
import {
  dispenseProductEndpoint,
  dispensingStatusEndpoint,
  getAllStatusEndpoint,
  resetStatusEndpoint,
  testMachineEndpoint,
  unlockMachineEndpoint,
  // dispenseStockEndpoint,
  // updatePlanogramEndpoint,
  updatePlanogramJsonEndpoint
} from './expoEndpoints';
import {
  ExpoDispenseModal,
  LogLevel,
  MachineStatus,
  MachineTestResult,
  PogRoute
  // ProductStock
  // RouteUpdateRequest
} from '../../../shared/sharedTypes';
import { expoDailyLogger } from '../loggingService/loggingService';
import path from 'path';
import { is } from '@electron-toolkit/utils';
import { sendEmailNotification } from '../../../utils/emailService';

const EXPO_BASE_URL = config.expoBaseUrl;
const COMPONENT_NAME = 'expoApis.ts';
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

axiosInstance.interceptors.response.use((response) => {
  let requestBody: any = '';
  if (response.config.data && response.config.data.length > 0) {
    requestBody = JSON.parse(response.config.data);
  }
  expoDailyLogger.log({
    level: LogLevel.INFO,
    component: COMPONENT_NAME,
    message: `API Response: ${response.status}`,
    data: {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      requestBody,
      responseData: response.data
    }
  });

  return response;
});

axiosInstance.interceptors.request.use((request) => {
  let requestBody = '';
  if (request.data && request.data.length > 0) {
    requestBody = JSON.parse(request.data);
  }
  expoDailyLogger.log({
    level: LogLevel.INFO,
    component: COMPONENT_NAME,
    message: `EXPO API: ${request.url}`,
    data: {
      url: request.url,
      method: request.method,
      requestBody
    }
  });
  return request;
});

const handleError = (error: unknown, customMessage = 'API error'): string => {
  let message = 'Internal Server Error';
  if (error instanceof AxiosError) {
    message =
      error.response?.data?.message || error.response?.statusText || error.message || message;

    expoDailyLogger.log({
      level: LogLevel.ERROR,
      message: customMessage,
      data: {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        code: error.code,
        message
      }
    });
    if (
      error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
      error.code === 'CERT_HAS_EXPIRED' ||
      error.code === 'CERT_NOT_YET_VALID' ||
      error.message?.includes('certificate') ||
      error.message?.includes('unable to verify')
    ) {
      sendEmailNotification([444]);
      return 'SSL Certificate verification failed. Please check your certificates.';
    }
    if (error.code === 'ECONNREFUSED') {
      sendEmailNotification([333, 333]);
      return 'Connection refused by server'; //send a mail
    }
  } else if (error instanceof Error) {
    message = error.message;
    expoDailyLogger.log({ level: LogLevel.ERROR, message: customMessage, data: { message } });
  } else {
    expoDailyLogger.error('Unknown error occurred', {
      level: LogLevel.ERROR,
      message: customMessage,
      data: { error }
    });
  }

  return message;
};

export const dispenseProduct = async (
  dispenseSkuAndQuantity: ExpoDispenseModal[]
): Promise<void> => {
  try {
    const response = await axiosInstance.post<void>(
      dispenseProductEndpoint,
      dispenseSkuAndQuantity
    );
    return response.data;
  } catch (error) {
    handleError(error, 'Dispense Product Failed');
    throw error;
  }
};

export const getDispenseStatus = async (): Promise<MachineStatus> => {
  try {
    const response = await axiosInstance.get<MachineStatus>(dispensingStatusEndpoint);
    return response.data;
  } catch (error) {
    handleError(error, 'Get Dispense Status');
    throw error;
  }
};

export const updatePlanogramJson = async (pogRoutesRequest: PogRoute[]): Promise<string> => {
  try {
    const response = await axiosInstance.post<string>(
      updatePlanogramJsonEndpoint,
      pogRoutesRequest
    );
    return response.data;
  } catch (error) {
    handleError(error, 'Update Planogram JSON');
    throw error;
  }
};

// export const getStockStatus = async (): Promise<ProductStock[]> => {
//   try {
//     const response = await axiosInstance.get<ProductStock[]>(dispenseStockEndpoint);
//     return response.data;
//   } catch (error) {
//     handleError(error, 'Get Stock Status');
//     throw error;
//   }
// };

export const testMachine = async (): Promise<MachineTestResult[]> => {
  try {
    const response = await axiosInstance.get<MachineTestResult[]>(testMachineEndpoint);
    return response.data;
  } catch (error) {
    handleError(error, 'Test Machine');
    throw error;
  }
};

export const unlockMachine = async (machineId: number): Promise<void> => {
  try {
    const response = await axiosInstance.get<void>(`${unlockMachineEndpoint}/${machineId}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Unlock Machine');
    throw error;
  }
};

// export const updatePlanogram = async (routeUpdateRequest: RouteUpdateRequest): Promise<number> => {
//   try {
//     const response = await axiosInstance.post<number>(updatePlanogramEndpoint, routeUpdateRequest);
//     return response.status;
//   } catch (error) {
//     handleError(error, 'Update Planogram');
//     throw error;
//   }
// };

export const resetStatus = async (): Promise<string> => {
  try {
    const response = await axiosInstance.post<string>(resetStatusEndpoint);
    return response.data;
  } catch (error) {
    handleError(error, 'Reset Status');
    throw error;
  }
};

export const getAllStatuses = async (): Promise<MachineStatus[]> => {
  try {
    const response = await axiosInstance.get<MachineStatus[]>(getAllStatusEndpoint);
    return response.data;
  } catch (error) {
    handleError(error, 'Get All Statuses');
    throw error;
  }
};
