import { LogEntry, PerformanceLog } from '@/interfaces/modal';
import axios from 'axios';

class LoggingService {
  private static readonly LOG_ENDPOINT = `${import.meta.env.VITE_NODE_SERVER_URL}/logs`;

  private static readonly PERFORMANCE_LOG_ENDPOINT = `${import.meta.env.VITE_NODE_SERVER_URL}/performance-logs`;

  static async log(entry: LogEntry): Promise<void> {
    try {
      await axios.post(this.LOG_ENDPOINT, {
        ...entry,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  }

  static async logPerformance(entry: PerformanceLog): Promise<void> {
    try {
      await axios.post(this.PERFORMANCE_LOG_ENDPOINT, {
        ...entry,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send performance log to server:', error);
    }
  }
}

export default LoggingService;
