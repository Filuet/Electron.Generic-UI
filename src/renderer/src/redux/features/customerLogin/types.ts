export enum ClientType {
  BrandPartner = 'Brand Partner',
  VIPCustomer = 'VIP Customer'
}

export interface UserLoginStore {
  phoneNumber: string;
  clientType: ClientType;
  loading: boolean;
  error: string;
}
