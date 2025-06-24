import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipcChannels';
import {
  closePaymentWindow,
  getHtmlContent,
  openPayment
} from '../services/paymentService/paymentService';
import { isPaymentWindowOpen } from '../windows/paymentWindow/paymentWindow';

const paymentWindowIpc = () => {
  ipcMain.handle(IPC_CHANNELS.PAYMENT_OPEN, async (_event, link: string) => {
    return openPayment(link);
  });

  ipcMain.handle(IPC_CHANNELS.PAYMENT_CLOSE, async (): Promise<boolean> => {
    closePaymentWindow();
    return true;
  });
  ipcMain.handle(IPC_CHANNELS.PAYMENT_IS_OPEN, async (): Promise<boolean> => {
    return isPaymentWindowOpen();
  });
  ipcMain.handle(IPC_CHANNELS.PAYMENT_WINDOW_HTML_CONTENT, async (): Promise<string | null> => {
    return await getHtmlContent();
  });
};
export default paymentWindowIpc;
