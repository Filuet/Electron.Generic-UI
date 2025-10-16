import { postData } from '@/services/axiosWrapper/apiService';
import {
  oriflameOrderEndpoint,
  paymentLinkEndpoint,
  paymentStatusHubEndpoint
} from '@/utils/endpoints';
import {
  LogLevel,
  OriflameOrderModal,
  PaymentLinkResponse,
  PaymentStatus,
  TransactionModel
} from '@/interfaces/modal';
import * as signalR from '@microsoft/signalr';
import { CustomerDetails } from '@/redux/features/customerDetails/types';
import loggingService from '@/utils/loggingService';

/**
 * Fetches the payment link and transaction ID.
 *
 * @param totalPrice - The total amount to be paid
 * @param products - The list of products in the cart
 * @returns A promise resolving to the payment link and transaction ID
 */
export const initiatePayment = async (
  totalPrice: number,
  products: {
    skuCode: string;
    productCount: number;
  }[],
  customerDetails: CustomerDetails,
  phoneNumber: string,
  orderCode: string
): Promise<{
  link: string;
  transactionId: string;
  orderCode: string;
} | null> => {
  const transactionModal: TransactionModel = {
    value: totalPrice,
    fullName: customerDetails.customerName,
    code: phoneNumber,
    customerId: customerDetails.customerId,
    isVIP: customerDetails.isVIP,
    kioskName: import.meta.env.VITE_KIOSK_NAME,
    order: products.map((product) => ({
      skuCode: product.skuCode,
      quantity: product.productCount
    })),
    orderCode
  };

  try {
    const response: PaymentLinkResponse = await postData<TransactionModel, PaymentLinkResponse>(
      paymentLinkEndpoint,
      transactionModal
    );
    return {
      link: response.link,
      transactionId: response.transactionId,
      orderCode: response.orderCode
    };
  } catch (error) {
    loggingService.log({
      level: LogLevel.ERROR,
      component: 'PaymentUtils',
      message: `Error fetching payment link: Request body for TransactionModel`,
      data: { transactionModal, error: JSON.stringify(error) }
    });
    console.error('Error fetching payment link:', error);
    return null;
  }
};
/**
 * Create Order in oriflame.
 * @param customerId - customerId
 * @param isVIP - customer either VIP or brandPartner
 * @param transactionId - transactionId created after payment
 * @param productDetails - The list of products in the cart
 * @returns A promise resolving to the orderNumber
 */
export const createOrder = async (
  transactionId: string,
  productDetails: { skuCode: string; productCount: number }[],
  customerDetails: CustomerDetails,
  phoneNumber: string,
  totalAmount: number
): Promise<string | null> => {
  const orderModal: OriflameOrderModal = {
    transactionId,
    customerId: customerDetails.customerId,
    isVIP: customerDetails.isVIP,
    products: productDetails.map((product) => ({
      skuCode: product.skuCode,
      quantity: product.productCount
    })),
    phoneNumber,
    totalAmount
  };
  try {
    const response: string = await postData<OriflameOrderModal, string>(
      oriflameOrderEndpoint,
      orderModal
    );
    return response;
  } catch (error) {
    loggingService.log({
      level: LogLevel.ERROR,
      component: 'PaymentUtils',
      message: `Error creating order: Request body for OrderModal`,
      data: { orderModal, error: JSON.stringify(error) }
    });
    console.error('Error creating order:', error);
    return null;
  }
};
/**
 * Creates a SignalR connection for tracking payment status.
 *
 * @param transactionId - Transaction ID for tracking payment status
 * @returns A new SignalR connection instance
 */
export const createSignalRConnection = (transactionId: string): signalR.HubConnection => {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${paymentStatusHubEndpoint}?transactionId=${transactionId}`)
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .build();
};

/**
 * Safely stops and cleans up a SignalR connection.
 * @param connection - The SignalR connection to clean up
 */
export const cleanupSignalRConnection = async (
  connection: signalR.HubConnection | null
): Promise<void> => {
  if (connection) {
    try {
      await connection.stop();
      loggingService.log({
        level: LogLevel.INFO,
        component: 'PaymentUtils',
        message: 'SignalR connection stopped successfully'
      });
    } catch (error) {
      loggingService.log({
        level: LogLevel.ERROR,
        component: 'paymentUtils.ts',
        message: `Error cleaning up SignalR connection: ${error}`
      });
    }
  }
};

/**
 * Parses payment status received from SignalR.
 *
 * @param message - Payment status message received from SignalR
 * @returns A valid PaymentStatus enum value
 */
export const parsePaymentStatus = (message: string): PaymentStatus => {
  return PaymentStatus[message as keyof typeof PaymentStatus] || PaymentStatus.NotFound;
};
