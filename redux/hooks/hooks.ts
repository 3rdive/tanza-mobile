import arg from "arg";
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { clearState, setEmail, setMobile, setPassword } from "../slices/authSlice";

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
  setPassword: (arg: string) => dispatch(setPassword(arg)),
  setEmail: (arg: string) => dispatch(setEmail(arg)),
  setMobile: (arg: string) => dispatch(setMobile(arg)),
  clearState: () => dispatch(clearState())
 }
}