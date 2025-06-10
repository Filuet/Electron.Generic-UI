import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { requestOtp } from './customerLoginThunk';
import { ClientType, UserLoginStore } from './types';

const initialState: UserLoginStore = {
  phoneNumber: '',
  clientType: ClientType.BrandPartner,
  loading: false,
  error: ''
};

const handlePending = (state: UserLoginStore): void => {
  const myState = state;
  myState.loading = true;
  myState.error = '';
};

const handleRejected = (
  state: UserLoginStore,
  action: PayloadAction<unknown, string, unknown, { message?: string }>
): void => {
  const myState = state;

  myState.loading = false;
  myState.error = action.error.message || 'An error occurred';
};

const customerLoginSlice = createSlice({
  name: 'customerLogin',
  initialState,
  reducers: {
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      const myState = state;
      myState.phoneNumber = action.payload;
    },
    setClientType: (state, action: PayloadAction<ClientType>) => {
      const myState = state;
      myState.clientType = action.payload;
    },
    resetUserDetails: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestOtp.pending, handlePending)
      .addCase(requestOtp.fulfilled, (state) => {
        const myState = state;
        myState.loading = false;
      })
      .addCase(requestOtp.rejected, handleRejected);
  }
});

export const { setPhoneNumber, setClientType, resetUserDetails } = customerLoginSlice.actions;
export const customerLoginReducer = customerLoginSlice.reducer;
export default customerLoginSlice.reducer;
