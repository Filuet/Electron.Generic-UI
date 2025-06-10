import { Theme } from '@mui/material';

type StylesType = {
  [key: string]: {
    [key: string]: string | number | object;
  };
};

export const ProductPageStyles = (theme: Theme): StylesType => ({
  productPageMainContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '45px'
  },
  categoryContainer: {
    width: '150px',
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
    width: '610px',
    height: '950px',
    overflowY: 'auto',
    // paddingTop: '10px',
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
    columnGap: 1,
    rowGap: 2,
    paddingLeft: '10px',
    marginTop: '5px'
  }
});
