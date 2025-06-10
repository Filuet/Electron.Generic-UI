export const BASE_URL = import.meta.env.VITE_OGMENTO_BASE_URL;

export const genericProductApi = 'api/generic/utils/products';

export const genericCategoriesApi = `api/generic/utils/category`;

export const oriflameProductApi = `api/oriflame/utils/products/${import.meta.env.VITE_KIOSK_NAME}`;

export const oriflameCategoriesApi = `api/oriflame/utils/category/${import.meta.env.VITE_KIOSK_NAME}`;

export const getProductImageEndPoint = 'api/product/picture';
export const getProductImagesEndPoint = 'api/product/pictures';

export const kioskSettingsEndpoint = '/api/kiosk/settings';

export const kioskLoginEndpoint = '/api/Auth/login';

export const paymentLinkEndpoint = '/api/payment';

export const paymentStatusHubEndpoint = `${BASE_URL}/paymentStatusHub`;

export const otpValidateEndpoint = '/api/validate/otp';

export const otpGenerateEndpoint = '/api/otp';

export const oriflameUserDetailsEndpoint = '/oriflame/login';

export const oriflameOrderEndpoint = '/oriflame/order';

export const getCustomerOrderDetailsEndpoint = 'api/order/quantity-limit';
export const planogramJsonEndpoint = 'api/planogram/json';
export const updateDispensedProductQuantityEndpoint = 'api/planogram/dispense';
export const updateDispensedErrorProductEndpoint = 'api/planogram/dispense/errors';
export const undispensedProductsEndpoint = '/api/email/undispensed';
export const notTakenProductsEndpoint = '/api/email/nottaken';
export const machineInoperableEndpoint = '/api/email/inoperable';
export const updateDispenseStatusEndpoint = 'api/order/dispense-status';
export const paymentTimeoutEndpoint = 'api/payment/timeout';
export const expoFailEndpoint = '/api/notify/expo-failure';
