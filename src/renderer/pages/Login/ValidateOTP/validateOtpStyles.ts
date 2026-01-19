import { CSS_MUI_PropertiesType } from '@/interfaces/modal';

export const ValidateOtpStyles = (): CSS_MUI_PropertiesType => ({
  header: { fontSize: '40px', lineHeight: '48px', marginTop: '32px' },
  helperText: {
    width: '379px',
    fontSize: '24px',
    lineHeight: '28.8px',
    fontWeight: 400,
    marginTop: '29px'
  },
  tryAgainText: { fontSize: '16px', fontWeight: 'normal' },
  inputField: {
    marginTop: '40px',
    width: '358px',
    height: '40px',

    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    }
  },
  enterButton: {
    marginTop: '34px',
    width: '272px',
    height: '64px',
    borderRadius: '50px'
  }
});
