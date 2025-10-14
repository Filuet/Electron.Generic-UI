import { CSSPropertiesType } from '@/interfaces/modal';

export const ProductCollectionStyles = (): CSSPropertiesType => ({
  helperText: {
    textAlign: 'center',
    marginTop: 2,
    fontSize: '1.2rem'
  },

  statusText: {
    fontWeight: 600,
    color: 'primary.main',
    marginBottom: 1
  },

  progressText: {
    color: 'text.secondary'
  }
});
