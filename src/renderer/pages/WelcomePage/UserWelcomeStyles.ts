import { CSSPropertiesType } from '@/interfaces/modal';

export const UserWelcomeStyles = (): CSSPropertiesType => ({
  header: {
    fontSize: '40px',
    lineHeight: '28.8px',
    fontWeight: 'normal'
  },
  userName: { fontWeight: 400, fontSize: '24px', marginTop: '34px' },
  userID: { fontWeight: 400, fontSize: '24px' }
});
