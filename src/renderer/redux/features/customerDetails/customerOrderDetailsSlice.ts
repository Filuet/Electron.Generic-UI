import { createSlice } from '@reduxjs/toolkit';
import { CustomerOrderDetailsStore } from './types';
import { fetchCustomerOrderDetails } from './customerApiThunks';

const initialState: CustomerOrderDetailsStore = {
  customerOrderDetails: {},
  loadingCustomerOrders: false,
  errorCustomerOrders: ''
};

const customerOrderDetailsSlice = createSlice({
  name: 'customerOrderDetails',
  initialState,
  reducers: {
    resetCustomerOrderDetails: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerOrderDetails.pending, (state) => {
        const myState = state;
        myState.loadingCustomerOrders = true;
        myState.errorCustomerOrders = '';
      })
      .addCase(fetchCustomerOrderDetails.fulfilled, (state, action) => {
        const myState = state;
        myState.loadingCustomerOrders = false;
        myState.customerOrderDetails = action.payload;
      })
      .addCase(fetchCustomerOrderDetails.rejected, (state, action) => {
        const myState = state;
        myState.loadingCustomerOrders = false;
        myState.errorCustomerOrders = action.error.message || 'An error occurred';
      });
  }
});

export const { resetCustomerOrderDetails } = customerOrderDetailsSlice.actions;
export const customerOrderDetailsReducer = customerOrderDetailsSlice.reducer;
export default customerOrderDetailsSlice;
