import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import LogoutIcon from '@mui/icons-material/Logout';
import { JSX, useState } from 'react';
import { Stack } from '@mui/system';
import useTranslationHook from '@/localization/hook';
import { Button, Modal, Typography, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/redux/core/utils/reduxHook';
import { LogLevel, PageRoute } from '@/interfaces/modal';
import { setActivePage } from '@/redux/features/pageNavigation/navigationSlice';
import { resetReduxStore } from '@/redux/core/utils/resetReduxStore';
import loggingService from '@/utils/loggingService';
import OriflameLogo from '../../assets/images/Logo/oriflameLogo.svg';
import { NavBarStyles } from './navbarStyle';
import { LocalStorageWrapper } from '@/utils/localStorageWrapper';
import { SESSION_ID } from '@/utils/constants';

function Navbar(): JSX.Element {
  const { translate } = useTranslationHook();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const customerName = useAppSelector((state) => state.customerDetails.customerName);
  const customerId = useAppSelector((state) => state.customerDetails.customerId);
  const navbarStyle = NavBarStyles(theme);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const onLogout = (): void => {
    loggingService.log({
      message: 'User logged out, Customer session ended by user',
      level: LogLevel.INFO,
      data: {
        customerId,
        customerName
      },
      component: 'Navbar.tsx'
    });
    LocalStorageWrapper.removeItem(SESSION_ID);
    resetReduxStore();
    dispatch(setActivePage(PageRoute.KioskWelcomePage));
  };

  return (
    <>
      <AppBar sx={navbarStyle.appBarStyle} position="static">
        <Toolbar >
          <Box component="img" alt="Oriflame" src={OriflameLogo} sx={navbarStyle.navbarLogo} />
          <Box sx={navbarStyle.textContainerStyle}>
            <Typography variant="body1" sx={{ fontSize: '1.9rem' }}>
              {translate('greetings')} {customerName}
            </Typography>
          </Box>
          <Box sx={navbarStyle.iconContainer}>
            {/* <Stack
              direction="row"
              mr={1}
              alignItems="center"
              sx={{ cursor: 'pointer' }}
            >
              <IconButton>
                <InfoOutlinedIcon sx={navbarStyle.navIcon} />
              </IconButton>
              <Typography variant="body2">{translate('help')}</Typography>
            </Stack> */}

            <Stack
              direction="row"
              alignItems="center"
              sx={{ cursor: 'pointer' }}
              onClick={() => setShowLogoutModal(true)}
            >
              <IconButton>
                <LogoutIcon sx={navbarStyle.navIcon} />
              </IconButton>
              <Typography variant="body2" sx={{ fontSize: '1.9rem' }}>
                {translate('logout')}
              </Typography>
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>
      <Modal open={showLogoutModal}>
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
          <Box
            component="img"
            src={OriflameLogo}
            sx={{ width: '250px', marginBottom: '30px', padding: 0 }}
          />

          <Typography
            variant="body1"
            sx={{
              fontSize: '1.375rem'
            }}
          >
            Are you sure, you want to logout?
          </Typography>

          <Box
            sx={{
              margin: 'auto',
              width: '100%',
              marginTop: '40px',
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem'
            }}
          >
            <Button
              variant="contained"
              sx={{
                width: '6.2rem',
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.secondary.main,
                fontSize: '1.06rem'
              }}
              onClick={onLogout}
            >
              Logout
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowLogoutModal(false)}
              sx={{
                width: '6.2rem',
                fontSize: '1.06rem'
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default Navbar;
