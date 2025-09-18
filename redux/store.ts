// src/redux/redux.ts
import resetSlice from "@/redux/slices/resetSlice";
import userSlice from "@/redux/slices/userSlice";
import virtualAccountReducer from "@/redux/slices/virtualAccountSlice";
import walletReducer from "@/redux/slices/walletSlice";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reset: resetSlice,
    user: userSlice,
    virtualAccount: virtualAccountReducer,
    wallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;