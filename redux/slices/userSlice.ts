import { IAuthSuccessData } from "@/lib/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IUserLocation {
  state: string;
  country: string;
}

interface IUserState extends IAuthSuccessData {
  cachedLocation: IUserLocation | null;
}

const initialState: IUserState = {
  access_token: null,
  user: null,
  cachedLocation: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IAuthSuccessData>) => {
      state.user = action.payload.user;
      state.access_token = action.payload.access_token;
    },
    clearUser: (state) => {
      state.user = null;
      state.access_token = null;
      state.cachedLocation = null;
    },
    setCachedLocation: (state, action: PayloadAction<IUserLocation>) => {
      state.cachedLocation = action.payload;
    },
    clearCachedLocation: (state) => {
      state.cachedLocation = null;
    },
  },
});

export const { setUser, clearUser, setCachedLocation, clearCachedLocation } =
  userSlice.actions;
export default userSlice.reducer;
export type { IUserLocation, IUserState };
