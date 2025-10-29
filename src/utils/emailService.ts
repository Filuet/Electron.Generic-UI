import axios from 'axios';
import * as dotenv from 'dotenv';
import { dailyLogger } from '../main/services/loggingService/loggingService';
import {
  LoginRequestModel,
  LoginResponseModel,
  LogLevel,
  MachineInoperableModal
} from '../shared/sharedTypes';
import { app } from 'electron';
import path from 'path';

dotenv.config({
  path: app.isPackaged
    ? path.join(process.resourcesPath, '.env')
    : path.resolve(process.cwd(), '.env')
});

const BASE_URL = process.env.VITE_OGMENTO_BASE_URL;

const loginWithKiosk = async (): Promise<string | null> => {
  const component = 'loginWithKiosk';
  const KIOSK_EMAIL = process.env.VITE_KIOSK_EMAIL;
  const KIOSK_PASSWORD = process.env.VITE_KIOSK_PASSWORD;

  if (!KIOSK_EMAIL || !KIOSK_PASSWORD || !BASE_URL) {
    dailyLogger.log({
      level: LogLevel.ERROR,
      component: 'loginWithKiosk',
      message: 'Kiosk login environment variables are not set properly',
      data: {
        VITE_KIOSK_EMAIL: KIOSK_EMAIL
      }
    });
  }
  try {
    const response = await axios.post<LoginRequestModel, { data: LoginResponseModel }>(
      `${BASE_URL}/api/Auth/login`,
      {
        email: KIOSK_EMAIL,
        password: KIOSK_PASSWORD
      }
    );

    if (response.data.token) {
      dailyLogger.log({
        level: LogLevel.INFO,
        component,
        message: 'Kiosk login successful',
        data: { email: KIOSK_EMAIL }
      });
      return response.data.token;
    }

    dailyLogger.log({
      level: LogLevel.WARN,
      component,
      message: 'Login succeeded but no token returned',
      data: { email: KIOSK_EMAIL }
    });
  } catch (err) {
    dailyLogger.log({
      level: LogLevel.ERROR,
      component,
      message: 'Kiosk login failed',
      data: {
        email: KIOSK_EMAIL,
        error: err instanceof Error ? err.message : String(err)
      }
    });
  }
  return null;
};

export const sendEmailNotification = async (inoperableMachines: number[]): Promise<void> => {
  const KIOSK_NAME = process.env.VITE_KIOSK_NAME;

  if (!KIOSK_NAME) {
    dailyLogger.log({
      level: LogLevel.ERROR,
      component: 'emailService',
      message: 'Missing VITE_KIOSK_NAME environment variable'
    });
    return;
  }
  const emailRequestPayload: MachineInoperableModal = {
    kioskName: KIOSK_NAME,
    machineIds: inoperableMachines
  };

  dailyLogger.log({
    level: LogLevel.INFO,
    component: 'emailService',
    message: 'Requesting token to send inoperable machine notification',
    data: { machines: inoperableMachines }
  });

  const token = await loginWithKiosk();

  if (token) {
    await axios
      .post<MachineInoperableModal, void>(`${BASE_URL}/api/email/inoperable`, emailRequestPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(() => {
        dailyLogger.log({
          level: LogLevel.INFO,
          component: 'emailService',
          message: 'Email notification sent successfully',
          data: emailRequestPayload
        });
      })
      .catch((err) => {
        dailyLogger.log({
          level: LogLevel.ERROR,
          component: 'emailService',
          message: 'Failed to send email notification',
          data: { error: err.message, request: emailRequestPayload }
        });
      });
  }
};
