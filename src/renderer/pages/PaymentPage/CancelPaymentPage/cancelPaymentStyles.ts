import { CSSPropertiesType } from '@/interfaces/modal';

export const CancelPaymentStyles = (): CSSPropertiesType => ({
  cancelPaymentHeader: {
    fontWeight: 'normal',
    lineHeight: '38.4px',
    fontSize: '32px',
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
    fontSize: '20px',
    fontWeight: 'normal',
    marginBottom: '6px'
  }
});
