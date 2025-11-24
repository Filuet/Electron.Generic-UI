import { KioskSettings } from '@/interfaces/modal';

export const getKioskSettings = '/kioskSettings/get';

export const kioskSettingSliceName = 'kioskSettings';

export const initialSettings: KioskSettings = {
  workingHours: {
    monday: {
      start: '08:00:00',
      end: '17:00:00'
    },
    tuesday: {
      start: '08:00:00',
      end: '17:00:00'
    },
    wednesday: {
      start: '08:00:00',
      end: '23:00:00'
    },
    thursday: {
      start: '08:00:00',
      end: '17:00:00'
    },
    friday: {
      start: '08:00:00',
      end: '22:00:00'
    },
    saturday: {
      start: '10:00:00',
      end: '14:00:00'
    },
    sunday: {
      start: '00:00:00',
      end: '00:00:00'
    }
  },
  receiptModeConfiguration: {
    isSMS: true,
    isPrint: false,
    isEmail: false
  },
  paymentMethod: {
    isCard: false,
    isUPI: true,
    isNetBanking: false,
    isCash: false
  },
  underMaintenance: false,
  noOrderActivityDays: 0,
  resetOnIdleTimerMs: 9999999,
  resetOnIdleTimerBeforeStartMs: 1000,
  refreshBrowserPeriodMin: 5,
  currency: {
    symbol: '$',
    decimalSplitter: ',',
    formatSplitter: '.',
    currencySymbolPosition: 2,
    currencyFormat: '##,##.##'
  },
  paymentTimeoutMs: 120000,
  machines: {
    isFirstMachineActive: false,
    isSecondMachineActive: false
  }
};
