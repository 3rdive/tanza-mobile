import React, { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

interface BookingOverlayProps {
  visible: boolean;
}

export const BookingOverlay = memo<BookingOverlayProps>(({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.bookingOverlay} pointerEvents="auto">
      <View style={styles.bookingOverlayBox}>
        <ActivityIndicator size="large" color="#00B624" />
        <Text style={styles.bookingOverlayText}>Booking your ride…</Text>
      </View>
    </View>
  );
});

BookingOverlay.displayName = "BookingOverlay";

const styles = StyleSheet.create({
  bookingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookingOverlayBox: {
    backgroundColor: "#fff",
    paddingVertical: rs(20),
    paddingHorizontal: rs(24),
    borderRadius: rs(12),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  bookingOverlayText: {
    marginTop: rs(10),
    fontSize: rs(16),
    fontWeight: "600",
    color: "#222",
  },
});
