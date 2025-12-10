import { CSSPropertiesType } from '@/interfaces/modal';

export const HomePageStyles = (): CSSPropertiesType => ({
  homePageMainContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px',
    padding: '0rem 0.78rem 0rem 0.78rem'
  },
  searchContainer: {
    width: '324px',
    height: '40px'
  },

  bannerImage: {
    width: '683px',
    margin: 'auto',
    marginTop: '33px',
    borderRadius: '10px'
  }
});
