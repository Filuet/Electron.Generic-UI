import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { paymentWindowDevSettings } from '../windowConfig/paymentWindowDevSettings';
import { is } from '@electron-toolkit/utils';
import { paymentWindowProdSettings } from '../windowConfig/paymentWindowProdSettings';
import { dailyLogger } from '../../services/loggingService/loggingService';
import { LogLevel } from '../../../shared/sharedTypes';

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

export const onClosePaymentWindow = (): void => {
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
    const webContents = paymentWindowObject.webContents;
    const meta: Record<string, unknown> = {
      url: webContents.getURL(), // url of the current page
      isLoading: webContents.isLoading(), // is the page still loading
      isCrashed: webContents.isCrashed?.(), // has the renderer process crashed
      userAgent: webContents.getUserAgent?.() // user agent string of the browser
    };

    try {
      const content = await webContents.executeJavaScript('document.documentElement.outerHTML');

      dailyLogger.log({
        level: LogLevel.INFO,
        message: 'Fetched HTML content from payment window',
        data: {
          ...meta,
          html_Content: JSON.stringify(content)
        }
      });

      return content;
    } catch (error) {
      dailyLogger.log({
        level: LogLevel.ERROR,
        message: 'Failed to get the HTML content of the payment window',
        data: {
          ...meta,
          error: error instanceof Error ? error.message : String(error)
        }
      });
      return null;
    }
  }

  dailyLogger.log({
    level: LogLevel.WARN,
    message: 'Attempted to get HTML content but payment window was not available'
  });

  return null;
};
