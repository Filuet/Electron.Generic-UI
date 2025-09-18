import {
  createPaymentWindow,
  getPaymentWindowHtml,
  isPaymentWindowOpen,
  onClosePaymentWindow
} from '../../windows/paymentWindow/paymentWindow';

export const openPayment = (url: string): boolean => {
  if (!url.trim()) return false;

  if (isPaymentWindowOpen()) return false;

  if (createPaymentWindow(url)) return true;

  return false;
};

export const closePaymentWindow = (): void => {
  onClosePaymentWindow();
};

export const paymentWindowOpen = (): boolean => {
  return isPaymentWindowOpen();
};

export const getHtmlContent = (): Promise<string | null> => {
  return getPaymentWindowHtml();
};
