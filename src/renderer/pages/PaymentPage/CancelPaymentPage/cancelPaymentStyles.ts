import { CSSPropertiesType } from '@/interfaces/modal';

export const CancelPaymentStyles = (): CSSPropertiesType => ({
  cancelPaymentHeader: {
    fontWeight: 400,
    lineHeight: '38.4px',
    fontSize: '2rem',
    width: '329px'
  },
  paymentInformationContainer: {
    width: '331px',
    marginTop: '45px',
    display: 'flex',
    textAlign: 'left',
    justifyContent: 'space-between'
  },
  informationText: {
    fontSize: '1.25rem',
    fontWeight: 400,
    marginBottom: '6px'
  }
});
