import { JSX } from 'react';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import { Typography, useTheme } from '@mui/material';
import { Box, Container } from '@mui/system';
import { useKioskReset } from '@/hooks/useKioskReset';
import BackgroundBanner from '../../assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';
import OriflameLogo from '../../assets/images/Logo/Oriflame_logo_WelcomePage.png';
import MaintenanceImg from '../../assets/images/Ilustrations/App development-amico (1).png';

function UnderMaintenance(): JSX.Element {
  const theme = useTheme();
  const globalStyles = GlobalStyles(theme);

  // Add the reset hook
  useKioskReset();

  return (
    <Box
      sx={{
        backgroundImage: `url(${BackgroundBanner})`,
        ...globalStyles.pageContainer
      }}
    >
      <Container
        sx={{
          width: '535px',
          height: '529px',
          ...globalStyles.pageContentContainer
        }}
      >
        <Box component="img" src={OriflameLogo} sx={{ width: '262px' }} />
        <Typography
          variant="body1"
          sx={{ fontWeight: 'normal', fontSize: '26px', lineHeight: '28.8px' }}
        >
          Currently, We are under Maintenance
        </Typography>
        <Box
          component="img"
          src={MaintenanceImg}
          sx={{
            width: '300px',
            marginTop: '40px'
          }}
        />
      </Container>
    </Box>
  );
}
export default UnderMaintenance;
