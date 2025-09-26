import { Direction } from '@mui/system';
import { ReactNode } from 'react';

export interface ThemeCustomizationProps {
  children: ReactNode;
  mode?: 'light' | 'dark';
  presetColor?: string;
  fontFamily?: string;
  direction?: Direction;
}

export interface TypographyOptions {
  [key: string]: unknown;
}
export interface ProductOrderInfo {
  skuCode: string;
  quantity: number;
}
export interface PaymentLinkResponse {
  link: string;
  transactionId: string;
  orderCode: string;
}

export type CSSPropertiesType = Record<string, React.CSSProperties>;

export type CSS_MUI_PropertiesType = {
  [key: string]: {
    [key: string]: string | number | object;
  };
};

export interface TransactionModel {
  value: number;
  fullName: string;
  code: string;
  customerId: string;
  isVIP: boolean;
  kioskName: string;
  order: ProductOrderInfo[];
  orderCode: string;
}
export enum PageRoute {
  UnderMaintenancePage = 'UnderMaintenancePage',
  NonWorkingHourPage = 'NonWorkingHourPage',
  KioskWelcomePage = 'KioskWelcomePage',
  LoginPage = 'LoginPage',
  SignUpPage = 'SignUpPage',
  UserWelcomePage = 'UserWelcomePage',
  HomePage = 'HomePage',
  ProductCollectionPage = 'ProductCollectionPage',
  ValidateOtpPage = 'ValidateOtpPage',
  PaymentProcessingPage = 'Payment processing page ',
  ThankYouPage = 'Thank you page ',
  SupportContactPage = 'Support Contact Page'
}

export interface KioskFormValue {
  salesCenterId: string;
  kioskName: string;
}

interface WorkingHours {
  start: string;
  end: string;
}

interface ReceiptModeConfiguration {
  isSMS: boolean;
  isPrint: boolean;
  isEmail: boolean;
}

interface PaymentMethod {
  isCard: boolean;
  isUPI: boolean;
  isNetBanking: boolean;
  isCash: boolean;
}

export interface Currency {
  symbol: string;
  decimalSplitter: string;
  formatSplitter: string;
  currencySymbolPosition: number;
  currencyFormat: string;
}
export interface MachineActiveStatus {
  isFirstMachineActive: boolean;
  isSecondMachineActive: boolean;
}
export interface KioskSettings {
  workingHours: Record<string, WorkingHours>;
  receiptModeConfiguration: ReceiptModeConfiguration;
  paymentMethod: PaymentMethod;
  underMaintenance: boolean;
  noOrderActivityDays: number;
  resetOnIdleTimerMs: number;
  resetOnIdleTimerBeforeStartMs: number;
  refreshBrowserPeriodMin: number;
  currency: Currency;
  paymentTimeoutMs: number;
  machines: MachineActiveStatus;
}

export interface ProductDataModal {
  skuCode: string;
  productName: string;
  price: number;
  productDescription: string;
  loyaltyPoints: number;
  weight: number;
  productTag: string;
  category: string;
  quantity: number;
  displayOrder: number;
  bP_BRP: number;
  fillSize: number;
  fillUnit: string;
  sellingPriceVIP: number;
  sellingPriceBRP: number;
  bV_BRP: number;
  bV_VIP: number;
  productSuggestions: string[];
}
export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug'
}
export interface LogEntry {
  level: LogLevel;
  message: string;
  component?: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}
export interface PerformanceLog {
  level: LogLevel;
  message: string;
  component?: string;
  data?: {
    usedJSHeapSizeMB: number;
    totalJSHeapSizeMB: number;
    jsHeapSizeLimitMB: number;
    usagePercent: number;
  };
  timestamp?: string;
}
export interface ImageObjectBase {
  pictureUrl: string;
  mimeType: string;
}
export interface NewImageObject extends ImageObjectBase {
  fileName: string;
  pictureUid: string;
  base64Encoded: string;
}
export enum ClientType {
  BrandPartner = 'Brand Partner',
  VIPCustomer = 'VIP Customer'
}
export enum PaymentStatus {
  NotFound = 'NotFound',
  Pending = 'Pending',
  Approved = 'Approved',
  Cancelled = 'Cancelled',
  Declined = 'Declined',
  Refunded = 'Refunded',
  Expired = 'Expired',
  Reversed = 'Reversed',
  Reserved = 'Reserved',
  Timeout = 'Timeout',
  FailedToGenerateLink = 'Failed to create payment link'
}

export interface PaymentProcessingError {
  message: string;
  code?: string;
}

