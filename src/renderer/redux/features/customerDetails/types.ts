export interface CustomerDetails {
  customerId: string;
  isVIP: boolean;
  customerName: string;
}

export interface CustomerOrderDetails {
  [key: string]: number;
}

export interface CustomerOrderDetailsStore {
  customerOrderDetails: CustomerOrderDetails;
  loadingCustomerOrders: boolean;
  errorCustomerOrders: string;
}
