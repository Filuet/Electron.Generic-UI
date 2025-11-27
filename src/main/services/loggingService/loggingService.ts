import path from 'path';
import fs from 'fs';
import { createLogger } from '../../utils/winstonConfig';
import config from '../../../../config.json';
import winston from 'winston';

const logPath = config.logFilePath;

const genericLogPath = path.join(logPath, 'AppLogs');
const performanceLogFilePath = path.join(logPath, 'AppPerformance');
const expoLogFilePath = path.join(logPath, 'GenericExpoLog');
const logDirs = [genericLogPath, performanceLogFilePath, expoLogFilePath];

// Generic log format
const logFormat = winston.format.printf(({ timestamp, level, message, component, data }) => {
  const logLevel = level.toUpperCase().slice(0, 3);
  const componentInfo = component ? `Component: ${component} |` : '';
  const dataInfo = data ? `| Data: ${JSON.stringify(data)}` : '';
  return `${timestamp} [${logLevel}] : ${componentInfo} Message: ${message} ${dataInfo}`;
});

// Expo log format
const expoLogFormat = winston.format.printf(({ timestamp, level, message, data }) => {
  const logLevel = level.toUpperCase().slice(0, 3);
  const apiInfo = message ? `API ${message}` : '';
  const dataInfo = data ? `| Data: ${JSON.stringify(data)}` : '';
  return `${timestamp} [${logLevel}] : ${apiInfo} ${dataInfo}`;
});

logDirs.forEach((dir) => {
  try {
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    console.error(`Failed to create log directory ${dir}:`, error);
  }
});

const dailyLogger = createLogger('generic-%DATE%.log', genericLogPath, logFormat);

const performanceLogger = createLogger(
  'generic-performance-%DATE%.log',
  performanceLogFilePath,
  logFormat
);

const expoDailyLogger = createLogger('expo-logs-%DATE%.log', expoLogFilePath, expoLogFormat);

export { performanceLogger, dailyLogger, expoDailyLogger };
