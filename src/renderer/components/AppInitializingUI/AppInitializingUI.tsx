import { useState, useEffect, JSX } from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { ExpoStatuses } from '../../../shared/sharedTypes';

const AppInitializingUI = (): JSX.Element | null => {
  const theme = useTheme();
  const [status, setStatus] = useState<ExpoStatuses>('loading');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const unsubscribe = window.electron.expoStatus.onExpoRunningStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        transition: 'opacity 0.3s ease'
      }}
    >
      {status === 'loading' && (
        <>
          <CircularProgress
            size={80}
            thickness={5}
            sx={{
              color: theme.palette.primary.main
            }}
          />

          <Typography
            variant="h3"
            sx={{
              mt: 2,
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            Initializing System{dots}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              textAlign: 'center',
              maxWidth: '70%'
            }}
          >
            Please wait while we connect to hardware services.
          </Typography>
        </>
      )}

      {status === 'error' && (
        <>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: theme.palette.error.main,
              textAlign: 'center'
            }}
          >
            Initialization Failed
          </Typography>

          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              maxWidth: '70%'
            }}
          >
            A critical system component failed to start.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              textAlign: 'center'
            }}
          >
            Please restart the machine or contact support.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default AppInitializingUI;
