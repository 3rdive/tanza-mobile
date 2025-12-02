import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
export const rs = (n: number) => RFValue((n - 1) * UI_SCALE);
export const getStatusColor = (status: string): string => {
  const s = String(status).toLowerCase();
  switch (s) {
    case "complete":
    case "delivered":
      return "#22c55e";
    case "refunded":
      return "#06b6d4";
    case "pending":
      return "#f59e0b";
    case "accepted":
      return "#3b82f6";
    case "failed":
      return "#ef4444";
    case "cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};
