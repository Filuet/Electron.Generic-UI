import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import moment from 'moment-timezone';
import path from 'path';
import fs from 'fs';
import config from '../../../../config.json';

const LOG_FILE_DIR = config.logFilesPath;
if (!fs.existsSync(LOG_FILE_DIR)) {
  fs.mkdirSync(LOG_FILE_DIR, { recursive: true });
}

const logFormat = winston.format.printf(({ timestamp, level, message, component, data }) => {
  const logLevel = level.toUpperCase().slice(0, 3);
  const componentInfo = component ? `Component: ${component} |` : '';
  const dataInfo = data ? `| Data: ${JSON.stringify(data)}` : '';
  return `${timestamp} [${logLevel}] : ${componentInfo} Message: ${message} ${dataInfo}`;
});

export const createLogger = (filename: string) =>
  winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: () => moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A')
      }),
      logFormat
    ),
    transports: [
      new DailyRotateFile({
        filename: path.join(LOG_FILE_DIR, filename),
        datePattern: 'YYYY-MM-DD'
      }),
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple())
      })
    ]
  });
