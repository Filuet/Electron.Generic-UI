import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/core/utils/reduxHook';
import { fetchKioskSettings } from '@/redux/features/kioskSettings/kioskSettingThunk';

export const useKioskReset = () => {
  const dispatch = useAppDispatch();
  const refreshKioskSettingsInterval = 1000 * 30; // 30 seconds

  useEffect(() => {
    const interval = setInterval(async () => {
      await dispatch(fetchKioskSettings());
    }, refreshKioskSettingsInterval);

    return () => clearInterval(interval);
  }, [dispatch, refreshKioskSettingsInterval]);
};
