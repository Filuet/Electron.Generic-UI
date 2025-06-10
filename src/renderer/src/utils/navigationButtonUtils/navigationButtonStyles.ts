import { Theme } from '@mui/material';

export const NavigationButtonStyles = (theme: Theme) => ({
  stackStyle: {
    marginTop: '34px',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  arrowBackIcon: {
    fontSize: '26px',
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
    borderRadius: '50%',
    padding: '2px'
  },
  textStyle: { fontSize: '20px', fontWeight: 'normal' }
});
