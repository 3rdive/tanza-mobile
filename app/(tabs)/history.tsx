import TransactionItem from "@/components/transaction/TransactionItem";
import { transactionService } from "@/lib/api";
import { tzColors } from "@/theme/color";
import {
  mapApiTransactionToUI,
  type MappedTransaction,
} from "@/utils/transaction.utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { JSX, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";

const UI_SCALE = 0.82; // downscale globally
const rs = (n: number) => RFValue(n * UI_SCALE);
const PAGE_SIZE = 10;

export default function TransactionHistoryScreen(): JSX.Element {
  const { refresh } = useLocalSearchParams<{ refresh: string }>();
  const [transactions, setTransactions] = useState<MappedTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [filter, setFilter] = useState<"all" | "ORDER" | "DEPOSIT">("all");

  const fetchPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      try {
        const params: any = { limit: PAGE_SIZE, page: pageToLoad };
        if (filter !== "all") params.transactionType = filter;
        const resp = await transactionService.getRecent(params);
        const apiItems = (resp as any)?.data || [];
        const mapped = apiItems.map(mapApiTransactionToUI);
        setHasMore(
          ((resp as any)?.pagination?.page || pageToLoad) <
            ((resp as any)?.pagination?.totalPages || 0)
        );
        setPage(pageToLoad);
        setTransactions((prev) => (append ? [...prev, ...mapped] : mapped));
      } catch (e) {
        console.warn("Failed to load transactions", e);
      }
    },
    [filter]
  );

  useEffect(() => {
    setLoading(true);
    fetchPage(1, false).finally(() => setLoading(false));
  }, [filter, fetchPage]);

  const loadMoreTransactions = async (): Promise<void> => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    fetchPage(nextPage, true).finally(() => setLoadingMore(false));
  };

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    fetchPage(1, false).finally(() => setRefreshing(false));
  }, [fetchPage]);

  useEffect(() => {
    if (refresh === "true") {
      onRefresh();
      router.setParams({ refresh: "" });
    }
  }, [refresh, onRefresh]);

  const FilterButton = ({
    type,
    label,
  }: {
    type: "all" | "ORDER" | "DEPOSIT";
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
      <MaterialCommunityIcons
        name="clipboard-text"
        size={rs(48)}
        color={tzColors.primary}
      />
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
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)")}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={rs(24)}
            color="#000"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton type="all" label="All" />
        <FilterButton type="DEPOSIT" label="Deposits" />
        <FilterButton type="ORDER" label="Orders" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={tzColors.primary} />
      ) : (
        <FlatList<MappedTransaction>
          data={transactions}
          renderItem={({ item }: { item: MappedTransaction }) => (
            <TransactionItem transaction={item} showChevron />
          )}
          keyExtractor={(item: MappedTransaction) => item.id}
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
    paddingVertical: rs(6),
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
