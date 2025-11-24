import { CustomMessageMeta } from '@/redux/core/genericTypes/genericTypes';
import { genericAsyncThunk } from '@/redux/core/utils/genericAsyncThunk';
import { getData } from '@/services/axiosWrapper/apiService';
import { AsyncThunk } from '@reduxjs/toolkit';
import { kioskSettingsEndpoint } from '@/utils/endpoints';
import { getKioskSettings } from './kioskSettingsConstant';
import { KioskSettingsBase } from './kioskSettingsTypes';

export const fetchKioskSettings: AsyncThunk<
  KioskSettingsBase,
  void,
  { rejectValue: CustomMessageMeta }
> = genericAsyncThunk<KioskSettingsBase, void>(
  getKioskSettings,

  async (): Promise<KioskSettingsBase> => {
    return getData(`${kioskSettingsEndpoint}/${import.meta.env.VITE_KIOSK_NAME}`);
  }
);
