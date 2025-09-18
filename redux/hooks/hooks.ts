import { IAuthSuccessData, IVirtualAccount, IWallet } from "@/lib/api";
import { StorageKeys, StorageMechanics } from "@/lib/storage-mechanics";
import { clearResetState, setResetMobile, setResetOtp, setResetPassword } from "@/redux/slices/resetSlice";
import { clearUser, setUser } from "@/redux/slices/userSlice";
import { clearVirtualAccount, setVirtualAccount } from "@/redux/slices/virtualAccountSlice";
import { clearWallet, setWallet, setWalletBalance } from "@/redux/slices/walletSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { clearState, setEmail, setMobile, setOtp, setPassword } from "../slices/authSlice";
import type { AppDispatch, RootState } from '../store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export function useAuthFlow(){
 const dispatch = useAppDispatch()
 const state = useAppSelector(state => state.auth);

 return {
   mobile: state.mobile,
  email: state.email,
  password: state.password,
  otp: state.otp,
  setPassword: (arg: string) => dispatch(setPassword(arg)),
  setEmail: (arg: string) => dispatch(setEmail(arg)),
  setMobile: (arg: string) => dispatch(setMobile(arg)),
  setOtp: (arg: string) => dispatch(setOtp(arg)),
  clearState: () => dispatch(clearState())
 }
}

export function usePasswordResetFlow(){
 const dispatch = useAppDispatch()
 const state = useAppSelector(state => state.reset);

 return {
  mobile: state.mobile,
  otp: state.otp,
  password: state.password,
  setPassword: (arg: string) => dispatch(setResetPassword(arg)),
  setOtp: (arg: string) => dispatch(setResetOtp(arg)),
  setMobile: (arg: string) => dispatch(setResetMobile(arg)),
  clearState: () => dispatch(clearResetState())
 }
}

export const useUser = () => {
 const dispatch = useAppDispatch();
 const user  = useAppSelector(state => state.user);

 // Helper: safely decode JWT and check expiry
 const isTokenExpired = (token?: string | null): boolean => {
  try {
    if (!token || typeof token !== 'string') return true;
    const parts = token.split('.');
    if (parts.length < 2) return true;
    const payloadPart = parts[1];
    const b64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (b64.length % 4)) % 4;
    const padded = b64 + (padLen === 2 ? '==' : padLen === 3 ? '=' : padLen === 1 ? '===' : '');
    let jsonStr = '';
    if (typeof (globalThis as any).atob === 'function') {
      const binary = (globalThis as any).atob(padded);
      // Convert binary string to UTF-8 string
      jsonStr = decodeURIComponent(Array.prototype.map.call(binary, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    } else if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(padded, 'base64').toString('utf8');
    } else {
      // Cannot decode -> treat as expired
      return true;
    }
    const payload = JSON.parse(jsonStr || '{}') as { exp?: number };
    const exp = typeof payload.exp === 'number' ? payload.exp : undefined;
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    const skewSeconds = 30; // small clock skew tolerance
    return exp <= (now + skewSeconds);
  } catch (_e) {
    return true; // On any error, assume expired
  }
 };

 useEffect(() => {
  const hydate = async () => {
    const user = await StorageMechanics.get(StorageKeys.USER);
    // Check if jwt is expired - if expired clear storage and redirect to sign-in
    const token = user?.access_token ?? null;
    if (token && !isTokenExpired(token)) {
      await authenticateUser(user);
    } else {
      await logOutUser();
    }
  }

  hydate()
 }, [])

 const authenticateUser =
   async (data: IAuthSuccessData) => {
  // Guard: do not authenticate with expired or missing token
  const token = data?.access_token ?? null;
  if (!token || isTokenExpired(token)) {
    await logOutUser();
    return;
  }
  dispatch(setUser(data))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  await StorageMechanics.set(StorageKeys.USER, data)
 }

 const logOutUser = async () => {
  dispatch(clearUser())
  axios.defaults.headers.common['Authorization'] = null as any;
  await StorageMechanics.remove(StorageKeys.USER)
 }


 return {
  user: user?.user,
  isAuthenticated: !!user?.user,
  access_token: user?.access_token,
  setUser: authenticateUser,
  logOut: logOutUser,
 }
}

export function useVirtualAccount(){
  const dispatch = useAppDispatch();
  const data = useAppSelector(state => state.virtualAccount.data);

  return {
    virtualAccount: data as IVirtualAccount | null,
    saveVirtualAccount: (d: IVirtualAccount) => dispatch(setVirtualAccount(d)),
    clearVirtualAccount: () => dispatch(clearVirtualAccount()),
  };
}

export function useWallet(){
  const dispatch = useAppDispatch();
  const wallet = useAppSelector(state => state.wallet.data);
  const balance = useAppSelector(state => state.wallet.balance);
  const loading = useAppSelector(state => state.wallet.loading);

  return {
    wallet: wallet as IWallet | null,
    balance,
    loading,
    setWallet: (w: IWallet | null) => dispatch(setWallet(w)),
    setWalletBalance: (amt: number) => dispatch(setWalletBalance(amt)),
    clearWallet: () => dispatch(clearWallet()),
  }
}