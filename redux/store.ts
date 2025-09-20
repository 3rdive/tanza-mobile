// src/redux/redux.ts
import resetSlice from "@/redux/slices/resetSlice";
import userSlice from "@/redux/slices/userSlice";
import virtualAccountReducer from "@/redux/slices/virtualAccountSlice";
import walletReducer from "@/redux/slices/walletSlice";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import locationSearchReducer from "./slices/locationSearchSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reset: resetSlice,
    user: userSlice,
    virtualAccount: virtualAccountReducer,
    wallet: walletReducer,
    locationSearch: locationSearchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;