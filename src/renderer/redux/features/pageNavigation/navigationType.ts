import { PageRoute } from '@/interfaces/modal';

export interface PageState {
  currentPage: PageRoute;
  isCartOpen: boolean;
}
export const NavigationRoute = PageRoute;
