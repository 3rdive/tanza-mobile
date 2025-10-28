// HomeScreen.ts
import { transactionService, userService, walletService } from "@/lib/api";
import { StorageKeys, StorageMechanics } from "@/lib/storage-mechanics";
import { useUser, useWallet } from "@/redux/hooks/hooks";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
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

export default function HomeScreen() {
  const { user, access_token, setUser } = useUser();
  const userName = useMemo(() => {
    if (!user) return "";
    const first = (user as any).firstName || "";
    const last = (user as any).lastName || "";
    return `${first} ${last}`.trim();
  }, [user]);

  const [isLoading, setIsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const { balance, setWallet } = useWallet();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isInitial: boolean = false) => {
    if (isInitial) {
      setIsLoading(true);
      setTransactionsLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      // Fetch wallet and recent transactions concurrently
      const [walletResp, txResp] = await Promise.all([
        walletService.getWallet(),
        transactionService.getRecent({ limit: 4, page: 1 }),
      ]);

      if (walletResp?.success) {
        setWallet(walletResp.data);
      }
      if (txResp?.success) {
        const apiTx = (txResp as any).data || [];
        const mapped = apiTx.map((t: any) => {
          // Map API type to local icon type and amount sign stays as-is for now
          const upperType = String(t.type).toUpperCase();
          const iconType =
            upperType === "DEPOSIT"
              ? "fund"
              : upperType === "WITHDRAWAL" || upperType === "ORDER"
              ? "send"
              : "receive";
          const title = t.type === "DEPOSIT" ? "Wallet Top-up" : "Package Sent";
          const created = new Date(t.createdAt);
          const dateStr = !isNaN(created.getTime())
            ? created.toLocaleDateString()
            : t.createdAt;
          // Prefer orderStatus for ORDER types
          const status =
            String(t.type).toUpperCase() === "ORDER" && t.orderStatus
              ? String(t.orderStatus)
              : String(t.status);
          return {
            id: t.id,
            type: iconType,
            title,
            subtitle: (t.description || "").toString(),
            amount: Number(t.amount) || 0,
            date: dateStr,
            status,
          };
        });
        setTransactions(mapped);
      }
    } catch (e) {
      // Optionally: show a toast/log
      console.warn("Failed to load dashboard data", e);
    } finally {
      if (isInitial) {
        setIsLoading(false);
        setTransactionsLoading(false);
      } else {
        setRefreshing(false);
        setTransactionsLoading(false);
      }
    }
  };

  useEffect(() => {
    userService
      .getProfile()
      .then((response) => {
        setUser({ access_token: access_token || null, user: response.data });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    StorageMechanics.set(
      StorageKeys.HAS_ONBOARDING_COMPLETED,
      StorageKeys.HAS_ONBOARDING_COMPLETED
    );

    load(true);
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

  const getStatusColor = (status: string): string => {
    const s = String(status).toLowerCase();
    switch (s) {
      case "completed":
      case "delivered":
        return "#22c55e";
      case "refunded":
        return "#06b6d4";
      case "in_transit":
        return "#f59e0b";
      case "pending":
        return "#6b7280";
      case "accepted":
        return "#3b82f6";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.transactionDate} allowFontScaling={false}>
              {transaction.date}
            </Text>
            {transaction.status ? (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(transaction.status) },
                ]}
              >
                <Text style={styles.statusText} allowFontScaling={false}>
                  {String(transaction.status).replace(/_/g, " ")}
                </Text>
              </View>
            ) : null}
          </View>
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

  const formattedBalance = new Intl.NumberFormat("en-US").format(balance ?? 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(false)}
          />
        }
      >
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
            {Boolean((user as any)?.profilePic) ? (
              <Image
                source={{ uri: (user as any)?.profilePic as string }}
                style={styles.profileAvatar}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.profileIcon} allowFontScaling={false}>
                👤
              </Text>
            )}
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
            ₦{formattedBalance}
          </Text>
          <Text style={styles.balanceSubtext} allowFontScaling={false}>
            Available for transactions
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: "/book-order",
                params: { send_type: "sender" },
              })
            }
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
            onPress={() =>
              router.push({
                pathname: "/book-order",
                params: { send_type: "recipient" },
              })
            }
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
              onPress={() => router.push("/rider/rider-wallet")}
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
  profileAvatar: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
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
    fontSize: rs(33),
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
  statusBadge: {
    paddingHorizontal: rs(6),
    paddingVertical: rs(2),
    borderRadius: rs(10),
    marginLeft: rs(8),
  },
  statusText: {
    fontSize: rs(10),
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
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
