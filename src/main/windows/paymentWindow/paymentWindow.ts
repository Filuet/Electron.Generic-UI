import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { paymentWindowDevSettings } from '../windowConfig/paymentWindowDevSettings';
import { is } from '@electron-toolkit/utils';
import { paymentWindowProdSettings } from '../windowConfig/paymentWindowProdSettings';
import { dailyLogger } from '../../services/loggingService/loggingService';

let paymentWindowObject: BrowserWindow | null = null;

export const createPaymentWindow = (link: string): BrowserWindow | null => {
  if (paymentWindowObject) {
    paymentWindowObject.focus();
    return null;
  }

  const paymentWindowSettings: BrowserWindowConstructorOptions = is.dev
    ? paymentWindowDevSettings
    : paymentWindowProdSettings;

  paymentWindowObject = new BrowserWindow(paymentWindowSettings);

  paymentWindowObject.loadURL(link);

  paymentWindowObject.on('closed', () => {
    paymentWindowObject = null;
  });
  paymentWindowObject.once('ready-to-show', () => {
    paymentWindowObject?.show();
  });
  return paymentWindowObject;
};

export const onClosePaymentWindow = () => {
  if (paymentWindowObject && !paymentWindowObject.isDestroyed()) {
    paymentWindowObject.close();
    paymentWindowObject = null;
  }
};

export const isPaymentWindowOpen = (): boolean => {
  return paymentWindowObject !== null;
};

export const getPaymentWindowHtml = async (): Promise<string | null> => {
  if (paymentWindowObject && !paymentWindowObject.isDestroyed()) {
    try {
      const content = await paymentWindowObject.webContents.executeJavaScript(
        'document.documentElement.outerHTML'
      );
      return content;
    } catch (error) {
      dailyLogger.log({
        level: 'error',
        message: 'Failed to get the html content of the payment window',
        data: error
      });
      return null;
    }
  }
  return null;
};
