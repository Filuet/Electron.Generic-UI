import { useState, useRef, useEffect, useCallback, JSX } from 'react';
import { AxiosError } from 'axios';
import { debounce } from 'lodash';
import { Modal, Box, Button, Typography, useTheme } from '@mui/material';
import KioskPortal from './KioskPortal';
import { LocalStorageWrapper } from './utils/localStorageWrapper';
import {
  ExtendedPerformance,
  LoginRequestModel,
  LoginResponseModel,
  LogLevel,
  MachineActiveStatus,
  PageRoute,
  ValidationException
} from './interfaces/modal';
import { postData } from './services/axiosWrapper/apiService';
import { useAppDispatch, useAppSelector } from './redux/core/utils/reduxHook';
import { fetchKioskSettings } from './redux/features/kioskSettings/kioskSettingThunk';
import { AUTH_TOKEN_KEY, SESSION_ID } from './utils/constants';
import { kioskLoginEndpoint } from './utils/endpoints';
import OriflameLogo from './assets/images/Logo/oriflameLogo.svg';
import StartScreenBanner from './assets/images/Defaults/DefaultBackgroundImage.png';
import { setVideoFileNames } from './redux/features/welcomeScreen/welcomeScreenSlice';
import OriflameLoader from './components/oriflameLoader/OriflameLoader';
import { resetReduxStore } from './redux/core/utils/resetReduxStore';
import { setActivePage } from './redux/features/pageNavigation/navigationSlice';
import loggingService from './utils/loggingService';
import {
  checkDispenserStatus,
  checkMachinesStatus,
  getActiveMachines
} from './pages/ProductCollection/productCollectionUtils/dispenserUtils';
import { setInoperableMachines } from './redux/features/expoSettings/expoSlice';

