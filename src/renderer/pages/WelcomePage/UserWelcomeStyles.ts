import { CSSPropertiesType } from '@/interfaces/modal';

export const UserWelcomeStyles = (): CSSPropertiesType => ({
  header: {
    fontSize: '2.5rem',
    lineHeight: '28.8px',
    fontWeight: 'normal'
  },
  userName: { fontWeight: 400, fontSize: '1.5rem', marginTop: '34px' },
  userID: { fontWeight: 400, fontSize: '1.5rem' }
});
