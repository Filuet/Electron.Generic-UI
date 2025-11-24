import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InoperableMachines } from './expoTypes';

const initialState: {
  inoperableMachines: InoperableMachines[];
  dispenserStatus: boolean;
} = {
  inoperableMachines: [],
  dispenserStatus: true
};

const expoSlice = createSlice({
  name: 'expoExtractor',
  initialState,
  reducers: {
    setInoperableMachines(state, action: PayloadAction<InoperableMachines[]>) {
      const myState = state;
      myState.inoperableMachines = action.payload;
    },
    setExpoStatus(state, action: PayloadAction<boolean>) {
      const myState = state;
      myState.dispenserStatus = action.payload;
    },
    resetMachineExpoStatus: () => initialState
  }
});

export const { setInoperableMachines, setExpoStatus, resetMachineExpoStatus } = expoSlice.actions;
export const expoReducer = expoSlice.reducer;
export default expoSlice.reducer;
