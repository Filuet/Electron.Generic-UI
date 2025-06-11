import { PaymentStatus } from '@/interfaces/modal';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PaymentState {
  status: PaymentStatus;
}

const initialState: PaymentState = {
  status: PaymentStatus.Pending
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentStatus(state, action: PayloadAction<PaymentStatus>) {
      const myState = state;
      myState.status = action.payload;
    },
    resetPaymentStatus: () => initialState
  }
});

export const { setPaymentStatus, resetPaymentStatus } = paymentSlice.actions;
export const paymentReducer = paymentSlice.reducer;
export default paymentSlice.reducer;
