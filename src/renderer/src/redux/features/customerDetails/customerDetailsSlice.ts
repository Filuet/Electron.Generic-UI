import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomerDetails } from './types';

const initialState: CustomerDetails = {
  customerId: '',
  customerName: '',
  isVIP: true
};

const customerDetailsSlice = createSlice({
  name: 'customerDetails',
  initialState,
  reducers: {
    resetCustomerDetails: () => initialState,
    setCustomerDetails: (state, action: PayloadAction<CustomerDetails>) => {
      const myState = state;
      myState.customerId = action.payload.customerId;
      myState.customerName = action.payload.customerName;
      myState.isVIP = action.payload.isVIP;
    }
  }
});
export const { resetCustomerDetails, setCustomerDetails } = customerDetailsSlice.actions;
export const customerDetailsReducer = customerDetailsSlice.reducer;
export default customerDetailsSlice;
