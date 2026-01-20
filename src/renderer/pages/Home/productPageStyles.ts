import { CSS_MUI_PropertiesType } from '@/interfaces/modal';
import { Theme } from '@mui/material';

export const ProductPageStyles = (theme: Theme): CSS_MUI_PropertiesType => ({
  productPageMainContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '45px'
  },
  categoryContainer: {
    width: '15vw',
    height: '960px',
    borderRight: `1px solid ${theme.palette.primary.main}`,
    paddingRight: '10px'
  },

  categoryBannerImage: {
    width: '119px',
    height: '337px',
    borderRadius: '10px',
    marginTop: '40px'
  },
  productContainer: {
    margin: 'auto',
    overflowY: 'auto',
    width: '85vw',
    height: '83.5vh',
    paddingBottom: '1rem',
    '::-webkit-scrollbar': {
      width: '12px',
      height: '12px'
    },
    '::-webkit-scrollbar-track': {
      borderRadius: '10px'
    },
    '::-webkit-scrollbar-thumb': {
      width: '10px',
      height: '20px',
      borderRadius: '10px'
    },
    '::-webkit-scrollbar-button': {
      height: '20px',
      width: '20px'
    },
    '::-webkit-scrollbar-button:single-button': {
      display: 'none'
    }
  },
  productCardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    columnGap: '1.5rem',
    rowGap: '1.5rem',
    padding: '0px 0.3rem 0.7rem 0.9rem',
    marginTop: '5px'
  }
});
