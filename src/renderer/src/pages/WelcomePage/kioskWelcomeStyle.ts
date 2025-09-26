import { CSSPropertiesType } from '@/interfaces/modal';
import { Theme } from '@mui/material';

export const KioskWelcomeStyle = (theme: Theme): CSSPropertiesType => ({
  logo: { width: '349px' },
  greetingsText: {
    margin: 'auto',
    width: '301px',
    fontSize: '24px',
    lineHeight: '28.8px',
    fontWeight: 'normal'
  },
  startButton: {
    marginTop: '54px'
  },
  contentContainer: {
    width: '535px',
    height: '509px',
    backgroundColor: theme.palette.secondary.main,
    marginTop: '78px',
    borderRadius: '10px'
  }
});
