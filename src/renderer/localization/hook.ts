import { useTranslation } from 'react-i18next';
import { TranslationHookReturnType, TranslationKey } from '@/localization/types';

const useTranslationHook = (): TranslationHookReturnType => {
  const { t } = useTranslation();

  const translate = (key: TranslationKey): string => {
    return t(key);
  };

  return { translate };
};

export default useTranslationHook;
