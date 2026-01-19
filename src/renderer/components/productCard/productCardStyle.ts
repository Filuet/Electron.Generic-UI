import { CSS_MUI_PropertiesType } from '@/interfaces/modal';
import { Theme } from '@mui/material';

export const ProductCardStyles = (theme: Theme): CSS_MUI_PropertiesType => ({
  cardStyle: {
    width: '10.9rem',
    height: '21.3rem',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 2
  },
  productTagImageStyle: {
    position: 'absolute',
    top: '4px',
    left: '6px',
    borderRadius: '3px'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.5rem',
    paddingTop: '0.3rem',
    height: '100%',
    boxSizing: 'border-box',
    alignItems: 'center',
    backgroundColor: theme.palette.common.white
  },
  productName: {
    fontSize: '15px',
    lineHeight: '18px',
    textAlign: 'left',
    padding: 0,
    whiteSpace: 'normal',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    minHeight: '54px'
  },
  cardInfoContainer: {
    width: '100%',
    textAlign: 'left',
    minHeight: '125px'
  },
  stackInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '26px'
  },
  cardSku: {
    fontWeight: '500',
    fontSize: '9px',
    lineHeight: '8.4px',
    width: '32px'
  },
  bonusPoint: {
    fontWeight: '500',
    fontSize: '10px',
    lineHeight: '8.4px',
    width: '74px'
  },
  fillSize: {
    fontWeight: '500',
    fontSize: '10px',
    lineHeight: '8.4px',
    width: '40px'
  },
  productPrice: {
    textDecoration: 'line-through',
    fontSize: '11px'
  },
  quantityContainer: {
    width: '25.32px',
    height: '25.32px',
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
    borderRadius: '2rem',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    fontWeight: 400,
    fontSize: '16px',
    fontFamily: 'SansOri,sans-serif'
  },
  quantityControllerIcon: {
    width: '1.1rem',
    height: '1.1rem',
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
    borderRadius: '50%'
  },
  addToCartButton: {
    width: '5.1rem',
    height: '1.5rem',
    borderRadius: '4rem',
    fontWeight: 400,
    letterSpacing: '0.5px',
    fontSize: '9px',
    lineHeight: '8.4px',
    padding: 0,
    boxShadow: 'none',
    marginTop: '5px'
  },
  originalPrice: {
    fontSize: '13px',
    lineHeight: '13.2px',
    fontWeight: 'bold'
  },
  iconContainer: {
    width: '110px',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  descriptionTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '20px'
  },
  descriptionScroll: {
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '8px',
    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.grey[600],
      borderRadius: '4px'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: theme.palette.grey[800]
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.grey[400]
    }
  },
  descriptionDialogue: {
    '.MuiDialog-paper': {
      bottom: '4.3%',
      minWidth: '680px',
      minHeight: '700px',
      padding: '0px 3px 14px 14px',
      maxHeight: '800px',
      maxWidth: '710px',
      overflow: 'hidden'
    },
    '.MuiDialog-paper::-webkit-scrollbar': {
      width: '8px'
    },
    '.MuiDialog-paper::-webkit-scrollbar-thumb': {
      borderRadius: '4px'
    },
    '.MuiDialog-paper::-webkit-scrollbar-thumb:hover': {},
    '.MuiDialog-paper::-webkit-scrollbar-track': {
      borderRadius: '4px'
    },
    '.MuiDialog-paper::-webkit-scrollbar-corner': {}
  },
  dialogIconContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end'
  },

  DescriptionProductName: {
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '14.4px',
    paddingRight: '15px'
  },
  inClusiveTax: {
    lineHeight: '10px',
    fontSize: '8px',
    marginTop: '11px',
    marginBottom: '13px'
  },

  descriptionText: {
    fontWeight: 700,
    fontSize: '18px',
    position: 'relative',
    display: 'inline-block',
    marginTop: '2.9rem',
    paddingBottom: '5px',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '97%',
      height: '1px',
      background: `linear-gradient(to right, ${theme.palette.divider} 24%, ${theme.palette.text.disabled} 20%)`
    }
  }
});
