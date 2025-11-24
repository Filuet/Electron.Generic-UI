import { LogLevel } from 'src/shared/sharedTypes';

interface LogPayload {
  level: LogLevel;
  message: string;
  component?: string;
  data?: unknown;
  timestamp?: string;
}

const logGeneric = (log: LogPayload): void => {
  window.electron.logs.generic({
    ...log,
    timestamp: log.timestamp ?? new Date().toISOString()
  });
};

const logPerformance = (log: LogPayload): void => {
  window.electron.logs.performance({
    ...log,
    timestamp: log.timestamp ?? new Date().toISOString()
  });
};
const loggingService = {
  log: logGeneric,
  logPerformance
};

export default loggingService;
