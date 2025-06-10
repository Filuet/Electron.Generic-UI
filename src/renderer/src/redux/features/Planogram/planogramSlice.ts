import { PogRoute } from '@/interfaces/modal';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PlanogramState {
  routes: PogRoute[];
}

const initialState: PlanogramState = {
  routes: []
};

const planogramSlice = createSlice({
  name: 'planogram',
  initialState,
  reducers: {
    setPlanogramJson(state, action: PayloadAction<PogRoute[]>) {
      const myState = state;
      myState.routes = action.payload;
    }
  }
});

export const { setPlanogramJson } = planogramSlice.actions;
export const planogramReducer = planogramSlice.reducer;
export default planogramSlice.reducer;
