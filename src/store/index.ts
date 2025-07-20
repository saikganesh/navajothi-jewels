
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import wishlistReducer from './slices/wishlistSlice';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    cart: cartReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'wishlist/addToWishlist/pending',
          'wishlist/removeFromWishlist/pending',
          'cart/addToCart/pending',
          'cart/removeFromCart/pending',
          'cart/updateQuantity/pending',
          'cart/clearCart/pending',
          'auth/setAuthData',
        ],
        ignoredPaths: ['auth.user', 'auth.session'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
