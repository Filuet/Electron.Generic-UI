export const enum IPC_CHANNELS {
  VIDEO_GET_FILES = 'video:get-files',
  VIDEO_FOLDER_UPDATED = 'video:folder-updated',

  LOG_GENERIC = 'log:generic',
  LOG_PERFORMANCE = 'log:performance',

  EXPO_DISPENSE_STATUS = 'expo:get-dispense-status',
  EXPO_DISPENSE_PRODUCT = 'expo:dispensing-product',
  EXPO_PLANOGRAM_JSON = 'expo:update-planogram-json',
  EXPO_STOCK_STATUS = 'expo:get-stock-status',
  EXPO_TEST_MACHINE = 'expo:test-machine',
  EXPO_UNLOCK_MACHINE = 'expo:unlock-machine',
  EXPO_PLANOGRAM_UPDATE = 'expo:update-planogram',
  EXPO_RESET_STATUS = 'expo:reset-status',
  EXPO_ALL_STATUSES = 'expo:get-all-statuses',

  PAYMENT_OPEN = 'payment:open',
  PAYMENT_CLOSE = 'payment:close',
  PAYMENT_IS_OPEN = 'payment:is-open',
  PAYMENT_WINDOW_HTML_CONTENT = 'payment:window-html-content'
}
