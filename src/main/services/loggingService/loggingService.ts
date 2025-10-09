import { createLogger } from '../../utils/winstonConfig';

const dailyLogger = createLogger('generic-%DATE%.log');

const performanceLogger = createLogger('generic-performance-%DATE%.log');

const expoDailyLogger = createLogger('expo-logs-%DATE%.log');

export { performanceLogger, dailyLogger, expoDailyLogger };
