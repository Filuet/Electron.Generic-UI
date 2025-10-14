import * as signalR from '@microsoft/signalr';
import { LogLevel, PaymentStatus } from '@/interfaces/modal';
import { createSignalRConnection } from '@/pages/PaymentPage/paymentUtils';
import loggingService from './loggingService';

type PaymentHandlerProps = {
  onStatusChange: (status: PaymentStatus) => void;
  onConnectionClose: () => void;
  onError: (error: Error) => void;
  onApproved: (transactionId: string) => Promise<void>;
};

interface PaymentConnectionError {
  message: string;
  code?: string;
  data?: Record<string, unknown>;
}

export class PaymentConnectionManager {
  private connection: signalR.HubConnection | null = null;

  private paymentWindow: Window | null = null;

  private timeoutInterval: NodeJS.Timeout | null = null;

  constructor(private handlers: PaymentHandlerProps) {}

  public initializePaymentWindow(link: string, timeoutMs: number, onTimeout: () => void): void {
    this.paymentWindow = window.open(link, '_blank');

    this.timeoutInterval = setInterval(() => {
      this.cleanup();
      onTimeout();
    }, timeoutMs);
  }

  public async initializeConnection(transactionId: string): Promise<void> {
    if (this.connection) {
      await this.cleanup();
    }

    await loggingService.log({
      level: LogLevel.INFO,
      component: 'PaymentConnectionManager',
      message: `Initializing connection for transaction ${transactionId}`
    });

    const connectionObject = createSignalRConnection(transactionId);
    this.setupEventHandlers(connectionObject, transactionId);
    this.connection = connectionObject;

    await this.startConnection();
  }

  public async cleanup(): Promise<void> {
    if (this.timeoutInterval) {
      clearInterval(this.timeoutInterval);
      this.timeoutInterval = null;
    }

    if (this.paymentWindow) {
      this.paymentWindow.close();
      this.paymentWindow = null;
    }

    if (this.connection) {
      const conn = this.connection;
      this.connection = null;
      try {
        await conn.stop();
        await loggingService.log({
          level: LogLevel.INFO,
          component: 'PaymentConnectionManager',
          message: 'Connection closed and cleaned up'
        });
      } catch (error) {
        const connError = error as PaymentConnectionError;
        await loggingService.log({
          level: LogLevel.ERROR,
          component: 'PaymentConnectionManager',
          message: 'Error stopping connection',
          data: { error: connError }
        });
      }
    }
  }

  private setupEventHandlers(connectionObject: signalR.HubConnection, transactionId: string): void {
    connectionObject.on('ReceivePaymentStatus', async (message: string) => {
      try {
        const paymentStatus = PaymentStatus[message as keyof typeof PaymentStatus];
        if (!paymentStatus) {
          throw new Error('Invalid payment status');
        }
        this.handlers.onStatusChange(paymentStatus);
        if (paymentStatus === PaymentStatus.Approved) {
          await this.handlers.onApproved(transactionId);
        }
      } catch (error) {
        this.handlers.onError(error as Error);
      }
    });

    connectionObject.onclose(() => {
      this.handlers.onConnectionClose();
    });
  }

  private async startConnection(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.start();
      await loggingService.log({
        level: LogLevel.INFO,
        component: 'PaymentConnectionManager',
        message: 'SignalR connection established'
      });
    } catch (error) {
      const connectionError = error as PaymentConnectionError;
      await loggingService.log({
        level: LogLevel.ERROR,
        component: 'PaymentConnectionManager',
        message: 'Connection failed',
        data: {
          message: connectionError.message,
          code: connectionError.code,
          data: connectionError.data
        }
      });
      this.handlers.onError(new Error(connectionError.message));
    }
  }
}
