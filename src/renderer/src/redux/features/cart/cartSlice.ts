import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartProduct, CartState } from './cartTypes';
import { cartSliceName } from './cartConstant';

const initialState: CartState = {
  products: [],
  totalCount: 0,
  totalPrice: 0,
  orderNumber: '',
  orderCode: ''
};

const cartSlice = createSlice({
  name: cartSliceName,
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartProduct>) => {
      const myState = state;
      const existingProduct = state.products.find(
        (product) => product.skuCode === action.payload.skuCode
      );
      if (existingProduct) {
        existingProduct.productCount += 1;
        myState.totalCount += 1;
        myState.totalPrice += existingProduct.priceToAdd;
        myState.totalPrice = Number(myState.totalPrice.toFixed(2));
      } else {
        myState.products.push({ ...action.payload, productCount: 1 });
        myState.totalCount += 1;
        myState.totalPrice += action.payload.priceToAdd;
        myState.totalPrice = Number(myState.totalPrice.toFixed(2));
      }
    },
    decrementProduct: (state, action: PayloadAction<string>) => {
      const myState = state;
      const existingProduct = myState.products.find(
        (product) => product.skuCode === action.payload
      );
      if (existingProduct) {
        existingProduct.productCount -= 1;
        myState.totalCount -= 1;
        myState.totalPrice -= existingProduct.priceToAdd;
        myState.totalPrice = Number(myState.totalPrice.toFixed(2));

        if (existingProduct.productCount === 0) {
          myState.products = myState.products.filter(
            (product) => product.skuCode !== action.payload
          );
        }
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      const myState = state;
      const productToRemove = myState.products.find(
        (product) => product.skuCode === action.payload
      );
      if (productToRemove) {
        myState.products = myState.products.filter((product) => product.skuCode !== action.payload);
        myState.totalCount -= productToRemove.productCount;
        myState.totalPrice -= productToRemove.priceToAdd * productToRemove.productCount;
        myState.totalPrice = Number(myState.totalPrice.toFixed(2));
      }
    },
    resetCart: (state) => {
      const myState = state;
      myState.products = [];
      myState.totalCount = 0;
      myState.totalPrice = 0;
      myState.orderNumber = '';
      myState.orderCode = '';
    },
    updateOrderNumber: (state, action: PayloadAction<string>) => {
      const myState = state;
      myState.orderNumber = action.payload;
    },
    updateOrderCode: (state, action: PayloadAction<string>) => {
      const myState = state;
      myState.orderCode = action.payload;
    }
  }
});

export const {
  addToCart,
  decrementProduct,
  removeProduct,
  resetCart,
  updateOrderNumber,
  updateOrderCode
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
export default cartSlice.reducer;
