import { CSS_MUI_PropertiesType } from '@/interfaces/modal';
import { Theme } from '@mui/material';

export const NavigationButtonStyles = (theme: Theme): CSS_MUI_PropertiesType => ({
  stackStyle: {
    marginTop: '34px',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  arrowBackIcon: {
    fontSize: '1.625rem',
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
    borderRadius: '50%',
    padding: '2px'
  },
  textStyle: { fontSize: '1.25rem', fontWeight: 400 }
});
