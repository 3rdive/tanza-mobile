import { tzColors } from "@/theme/color";
import { router } from "expo-router";
import { JSX, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82; // downscale globally
const rs = (n: number) => RFValue(n * UI_SCALE);

type TransactionType = "send" | "receive" | "fund";

type TransactionStatus = "completed" | "in_transit" | "pending" | "failed";

type Transaction = {
  id: string;
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  // optional fields depending on type
  recipient?: string;
  sender?: string;
  trackingId?: string;
  location?: string;
  paymentMethod?: string;
  reference?: string;
};

// Extended demo data with more transaction types
const generateTransactions = (page = 0, limit = 20): Transaction[] => {
  const baseTransactions: Transaction[] = [
    {
      id: "txn_001",
      type: "send",
      title: "Package to Lagos",
      subtitle: "Delivered to John Smith • 2.5kg",
      amount: -1500,
      date: "2024-01-15T10:30:00Z",
      status: "completed",
      recipient: "John Smith",
      trackingId: "TZ001234567",
      location: "Lagos, Nigeria",
    },
    {
      id: "txn_002",
      type: "receive",
      title: "Package from Abuja",
      subtitle: "From Sarah Johnson • 1.2kg",
      amount: 2000,
      date: "2024-01-14T14:20:00Z",
      status: "completed",
      sender: "Sarah Johnson",
      trackingId: "TZ001234568",
      location: "Abuja, Nigeria",
    },
    {
      id: "txn_003",
      type: "fund",
      title: "Wallet Top-up",
      subtitle: "Bank Transfer • GTBank",
      amount: 5000,
      date: "2024-01-13T09:15:00Z",
      status: "completed",
      paymentMethod: "Bank Transfer",
      reference: "REF123456789",
    },
    {
      id: "txn_004",
      type: "send",
      title: "Package to Port Harcourt",
      subtitle: "Delivered to Mike Brown • 0.8kg",
      amount: -800,
      date: "2024-01-12T16:45:00Z",
      status: "completed",
      recipient: "Mike Brown",
      trackingId: "TZ001234569",
      location: "Port Harcourt, Nigeria",
    },
    {
      id: "txn_005",
      type: "fund",
      title: "Card Payment",
      subtitle: "Visa ending in 4532",
      amount: 3000,
      date: "2024-01-11T11:30:00Z",
      status: "completed",
      paymentMethod: "Credit Card",
      reference: "CC987654321",
    },
    {
      id: "txn_006",
      type: "send",
      title: "Package to Kano",
      subtitle: "In Transit to Alice Cooper • 3.1kg",
      amount: -2200,
      date: "2024-01-10T08:20:00Z",
      status: "in_transit",
      recipient: "Alice Cooper",
      trackingId: "TZ001234570",
      location: "Kano, Nigeria",
    },
    {
      id: "txn_007",
      type: "receive",
      title: "Package from Ibadan",
      subtitle: "From David Wilson • 0.5kg",
      amount: 1200,
      date: "2024-01-09T13:10:00Z",
      status: "completed",
      sender: "David Wilson",
      trackingId: "TZ001234571",
      location: "Ibadan, Nigeria",
    },
    {
      id: "txn_008",
      type: "fund",
      title: "Google Pay",
      subtitle: "Google Pay Transfer",
      amount: 4500,
      date: "2024-01-08T15:25:00Z",
      status: "completed",
      paymentMethod: "Google Pay",
      reference: "GP456789123",
    },
  ];

  // Generate more transactions for pagination
  const transactions: Transaction[] = [];
  for (let i = 0; i < limit; i++) {
    const baseIndex = i % baseTransactions.length;
    const transaction: Transaction = {
      ...baseTransactions[baseIndex],
      id: `txn_${page}_${i}`,
      date: new Date(
        Date.now() - (page * limit + i) * 24 * 60 * 60 * 1000
      ).toISOString(),
    };
    transactions.push(transaction);
  }

  return transactions;
};

export default function TransactionHistoryScreen(): JSX.Element {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [filter, setFilter] = useState<"all" | TransactionType>("all"); // all, send, receive, fund

  useEffect(() => {
    loadInitialTransactions();
  }, [filter]);

  const loadInitialTransactions = async (): Promise<void> => {
    setLoading(true);
    setPage(0);

    // Simulate API call
    setTimeout(() => {
      const newTransactions = generateTransactions(0, 20);
      const filteredTransactions = filterTransactions(newTransactions);
      setTransactions(filteredTransactions);
      setLoading(false);
      setHasMore(filteredTransactions.length === 20);
    }, 1000);
  };

  const loadMoreTransactions = async (): Promise<void> => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    // Simulate API call
    setTimeout(() => {
      const newTransactions = generateTransactions(nextPage, 20);
      const filteredTransactions = filterTransactions(newTransactions);

      if (filteredTransactions.length > 0) {
        setTransactions((prev) => [...prev, ...filteredTransactions]);
        setPage(nextPage);
        setHasMore(filteredTransactions.length === 20);
      } else {
        setHasMore(false);
      }

      setLoadingMore(false);
    }, 1500);
  };

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    setPage(0);

    setTimeout(() => {
      const newTransactions = generateTransactions(0, 20);
      const filteredTransactions = filterTransactions(newTransactions);
      setTransactions(filteredTransactions);
      setRefreshing(false);
      setHasMore(true);
    }, 1000);
  }, [filter]);

  const filterTransactions = (
    transactionList: Transaction[]
  ): Transaction[] => {
    if (filter === "all") return transactionList;
    return transactionList.filter((transaction) => transaction.type === filter);
  };

  const getTransactionIcon = (type: TransactionType): string => {
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

  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case "completed":
        return "#22c55e";
      case "in_transit":
        return "#f59e0b";
      case "pending":
        return "#6b7280";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime: number = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const TransactionItem = ({
    transaction,
  }: {
    transaction: Transaction;
  }): JSX.Element => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => router.push(`/transactions/${transaction.id}`)}
    >
      <View style={styles.transactionIconContainer}>
        <Text style={styles.transactionIcon}>
          {getTransactionIcon(transaction.type)}
        </Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionSubtitle}>{transaction.subtitle}</Text>
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.date)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(transaction.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {transaction.status.replace("_", " ")}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            transaction.amount > 0
              ? styles.positiveAmount
              : styles.negativeAmount,
          ]}
        >
          {transaction.amount > 0 ? "+" : ""}₦
          {Math.abs(transaction.amount).toLocaleString()}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({
    type,
    label,
  }: {
    type: "all" | TransactionType;
    label: string;
  }): JSX.Element => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === type && styles.activeFilterButton,
      ]}
      onPress={() => setFilter(type)}
    >
      <Text
        style={[styles.filterText, filter === type && styles.activeFilterText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFooter = (): JSX.Element | null => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#008B8B" />
        <Text style={styles.loadingMoreText}>Loading more transactions...</Text>
      </View>
    );
  };

  const renderEmpty = (): JSX.Element => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateText}>No transactions found</Text>
      <Text style={styles.emptyStateSubtext}>
        {filter === "all"
          ? "Your transaction history will appear here"
          : `No ${filter} transactions found`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton type="all" label="All" />
        <FilterButton type="send" label="Sent" />
        <FilterButton type="receive" label="Received" />
        <FilterButton type="fund" label="Funded" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={tzColors.primary} />
      ) : (
        <FlatList<Transaction>
          data={transactions}
          renderItem={({ item }: { item: Transaction }) => (
            <TransactionItem transaction={item} />
          )}
          keyExtractor={(item: Transaction) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreTransactions}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[tzColors.primary]}
              tintColor={tzColors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(20),
    paddingVertical: rs(16),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: rs(40),
    height: rs(40),
    justifyContent: "center",
  },
  backArrow: {
    fontSize: rs(24),
    color: "#000",
  },
  headerTitle: {
    fontSize: rs(18),
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    width: rs(40),
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: rs(20),
    paddingVertical: rs(16),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterButton: {
    paddingHorizontal: rs(15),
    paddingVertical: rs(9),
    borderRadius: rs(20),
    marginRight: rs(10),
    backgroundColor: "#f5f5f5",
  },
  activeFilterButton: {
    backgroundColor: tzColors.primary,
  },
  filterText: {
    fontSize: rs(14),
    fontWeight: "500",
    color: "#666",
  },
  activeFilterText: {
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: rs(18),
    paddingTop: rs(18),
  },
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
  chevron: {
    fontSize: rs(16),
    color: "#ccc",
  },
  loadingMore: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: rs(20),
  },
  loadingMoreText: {
    fontSize: rs(14),
    color: "#666",
    marginLeft: rs(8),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: rs(60),
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
