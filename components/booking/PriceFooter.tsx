import { poppinsFonts } from "@/theme/fonts";
import React, { memo } from "react";
import {
  ActivityIndicator,
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
  isCalculating: boolean;
  isBooking: boolean;
  disabled: boolean;
  onBook: () => void;
}

export const PriceFooter = memo<PriceFooterProps>(
  ({ calculatedPrice, isCalculating, isBooking, disabled, onBook }) => {
    return (
      <View style={styles.priceContainer}>
        <View>
          {isCalculating ? (
            <View style={styles.calculatingContainer}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.calculatingText}>Calculating…</Text>
            </View>
          ) : (
            <>
              <Text style={styles.price}>
                ₦{calculatedPrice?.toLocaleString() || 0}
              </Text>
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
            <Text style={[styles.placeOrder, { opacity: disabled ? 0.5 : 1 }]}>
              Book Now
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
});