function App(): JSX.Element {
  const theme = useTheme();
  const PERFORMANCE_LOGGING_INTERVAL = 30 * 60 * 1000; // 30 minutes
  const MACHINE_STATUS_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes;
  const dispatch = useAppDispatch();

  const videoFilenames = useAppSelector((state) => state.welcomeScreen);
  const currentPage = useAppSelector((state) => state.navigation.currentPage);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const customerName = useAppSelector((state) => state.customerDetails.customerName);
  const customerId = useAppSelector((state) => state.customerDetails.customerId);
  const resetOnIdleTimerMs =
    useAppSelector((state) => state.kioskSettings.kioskSettings.resetOnIdleTimerMs) ?? 3000;

  const machineStatus: MachineActiveStatus = useAppSelector(
    (state) => state.kioskSettings.kioskSettings.machines
  );
  const machineStatusRef = useRef(machineStatus);
  const customerIdRef = useRef(customerId);
  const customerNameRef = useRef(customerName);
  useEffect(() => {
    machineStatusRef.current = machineStatus;
    customerIdRef.current = customerId;
    customerNameRef.current = customerName;
  }, [machineStatus, customerId, customerName]);

  useEffect(() => {
    const initializeKiosk = async (): Promise<void> => {
      try {
        LocalStorageWrapper.removeItem(AUTH_TOKEN_KEY);
        const response = await postData<LoginRequestModel, LoginResponseModel>(
          kioskLoginEndpoint,
          {
            email: import.meta.env.VITE_KIOSK_EMAIL,
            password: import.meta.env.VITE_KIOSK_PASSWORD
          },
          false
        );

        if (response.token !== null) {
          LocalStorageWrapper.setItem(AUTH_TOKEN_KEY, response.token);
          await dispatch(fetchKioskSettings());
        }
      } catch (error) {
        const response = (error as AxiosError).response?.data as ValidationException;
        if (response?.exceptionType === 'ValidationException') {
          loggingService.log({
            level: LogLevel.ERROR,
            component: 'App.tsx',
            message: `Invalid kiosk credentials provided.`,
            data: { error }
          });
        }
        loggingService.log({
          level: LogLevel.ERROR,
          component: 'App.tsx',
          message: `Error occurred while logging kiosk. Navigating to Under Maintenance page.`,
          data: { error }
        });
        dispatch(setActivePage(PageRoute.UnderMaintenancePage));
      }
    };

    initializeKiosk();
  }, [dispatch]);
  useEffect(() => {
    if (currentPage === PageRoute.KioskWelcomePage) {
      dispatch(fetchKioskSettings());
    }
  }, [currentPage, dispatch]);
  useEffect(() => {
    async function getVideoUrl(): Promise<void> {
      if (videoFilenames[currentVideoIndex]) {
        const dataUrl = await window.electron.videoFilesUtil.getVideoContent(
          videoFilenames[currentVideoIndex]
        );
        if (dataUrl) {
          setCurrentVideoUrl(dataUrl);
        } else {
          loggingService.log({
            level: LogLevel.ERROR,
            message: 'Failed to load video content',
            component: 'App.tsx',
            data: {
              videoFileName: videoFilenames[currentVideoIndex],
              index: currentVideoIndex,
              videoFilenames
            }
          });
        }
      }
    }

    getVideoUrl();
  }, [currentVideoIndex, videoFilenames]);

  useEffect(() => {
    async function getVideoFilenames(): Promise<void> {
      window.electron.videoFilesUtil.getFiles().then((response) => {
        if (response.length !== 0) {
          dispatch(setVideoFileNames(response));
        }
      });
    }

    getVideoFilenames();
  }, [dispatch]);

  // Refetch when file change detected
  useEffect(() => {
    const refresh = debounce(() => {
      window.electron.videoFilesUtil.getFiles().then((response) => {
        dispatch(setVideoFileNames(response));
      });
    }, 500);

    window.electron.videoFilesUtil.onFolderChange(refresh);

    return () => {
      window.electron.videoFilesUtil.removeFolderListener(refresh);
    };
  }, [dispatch]);

  // Simplified auth error handler
  useEffect(() => {
    const handleAuthError = (): void => {
      console.log('Auth error detected - token refresh failed completely');
      loggingService.log({
        level: LogLevel.ERROR,
        component: 'App',
        message: `Auth error detected - token refresh failed completely. Navigating to Under Maintenance page.`
      });
      // Just update UI state since token refresh already failed in the interceptor
      dispatch(setActivePage(PageRoute.UnderMaintenancePage));
      loggingService.log({
        level: LogLevel.ERROR,
        message: 'Authentication error detected, redirecting to under maintenance page',
        component: 'App.tsx'
      });
    };

    // Listen for auth errors from axios interceptor
    window.addEventListener('auth-error', handleAuthError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [dispatch]);

  const onVideoEnd = useCallback(() => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoFilenames.length);
  }, [videoFilenames.length]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('ended', onVideoEnd);
    }
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('ended', onVideoEnd);
      }
    };
  }, [videoFilenames.length, currentVideoIndex, isVideoPlaying, onVideoEnd]);

  useEffect(() => {
    if (videoRef.current && currentVideoUrl) {
      videoRef.current.src = currentVideoUrl;
      videoRef.current.play().catch((err) => {
        loggingService.log({
          level: LogLevel.ERROR,
          message: 'Error playing video',
          component: 'App.tsx',
          data: err
        });
      });
    }
  }, [currentVideoUrl]);

  const loading = useAppSelector((state) => state.kioskSettings.loading);

  useEffect(() => {
    if ('performance' in window && (performance as ExtendedPerformance).memory) {
      const checkMemoryUsage = (): void => {
        const { memory } = performance as ExtendedPerformance;

        if (memory) {
          const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = memory;

          const used = +(usedJSHeapSize / 1048576).toFixed(2);
          const total = +(totalJSHeapSize / 1048576).toFixed(2);
          const limit = +(jsHeapSizeLimit / 1048576).toFixed(2);
          const usagePercent = +((usedJSHeapSize / jsHeapSizeLimit) * 100).toFixed(2);

          const logPayload = {
            level: LogLevel.INFO,
            message: 'Memory usage report',
            component: 'App.tsx',
            type: 'performance',
            data: {
              usedJSHeapSizeMB: used,
              totalJSHeapSizeMB: total,
              jsHeapSizeLimitMB: limit,
              usagePercent
            }
          };
          loggingService.logPerformance(logPayload);
        }
      };

      const intervalId = setInterval(checkMemoryUsage, PERFORMANCE_LOGGING_INTERVAL);

      return () => clearInterval(intervalId);
    }

    return undefined;
  }, [PERFORMANCE_LOGGING_INTERVAL]);

  const getPagesWithNoInactivity = (): PageRoute[] => [
    PageRoute.PaymentProcessingPage,
    PageRoute.ProductCollectionPage,
    PageRoute.ThankYouPage,
    PageRoute.SupportContactPage
  ];

  const getPagesWithoutModal = (): PageRoute[] => [
    PageRoute.LoginPage,
    PageRoute.KioskWelcomePage,
    PageRoute.UnderMaintenancePage,
    PageRoute.ValidateOtpPage,
    PageRoute.SignUpPage,
    PageRoute.NonWorkingHourPage
  ];

  const onUserInactivity = useCallback(async () => {
    if (getPagesWithNoInactivity().includes(currentPage)) {
      return;
    }

    if (getPagesWithoutModal().includes(currentPage)) {
      const resetApp = async (): Promise<void> => {
        setIsModalOpen(false);

        if (customerId !== '' && customerName !== '') {
          LocalStorageWrapper.removeItem(SESSION_ID);
          loggingService.log({
            level: LogLevel.INFO,
            message: 'User logged out, Customer session ended due to inactivity',
            component: 'App.tsx',
            data: {
              customerId,
              customerName
            }
          });
        }

        resetReduxStore();
        setIsVideoPlaying(true);
        videoRef.current?.play();
        // await dispatch(fetchKioskSettings());
      };
      setTimeout(resetApp, 30000);
      return;
    }

    if (countdownTimer.current) {
      clearInterval(countdownTimer.current!);
    }

    setIsModalOpen(true);
    setCountdown(30);

    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownTimer.current!);
          countdownTimer.current = null;
          setIsModalOpen(false);
          if (customerId !== '' && customerName !== '') {
            loggingService.log({
              message: 'User logged out',
              level: LogLevel.INFO,
              data: {
                customerId,
                customerName
              },
              component: 'App.tsx'
            });
          }
          resetReduxStore();
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentPage, customerId, customerName]);

  const onUserActivity = (): void => {
    // its needed to fetch kiosk settings when the user is on start page only
    dispatch(fetchKioskSettings());
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsModalOpen(false);
    clearInterval(countdownTimer.current!);
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      if (!isVideoPlaying) {
        onUserInactivity();
      }
    }, resetOnIdleTimerMs - 30000);
  }, [isVideoPlaying, onUserInactivity, resetOnIdleTimerMs]);

  useEffect(() => {
    const onActivity = (): void => {
      resetInactivityTimer();
    };

    // Existing event listeners for general user activity
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('click', onActivity);
    window.addEventListener('wheel', onActivity);
    window.addEventListener('touchstart', onActivity);
    window.addEventListener('touchmove', onActivity);

    // Add event listeners for input events
    window.addEventListener('input', onActivity); // Captures text input in any input field
    window.addEventListener('focus', onActivity, true); // Captures when an input receives focus (with capturing phase)
    window.addEventListener('change', onActivity); // Captures when an input value is committed

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }

      // Remove existing event listeners
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('wheel', onActivity);
      window.removeEventListener('touchstart', onActivity);
      window.removeEventListener('touchmove', onActivity);

      // Remove input event listeners
      window.removeEventListener('input', onActivity);
      window.removeEventListener('focus', onActivity, true);
      window.removeEventListener('change', onActivity);
    };
  }, [currentPage, isVideoPlaying, resetInactivityTimer]);

  const onCloseModal = (): void => {
    resetInactivityTimer();
    setIsModalOpen(false);
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    clearInterval(countdownTimer.current!);
  };

  useEffect(() => {
    const checkStatus = async (): Promise<void> => {
      if (customerIdRef.current === '' && customerNameRef.current === '') {
        const activeMachines = getActiveMachines(machineStatusRef.current);
        const checkMachineResult = await checkMachinesStatus(activeMachines, 1);
        const machines = !checkMachineResult.success
          ? checkMachineResult.inoperableMachines.map((id) => ({
              machineId: id
            }))
          : [];

        dispatch(setInoperableMachines(machines));
        await checkDispenserStatus(1);
      }
    };
    checkStatus();
    const intervalId = setInterval(checkStatus, MACHINE_STATUS_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <OriflameLoader isLoading={loading} />
      {isVideoPlaying && videoFilenames.length !== 0 && currentVideoUrl && (
        <video
          ref={videoRef}
          src={currentVideoUrl}
          className="video-player"
          autoPlay
          muted
          loop={videoFilenames.length === 1}
          onClick={onUserActivity}
        />
      )}
      {isVideoPlaying && videoFilenames.length === 0 && (
        <Box
          component="img"
          src={StartScreenBanner}
          onClick={onUserActivity}
          sx={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '1272px'
          }}
        />
      )}
      {!loading && !isVideoPlaying && <KioskPortal />}
      <Modal open={isModalOpen} onClose={onCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '36%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            padding: '30px 60px 30px 60px',
            boxShadow: 'none'
          }}
        >
          <Box component="img" src={OriflameLogo} sx={{ width: '250px', margin: 0, padding: 0 }} />

          <Typography
            variant="body1"
            sx={{
              width: '300px',
              fontSize: '22px',
              marginTop: '30px'
            }}
          >
            Kiosk resetting in {countdown} seconds. Do you need more time?
          </Typography>

          <Box
            sx={{
              marginTop: '40px',
              display: 'flex',
              justifyContent: 'space-around'
            }}
          >
            <Button
              variant="contained"
              sx={{
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.secondary.main,
                width: '5.5rem'
              }}
              onClick={onCloseModal}
            >
              Yes
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default App;
