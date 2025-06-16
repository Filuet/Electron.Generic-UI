type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  level: LogLevel;
  message: string;
  component?: string;
  data?: unknown;
  timestamp?: string;
}

const logGeneric = (log: LogPayload) => {
  window.electronAPI.logGeneric({
    ...log,
    timestamp: log.timestamp ?? new Date().toISOString()
  });
};

const logPerformance = (log: LogPayload) => {
  window.electronAPI.logPerformance({
    ...log,
    timestamp: log.timestamp ?? new Date().toISOString()
  });
};
const loggingService = {
  log: logGeneric,
  logPerformance
};

export default loggingService;
