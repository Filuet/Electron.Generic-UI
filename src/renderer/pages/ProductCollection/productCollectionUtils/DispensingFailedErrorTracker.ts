import { MachineStatus } from '@/interfaces/modal';

export class DispensingErrorTracker {
  private errorMap: Map<string, { sku: string; count: number }>;

  private abandonedMap: Map<string, { sku: string; count: number }>;

  constructor() {
    this.errorMap = new Map();
    this.abandonedMap = new Map();
  }

  public addError(address: string, sku: string): void {
    if (this.errorMap.has(address)) {
      const errorInfo = this.errorMap.get(address);
      if (errorInfo) {
        errorInfo.count += 1;
      }
    } else {
      this.errorMap.set(address, { sku, count: 1 });
    }
  }

  public addAbandonedProduct(address: string, sku: string): void {
    if (this.abandonedMap.has(address)) {
      const abandonedInfo = this.abandonedMap.get(address);
      if (abandonedInfo) {
        abandonedInfo.count += 1;
      }
    } else {
      this.abandonedMap.set(address, { sku, count: 1 });
    }
  }

  public getAllErrors(): { address: string; sku: string; count: number }[] {
    return Array.from(this.errorMap, ([address, value]) => ({
      address,
      sku: value.sku,
      count: value.count
    }));
  }

  public getAllAbandonedProducts(): {
    address: string;
    sku: string;
    count: number;
  }[] {
    return Array.from(this.abandonedMap, ([address, value]) => ({
      address,
      sku: value.sku,
      count: value.count
    }));
  }

  public handleDispensingFailedProductCount(status: MachineStatus): boolean {
    const addressMatch = status.message.match(/\[(.*?)\]/);
    const skuMatch = status.message.match(/sku:(\w+)/);
    const address = addressMatch ? addressMatch[1] : '';
    const sku = skuMatch ? skuMatch[1] : '';

    if (address && sku) {
      this.addError(address, sku);
      return true;
    }
    return false;
  }

  public handleAbandonedProductCount(status: MachineStatus): boolean {
    const abandonedMatch = status.message.match(/\[(.*?)\] .* sku:(\w+)/);
    const abandonedAddress = abandonedMatch ? abandonedMatch[1] : '';
    const abandonedSku = abandonedMatch ? abandonedMatch[2] : '';

    if (abandonedAddress && abandonedSku) {
      this.addAbandonedProduct(abandonedAddress, abandonedSku);
      return true;
    }

    return false;
  }
}
