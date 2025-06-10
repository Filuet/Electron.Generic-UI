import { Theme } from '@mui/material';

export const GlobalStyles = (theme: Theme) => ({
  pageContainer: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  pageContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '78px',
    borderRadius: '10px',
    backgroundColor: theme.palette.secondary.main
  }
});
