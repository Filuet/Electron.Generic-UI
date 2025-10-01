import expoIpcHandler from './expoHandler';
import loggingIpcHandler from './loggingHandler';
import paymentWindowIpc from './paymentWindowHandler';
import videoFilesIpcHandler from './videoFilesHandler';

const registerAllIpcHandlers = (): void => {
  expoIpcHandler();
  loggingIpcHandler();
  videoFilesIpcHandler();
  paymentWindowIpc();
};
export default registerAllIpcHandlers;
