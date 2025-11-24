import { SupportedLanguage } from '@/localization/types';
import loggingService from '@/utils/loggingService';
import { LogLevel } from '@/interfaces/modal';
import i18n from './index';
import { SUPPORTED_LANGUAGES } from './config';

export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  if (SUPPORTED_LANGUAGES.includes(language)) {
    await i18n.changeLanguage(language);
  } else {
    loggingService.log({
      level: LogLevel.WARN,
      message: 'Unsupported language',
      component: 'localization/utils',
      data: { language, supportedLanguages: SUPPORTED_LANGUAGES }
    });
  }
};
