import { IAuthSuccessData } from "@/lib/api";
import { StorageKeys, StorageMechanics } from "@/lib/storage-mechanics";
import { clearResetState, setResetMobile, setResetOtp, setResetPassword } from "@/redux/slices/resetSlice";
import { clearUser, setUser } from "@/redux/slices/userSlice";
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


 useEffect(() => {
  const hydate = async () => {
    const user = await StorageMechanics.get(StorageKeys.USER);
    //TODO: check is jwt is expired -: if expired clear storage and redirect to sign-in
    if(user){
     await authenticateUser(user)
    }
  }

  hydate()
 }, [])

 const authenticateUser =
   async (data: IAuthSuccessData) => {
  dispatch(setUser(data))
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
  await StorageMechanics.set(StorageKeys.USER, data)
 }

 const logOutUser = async () => {
  dispatch(clearUser())
  axios.defaults.headers.common['Authorization'] = null;
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