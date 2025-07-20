
import { configureStore } from '@reduxjs/toolkit';
import wishlistSlice from './slices/wishlistSlice';
import cartSlice from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    wishlist: wishlistSlice,
    cart: cartSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: [
          'wishlist/setUser',
          'cart/setUser',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
