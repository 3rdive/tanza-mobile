// HomeScreen.ts
import { StorageKeys, StorageMechanics } from "@/lib/storage-mechanics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
const UI_SCALE = 0.82; // globally downscale sizes ~18%
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

const demoTransactions = [
  {
    id: "1",
    type: "send",
    title: "Package to Lagos",
    subtitle: "Delivered to John Smith",
    amount: -1500,
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: "2",
    type: "receive",
    title: "Package from Abuja",
    subtitle: "From Sarah Johnson",
    amount: 2000,
    date: "2024-01-14",
    status: "completed",
  },
  {
    id: "3",
    type: "fund",
    title: "Wallet Top-up",
    subtitle: "Bank Transfer",
    amount: 5000,
    date: "2024-01-13",
    status: "completed",
  },
  {
    id: "4",
    type: "send",
    title: "Package to Port Harcourt",
    subtitle: "Delivered to Mike Brown",
    amount: -800,
    date: "2024-01-12",
    status: "completed",
  },
];

export default function HomeScreen() {
  const walletBalance = 2000;
  const userName = "John Doe";
  const [isLoading, setIsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    StorageMechanics.set(
      StorageKeys.HAS_ONBOARDING_COMPLETED,
      StorageKeys.HAS_ONBOARDING_COMPLETED
    );

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    setTimeout(() => {
      setTransactions(demoTransactions);
      setTransactionsLoading(false);
    }, 2000);
  }, []);

  const getTransactionIcon = (type: any) => {
    switch (type) {
      case "send":
        return "📤";
      case "receive":
        return "📥";
      case "fund":
        return "💰";
      default:
        return "💳";
    }
  };

  const TransactionItem = ({ transaction }: { transaction: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/transactions/${transaction.id}`)}
    >
      <View style={styles.transactionItem}>
        <View style={styles.transactionIconContainer}>
          <Text style={styles.transactionIcon} allowFontScaling={false}>
            {getTransactionIcon(transaction.type)}
          </Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle} allowFontScaling={false}>
            {transaction.title}
          </Text>
          <Text style={styles.transactionSubtitle} allowFontScaling={false}>
            {transaction.subtitle}
          </Text>
          <Text style={styles.transactionDate} allowFontScaling={false}>
            {transaction.date}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            transaction.amount > 0
              ? styles.positiveAmount
              : styles.negativeAmount,
          ]}
          allowFontScaling={false}
        >
          {transaction.amount > 0 ? "+" : ""}₦
          {Math.abs(transaction.amount).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B624" />
          <Text style={styles.loadingText} allowFontScaling={false}>
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting} allowFontScaling={false}>
              Good morning
            </Text>
            <Text style={styles.userName} allowFontScaling={false}>
              {userName}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon} allowFontScaling={false}>
              👤
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel} allowFontScaling={false}>
              Wallet Balance
            </Text>
            <TouchableOpacity
              style={styles.addMoneyButton}
              onPress={() => router.push("/payment")}
            >
              <Text style={styles.addMoneyText} allowFontScaling={false}>
                + Add Money
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount} allowFontScaling={false}>
            ₦{walletBalance.toLocaleString()}
          </Text>
          <Text style={styles.balanceSubtext} allowFontScaling={false}>
            Available for transactions
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/book-order")}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon} allowFontScaling={false}>
                📦
              </Text>
            </View>
            <Text style={styles.actionText} allowFontScaling={false}>
              Send Package
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/book-order")}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon} allowFontScaling={false}>
                📥
              </Text>
            </View>
            <Text style={styles.actionText} allowFontScaling={false}>
              Receive Package
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Text
              style={styles.infoTitle}
              allowFontScaling={false}
              maxFontSizeMultiplier={1}
            >
              Did you know?
            </Text>
            <Text style={styles.infoText} allowFontScaling={false}>
              You can fund your account via bank transfer for free
            </Text>
            <TouchableOpacity
              style={styles.fundWalletButton}
              onPress={() => router.push("/payment")}
            >
              <Text style={styles.fundWalletText} allowFontScaling={false}>
                Fund Wallet
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} allowFontScaling={false}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => router.push("/history")}>
              <Text style={styles.seeAllText} allowFontScaling={false}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {transactionsLoading ? (
            <View style={styles.transactionsLoading}>
              <ActivityIndicator size="small" color="#00B624" />
              <Text
                style={styles.loadingTransactionsText}
                allowFontScaling={false}
              >
                Loading transactions...
              </Text>
            </View>
          ) : transactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {transactions.map((transaction: any) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon} allowFontScaling={false}>
                📋
              </Text>
              <Text style={styles.emptyStateText} allowFontScaling={false}>
                No recent transactions
              </Text>
              <Text style={styles.emptyStateSubtext} allowFontScaling={false}>
                Your transaction history will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    paddingHorizontal: rs(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: rs(16),
    color: "#666",
    marginTop: rs(16),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: rs(20),
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: rs(16),
    color: "#666",
    marginBottom: rs(4),
  },
  userName: {
    fontSize: rs(24),
    fontWeight: "bold",
    color: "#000",
  },
  profileButton: {
    width: rs(40),
    height: rs(40),
    backgroundColor: "#00B624",
    borderRadius: rs(20),
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    fontSize: rs(20),
    color: "#fff",
  },
  balanceCard: {
    backgroundColor: "#00B624",
    borderRadius: rs(16),
    padding: rs(24),
    marginBottom: rs(24),
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(16),
  },
  balanceLabel: {
    fontSize: rs(16),
    color: "rgba(255, 255, 255, 0.8)",
  },
  addMoneyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: rs(16),
    paddingVertical: rs(8),
    borderRadius: rs(20),
  },
  addMoneyText: {
    color: "#fff",
    fontSize: rs(14),
    fontWeight: "600",
  },
  balanceAmount: {
    fontSize: rs(36),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: rs(4),
  },
  balanceSubtext: {
    fontSize: rs(14),
    color: "rgba(255, 255, 255, 0.7)",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: rs(24),
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: rs(12),
    padding: rs(20),
    alignItems: "center",
    marginHorizontal: rs(6),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: rs(48),
    height: rs(48),
    backgroundColor: "#f0fffe",
    borderRadius: rs(24),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: rs(12),
  },
  actionIcon: {
    fontSize: rs(24),
  },
  actionText: {
    fontSize: rs(13),
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    padding: rs(20),
    marginBottom: rs(24),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContent: {
    alignItems: "flex-start",
  },
  infoTitle: {
    fontSize: rs(18),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(8),
  },
  infoText: {
    fontSize: rs(14),
    color: "#666",
    lineHeight: rs(20),
    marginBottom: rs(16),
  },
  fundWalletButton: {
    backgroundColor: "#00B624",
    paddingHorizontal: rs(20),
    paddingVertical: rs(10),
    borderRadius: rs(20),
  },
  fundWalletText: {
    color: "#fff",
    fontSize: rs(14),
    fontWeight: "600",
  },
  recentSection: {
    marginBottom: rs(40),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(16),
  },
  sectionTitle: {
    fontSize: rs(20),
    fontWeight: "bold",
    color: "#000",
  },
  seeAllText: {
    fontSize: rs(16),
    color: "#00B624",
    fontWeight: "500",
  },
  transactionsLoading: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    padding: rs(20),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingTransactionsText: {
    fontSize: rs(14),
    color: "#666",
    marginTop: rs(8),
  },
  transactionsList: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: rs(16),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    fontSize: rs(16),
    fontWeight: "600",
    color: "#000",
    marginBottom: rs(2),
  },
  transactionSubtitle: {
    fontSize: rs(14),
    color: "#666",
    marginBottom: rs(2),
  },
  transactionDate: {
    fontSize: rs(12),
    color: "#999",
  },
  transactionAmount: {
    fontSize: rs(16),
    fontWeight: "600",
  },
  positiveAmount: {
    color: "#22c55e",
  },
  negativeAmount: {
    color: "#ef4444",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    padding: rs(40),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateIcon: {
    fontSize: rs(48),
    marginBottom: rs(16),
  },
  emptyStateText: {
    fontSize: rs(18),
    fontWeight: "600",
    color: "#000",
    marginBottom: rs(8),
  },
  emptyStateSubtext: {
    fontSize: rs(14),
    color: "#666",
    textAlign: "center",
  },
});
