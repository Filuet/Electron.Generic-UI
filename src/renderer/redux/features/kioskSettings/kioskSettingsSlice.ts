import { ActionReducerMapBuilder, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomMessageMeta } from '@/redux/core/genericTypes/genericTypes';
import { KioskSettingsBase, KioskSettingStore } from './kioskSettingsTypes';
import { fetchKioskSettings } from './kioskSettingThunk';
import { initialSettings, kioskSettingSliceName } from './kioskSettingsConstant';

const initialState: KioskSettingStore = {
  kioskSettings: initialSettings,
  loading: true,
  error: ''
};

const handlePending = (state: KioskSettingStore): void => {
  const myState = state;
  myState.loading = true;
  myState.error = '';
};

const handleRejected = (
  state: KioskSettingStore,
  action: PayloadAction<CustomMessageMeta | undefined>
): void => {
  const myState = state;
  myState.loading = false;
  myState.error = action.payload?.message || '';
};

const fetchKioskSettingsCase = (builder: ActionReducerMapBuilder<KioskSettingStore>): void => {
  builder
    .addCase(fetchKioskSettings.pending, handlePending)
    .addCase(fetchKioskSettings.fulfilled, (state, action: PayloadAction<KioskSettingsBase>) => {
      const myState = state;
      myState.loading = false;
      myState.kioskSettings = action.payload.kioskSettings;
    })
    .addCase(fetchKioskSettings.rejected, handleRejected);
};

const kioskSettingSlice = createSlice({
  name: kioskSettingSliceName,
  initialState,
  reducers: {
    resetKioskSettings: (state) => {
      const myState = state;
      myState.kioskSettings = initialSettings;
      myState.loading = false;
      myState.error = '';
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<KioskSettingStore>) => {
    fetchKioskSettingsCase(builder);
  }
});
export const { resetKioskSettings } = kioskSettingSlice.actions;
export const kioskSettingsReducer = kioskSettingSlice.reducer;
export default kioskSettingSlice.reducer;
