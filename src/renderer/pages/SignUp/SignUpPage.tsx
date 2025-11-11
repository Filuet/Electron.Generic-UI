import { JSX } from 'react';
import { PageRoute } from '@/interfaces/modal';
import { useAppDispatch } from '@/redux/core/utils/reduxHook';
import { setActivePage } from '@/redux/features/pageNavigation/navigationSlice';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import NavigationButtonUtils from '@/utils/navigationButtonUtils/NavigationButton';
import SignUpPageBanner from '@/assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';
import OriflameRegistrationQRCode from '@/assets/images/OriflameRegistrationQRCode.png';
import { Typography, useTheme } from '@mui/material';
import useTranslationHook from '@/localization/hook';
import { Box, Container } from '@mui/system';
import { SignUpPageStyles } from './signUpStyles';

function SignUpPage(): JSX.Element {
  const theme = useTheme();
  const { translate } = useTranslationHook();
  const globalStyles = GlobalStyles(theme);
  const signUpStyles = SignUpPageStyles();
  const dispatch = useAppDispatch();

  const onPreviousPage = (): void => {
    dispatch(setActivePage(PageRoute.LoginPage));
  };
  return (
    <Box
      sx={{
        backgroundImage: `url(${SignUpPageBanner})`,
        ...globalStyles.pageContainer
      }}
    >
      <Container
        sx={{
          width: '535px',
          height: '589px',
          ...globalStyles.pageContentContainer
        }}
      >
        <Typography variant="body1" sx={signUpStyles.header}>
          Welcome!
        </Typography>
        <Typography variant="body1" sx={signUpStyles.helperText}>
          {translate('signUpWelcomeMessage')}
        </Typography>
        <Box
          component="img"
          src={OriflameRegistrationQRCode}
          sx={{ marginTop: '40px', width: '141px' }}
        />
        <NavigationButtonUtils onPageChange={onPreviousPage} />
      </Container>
    </Box>
  );
}
export default SignUpPage;
