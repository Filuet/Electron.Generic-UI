import { CSSPropertiesType } from '@/interfaces/modal';
import { Theme } from '@mui/material';

export const ProductCartStyles = (theme: Theme): CSSPropertiesType => ({
  cartHeaderContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '59px',
    padding: '0px 40px 0px 40px'
  },
  myBagText: {
    fontSize: '1.25rem',
    fontWeight: 400
  },

  cartProductContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    width: '193px',
    textAlign: 'left',
    marginLeft: '12px'
  },
  cartProductName: {
    fontWeight: 400,
    fontSize: '0.9375rem',
    lineHeight: '18.3px',
    // letterSpacing: '1px',
    whiteSpace: 'normal',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  productStackInformation: { fontSize: '0.6875rem', fontWeight: 400 },
  MRPStyles: {
    fontSize: '0.625rem',
    fontWeight: 400
  },
  priceHelperText: {
    fontWeight: 400,
    lineHeight: '8.4px',
    fontSize: '0.59375rem'
  },
  quantityControllerContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  removeIcon: {
    width: '20px',
    height: '20px',
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
    borderRadius: '50%'
  },
  productCountStyle: {
    width: '31px',
    height: '31px',
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    borderRadius: '50%',
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    fontFamily: 'SansOri,sans-serif'
  },
  addIcon: {
    width: '20px',
    height: '20px',
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
    borderRadius: '50%'
  },
  priceDetailsContainer: {
    width: '230px',
    height: '110px',
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '5px',
    paddingLeft: '10px',
    paddingTop: '10px',
    textAlign: 'left'
  },
  priceDetailsText: {
    fontSize: '1.125rem',
    fontWeight: 700,
    textDecoration: 'underline'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white'
  }
});
