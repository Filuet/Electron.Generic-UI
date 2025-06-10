import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: string[] = [];

const welcomeScreenSlice = createSlice({
  name: 'welcomeScreen',
  initialState,
  reducers: {
    setVideoFileNames: (_state, action: PayloadAction<string[]>) => {
      return action.payload;
    },
    resetStore: () => initialState
  }
});

export const { setVideoFileNames, resetStore } = welcomeScreenSlice.actions;
export const welcomeScreenReducer = welcomeScreenSlice.reducer;
export default welcomeScreenSlice.reducer;
