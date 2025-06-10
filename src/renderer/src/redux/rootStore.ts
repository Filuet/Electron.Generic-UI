import { configureStore } from '@reduxjs/toolkit';
import { navigationReducer } from './features/pageNavigation/navigationSlice';
import { cartReducer } from './features/cart/cartSlice';
import { kioskSettingsReducer } from './features/kioskSettings/kioskSettingsSlice';
import { paymentReducer } from './features/payment/paymentSlice';
import { customerLoginReducer } from './features/customerLogin/customerLogin';
import { welcomeScreenReducer } from './features/welcomeScreen/welcomeScreenSlice';
import { planogramReducer } from './features/Planogram/planogramSlice';
import { customerDetailsReducer } from './features/customerDetails/customerDetailsSlice';
import { customerOrderDetailsReducer } from './features/customerDetails/customerOrderDetailsSlice';
import { expoReducer } from './features/expoSettings/expoSlice';

const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    cart: cartReducer,
    kioskSettings: kioskSettingsReducer,
    payment: paymentReducer,
    customerLogin: customerLoginReducer,
    welcomeScreen: welcomeScreenReducer,
    customerDetails: customerDetailsReducer,
    customerOrderDetails: customerOrderDetailsReducer,
    planogram: planogramReducer,
    expoExtractor: expoReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: {
        ignoredPaths: ['ignoredPath', 'ignoredNested.one', 'ignoredNested.two']
      }
    })
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
