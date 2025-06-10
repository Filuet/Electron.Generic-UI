import { useState, useRef, useEffect, useCallback, JSX } from 'react';
import { AxiosError } from 'axios';
import { Modal, Box, Button, Typography, useTheme } from '@mui/material';
import KioskPortal from './KioskPortal';
import { LocalStorageWrapper } from './utils/localStorageWrapper';
import {
  ExtendedPerformance,
  LoginRequestModel,
  LoginResponseModel,
  LogLevel,
  PageRoute,
  ValidationException
} from './interfaces/modal';
import { postData } from './services/axiosWrapper/apiService';
import { useAppDispatch, useAppSelector } from './redux/core/utils/reduxHook';
import { fetchKioskSettings } from './redux/features/kioskSettings/kioskSettingThunk';
import { AUTH_TOKEN_KEY } from './utils/constants';
import { kioskLoginEndpoint } from './utils/endpoints';
import OriflameLogo from './assets/images/Logo/oriflameLogo.svg';
import StartScreenBanner from './assets/images/Defaults/DefaultBackgroundImage.png';
import { getVideoFileNames } from './utils/expoApiUtils';
import { setVideoFileNames } from './redux/features/welcomeScreen/welcomeScreenSlice';
import OriflameLoader from './components/oriflameLoader/OriflameLoader';
import { resetReduxStore } from './redux/core/utils/resetReduxStore';
import { setActivePage } from './redux/features/pageNavigation/navigationSlice';
import LoggingService from './utils/loggingService';

function App(): JSX.Element {
  const theme = useTheme();
  const PERFORMANCE_LOGGING_INTERVAL = 30 * 60 * 1000; // 30 minutes
  const VIDEO_BASE_PATH = `${import.meta.env.VITE_NODE_SERVER_URL}/video`;
  const dispatch = useAppDispatch();
  const resetOnIdleTimerMs =
    useAppSelector((state) => state.kioskSettings.kioskSettings.resetOnIdleTimerMs) ?? 3000;
  // const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  const videoFilenames = useAppSelector((state) => state.welcomeScreen);
  const currentPage = useAppSelector((state) => state.navigation.currentPage);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const customerName = useAppSelector((state) => state.customerDetails.customerName);
  const customerId = useAppSelector((state) => state.customerDetails.customerId);
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
          alert('Invalid credentials');
        }
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
    async function getVideoFilenames(): Promise<void> {
      // setIsLoadingVideos(true);
      getVideoFileNames()
        .then((response) => {
          if (response.length !== 0) {
            dispatch(setVideoFileNames(response));
          }
        })
        .catch((err) => {
          console.error('Error fetching video filenames:', err);
        })
        .finally(() => {
          // setIsLoadingVideos(false);
        });
    }
    getVideoFilenames();
  }, []);

  // Simplified auth error handler
  useEffect(() => {
    const handleAuthError = (): void => {
      console.log('Auth error detected - token refresh failed completely');

      // Just update UI state since token refresh already failed in the interceptor
      dispatch(setActivePage(PageRoute.UnderMaintenancePage));
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
  }, [videoFilenames.length, currentVideoIndex, isVideoPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = `${VIDEO_BASE_PATH}/${videoFilenames[currentVideoIndex]}`;
      videoRef.current.play();
    }
  }, [currentVideoIndex, videoFilenames]);

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
          LoggingService.logPerformance(logPayload);

          console.log(logPayload);
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
          LoggingService.log({
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
            LoggingService.log({
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
  }, [currentPage, dispatch]);

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

  return (
    <>
      <OriflameLoader isLoading={loading} />
      {isVideoPlaying && videoFilenames.length !== 0 && (
        <video
          ref={videoRef}
          src={`${VIDEO_BASE_PATH}/${videoFilenames[currentVideoIndex]}`}
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
