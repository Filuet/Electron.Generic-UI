import expoIpcHandler from './expoHandler';
import loggingIpcHandler from './loggingHandler';
import paymentWindowIpc from './paymentWindowHandler';
import testingConfigIpcHandler from './testingConfigIpcHandler';
import videoFilesIpcHandler from './videoFilesHandler';

const registerAllIpcHandlers = (): void => {
  expoIpcHandler();
  loggingIpcHandler();
  videoFilesIpcHandler();
  paymentWindowIpc();
  testingConfigIpcHandler();
};
export default registerAllIpcHandlers;
