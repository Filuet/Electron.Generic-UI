import { JSX, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import UnderMaintenance from './pages/UnderMaintenance/UnderMaintenance';
import NonWorkingHours from './pages/NonWorkingHour/NonWorkingHours';
import { LogLevel, MachineActiveStatus, PageRoute } from './interfaces/modal';
import { setActivePage } from './redux/features/pageNavigation/navigationSlice';
import { useAppDispatch, useAppSelector } from './redux/core/utils/reduxHook';
import LoginPage from './pages/Login/LoginPage';
import HomePage from './pages/Home/HomePage';
import SignUpPage from './pages/SignUp/SignUpPage';
// import CartPage from './pages/ProductCartPage/ProductCart';
import KioskWelcomePage from './pages/WelcomePage/KioskWelcome';
import UserWelcomePage from './pages/WelcomePage/UserWelcome';
import PaymentProcessing from './pages/PaymentPage/PaymentProcessing';
import ProductCollection from './pages/Product_Collection/ProductCollection';
import ThankyouPage from './pages/ThankYouPage/ThankyouPage';
import ValidateOtp from './pages/Login/ValidateOTP/ValidateOtp';
import { getDispenseStatus, resetStatus } from './utils/expoApiUtils';
import { setExpoStatus, setInoperableMachines } from './redux/features/expoSettings/expoSlice';
import { checkMachinesStatus, delay, getActiveMachines } from './utils/dispenserUtils';
import { getData } from './services/axiosWrapper/apiService';
import { expoFailEndpoint } from './utils/endpoints';
import SupportContact from './pages/UnderMaintenance/SupportContact';
import loggingService from './utils/loggingService';

function KioskPortal(): JSX.Element {
  const dispatch = useAppDispatch();

  const currentPage = useAppSelector((state) => state.navigation.currentPage);
  const { workingHours, underMaintenance } = useAppSelector(
    (state) => state.kioskSettings.kioskSettings
  );

  const machineStatus: MachineActiveStatus = useAppSelector(
    (state) => state.kioskSettings.kioskSettings.machines
  );

  const checkDispenserStatus = async (attempts: number = 3): Promise<boolean> => {
    if (attempts === 0) {
      dispatch(setExpoStatus(false));
      loggingService.log({
        level: 'info',
        component: 'KioskPortal.tsx',
        message: 'Dispenser is not reachable after multiple attempts',
        data: { attempts: attempts }
      });
      return false;
    }

    const apiResponse = await getDispenseStatus();
    const statusResult = apiResponse.data;
    if (
      statusResult.status === 'success' &&
      statusResult.action === 'pending' &&
      statusResult.message === 'Waiting for command'
    ) {
      return true;
    }

    await delay(2000);
    return checkDispenserStatus(attempts - 1);
  };
  const checkWorkingHours = useCallback(() => {
    const now = dayjs();
    const currentDay = now.format('dddd').toLowerCase();
    const currentTime = now.format('HH:mm');
    const workingHoursForToday = workingHours[currentDay];

    if (workingHoursForToday.start === '00:00:00' && workingHoursForToday.end === '00:00:00') {
      return false;
    }

    return (
      dayjs(`1970-01-01 ${workingHoursForToday.start}`).isBefore(
        dayjs(`1970-01-01 ${currentTime}`)
      ) &&
      dayjs(`1970-01-01 ${workingHoursForToday.end}`).isAfter(dayjs(`1970-01-01 ${currentTime}`))
    );
  }, [workingHours]);
  useEffect(() => {
    const dispenserCheck = async (kioskMachines: number[]): Promise<void> => {
      try {
        const machineCheckResult = await checkMachinesStatus(kioskMachines);

        if (!machineCheckResult.success) {
          // Update Redux state with inoperable machines
          dispatch(
            setInoperableMachines(
              machineCheckResult.inoperableMachines.map((machineId) => ({
                machineId
              }))
            )
          );
        }

        const dispenserStatus = await checkDispenserStatus();
        if (!dispenserStatus) {
          await resetStatus();
          loggingService.log({
            level: 'info',
            component: 'KioskPortal.tsx',
            message: 'Dispenser is not reachable',
            data: { dispenserStatus: dispenserStatus }
          });
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === 'ECONNREFUSED' &&
          import.meta.env.VITE_IS_PROD === 'true'
        ) {
          getData(`${expoFailEndpoint}/${import.meta.env.VITE_KIOSK_NAME}`);
          loggingService.log({
            level: LogLevel.ERROR,
            component: 'KioskPortal',
            message: `ExpoExtractor is not running`,
            data: {
              message: error.message
            }
          });
          dispatch(setActivePage(PageRoute.SupportContactPage));
          return;
        }
        loggingService.log({
          level: LogLevel.ERROR,
          component: 'KioskPortal',
          message: 'Error during dispenser check',
          data: { error: JSON.stringify(error) }
        });
      }
    };

    const activeMachines = getActiveMachines(machineStatus);
    dispenserCheck(activeMachines);
  }, []);
  useEffect(() => {
    if (underMaintenance) {
      dispatch(setActivePage(PageRoute.UnderMaintenancePage));
    } else if (!checkWorkingHours()) {
      dispatch(setActivePage(PageRoute.NonWorkingHourPage));
    } else {
      dispatch(setActivePage(PageRoute.KioskWelcomePage));
    }
  }, [checkWorkingHours, dispatch, underMaintenance]);

  const renderPage = (): JSX.Element => {
    switch (currentPage) {
      case PageRoute.UnderMaintenancePage:
        return <UnderMaintenance />;
      case PageRoute.NonWorkingHourPage:
        return <NonWorkingHours />;
      case PageRoute.KioskWelcomePage:
        return <KioskWelcomePage />;
      case PageRoute.LoginPage:
        return <LoginPage />;
      case PageRoute.SignUpPage:
        return <SignUpPage />;
      case PageRoute.UserWelcomePage:
        return <UserWelcomePage />;
      case PageRoute.HomePage:
        return <HomePage />;
      // case PageRoute.CheckoutPage:
      //   return <CartPage />;
      case PageRoute.ValidateOtpPage:
        return <ValidateOtp />;
      case PageRoute.PaymentProcessingPage:
        return <PaymentProcessing />;
      case PageRoute.ProductCollectionPage:
        return <ProductCollection />;
      case PageRoute.ThankYouPage:
        return <ThankyouPage />;
      case PageRoute.SupportContactPage:
        return <SupportContact />;
      default:
        return <KioskWelcomePage />;
    }
  };
  return renderPage();
}

export default KioskPortal;
