import { JSX } from 'react';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import { Typography, useTheme } from '@mui/material';
import { Box, Container } from '@mui/system';
import BackgroundBanner from '../../assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';
import OriflameLogo from '../../assets/images/Logo/Oriflame_logo_WelcomePage.png';
import MaintenanceImg from '../../assets/images/Ilustrations/App development-amico (1).png';

function SupportContact(): JSX.Element {
  const theme = useTheme();
  const globalStyles = GlobalStyles(theme);

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
          height: '540px',
          ...globalStyles.pageContentContainer
        }}
      >
        <Box component="img" src={OriflameLogo} sx={{ width: '262px' }} />
        <Typography
          variant="body1"
          sx={{ fontWeight: 400, fontSize: '26px', lineHeight: '28.8px' }}
        >
          We&apos;ve encountered an issue. Please reach out to our support team for assistance.
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
export default SupportContact;
