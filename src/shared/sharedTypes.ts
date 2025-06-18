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
