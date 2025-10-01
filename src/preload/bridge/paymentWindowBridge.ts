import { IPC_CHANNELS } from '../../shared/ipcChannels';
import { PaymentWindowBridge } from '../../shared/sharedTypes';

const createPaymentWindowBridge = (ipc: Electron.IpcRenderer): PaymentWindowBridge => {
  return {
    open: (link: string): Promise<boolean> => ipc.invoke(IPC_CHANNELS.PAYMENT_OPEN, link),
    close: (): Promise<boolean> => ipc.invoke(IPC_CHANNELS.PAYMENT_CLOSE),
    getHTML: (): Promise<string | null> => ipc.invoke(IPC_CHANNELS.PAYMENT_WINDOW_HTML_CONTENT),
    isOpen: (): Promise<boolean> => ipc.invoke(IPC_CHANNELS.PAYMENT_IS_OPEN)
  };
};
export default createPaymentWindowBridge;
