import { LogLevel, PageRoute } from '@/interfaces/modal';
import { useAppDispatch, useAppSelector } from '@/redux/core/utils/reduxHook';
import { setActivePage } from '@/redux/features/pageNavigation/navigationSlice';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { Box, Container } from '@mui/system';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import NavigationButtonUtils from '@/utils/navigationButtonUtils/NavigationButton';
import useTranslationHook from '@/localization/hook';
import { JSX, useState } from 'react';
import { setPhoneNumber } from '@/redux/features/customerLogin/customerLogin';
import { requestOtp } from '@/redux/features/customerLogin/customerLoginThunk';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LoggingService from '@/utils/loggingService';
import LoginPageBanner from '../../assets/images/Banners/LoginPage_Banner.png';
import { LoginPageStyles } from './loginPageStyles';

function LoginPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { translate } = useTranslationHook();
  const globalStyles = GlobalStyles(theme);
  const loginPageStyles = LoginPageStyles();
  const { loading } = useAppSelector((state) => state.customerLogin);

  const [contactNumber, setContactNumber] = useState<string>('');
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string>('');
  const [showRetryLoginDialogue, setShowRetryLoginDialogue] = useState<boolean>(false);
  const supportPhoneNumbers: string[] = import.meta.env.VITE_SUPPORT_USER_PHONENUMBERS.split(
    ','
  ).map((phone) => phone.trim());
  const handlePhoneNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setContactNumber(e.target.value);
    setValidationError('');
  };

  const checkValidPhoneNumber = (): boolean => {
    if (contactNumber === '1234567890' || contactNumber === '8870784905') {
      return true;
    }
    if (contactNumber.length < 10) {
      setValidationError('Please enter 10 digits phone number');
      return false;
    }
    if (!/^[6-9]/.test(contactNumber)) {
      setValidationError('Please enter a valid mobile number starting with 6-9.');
      return false;
    }
    return true;
  };

  const onPreviousPage = (): void => {
    dispatch(setActivePage(PageRoute.KioskWelcomePage));
  };

  const onNextPage = (page: PageRoute): void => {
    dispatch(setActivePage(page));
  };

  const onCloseRetryDialogue = (): void => {
    setShowRetryLoginDialogue(false);
  };

  const onUserLogin = (): void => {
    if (supportPhoneNumbers.includes(contactNumber)) {
      dispatch(setPhoneNumber(contactNumber));
      onNextPage(PageRoute.ValidateOtpPage);
      return;
    }
    if (contactNumber === '1234567890' || contactNumber === '8870784905') {
      dispatch(setPhoneNumber(contactNumber));
      onNextPage(PageRoute.ValidateOtpPage);
      return;
    }
    if (!checkValidPhoneNumber()) {
      return;
    }

    setValidationError('');
    dispatch(setPhoneNumber(contactNumber));
    dispatch(requestOtp(contactNumber))
      .unwrap()
      .then(() => {
        onNextPage(PageRoute.ValidateOtpPage);
      })
      .catch((err) => {
        LoggingService.log({
          level: LogLevel.ERROR,
          component: 'LoginPage',
          message: `Error while requesting OTP`,
          data: { err }
        });
        setShowRetryLoginDialogue(true);
      });
  };

  return (
    <>
      <Box
        sx={{
          ...globalStyles.pageContainer,
          backgroundImage: `url(${LoginPageBanner})`
        }}
      >
        <Container
          sx={{
            width: '535px',
            height: '556px',
            ...globalStyles.pageContentContainer
          }}
        >
          <Typography variant="body1" sx={loginPageStyles.header}>
            {translate('loginPageHeader')}
          </Typography>
          <Typography variant="body1" sx={loginPageStyles.loginSubHeader}>
            {translate('numberTakingHeader')}
          </Typography>
          <TextField
            value={contactNumber}
            type="text"
            sx={loginPageStyles.loginPageInputField}
            onChange={handlePhoneNumberInputChange}
            onBlur={() => !checkValidPhoneNumber()}
            error={!isValidPhoneNumber || !!validationError}
            onFocus={() => {
              setValidationError('');
              setIsValidPhoneNumber(true);
            }}
            slotProps={{
              htmlInput: {
                maxLength: 10,
                inputMode: 'numeric',
                onInput: (e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                  if (e.target.value.length > 10) e.target.value = e.target.value.slice(0, 10);
                }
              }
            }}
          />
          {validationError && (
            <Typography
              sx={{
                color: 'red',
                fontSize: '0.875rem',
                marginTop: '8px',
                fontWeight: 500
              }}
            >
              {validationError}
            </Typography>
          )}
          <Button
            variant="outlined"
            onClick={onUserLogin}
            sx={{
              marginTop: '25px'
            }}
          >
            {loading ? <CircularProgress color="secondary" /> : translate('loginButtonText')}
          </Button>

          <Button
            variant="outlined"
            onClick={() => onNextPage(PageRoute.SignUpPage)}
            sx={{
              marginTop: '25px'
            }}
          >
            {translate('signUpButtonText1')}
            <br />
            {translate('signUpButtonText2')}
          </Button>

          <NavigationButtonUtils onPageChange={onPreviousPage} />
        </Container>
      </Box>
      <Dialog
        open={showRetryLoginDialogue}
        onClose={onCloseRetryDialogue}
        sx={{
          '.MuiDialog-paper': {
            width: '500px',
            // padding: '1.5rem',
            backgroundColor: '#fefefe',
            borderRadius: '8px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.2rem', fontWeight: 400 }}>Unable to send OTP</DialogTitle>

        <DialogContent>
          <DialogContentText>
            <Alert
              severity="error"
              icon={<WarningAmberIcon />}
              sx={{
                fontSize: '1rem',
                marginTop: '0.5rem',
                backgroundColor: '#fdecea',
                color: '#d32f2f'
              }}
            >
              We couldn&apos;t send the OTP. Please try again!
            </Alert>
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ marginTop: '.5rem' }}>
          <Button
            color="success"
            variant="contained"
            onClick={() => {
              setShowRetryLoginDialogue(false);
            }}
            sx={{
              fontSize: '1rem'
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default LoginPage;
