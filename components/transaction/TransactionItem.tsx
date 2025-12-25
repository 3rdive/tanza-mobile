import { tzColors } from "@/theme/color";
import {
  formatStatusText,
  formatTransactionDate,
  getAmountSign,
  getStatusColor,
  getTransactionIcon,
  shouldShowPositiveAmount,
  type MappedTransaction,
} from "@/utils/transaction.utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue(n * UI_SCALE);

interface TransactionItemProps {
  transaction: MappedTransaction;
  showChevron?: boolean;
}

export default function TransactionItem({
  transaction,
  showChevron = false,
}: TransactionItemProps) {
  return (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => router.push(`/transactions/${transaction.id}`)}
    >
      <View style={styles.transactionIconContainer}>
        <Text style={styles.transactionIcon} allowFontScaling={false}>
          {getTransactionIcon(transaction.type, rs(18), tzColors.primary)}
        </Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle} allowFontScaling={false}>
          {transaction.title}
        </Text>
        <Text style={styles.transactionSubtitle} allowFontScaling={false}>
          {transaction.subtitle}
        </Text>
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionDate} allowFontScaling={false}>
            {formatTransactionDate(transaction.date)}
          </Text>
          {transaction.status ? (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(transaction.status) },
              ]}
            >
              <Text style={styles.statusText} allowFontScaling={false}>
                {formatStatusText(transaction.status)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            transaction.isCashPayment
              ? {}
              : shouldShowPositiveAmount(transaction)
              ? styles.positiveAmount
              : styles.negativeAmount,
            transaction.isCashPayment ? { color: "orange" } : {},
          ]}
          allowFontScaling={false}
        >
          {getAmountSign(transaction)}₦
          {Math.abs(transaction.amount).toLocaleString()}
        </Text>
        {showChevron && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={rs(16)}
            color="#ccc"
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: rs(14),
    borderRadius: rs(12),
    marginBottom: rs(10),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionIconContainer: {
    width: rs(40),
    height: rs(40),
    backgroundColor: "#f0fffe",
    borderRadius: rs(20),
    justifyContent: "center",
    alignItems: "center",
    marginRight: rs(12),
  },
  transactionIcon: {
    fontSize: rs(18),
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#000",
    marginBottom: rs(4),
  },
  transactionSubtitle: {
    fontSize: rs(12),
    color: "#666",
    marginBottom: rs(4),
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDate: {
    fontSize: rs(12),
    color: "#999",
    marginRight: rs(8),
  },
  statusBadge: {
    paddingHorizontal: rs(6),
    paddingVertical: rs(2),
    borderRadius: rs(10),
  },
  statusText: {
    fontSize: rs(10),
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: rs(16),
    fontWeight: "600",
    marginBottom: rs(4),
  },
  positiveAmount: {
    color: "#22c55e",
  },
  negativeAmount: {
    color: "#ef4444",
  },
});
