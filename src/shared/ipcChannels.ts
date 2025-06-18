export const IPC_CHANNELS = {
  VIDEO: {
    GET_FILES: 'video:get-files',
    FOLDER_UPDATED: 'video:folder-updated'
  },
  LOG: {
    GENERIC: 'log:generic',
    PERFORMANCE: 'log:performance'
  },
  EXPO: {
    DISPENSE_STATUS: 'expo:get-dispense-status',
    DISPENSE_PRODUCT: 'expo:dispensing-product',
    PLANOGRAM_JSON: 'expo:update-planogram-json',
    STOCK_STATUS: 'expo:get-stock-status',
    TEST_MACHINE: 'expo:test-machine',
    UNLOCK_MACHINE: 'expo:unlock-machine',
    PLANOGRAM_UPDATE: 'expo:update-planogram',
    RESET_STATUS: 'expo:reset-status',
    ALL_STATUSES: 'expo:get-all-statuses'
  }
} as const;
