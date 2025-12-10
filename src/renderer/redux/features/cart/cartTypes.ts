export interface CartProduct {
  skuCode: string;
  productName: string;
  price: number;
  quantity: number;
  bP_BRP: number;
  fillSize: number;
  fillUnit: string;
  sellingPriceVIP: number;
  sellingPriceBRP: number;
  productCount: number;
  priceToAdd: number;
}
export interface CartState {
  products: CartProduct[];
  totalCount: number;
  totalPrice: number;
  orderNumber: string;
  orderCode: string;
}
