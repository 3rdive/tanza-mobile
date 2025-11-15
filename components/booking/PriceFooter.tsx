import { poppinsFonts } from "@/theme/fonts";
import { MultipleDeliveryPriceResponse } from "@/types/booking.types";
import { MaterialIcons } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

interface PriceFooterProps {
  calculatedPrice: number | null;
  priceBreakdown: MultipleDeliveryPriceResponse | null;
  isCalculating: boolean;
  isBooking: boolean;
  disabled: boolean;
  onBook: () => void;
}

export const PriceFooter = memo<PriceFooterProps>(
  ({
    calculatedPrice,
    priceBreakdown,
    isCalculating,
    isBooking,
    disabled,
    onBook,
  }) => {
    const [showBreakdown, setShowBreakdown] = useState(false);

    return (
      <>
        <View style={styles.priceContainer}>
          <View style={styles.priceSection}>
            {isCalculating ? (
              <View style={styles.calculatingContainer}>
                <ActivityIndicator size="small" color="#000" />
                <Text style={styles.calculatingText}>Calculating…</Text>
              </View>
            ) : (
              <>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    ₦{calculatedPrice?.toLocaleString() || 0}
                  </Text>
                  {priceBreakdown && (
                    <TouchableOpacity
                      onPress={() => setShowBreakdown(true)}
                      style={styles.breakdownButton}
                    >
                      <MaterialIcons
                        name="info-outline"
                        size={rs(20)}
                        color="#007AFF"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.amountSubtitle}>TOTAL AMOUNT</Text>
              </>
            )}
          </View>
          <TouchableOpacity onPress={onBook} disabled={disabled}>
            {isBooking ? (
              <View style={styles.placeOrder}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.bookingText}>Booking…</Text>
              </View>
            ) : (
              <Text
                style={[styles.placeOrder, { opacity: disabled ? 0.5 : 1 }]}
              >
                Book Now
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Price Breakdown Modal */}
        <Modal
          visible={showBreakdown}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowBreakdown(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Price Breakdown</Text>
                <TouchableOpacity
                  onPress={() => setShowBreakdown(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={rs(24)} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.breakdownContent}>
                {priceBreakdown && (
                  <>
                    {/* Individual Deliveries */}
                    <Text style={styles.sectionTitle}>Deliveries</Text>
                    {priceBreakdown.deliveries.map((delivery, index) => (
                      <View key={index} style={styles.deliveryItem}>
                        <View style={styles.deliveryHeader}>
                          <Text style={styles.deliveryNumber}>
                            Delivery {index + 1}
                          </Text>
                          <Text style={styles.deliveryFee}>
                            ₦{delivery.deliveryFee.toLocaleString()}
                          </Text>
                        </View>
                        <Text style={styles.deliveryDetail}>
                          Distance:{" "}
                          {delivery.distance_from_pickup_km.toFixed(2)} km
                        </Text>
                        <Text style={styles.deliveryDetail}>
                          Duration: {delivery.duration_from_pickup}
                        </Text>
                      </View>
                    ))}

                    {/* Summary */}
                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        Total Delivery Fee
                      </Text>
                      <Text style={styles.summaryValue}>
                        ₦{priceBreakdown.totalDeliveryFee.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Service Charge</Text>
                      <Text style={styles.summaryValue}>
                        ₦{priceBreakdown.serviceCharge.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                      <Text style={styles.totalLabel}>Total Amount</Text>
                      <Text style={styles.totalValue}>
                        ₦{priceBreakdown.totalAmount.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.infoBox}>
                      <MaterialIcons
                        name="info"
                        size={rs(16)}
                        color="#007AFF"
                      />
                      <Text style={styles.infoText}>
                        Total Distance:{" "}
                        {priceBreakdown.totalDistanceKm.toFixed(2)} km
                      </Text>
                    </View>

                    <View style={styles.infoBox}>
                      <MaterialIcons
                        name="access-time"
                        size={rs(16)}
                        color="#007AFF"
                      />
                      <Text style={styles.infoText}>
                        Estimated Duration:{" "}
                        {priceBreakdown.estimatedTotalDuration}
                      </Text>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
    );
  }
);

PriceFooter.displayName = "PriceFooter";

const styles = StyleSheet.create({
  priceContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderTopWidth: 1,
    borderTopColor: "#eee",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  priceSection: {
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  breakdownButton: {
    padding: rs(4),
  },
  calculatingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calculatingText: {
    marginLeft: 8,
    fontSize: rs(16),
    color: "#333",
  },
  price: {
    fontSize: rs(32),
    fontWeight: "bold",
    color: "black",
  },
  amountSubtitle: {
    textDecorationLine: "underline",
    fontSize: rs(13),
    fontWeight: "bold",
  },
  placeOrder: {
    backgroundColor: "black",
    color: "white",
    borderRadius: rs(12),
    paddingHorizontal: rs(20),
    paddingVertical: rs(12),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: rs(20),
    fontWeight: "600",
    fontFamily: poppinsFonts.bold,
  },
  bookingText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: rs(18),
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    maxHeight: "80%",
    paddingTop: rs(20),
    paddingBottom: rs(40),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: rs(20),
    marginBottom: rs(20),
  },
  modalTitle: {
    fontSize: rs(20),
    fontWeight: "bold",
    color: "#000",
  },
  closeButton: {
    padding: rs(4),
  },
  breakdownContent: {
    flex: 1,
    paddingHorizontal: rs(20),
  },
  sectionTitle: {
    fontSize: rs(16),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(12),
  },
  deliveryItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: rs(12),
    padding: rs(16),
    marginBottom: rs(12),
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(8),
  },
  deliveryNumber: {
    fontSize: rs(15),
    fontWeight: "600",
    color: "#333",
  },
  deliveryFee: {
    fontSize: rs(16),
    fontWeight: "bold",
    color: "#007AFF",
  },
  deliveryDetail: {
    fontSize: rs(13),
    color: "#666",
    marginTop: rs(4),
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: rs(16),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(12),
  },
  summaryLabel: {
    fontSize: rs(15),
    color: "#666",
  },
  summaryValue: {
    fontSize: rs(15),
    fontWeight: "600",
    color: "#333",
  },
  totalLabel: {
    fontSize: rs(18),
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: rs(20),
    fontWeight: "bold",
    color: "#000",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    borderRadius: rs(8),
    padding: rs(12),
    marginTop: rs(12),
  },
  infoText: {
    fontSize: rs(14),
    color: "#007AFF",
    marginLeft: rs(8),
    flex: 1,
  },
});
