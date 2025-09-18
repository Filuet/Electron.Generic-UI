import { useEffect, useRef, useState } from 'react';
import { Box, Container } from '@mui/system';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import { Button, CircularProgress, Typography, useTheme } from '@mui/material';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import * as signalR from '@microsoft/signalr';
import useTranslationHook from '@/localization/hook';
import { useAppDispatch, useAppSelector } from '@/redux/core/utils/reduxHook';
import {
  DispenseStatus,
  LogLevel,
  PageRoute,
  PaymentStatus,
  UpdateDispenseStatusModal
} from '@/interfaces/modal';
import { setPaymentStatus } from '@/redux/features/payment/paymentSlice';
import { setActivePage } from '@/redux/features/pageNavigation/navigationSlice';
import { updateOrderCode, updateOrderNumber } from '@/redux/features/cart/cartSlice';
import NavigationButtonUtils from '@/utils/navigationButtonUtils/NavigationButton';
import { updateData } from '@/services/axiosWrapper/apiService';
import { updateDispenseStatusEndpoint } from '@/utils/endpoints';
import LoggingService from '@/utils/loggingService';
import {
  initiatePayment,
  createSignalRConnection,
  createOrder,
  cleanupSignalRConnection as stopSignalRConnection
} from './paymentUtils';
import PaymentPageBanner from '../../assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';
import OriflameLogo from '../../assets/images/Logo/Oriflame_logo_WelcomePage.png';
import loggingService from '@/utils/loggingService';

interface PaymentProcessingError {
  message: string;
  code?: string;
}

