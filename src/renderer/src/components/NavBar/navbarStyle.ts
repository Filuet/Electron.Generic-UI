import { Theme } from '@mui/material';

export const NavBarStyles = (theme: Theme) => ({
  navbarLogo: {
    width: '8.625rem',
    // height: '2.188rem',
    marginLeft: '-0.6rem'
  },
  appBarStyle: {
    width: '100%',
    borderBottom: `0.2rem solid ${theme.palette.divider}`,
    padding: '0'
  },

  navIcon: {
    fontSize: '1.4rem',
    backgroundColor: theme.palette.common.white
  },
  textContainerStyle: {
    width: '450px',
    textAlign: 'left',
    marginLeft: '15px'
  },
  iconContainer: {
    width: '22%',
    display: 'flex',
    justifyContent: 'end'
  }
});
