import { KioskSettings } from '@/interfaces/modal';

export interface KioskSettingStore {
  kioskSettings: KioskSettings;
  loading: boolean;
  error: string;
}

export interface KioskSettingsBase {
  kioskName: string;
  kioskSettings: KioskSettings;
}
