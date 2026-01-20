import { CSS_MUI_PropertiesType } from '@/interfaces/modal';
import { Theme } from '@mui/material';

export const ProductCardStyles = (theme: Theme): CSS_MUI_PropertiesType => ({
  cardStyle: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 2,
    height: '20vh'
  },
  productTagImageStyle: {
    position: 'absolute',
    top: '4px',
    left: '6px',
    borderRadius: '3px'
  },
  cardContent: {
    // border: '1px solid red',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.5rem',
    paddingTop: '0.3rem',
    height: '50%',
    boxSizing: 'border-box',
    alignItems: 'center',
    backgroundColor: theme.palette.common.white
  },
  productName: {
    fontSize: '1.3rem',
    lineHeight: '1.3rem',
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
    fontSize: '1rem',
    lineHeight: '8.4px'
    // width: 'px'
  },
  bonusPoint: {
    fontWeight: '500',
    fontSize: '1rem',
    lineHeight: '8.4px'
    // width: '74px'
  },
  fillSize: {
    fontWeight: '500',
    fontSize: '1rem',
    lineHeight: '8.4px'
    // width: '40px'
  },

  quantityContainer: {
    width: '2.3rem',
    height: '2.3rem',
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
    borderRadius: '2rem',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    fontWeight: 400,
    fontSize: '1.3rem',
    fontFamily: 'SansOri,sans-serif'
  },
  quantityControllerIcon: {
    width: '1.7rem',
    height: '1.7rem',
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
    borderRadius: '50%'
  },
  addToCartButton: {
    width: '7rem',
    height: '2rem',
    borderRadius: '4rem',
    fontWeight: 400,
    letterSpacing: '0.5px',
    fontSize: '0.8rem',
    lineHeight: '8.4px',
    padding: 0,
    boxShadow: 'none',
    marginTop: '0.9rem'
  },
  originalPrice: {
    fontSize: '1rem',
    lineHeight: '13.2px',
    fontWeight: 'bold'
  },
  iconContainer: {
    width: '60%',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: '1.5rem'
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
    fontSize: '0.75rem',
    lineHeight: '14.4px',
    paddingRight: '15px'
  },
  inClusiveTax: {
    lineHeight: '10px',
    fontSize: '0.5rem',
    marginTop: '11px',
    marginBottom: '13px'
  },

  descriptionText: {
    fontWeight: 700,
    fontSize: '1.7rem',
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
