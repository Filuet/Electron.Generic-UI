import type { ElectronAPI } from '@electron-toolkit/preload';

export interface PaymentWindowBridge {
  open: (link: string) => Promise<boolean>;
  close: () => Promise<boolean>;
  getHTML: () => Promise<string | null>;
  isOpen: () => Promise<boolean>;
}
export interface ExpoBridge {
  getDispenseStatus: () => Promise<ApiResponse<MachineStatus>>;
  updatePlanogramJson: (routes: PogRoute[]) => Promise<ApiResponse<boolean>>;
  getStockStatus: () => Promise<ApiResponse<ProductStock[]>>;
  testMachine: () => Promise<ApiResponse<MachineTestResult[]>>;
  unlockMachine: (machineId: number) => Promise<ApiResponse<{ success: boolean }>>;
  updatePlanogram: (req: RouteUpdateRequest) => Promise<ApiResponse<number>>;
  resetDispenseStatus: () => Promise<ApiResponse<number>>;
  getAllStatuses: () => Promise<ApiResponse<MachineStatus[]>>;
  dispenseProduct: (products: ExpoDispenseModal[]) => Promise<ApiResponse<DispenseResponse>>;
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
}

export type LogLevel = 'info' | 'error' | 'warn' | 'debug';

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

export interface ApiResponse<T> {
  status: boolean;
  data: T;
  error: unknown;
}
