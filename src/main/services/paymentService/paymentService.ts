import {
  createPaymentWindow,
  getPaymentWindowHtml,
  isPaymentWindowOpen,
  onClosePaymentWindow
} from '../../windows/paymentWindow/paymentWindow';

export const openPayment = (url: string): boolean => {
  if (!url) return false;

  if (isPaymentWindowOpen()) return false;

  createPaymentWindow(url);

  return true;
};

export const closePaymentWindow = (): void => {
  onClosePaymentWindow();
};

export const paymentWindowOpen = (): boolean => {
  return isPaymentWindowOpen();
};

export const getHtmlContent = async (): Promise<string | null> => {
  return await getPaymentWindowHtml();
};
