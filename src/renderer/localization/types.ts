import { SUPPORTED_LANGUAGES } from './config';

export interface LanguageModal {
  greetings: string;
  logout: string;
  help: string;
  addToCart: string;
  backButton: string;
  bag: string;
  searchInputText: string;
  loginPageHeader: string;
  numberTakingHeader: string;
  loginButtonText: string;
  signUpButtonText1: string;
  signUpButtonText2: string;
  validateOtpHeader: string;
  validateOtpHelperText: string;
  getOtpAgain: string;
  tryAgain: string;
  resendOtp: string;
  enterButtonText: string;
  cancelButtonText: string;
  paymentProcessing: string;
  paymentSuccessful: string;
  paymentDeclined: string;
  paymentExpired: string;
  paymentNotFound: string;
  paymentRefunded: string;
  paymentCancelled: string;
  paymentPending: string;
  kioskWelcomeHeader: string;
  start: string;
  next: string;
  userGreet: string;
  thankYouMessage: string;
  signUpWelcomeMessage: string;
  retryPayment: string;
  paymentTimeOut: string;
  FailedToGenerateLink: string;
}

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type TranslationKey = keyof LanguageModal;

export type TranslationHookReturnType = { translate: (key: TranslationKey) => string };
