import { resetCart } from '@/redux/features/cart/cartSlice';
import { resetCustomerDetails } from '@/redux/features/customerDetails/customerDetailsSlice';
import { resetCustomerOrderDetails } from '@/redux/features/customerDetails/customerOrderDetailsSlice';
import { resetNavigationStore } from '@/redux/features/pageNavigation/navigationSlice';
import { resetPaymentStatus } from '@/redux/features/payment/paymentSlice';
import store from '@/redux/rootStore';

export const resetReduxStore = (): void => {
  store.dispatch(resetCart());
  store.dispatch(resetPaymentStatus());
  store.dispatch(resetNavigationStore());
  store.dispatch(resetCustomerDetails({}));
  store.dispatch(resetCustomerOrderDetails());
};
