import { JSX } from 'react';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import { Typography, useTheme } from '@mui/material';
import { Box, Container } from '@mui/system';
import useTranslationHook from '@/localization/hook';
import { LogLevel, PageRoute } from '@/interfaces/modal';
import { useAppDispatch, useAppSelector } from '@/redux/core/utils/reduxHook';
import { setActivePage } from '@/redux/features/pageNavigation/navigationSlice';
import { resetReduxStore } from '@/redux/core/utils/resetReduxStore';
import loggingService from '@/utils/loggingService';
import { ThankYouPageStyles } from './thankYouPageStyles';
import PaymentPageBanner from '../../assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';
import OriflameLogo from '../../assets/images/Logo/Oriflame_logo_WelcomePage.png';

function ThankyouPage(): JSX.Element {
  const theme = useTheme();
  const globalStyles = GlobalStyles(theme);
  const thankyouPageStyles = ThankYouPageStyles();
  const { translate } = useTranslationHook();
  const dispatch = useAppDispatch();
  const customerName = useAppSelector((state) => state.customerDetails.customerName);
  const customerId = useAppSelector((state) => state.customerDetails.customerId);
  setTimeout(() => {
    loggingService.log({
      message: 'User logged out',
      level: LogLevel.INFO,
      data: {
        customerId,
        customerName
      },
      component: 'ThankYouPage.tsx'
    });

    dispatch(setActivePage(PageRoute.KioskWelcomePage));
    resetReduxStore();
  }, 5000);

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
          height: '347px',
          ...globalStyles.pageContentContainer
        }}
      >
        <Box component="img" src={OriflameLogo} sx={{ width: '262px' }} />
        <Typography variant="body1" sx={thankyouPageStyles.thankYouMessageStyles}>
          {translate('thankYouMessage')}
        </Typography>
      </Container>
    </Box>
  );
}
export default ThankyouPage;
