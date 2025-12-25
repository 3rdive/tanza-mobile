import { tzColors } from "@/theme/color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { JSX } from "react";

/**
 * Transaction type for UI display
 */
export type TransactionUIType = "send" | "receive" | "fund";

/**
 * Transaction status from API
 */
export type TransactionStatus =
  | "completed"
  | "complete"
  | "failed"
  | "refunded"
  | "transit"
  | "pending"
  | "accepted"
  | "delivered"
  | "in_transit"
  | "picked_up"
  | "cancelled";

/**
 * Mapped transaction for UI
 */
export interface MappedTransaction {
  id: string;
  type: TransactionUIType;
  apiType: string; // Original API type for accurate logic
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  status: string;
  isCashPayment: boolean;
  // Optional fields from API
  reference?: string;
  description?: string;
}

/**
 * Maps API transaction type to UI icon type
 */
export function mapTransactionType(apiType: string): TransactionUIType {
  const upperType = String(apiType).toUpperCase();

  switch (upperType) {
    case "DEPOSIT":
    case "FUND":
      return "fund";
    case "WITHDRAWAL":
    case "ORDER":
      return "send";
    case "RECEIVE":
    case "INCOMING":
      return "receive";
    default:
      return "send";
  }
}

/**
 * Gets the display title for a transaction type
 */
export function getTransactionTitle(apiType: string): string {
  const upperType = String(apiType).toUpperCase();

  switch (upperType) {
    case "DEPOSIT":
      return "Wallet Top-up";
    case "ORDER":
      return "Order";
    case "WITHDRAWAL":
      return "Withdrawal";
    case "FUND":
      return "Wallet Funding";
    default:
      return String(apiType);
  }
}

/**
 * Determines the transaction status from API data
 * Prioritizes orderTracking > orderStatus > status
 */
export function getTransactionStatus(transaction: any): string {
  // Check for order tracking (most recent status)
  const tracking = transaction?.order?.orderTracking;
  if (tracking && Array.isArray(tracking) && tracking.length > 0) {
    const last = tracking.reduce((a: any, b: any) =>
      new Date(a.createdAt) > new Date(b.createdAt) ? a : b
    );
    return String(last.status);
  }

  // Check for order status
  if (transaction?.order?.orderStatus) {
    return String(transaction.order.orderStatus);
  }

  // Check for orderStatus at transaction level
  if (transaction?.orderStatus) {
    return String(transaction.orderStatus);
  }

  // Fall back to transaction status
  return String(transaction?.status || "pending");
}

/**
 * Maps transaction status to display color
 */
export function getStatusColor(status: string): string {
  const normalizedStatus = String(status).toLowerCase().replace(/_/g, " ");

  switch (normalizedStatus) {
    case "completed":
    case "complete":
    case "delivered":
      return "#22c55e"; // Green
    case "refunded":
      return "#06b6d4"; // Cyan
    case "transit":
    case "in transit":
    case "picked up":
      return "#f59e0b"; // Amber
    case "pending":
      return "#6b7280"; // Gray
    case "accepted":
      return "#3b82f6"; // Blue
    case "failed":
    case "cancelled":
      return "#ef4444"; // Red
    default:
      return "#6b7280"; // Gray
  }
}

/**
 * Formats transaction date
 */
export function formatTransactionDate(
  dateString: string,
  format: "short" | "long" = "short"
): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString;
  }

  if (format === "long") {
    return date.toLocaleString();
  }

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays - 1} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Maps API transaction to UI transaction
 */
export function mapApiTransactionToUI(apiTransaction: any): MappedTransaction {
  const iconType = mapTransactionType(apiTransaction.type);
  const title = getTransactionTitle(apiTransaction.type);
  const status = getTransactionStatus(apiTransaction);

  const created = new Date(apiTransaction.createdAt);
  const dateStr = !isNaN(created.getTime())
    ? created.toISOString()
    : apiTransaction.createdAt;

  return {
    id: apiTransaction.id,
    type: iconType,
    apiType: String(apiTransaction.type).toUpperCase(),
    title,
    subtitle: String(apiTransaction.description || ""),
    amount: Number(apiTransaction.amount) || 0,
    date: dateStr,
    status,
    isCashPayment: apiTransaction.isCashPayment || false,
    reference: apiTransaction.reference,
    description: apiTransaction.description,
  };
}

/**
 * Gets the icon for a transaction type
 */
export function getTransactionIcon(
  type: TransactionUIType,
  size: number,
  color: string = tzColors.primary
): JSX.Element {
  switch (type) {
    case "send":
      return (
        <MaterialCommunityIcons
          name="tray-arrow-up"
          size={size}
          color={color}
        />
      );
    case "receive":
      return (
        <MaterialCommunityIcons
          name="tray-arrow-down"
          size={size}
          color={color}
        />
      );
    case "fund":
      return (
        <MaterialCommunityIcons name="currency-ngn" size={size} color={color} />
      );
    default:
      return (
        <MaterialCommunityIcons name="credit-card" size={size} color={color} />
      );
  }
}

/**
 * Formats status text for display
 */
export function formatStatusText(status: string): string {
  return String(status).replace(/_/g, " ");
}

/**
 * Determines if amount should be shown as positive or negative
 */
export function getAmountSign(transaction: MappedTransaction): string {
  if (transaction.isCashPayment) {
    return "";
  }

  // DEPOSIT and REFUND add money to wallet (positive)
  if (
    transaction.apiType === "DEPOSIT" ||
    transaction.apiType === "REFUND" ||
    transaction.apiType === "FUND"
  ) {
    return "+";
  }

  // ORDER and WITHDRAWAL remove money from wallet (negative)
  return "-";
}

/**
 * Determines if transaction should be styled as positive (green) or negative (red)
 */
export function shouldShowPositiveAmount(
  transaction: MappedTransaction
): boolean {
  if (transaction.isCashPayment) {
    return false; // Orange color for cash payments
  }

  // DEPOSIT and REFUND are positive (add money to wallet)
  return (
    transaction.apiType === "DEPOSIT" ||
    transaction.apiType === "REFUND" ||
    transaction.apiType === "FUND"
  );
}
