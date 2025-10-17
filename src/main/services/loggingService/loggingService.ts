import path from 'path';
import fs from 'fs';
import { createLogger } from '../../utils/winstonConfig';
import config from '../../../../config.json';

const logPath = config.logFilePath;

const genericLogPath = path.join(logPath, 'AppLogs');
const performanceLogFilePath = path.join(logPath, 'AppPerformance');
const expoLogFilePath = path.join(logPath, 'GenericExpoLog');
const logDirs = [genericLogPath, performanceLogFilePath, expoLogFilePath];

logDirs.forEach((dir) => {
  try {
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    console.error(`Failed to create log directory ${dir}:`, error);
  }
});

const dailyLogger = createLogger('generic-%DATE%.log', genericLogPath);

const performanceLogger = createLogger('generic-performance-%DATE%.log', performanceLogFilePath);

const expoDailyLogger = createLogger('expo-logs-%DATE%.log', expoLogFilePath);

export { performanceLogger, dailyLogger, expoDailyLogger };
