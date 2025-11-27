import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import moment from 'moment-timezone';
import path from 'path';

export const createLogger = (
  filename: string,
  logFilePath: string,
  logFormat: winston.Logform.Format
): winston.Logger => {
  const baseFormat = winston.format.combine(
    winston.format.timestamp({
      format: () => moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A')
    }),
    logFormat
  );
  return winston.createLogger({
    level: 'info',
    format: baseFormat,
    transports: [
      new DailyRotateFile({
        filename: path.join(logFilePath, filename),
        datePattern: 'YYYY-MM-DD'
      }),
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), baseFormat)
      })
    ]
  });
};
