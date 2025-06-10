import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PageRoute } from '@/interfaces/modal';
import { PageState } from './navigationType';
import { navigationSliceName } from './pageNavigationConstant';

const initialState: PageState = {
  currentPage: PageRoute.KioskWelcomePage,
  isCartOpen: false
};

const pageNavigationSlice = createSlice({
  name: navigationSliceName,
  initialState,
  reducers: {
    setActivePage(state, action: PayloadAction<PageRoute>) {
      const myState = state;
      if (
        myState.currentPage === PageRoute.PaymentProcessingPage &&
        action.payload !== PageRoute.ProductCollectionPage
      ) {
        myState.isCartOpen = true;
      }
      myState.currentPage = action.payload;
    },
    resetNavigationStore: () => initialState
  }
});

export const { setActivePage, resetNavigationStore } = pageNavigationSlice.actions;
export const navigationReducer = pageNavigationSlice.reducer;
export default pageNavigationSlice.reducer;
