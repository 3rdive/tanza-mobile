import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
export const rs = (n: number) => RFValue((n - 1) * UI_SCALE);
