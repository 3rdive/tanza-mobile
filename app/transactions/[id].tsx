import DeliveryProgress from "@/components/transaction/delivery-progress";
import {
  transactionService,
  userService,
  type ITransactionDetail,
  type IUser,
} from "@/lib/api";
import { tzColors } from "@/theme/color";
import {
  formatStatusText,
  formatTransactionDate,
  getStatusColor,
  getTransactionStatus,
} from "@/utils/transaction.utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

export default function TransactionDetail(): JSX.Element {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [apiTx, setApiTx] = useState<ITransactionDetail | null>(null);
  const [profile, setProfile] = useState<IUser | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        if (!id) {
          setNotFound(true);
          return;
        }
        const res = await transactionService.getById(String(id));
        const data = res?.data ?? null;
        if (!mounted) return;
        if (!data) {
          setNotFound(true);
        } else {
          setApiTx(data);
          if (data.order && (!data.order.sender || !data.order.recipient)) {
            try {
              const u = await userService.getProfile();
              if (!mounted) return;
              if (u?.success && u.data) setProfile(u.data);
            } catch {}
          }
        }
      } catch {
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Fallback mock transaction for legacy UI

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={rs(24)}
              color="#000"
              style={styles.backArrow}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B624" />
          <Text style={styles.loadingText}>Loading transaction…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (notFound || !apiTx) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={rs(24)}
              color="#000"
              style={styles.backArrow}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundCode}>404</Text>
          <Text style={styles.notFoundTitle}>Transaction not found</Text>
          <Text style={styles.notFoundSubtitle}>
            We could not find this transaction. It may have been moved or
            deleted.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.notFoundButton}
          >
            <Text style={styles.notFoundButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const amountNum =
    typeof apiTx.amount === "string" ? parseFloat(apiTx.amount) : apiTx.amount;
  const order = apiTx.order;

  const safeUserName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    : "You";
  const contactSenderName = (order as any)?.sender?.name || safeUserName;
  const contactSenderPhone =
    (order as any)?.sender?.phone || profile?.mobile || "";
  const contactRecipientName = (order as any)?.recipient?.name || safeUserName;
  const contactRecipientPhone =
    (order as any)?.recipient?.phone || profile?.mobile || "";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={rs(24)}
            color="#000"
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.transactionIconContainer}>
              <MaterialCommunityIcons
                name="credit-card"
                size={rs(18)}
                color="#000"
              />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>{apiTx.type}</Text>
              <Text style={styles.summarySubtitle} numberOfLines={1}>
                {apiTx.description || ""}
              </Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text
              style={[
                styles.amount,
                amountNum >= 0 ? styles.positiveAmount : styles.negativeAmount,
              ]}
            >
              {amountNum >= 0 ? "+" : ""}₦
              {Math.abs(amountNum || 0).toLocaleString()}
            </Text>
            {(() => {
              const derived = getTransactionStatus(apiTx);
              return (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(derived) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {formatStatusText(derived)}
                  </Text>
                </View>
              );
            })()}
          </View>
        </View>

        {apiTx?.order?.orderTracking && (
          <DeliveryProgress currentStatus={getTransactionStatus(apiTx)} />
        )}

        {/* Transaction Info */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>
          <View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{apiTx.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatTransactionDate(apiTx.createdAt, "long")}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
                {formatStatusText(getTransactionStatus(apiTx))}
              </Text>
            </View>
            {apiTx.reference ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference</Text>
                <Text style={styles.detailValue}>{apiTx.reference}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Package Details and Contacts for ORDER/DEPOSIT with order */}
        {order && (apiTx.type === "ORDER" || apiTx.type === "DEPOSIT") && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Package & Contact Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pickup</Text>
              <Text style={styles.detailValue}>
                {(order as any)?.pickUpLocation?.address ||
                  (order as any)?.pickUpLocation ||
                  ""}
              </Text>
            </View>

            {/* Show drop-off only if not multi-delivery */}
            {!order.hasMultipleDeliveries && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Drop-off</Text>
                <Text style={styles.detailValue}>
                  {(order as any)?.dropOffLocation?.address ||
                    (order as any)?.dropOffLocation ||
                    ""}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle</Text>
              <Text style={styles.detailValue}>{order.vehicleType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ETA</Text>
              <Text style={styles.detailValue}>{order.eta}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>{order.distanceInKm} KM</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total</Text>
              <Text style={styles.detailValue}>
                ₦{Number(order.totalAmount || 0).toLocaleString()}
              </Text>
            </View>

            <View style={styles.separator} />
            <Text style={styles.subSectionTitle}>Contact Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sender</Text>
              <Text style={styles.detailValue}>{contactSenderName}</Text>
            </View>
            {contactSenderPhone ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sender Phone</Text>
                <Text style={styles.detailValue}>{contactSenderPhone}</Text>
              </View>
            ) : null}

            {/* Show single recipient only if not multi-delivery */}
            {!order.hasMultipleDeliveries && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Recipient</Text>
                  <Text style={styles.detailValue}>{contactRecipientName}</Text>
                </View>
                {contactRecipientPhone ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Recipient Phone</Text>
                    <Text style={styles.detailValue}>
                      {contactRecipientPhone}
                    </Text>
                  </View>
                ) : null}
              </>
            )}
          </View>
        )}

        {/* Multi-Delivery Destinations */}
        {order && order.hasMultipleDeliveries && order.deliveryDestinations && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>
              Delivery Destinations ({order.deliveryDestinations.length})
            </Text>
            {order.deliveryDestinations.map((destination, index) => (
              <View key={destination.id}>
                {index > 0 && <View style={styles.separator} />}
                <View style={styles.destinationContainer}>
                  <View style={styles.destinationHeader}>
                    <Text style={styles.destinationNumber}>
                      Stop {index + 1}
                    </Text>
                    {destination.delivered && (
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: "#22c55e" },
                        ]}
                      >
                        <Text style={styles.statusText}>Delivered</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>
                      {destination.dropOffLocation?.address || ""}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Recipient</Text>
                    <Text style={styles.detailValue}>
                      {destination.recipient?.name || ""}
                    </Text>
                  </View>

                  {destination.recipient?.phone && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Phone</Text>
                      <Text style={styles.detailValue}>
                        {destination.recipient.phone}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Distance</Text>
                    <Text style={styles.detailValue}>
                      {destination.distanceFromPickupKm.toFixed(2)} km
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>
                      {destination.durationFromPickup}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Delivery Fee</Text>
                    <Text style={styles.detailValue}>
                      ₦{Number(destination.deliveryFee || 0).toLocaleString()}
                    </Text>
                  </View>

                  {destination.deliveredAt && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Delivered At</Text>
                      <Text style={styles.detailValue}>
                        {formatTransactionDate(destination.deliveredAt, "long")}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    borderBottomWidth: rs(1),
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
    fontSize: rs(20),
    fontWeight: "bold",
    color: "#000",
  },
  shareButton: {
    width: rs(40),
    height: rs(40),
    justifyContent: "center",
    alignItems: "center",
  },
  shareIcon: {
    fontSize: rs(20),
    color: tzColors.primary,
  },
  placeholder: {
    width: rs(40),
  },
  content: {
    flex: 1,
    paddingHorizontal: rs(20),
    paddingTop: rs(20),
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(24),
    marginBottom: rs(20),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rs(20),
  },
  transactionIconContainer: {
    width: rs(48),
    height: rs(48),
    backgroundColor: "#f0fffe",
    borderRadius: rs(24),
    justifyContent: "center",
    alignItems: "center",
    marginRight: rs(16),
  },
  transactionIcon: {
    fontSize: rs(24),
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: rs(20),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(4),
  },
  summarySubtitle: {
    fontSize: rs(16),
    color: "#666",
  },
  amountContainer: {
    alignItems: "center",
  },
  amount: {
    fontSize: rs(32),
    fontWeight: "bold",
    marginBottom: rs(8),
  },
  positiveAmount: {
    color: "#22c55e",
  },
  negativeAmount: {
    color: "#ef4444",
  },
  statusBadge: {
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(16),
  },
  statusText: {
    fontSize: rs(12),
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    padding: rs(20),
    marginBottom: rs(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: rs(18),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(16),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: rs(12),
    borderBottomWidth: rs(1),
    gap: 10,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: rs(14),
    color: "#666",
    width: "50%",
  },
  detailValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(2),
    justifyContent: "flex-end",
  },
  detailValue: {
    fontSize: rs(14),
    fontWeight: "500",
    color: "#000",
    textAlign: "right",
    flex: 1,
    overflow: "hidden",
  },
  copyIcon: {
    fontSize: rs(12),
    marginLeft: rs(8),
    color: tzColors.primary,
  },
  actionButtons: {
    marginTop: rs(20),
    marginBottom: rs(40),
  },
  actionButton: {
    backgroundColor: tzColors.primary,
    paddingVertical: rs(16),
    borderRadius: rs(12),
    alignItems: "center",
    marginBottom: rs(12),
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: rs(2),
    borderColor: tzColors.primary,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: rs(16),
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: tzColors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: rs(18),
    color: "#666",
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: rs(20),
  },
  loadingText: {
    marginTop: rs(12),
    color: "#666",
  },
  // 404 styles
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: rs(24),
  },
  notFoundCode: {
    fontSize: rs(56),
    fontWeight: "900",
    color: "#e11d48",
    marginBottom: rs(8),
  },
  notFoundTitle: {
    fontSize: rs(20),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(6),
  },
  notFoundSubtitle: {
    fontSize: rs(14),
    color: "#666",
    textAlign: "center",
    marginBottom: rs(16),
  },
  notFoundButton: {
    backgroundColor: "#000",
    paddingHorizontal: rs(20),
    paddingVertical: rs(12),
    borderRadius: rs(12),
  },
  notFoundButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // Dividers
  separator: {
    height: rs(1),
    backgroundColor: "#f0f0f0",
    marginVertical: rs(12),
  },
  subSectionTitle: {
    fontSize: rs(16),
    fontWeight: "700",
    color: "#000",
    marginBottom: rs(6),
  },
  // Timeline
  timelineContainer: {
    marginTop: rs(4),
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: rs(16),
  },
  timelineLeft: {
    width: rs(24),
    alignItems: "center",
  },
  timelineDot: {
    width: rs(10),
    height: rs(10),
    borderRadius: rs(5),
    backgroundColor: "#00B624",
  },
  timelineLine: {
    width: rs(2),
    flex: 1,
    backgroundColor: "#e5e7eb",
    marginTop: rs(4),
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#000",
  },
  timelineNote: {
    fontSize: rs(13),
    color: "#374151",
    marginTop: rs(2),
  },
  timelineTime: {
    fontSize: rs(12),
    color: "#999",
    marginTop: rs(2),
  },
  destinationContainer: {
    marginVertical: rs(8),
  },
  destinationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(12),
  },
  destinationNumber: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#000",
  },
});
