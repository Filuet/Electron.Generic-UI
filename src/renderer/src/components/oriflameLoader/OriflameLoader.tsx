import { Backdrop, Typography, useTheme, Box, CircularProgress } from '@mui/material';
import { OriflameLoaderProp } from '@/interfaces/props';

import OriflameLogo from '../../assets/images/Logo/oriflameLogo.svg';

function OriflameLoader(props: OriflameLoaderProp) {
  const { isLoading, message } = props;
  const theme = useTheme();

  const backdropColor =
    theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';

  return (
    <Backdrop
      sx={{
        color: theme.palette.primary.contrastText,
        zIndex: theme.zIndex.drawer + 1,
        backdropFilter: 'blur(8px)',
        background: backdropColor
      }}
      open={isLoading}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <Box
          component="img"
          src={OriflameLogo}
          alt="Oriflame Logo"
          sx={{
            width: 250,
            marginBottom: '2rem',
            opacity: 0.9
          }}
        />

        <CircularProgress />

        <Typography
          variant="h6"
          sx={{
            fontSize: '1.2rem',
            color: theme.palette.primary.main,
            fontWeight: 500,
            marginTop: '2rem'
          }}
        >
          {message || 'Loading... Please wait.'}
        </Typography>
      </Box>
    </Backdrop>
  );
}

export default OriflameLoader;
