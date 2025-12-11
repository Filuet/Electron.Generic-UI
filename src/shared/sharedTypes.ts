import type { ElectronAPI } from '@electron-toolkit/preload';

export interface PaymentWindowBridge {
  open: (link: string) => Promise<boolean>;
  close: () => Promise<boolean>;
  getHTML: () => Promise<string | null>;
  isOpen: () => Promise<boolean>;
}
export interface ExpoBridge {
  dispenseProduct: (products: ExpoDispenseModal[]) => Promise<void>;
  getDispenseStatus: () => Promise<MachineStatus>;
  updatePlanogramJson: (routes: PogRoute[]) => Promise<string>;
  // getStockStatus: () => Promise<ProductStock[]>;
  testMachine: () => Promise<MachineTestResult[]>;
  unlockMachine: (machineId: number) => Promise<void>;
  // updatePlanogram: (req: RouteUpdateRequest) => Promise<number>;
  resetStatus: () => Promise<string>;
  getAllStatuses: () => Promise<MachineStatus[]>;
}
export interface VideoFilesBridge {
  getFiles: () => Promise<string[]>;
  getVideoContent: (filename: string) => Promise<string | null>;
  onFolderChange: (callback: () => void) => void;
  removeFolderListener: (callback: () => void) => void;
}
export interface LoggingServiceBridge {
  generic: (entry: LogEntry) => Promise<void>;
  performance: (entry: LogEntry) => Promise<void>;
}
export interface ElectronBridgeAPI extends ElectronAPI {
  videoFilesUtil: VideoFilesBridge;
  logs: LoggingServiceBridge;
  expo: ExpoBridge;
  payment: PaymentWindowBridge;
  testingConfig: Promise<TestingConfigJsonObject>;
  expoStatus: ExpoStatusBridge;
}

export type ExpoStatuses = 'loading' | 'ready' | 'error';

export interface ExpoStatusBridge {
  onExpoRunningStatusChange: (callback: (status: ExpoStatuses) => void) => () => void;
  getExpoRunningStatus: () => Promise<ExpoStatuses>;
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
  data?: unknown;
  timestamp?: string;
}

export interface MachineStatus {
  action: string;
  status: string;
  message: string;
}

interface Route {
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

export interface ExpoDispenseModal {
  sku: string;
  qty: number;
}

export type DispenserStatus = 'success' | 'failed' | 'pending';

export interface DispenserError {
  code: string;
  message: string;
  address?: string;
}

export interface DispenseResponse {
  status: DispenserStatus;
  message: string;
  error?: DispenserError;
}

export type LoginRequestModel = {
  email: string;
  password: string;
};
export type LoginResponseModel = {
  token: string | null;
};

export interface MachineInoperableModal {
  kioskName: string;
  machineIds: number[];
}

export type TestingConfigJsonObject = {
  skipAddToCartValidation: boolean;
  skipPaymentProcess: boolean;
  expoEmailShouldSend: boolean;
};
