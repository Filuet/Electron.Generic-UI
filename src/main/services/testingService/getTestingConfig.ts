import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { app } from 'electron';
import { dailyLogger } from '../loggingService/loggingService';
import { LogLevel, TestingConfigJsonObject } from '../../../shared/sharedTypes';
import config from '../../../../config.json';

dotenv.config({
  path: app.isPackaged
    ? path.join(process.resourcesPath, '.env')
    : path.resolve(process.cwd(), '.env')
});

export function getTestingConfig(): TestingConfigJsonObject {
  const COMPONENT_NAME = 'getTestingConfigService';

  const defaultConfig: TestingConfigJsonObject = {
    skipAddToCartValidation:
      process.env.SKIP_ADD_TO_CART_VALIDATION?.toLowerCase() === 'true' ? true : false,
    skipPaymentProcess: process.env.SKIP_PAYMENT_PROCESS?.toLowerCase() === 'true' ? true : false,
    expoEmailShouldSend: process.env.EXPO_EMAIL_SHOULD_SEND?.toLowerCase() === 'true' ? true : false
  };

  try {
    const TESTING_CONFIG_DIR = config.externalConfigFilePath;
    const TESTING_CONFIG_FILE_PATH = path.resolve(TESTING_CONFIG_DIR, 'testingConfig.json');

    if (!fs.existsSync(TESTING_CONFIG_DIR)) {
      fs.mkdirSync(TESTING_CONFIG_DIR, { recursive: true });
      dailyLogger.log({
        level: LogLevel.INFO,
        message: `Config directory created: ${TESTING_CONFIG_DIR}`,
        component: COMPONENT_NAME
      });
    }

    if (!fs.existsSync(TESTING_CONFIG_FILE_PATH)) {
      dailyLogger.log({
        level: LogLevel.INFO,
        message: `Config file not found at path: ${TESTING_CONFIG_FILE_PATH}. Using environment variables.`,
        component: COMPONENT_NAME,
        data: { defaultConfig }
      });
      return defaultConfig;
    }

    const data = fs.readFileSync(TESTING_CONFIG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    dailyLogger.log({
      level: LogLevel.INFO,
      message: `Config file loaded successfully from: ${TESTING_CONFIG_FILE_PATH}`,
      component: COMPONENT_NAME,
      data: parsed
    });
    return {
      skipAddToCartValidation: Boolean(parsed.skipAddToCartValidation ?? false),
      skipPaymentProcess: Boolean(parsed.skipPaymentProcess ?? false),
      expoEmailShouldSend: Boolean(parsed.expoEmailShouldSend ?? false)
    };
  } catch (error) {
    dailyLogger.log({
      level: LogLevel.ERROR,
      message: 'Error reading or parsing external config file. Using environment variables.',
      component: COMPONENT_NAME,
      data: { error, defaultConfig }
    });
    return defaultConfig;
  }
}