export enum DispenseStatus {
  Completed = 1,
  Pending = 2,
  Started = 3,
  PartiallyCompleted = 4,
  Failed = 5,
  Terminated = 6,
  MachineError = 7,
  TrayError = 8,
  BeltError = 9,
  NotTaken = 10,
  NotTakenDoorLock = 11
}
export type Category = string[];
export interface LoginRequestModel {
  email: string;
  password: string;
}
export interface LoginResponseModel {
  token: string | null;
}
export type ValidationException = {
  description: string;
  exceptionType: string;
  statusCode: number;
};

export enum ProductTag {
  NEW = 'new',
  ICON = 'Icon'
}
export enum ProductCollectionMachine {
  left = 'left',
  right = 'right'
}

// expo related modals
export interface ProductStock {
  sku: string;
  qty: number;
  max: number;
}

export interface MachineTestResult {
  machine: number;
  status: string | null;
}

export interface RouteUpdateRequest {
  route: string | null;
  sku: string | null;
  qty?: number | null;
  maxQty?: number | null;
  isActive?: boolean | null;
}
export interface PlanogramUpdateRequest {
  kioskName: string;
  clientName: string;
  machineId: number;
  trayId: number;
  beltId: number;
  sku: string;
  quantity: number;
}

export interface ExpoDispenseModal {
  sku: string;
  qty: number;
}
export interface ProductAddress {
  sku: string;
  trayId: string;
  beltId: string;
  machineId: string;
  quantity: number;
}

// Add new types for all possible actions and statuses
export type DispenserAction =
  | 'dispensing'
  | 'dispensed'
  | 'takeproducts'
  | 'lights'
  | 'unlock'
  | 'pending'
  | 'error';

export type DispenserStatus = 'success' | 'failed' | 'pending';

// Update MachineStatus interface
export interface MachineStatus {
  action: string;
  status: string;
  message: string;
}

// Add specific response types for different actions
export interface LightStatus {
  machineId: string;
  isOn: boolean;
}

export interface DispenserError {
  code: string;
  message: string;
  address?: string;
}

export interface DispenserAddress {
  machine: string;
  tray: string;
  belt: string;
}

// Helper type for parsing different message formats
export type DispenserMessage =
  | { type: 'dispensing'; address: string; status: 'started' | 'completed' }
  | { type: 'error'; error: DispenserError }
  | { type: 'lights'; machineId: string; isOn: boolean }
  | { type: 'unlock'; machine: string }
  | { type: 'takeproducts'; address: string };

// Update DispenseResponse to be more specific
export interface DispenseResponse {
  status: DispenserStatus;
  message: string;
  error?: DispenserError;
}

// Constants for status messages
export const DispenserMessages = {
  DISPENSING_STARTED: (address: string) => `${address} Dispensing started`,
  DISPENSING_COMPLETED: (address: string) =>
    `${address} Dispensing completed. You can carry on with dispensing`,
  PRODUCTS_ABANDONED: (address: string) => `Likely that products were abandoned ${address}`,
  LIGHTS_STATUS: (machineId: string, isOn: boolean) =>
    `Machine ${machineId} Lights are ${isOn ? 'On' : 'Off'}`,
  MACHINE_UNLOCKED: (machine: string) => `${machine} is unlocked`,
  WAITING_FOR_PICKUP: 'Dispenser is waiting for products to be removed'
} as const;

export interface OtpRequest {
  country: string;
  method: {
    channel: 'sms';
    address: string;
  };
}

export interface ValidateOtpRequest extends OtpRequest {
  code: string;
}

export interface OriflameOrderModal {
  customerId: string;
  isVIP: boolean;
  transactionId: string;
  products: ProductOrderInfo[];
  phoneNumber: string;
  totalAmount: number;
}
export interface Route {
  r: string;
  q: number;
  m: number;
  a: boolean;
}

export interface PogRoute {
  product: string;
  routes: Route[];
  weight: number;
}

export interface CustomerDetails {
  customerId: string;
  isVIP: boolean;
  customerName: string;
}

export type ApiError = {
  exceptionType: string;
  statusCode: number;
  description: string;
};

export interface UndispenseProductDetailsDto {
  kioskName: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  products: {
    skuName: string;
    quantity: number;
  }[];
  reason: MachineStatus[];
}
export interface SkuAddress {
  machineId: number;
  trayId: number;
  beltId: number;
}
export interface UndispenseErrorProductsDto {
  kioskName: string;
  clientName: string;
  routes: SkuAddress[];
}
export interface MachineInoperableModal {
  kioskName: string;
  machineIds: number[];
}
export interface UpdateDispenseStatusModal {
  status: DispenseStatus;
  orderCode: string;
}

export interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
  };
}
