// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
 mobile: string | null;
 email: string | null;
 password: string | null;
};

const initialState: AuthState = {
 mobile: null,
 email: null,
 password: null,
};

const authSlice = createSlice({
 name: "auth",
 initialState,
 reducers: {
	setMobile: (state, action: PayloadAction<string>) => {
	 state.mobile = action.payload;
	},
	setEmail: (state, action: PayloadAction<string>) => {
	 state.email = action.payload;
	},
	setPassword: (state, action: PayloadAction<string>) => {
	 state.password = action.payload;
	},
	clearState: (state) => {
	 state.mobile = null;
	 state.email = null;
	 state.password = null;
	}
 },
});

export const { setMobile, setEmail, setPassword, clearState } = authSlice.actions;
export default authSlice.reducer;