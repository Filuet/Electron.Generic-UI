import { PageRoute } from '@/interfaces/modal';
import { useAppDispatch } from '@/redux/core/utils/reduxHook';
import { setActivePage } from '@/redux/features/pageNavigation/navigationSlice';
import { Box, Container } from '@mui/system';
import { Button, Typography, useTheme } from '@mui/material';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import useTranslationHook from '@/localization/hook';
import OriflameLogo from '../../assets/images/Logo/Oriflame_logo_WelcomePage.png';
import { KioskWelcomeStyle } from './kioskWelcomeStyle';
import KioskWelcomePageBanner from '../../assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';

function KioskWelcomePage() {
  const theme = useTheme();
  const { translate } = useTranslationHook();
  const globalStyle = GlobalStyles(theme);
  const kioskWelcomeStyle = KioskWelcomeStyle(theme);
  const dispatch = useAppDispatch();
  const onNextPage = () => {
    dispatch(setActivePage(PageRoute.LoginPage));
  };

  return (
    <Box
      sx={{
        ...globalStyle.pageContainer,
        backgroundImage: `url(${KioskWelcomePageBanner})`
      }}
    >
      <Container sx={kioskWelcomeStyle.contentContainer}>
        <Box component="img" src={OriflameLogo} sx={kioskWelcomeStyle.logo} />
        <Typography variant="body1" sx={kioskWelcomeStyle.greetingsText}>
          {translate('kioskWelcomeHeader')}
        </Typography>
        <Button variant="outlined" onClick={onNextPage} sx={kioskWelcomeStyle.startButton}>
          {translate('start')}
        </Button>
      </Container>
    </Box>
  );
}

export default KioskWelcomePage;