function PaymentProcessing() {
  const theme = useTheme();
  const globalStyles = GlobalStyles(theme);
  const { translate } = useTranslationHook();
  const paymentStatus = useAppSelector((state) => state.payment.status);
  const products = useAppSelector((state) => state.cart.products);
  const totalPrice = useAppSelector((state) => state.cart.totalPrice);
  const customerDetails = useAppSelector((state) => state.customerDetails);
  const phoneNumber = useAppSelector((state) => state.customerLogin.phoneNumber);
  const [isPaymentLinkGenerationFailed, setIsPaymentLinkGenerationFailed] =
    useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const cleanupConnection = async (reason: string) => {
    if (connectionRef.current) {
      await LoggingService.log({
        level: LogLevel.INFO,
        component: 'PaymentProcessing',
        message: `Cleaning up SignalR connection: ${reason}`
      });
      await stopSignalRConnection(connectionRef.current);
      connectionRef.current = null;
    }
  };
  const existingOrderCode = useAppSelector((state) => state.cart.orderCode);
  const onNextPage = async (orderCodeToUse: string) => {
    const updateDispenseRequest: UpdateDispenseStatusModal = {
      orderCode: orderCodeToUse,
      status: DispenseStatus.Started
    };
    await LoggingService.log({
      level: LogLevel.INFO,
      component: 'PaymentProcessing',
      message: `Updating dispense status to Started for order code: ${orderCodeToUse}`
    });
    await updateData<UpdateDispenseStatusModal, void>(
      updateDispenseStatusEndpoint,
      updateDispenseRequest
    )
      .then(() => {
        loggingService.log({
          level: 'info',
          message: `Dispense status updated to Started for order code: ${orderCodeToUse}`,
          component: 'PaymentProcessing',
          data: { orderCode: orderCodeToUse }
        });
      })
      .catch(() => {
        loggingService.log({
          level: 'error',
          message: `Failed to update dispense status for order code: ${orderCodeToUse}`,
          component: 'PaymentProcessing',
          data: { orderCode: orderCodeToUse }
        });
      });
    dispatch(setActivePage(PageRoute.ProductCollectionPage));
  };
  const addEventHandlersForSignalR = (
    connectionObject: signalR.HubConnection,
    transactionId: string,
    orderCode: string
  ) => {
    connectionObject.on('ReceivePaymentStatus', async function GetPaymentStatus(message: string) {
      let paymentStatusResponse: PaymentStatus;
      try {
        paymentStatusResponse = PaymentStatus[message as keyof typeof PaymentStatus];
        if (paymentStatusResponse) {
          if (paymentStatusResponse === PaymentStatus.Approved) {
            const orderNumber = await createOrder(
              transactionId,
              products,
              customerDetails,
              phoneNumber,
              totalPrice
            );
            if (orderNumber !== null) {
              dispatch(updateOrderNumber(orderNumber));
            }
          }
          // Clean up connection since we have a valid terminal state
          await cleanupConnection(`Received status: ${paymentStatusResponse}`);
        } else {
          throw new Error('Invalid payment status');
        }
      } catch (error) {
        console.error('Error handling payment status:', error);
        paymentStatusResponse = PaymentStatus.NotFound;

        // Clean up connection for error case as well
        await cleanupConnection('Error handling payment status');
      }

      dispatch(setPaymentStatus(paymentStatusResponse));
      // Update payment status and navigate if approved
      if (paymentStatusResponse === PaymentStatus.Approved) {
        onNextPage(orderCode);
      }
      setIsPaymentProcessing(false);
    });

    const startConnection = () => {
      connectionObject
        .start()
        .then(() => {
          loggingService.log({
            level: 'info',
            message: 'SignalR connection started successfully',
            component: 'PaymentProcessing'
          });
        })
        .catch((err) => {
          console.error('Connection failed: ', err);
        });
    };

    startConnection();
  };

  useEffect(() => {
    return () => {
      cleanupConnection('Component unmount');
    };
  }, []);

  const openPaymentWindowInNewTab = (link: string) => {
    loggingService.log({
      level: 'info',
      component: 'PaymentProcessing',
      message: `Attempting to open payment window with link: ${link}`
    });

    try {
      window.electron.payment.open(link);
      loggingService.log({
        level: 'info',
        component: 'PaymentProcessing',
        message: 'Payment window opened successfully'
      });
    } catch (error) {
      const paymentError = error as PaymentProcessingError;
      LoggingService.log({
        level: LogLevel.ERROR,
        component: 'PaymentProcessing',
        message: `Failed to open payment window: ${paymentError.message}`,
        data: { error: paymentError, link }
      });
      dispatch(setPaymentStatus(PaymentStatus.NotFound));
      setIsPaymentProcessing(false);
    }
  };

  const onPaymentProcessing = async () => {
    await LoggingService.log({
      level: LogLevel.INFO,
      component: 'PaymentProcessing',
      message: 'Starting payment processing'
    });
    setIsPaymentLinkGenerationFailed(false);
    setIsPaymentProcessing(true);
    // Clean up existing connection first
    await cleanupConnection('Starting new payment process');
    dispatch(setPaymentStatus(PaymentStatus.Pending));
    const paymentData = await initiatePayment(
      totalPrice,
      products,
      customerDetails,
      phoneNumber,
      existingOrderCode
    );
    if (paymentData) {
      if (existingOrderCode !== paymentData.orderCode) {
        dispatch(updateOrderCode(paymentData.orderCode));
      }
      if (import.meta.env.VITE_IS_PROD === 'true') {
        openPaymentWindowInNewTab(paymentData.link);
        const newConnection = createSignalRConnection(paymentData.transactionId);
        addEventHandlersForSignalR(newConnection, paymentData.transactionId, paymentData.orderCode);
        connectionRef.current = newConnection;
      } else {
        dispatch(setPaymentStatus(PaymentStatus.Approved));
        onNextPage(paymentData.orderCode);
      }
    } else {
      setIsPaymentProcessing(false);
      setIsPaymentLinkGenerationFailed(true);
    }
  };
  const retryPayment = async () => {
    await cleanupConnection('Retrying payment');
    await onPaymentProcessing();
  };
  useEffect(() => {
    onPaymentProcessing();
  }, []);

  const renderPaymentStatusMessage = () => {
    switch (paymentStatus) {
      case PaymentStatus.Approved:
        return translate('paymentSuccessful');

      case PaymentStatus.Declined:
        return translate('paymentDeclined');

      case PaymentStatus.Expired:
        return translate('paymentExpired');
      case PaymentStatus.NotFound:
        return translate('paymentNotFound');

      case PaymentStatus.Refunded:
        return translate('paymentRefunded');
      case PaymentStatus.Cancelled:
        return translate('paymentCancelled');
      case PaymentStatus.Timeout:
        return translate('paymentTimeOut');
      case PaymentStatus.Pending:
        return translate('paymentProcessing');
      default:
        return translate('paymentNotFound');
    }
  };
  const onPreviousPage = () => {
    dispatch(setActivePage(PageRoute.HomePage));
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${PaymentPageBanner})`,
        ...globalStyles.pageContainer
      }}
    >
      <Container
        sx={{
          width: '535px',
          height: '482px',
          ...globalStyles.pageContentContainer
        }}
      >
        <Box component="img" src={OriflameLogo} sx={{ width: '262px' }} />
        <PaymentOutlinedIcon sx={{ fontSize: '102px', height: '102px' }} />
        <Typography
          variant="body1"
          sx={{ fontWeight: 'normal', fontSize: '24px', marginTop: '20px' }}
        >
          {isPaymentLinkGenerationFailed
            ? translate('FailedToGenerateLink')
            : renderPaymentStatusMessage()}
        </Typography>

        {paymentStatus !== PaymentStatus.Approved && (
          <>
            <Button
              variant="outlined"
              sx={{ marginTop: '25px' }}
              onClick={retryPayment}
              disabled={isPaymentProcessing}
            >
              {isPaymentProcessing ? (
                <CircularProgress color="secondary" size={25} />
              ) : (
                translate('retryPayment')
              )}
            </Button>
            {!isPaymentProcessing && <NavigationButtonUtils onPageChange={onPreviousPage} />}
          </>
        )}
      </Container>
    </Box>
  );
}

export default PaymentProcessing;
