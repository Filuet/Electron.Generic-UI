import expoHandler from './expoHandler';
import loggingHandler from './loggingHandler';
import paymentWindowIpc from './paymentWindowHandler';
import videoFilesHandler from './videoFilesHandler';

const registerAllIpcHandlers = () => {
  expoHandler();
  loggingHandler();
  videoFilesHandler();
  paymentWindowIpc();
};
export default registerAllIpcHandlers;
