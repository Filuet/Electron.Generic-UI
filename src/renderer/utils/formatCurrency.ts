import { Currency } from '@/interfaces/modal';

function formatCurrency(amount: number, format: Currency): string {
  const strNumber = String(amount);
  const [integerPart, decimalPart] = strNumber.split('.');

  const formattedDecimalPart = decimalPart ? decimalPart.slice(0, 3) : '';

  let formattedIntegerPart = '';
  const formatGroups = format.currencyFormat.split(',');
  const groupSize = formatGroups[0].length;

  const integerPartsArray: string[] = [];
  let tempInteger = integerPart;
  while (tempInteger.length > 0) {
    integerPartsArray.unshift(tempInteger.slice(-groupSize));
    tempInteger = tempInteger.slice(0, tempInteger.length - groupSize);
  }

  formattedIntegerPart = integerPartsArray.join(format.formatSplitter);

  let finalAmount = formattedIntegerPart;
  if (formattedDecimalPart) {
    finalAmount += `${format.decimalSplitter}${formattedDecimalPart}`;
  }

  let currencyString = '';
  switch (format.currencySymbolPosition) {
    case 0:
      currencyString = `${format.symbol}${finalAmount}`;
      break;
    case 1:
      currencyString = `${finalAmount}${format.symbol}`;
      break;
    case 2:
      currencyString = `${format.symbol} ${finalAmount}`;
      break;
    case 3:
      currencyString = `${finalAmount} ${format.symbol}`;
      break;
    default:
      currencyString = `${finalAmount}`;
      break;
  }

  return currencyString;
}

export default formatCurrency;
