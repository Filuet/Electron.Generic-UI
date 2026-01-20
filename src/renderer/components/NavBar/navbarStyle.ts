import { CSSPropertiesType } from '@/interfaces/modal';
import { Theme } from '@mui/material';

export const NavBarStyles = (theme: Theme): CSSPropertiesType => ({
  navbarLogo: {
    marginLeft: '-0.6rem',
    width: '18%'
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
    width: '52%',
    // border: '1px solid red',
    textAlign: 'left',
    marginLeft: '15px'
  },
  iconContainer: {
    width: '30%',
    // border: '1px solid red',
    display: 'flex',
    justifyContent: 'end'
  }
});
