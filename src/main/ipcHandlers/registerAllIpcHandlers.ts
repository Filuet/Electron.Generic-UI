import expoHandler from './expoHandler';
import loggingHandler from './loggingHandler';
import videoFilesHandler from './videoFilesHandler';

const registerAllIpcHandlers = () => {
  expoHandler();
  loggingHandler();
  videoFilesHandler();
};
export default registerAllIpcHandlers;
