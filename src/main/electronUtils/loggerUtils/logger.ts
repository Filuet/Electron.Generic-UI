import { createLogger } from './winstonConfig';

const dailyLogger = createLogger('generic-%DATE%.log');

const performanceLogger = createLogger('generic-performance-%DATE%.log');

export { performanceLogger, dailyLogger };
