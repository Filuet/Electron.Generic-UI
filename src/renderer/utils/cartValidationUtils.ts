import { ClientType, ProductDataModal } from '@/interfaces/modal';
import { CartProduct } from '@/redux/features/cart/cartTypes';
import { CustomerOrderDetails } from '@/redux/features/customerDetails/types';
import { testingConfig } from './electronApi/getTestingConfig';

export const validateAddToCart = (
  product: ProductDataModal | CartProduct,
  productInCart: CartProduct | undefined,
  customerOrderDetails: CustomerOrderDetails,
  cartTotalPrice: number,
  currentClient: ClientType
): string | null => {
  const PRODUCT_PURCHASE_LIMIT = 5;
  const TOTAL_CART_LIMIT = 42000;
  let sellingPrice = product.sellingPriceVIP;
  const SKIP_ADD_TO_CART_VALIDATION: boolean = testingConfig.skipAddToCartValidation;

  if (ClientType.BrandPartner === currentClient) {
    sellingPrice = product.sellingPriceBRP;
  }

  if (cartTotalPrice + sellingPrice >= TOTAL_CART_LIMIT) {
    return 'You have reached the maximum order amount per invoice';
  }

  if (productInCart && product.quantity <= productInCart.productCount) {
    return 'Sorry, currently we do not have enough stock of this product';
  }
  if (SKIP_ADD_TO_CART_VALIDATION) {
    return null;
  }
  if (productInCart && productInCart?.productCount >= PRODUCT_PURCHASE_LIMIT) {
    return 'You have added maximum quantity of this product';
  }

  if (productInCart) {
    if (customerOrderDetails[productInCart.skuCode] !== undefined) {
      const maxQuantityToBuyProduct =
        PRODUCT_PURCHASE_LIMIT - customerOrderDetails[productInCart.skuCode];
      if (productInCart.productCount >= maxQuantityToBuyProduct) {
        return 'You have added the maximum units of this product for this month';
      }
    }
  } else if (customerOrderDetails[product.skuCode] !== undefined) {
    const maxQuantityToBuyProduct = PRODUCT_PURCHASE_LIMIT - customerOrderDetails[product.skuCode];
    if (!(maxQuantityToBuyProduct >= 1)) {
      return 'You have added the maximum units of this product for this month';
    }
  }

  return null;
};
