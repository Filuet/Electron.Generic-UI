import { ApiError, CustomerDetails, LogLevel, PageRoute } from '@/interfaces/modal';
import { useAppDispatch, useAppSelector } from '@/redux/core/utils/reduxHook';
import { setActivePage } from '@/redux/features/pageNavigation/navigationSlice';
import { Button, Typography, useTheme } from '@mui/material';
import { Box, Container, Stack } from '@mui/system';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import useTranslationHook from '@/localization/hook';
import NavigationButtonUtils from '@/utils/navigationButtonUtils/NavigationButton';
import { setClientType } from '@/redux/features/customerLogin/customerLogin';
import { ClientType } from '@/redux/features/customerLogin/types';
import { useEffect, useState } from 'react';
import { fetchCustomerOrderDetails } from '@/redux/features/customerDetails/customerApiThunks';
import OriflameLoader from '@/components/oriflameLoader/OriflameLoader';
import { oriflameUserDetailsEndpoint } from '@/utils/endpoints';
import { AxiosError } from 'axios';
import { getData } from '@/services/axiosWrapper/apiService';
import { setCustomerDetails } from '@/redux/features/customerDetails/customerDetailsSlice';
import LoggingService from '@/utils/loggingService';
import UserWelcomeBanner from '../../assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';
import OriflameLogo from '../../assets/images/Logo/Oriflame_logo_WelcomePage.png';
import { UserWelcomeStyles } from './UserWelcomeStyles';

function UserWelcomePage() {
  const theme = useTheme();
  const globalStyles = GlobalStyles(theme);
  const userWelcomeStyles = UserWelcomeStyles();
  const { translate } = useTranslationHook();
  const dispatch = useAppDispatch();
  const [isCustomerDetailsLoading, setIsCustomerDetailsLoading] = useState<boolean>(true);
  const [isApiFailed, setIsApiFailed] = useState<boolean>(false);
  const [isCustomerNotFound, setIsCustomerNotFound] = useState<boolean>(false);
  const [isMultipleUserFound, setIsMultipleUserFound] = useState<boolean>(false);

  const onNextPage = () => {
    dispatch(setActivePage(PageRoute.HomePage));
  };
  const onLoginPage = () => {
    dispatch(setActivePage(PageRoute.LoginPage));
  };
  const onRegisterPage = () => {
    dispatch(setActivePage(PageRoute.SignUpPage));
  };
  const phoneNumber = useAppSelector((state) => state.customerLogin.phoneNumber);
  const customerDetails = useAppSelector((state) => state.customerDetails);
  const loadingCustomerOrders = useAppSelector(
    (state) => state.customerOrderDetails.loadingCustomerOrders
  );
  const onFetchingCustomerDetails = async () => {
    setIsCustomerDetailsLoading(true);
    await getData<CustomerDetails>(`${oriflameUserDetailsEndpoint}/${phoneNumber}`)
      .then((response) => {
        dispatch(setCustomerDetails(response));
        LoggingService.log({
          level: LogLevel.INFO,
          component: 'UserWelcome',
          message: `Customer Logged In`,
          data: { response }
        });
        dispatch(fetchCustomerOrderDetails(response.customerId))
          .unwrap()
          .then(() => {
            if (response.isVIP) {
              dispatch(setClientType(ClientType.VIPCustomer));
            } else {
              dispatch(setClientType(ClientType.BrandPartner));
            }
          });
      })
      .catch((error: AxiosError) => {
        const res: ApiError = error.response?.data as ApiError;
        console.log(`res:${res}`);
        //   console.log(`desc${error.response?.description}`);
        console.log(`data${error.response?.data}`);

        if (res?.description && res.description.includes('Customer for telephone')) {
          setIsCustomerNotFound(true);
          LoggingService.log({
            level: LogLevel.ERROR,
            component: 'UserWelcome',
            message: `Customer not found. Customer needs to Sign In`,
            data: { phoneNumber, error }
          });
        } else if (res?.description && res.description.includes('Multiple customers found')) {
          setIsMultipleUserFound(true);
          LoggingService.log({
            level: LogLevel.ERROR,
            component: 'UserWelcome',
            message: `Multiple customers found for the phone number`,
            data: { phoneNumber, error }
          });
        } else {
          LoggingService.log({
            level: LogLevel.ERROR,
            component: 'UserWelcome',
            message: `Customer details API failed`,
            data: { phoneNumber, error }
          });
          setIsApiFailed(true);
        }
      })
      .finally(() => {
        setIsCustomerDetailsLoading(false);
      });
  };

  useEffect(() => {
    onFetchingCustomerDetails();
  }, []);
  const onPreviousPage = () => {
    dispatch(setActivePage(PageRoute.LoginPage));
  };

  return (
    <>
      <OriflameLoader
        isLoading={isCustomerDetailsLoading || loadingCustomerOrders}
        message="Please wait while we are fetching your details "
      />
      <Box
        sx={{
          backgroundImage: `url(${UserWelcomeBanner})`,
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

          {isCustomerNotFound && (
            <>
              <Typography
                variant="body1"
                sx={{ fontSize: '30px', width: '400px', marginTop: '10px' }}
              >
                Phone number {phoneNumber} not registered with Oriflame
              </Typography>
              <Button
                variant="outlined"
                onClick={onRegisterPage}
                sx={{
                  marginTop: '50px',
                  marginBottom: '20px'
                }}
              >
                Register Now
              </Button>
              <NavigationButtonUtils onPageChange={onLoginPage} />
            </>
          )}
          {isMultipleUserFound && (
            <>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '30px',
                  width: '400px',
                  marginTop: '10px',
                  marginBottom: '20px'
                }}
              >
                Multiple users are registered with this number: {phoneNumber}. Kindly contact
                Oriflame Support Team for assistance.
              </Typography>

              <NavigationButtonUtils onPageChange={onLoginPage} />
            </>
          )}

          {isApiFailed && !customerDetails?.customerId && (
            <>
              <Typography variant="body1" sx={{ fontSize: '35px', width: '400px' }}>
                Unable to fetch your details from Oriflame. Please try again!
              </Typography>
              <Button
                variant="outlined"
                onClick={onFetchingCustomerDetails}
                sx={{
                  marginTop: '54px'
                }}
              >
                Try again
              </Button>
              <NavigationButtonUtils onPageChange={onPreviousPage} />
            </>
          )}

          {customerDetails.customerId && !isCustomerNotFound && !isMultipleUserFound && (
            <>
              <Typography variant="body1" sx={userWelcomeStyles.header}>
                {translate('userGreet')}
              </Typography>
              <Stack>
                <Typography variant="body1" sx={userWelcomeStyles.userName}>
                  Welcome {customerDetails.customerName}.
                </Typography>
                <Typography variant="body1" sx={userWelcomeStyles.userID}>
                  You are a privileged {customerDetails.isVIP ? 'VIP customer' : 'Brand Partner'}
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                onClick={onNextPage}
                sx={{
                  marginTop: '54px'
                }}
              >
                {translate('next')}
              </Button>
              <NavigationButtonUtils onPageChange={onLoginPage} />
            </>
          )}
        </Container>
      </Box>
    </>
  );
}

export default UserWelcomePage;
