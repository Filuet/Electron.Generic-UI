import { CSS_MUI_PropertiesType } from '@/interfaces/modal';
import { Theme } from '@mui/material/styles';

export const supportStyles = (theme: Theme): CSS_MUI_PropertiesType => ({
  dialogPaper: {
    '.MuiDialog-paper': {
      bottom: '4.3%',
      minWidth: '600px',
      minHeight: '370px',
      padding: '0px 3px 14px 14px',
      overflow: 'hidden'
    }
  },
  unlockButtons: {
    marginTop: '34px',
    width: '200px',
    height: '64px',
    borderRadius: '10px'
  },
  unlockButtonBox: {
    display: 'flex',
    flex: 'row',
    gap: '3rem'
  },
  supportBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    borderRadius: 2,
    backgroundColor: theme.palette.background.paper,
    padding: '30px 60px 30px 60px',
    boxShadow: 'none'
  },
  closeButton: {
    marginTop: '3rem',
    width: '5rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.secondary.main
  },
  logo: {
    width: '250px',
    marginBottom: '30px'
  }
});
