export const LoginPageStyles = () => ({
  header: { fontSize: '40px', lineHeight: '48px', marginTop: '32px' },
  loginSubHeader: {
    fontSize: '26px',
    lineHeight: '30px',
    fontWeight: 'normal',
    marginTop: '29px',
    width: '420px'
  },
  loginPageInputField: {
    marginTop: '41px',
    width: '358px',
    height: '40px',
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    }
  }
});
