import { DefaultAddress, LocationContext } from "@/types/booking.types";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

interface LocationInputSectionProps {
  pickupLocation: string;
  dropoffLocation: string;
  defaultAddress?: DefaultAddress | null;
  onClearPickup: () => void;
  onClearDropoff: () => void;
  onUseDefaultAddress: (type: LocationContext) => void;
}

export const LocationInputSection = memo<LocationInputSectionProps>(
  ({
    pickupLocation,
    dropoffLocation,
    defaultAddress,
    onClearPickup,
    onClearDropoff,
    onUseDefaultAddress,
  }) => {
    return (
      <View style={styles.locationSection}>
        {/* Pickup Location */}
        <View style={styles.locationInputContainer}>
          <Text style={styles.inputLabel}>📍 Pickup Location</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.locationInput}
              value={pickupLocation}
              onFocus={() =>
                router.push({
                  pathname: "/location-search",
                  params: { context: "pickup" },
                })
              }
              showSoftInputOnFocus={false}
              caretHidden
              placeholder="Where should we pick up from?"
              placeholderTextColor="#999"
            />
            {!!pickupLocation && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Clear pickup location"
                onPress={onClearPickup}
                style={styles.clearBtn}
              >
                <MaterialIcons name="cancel" size={24} color="red" />
              </TouchableOpacity>
            )}
          </View>
          {defaultAddress && (
            <TouchableOpacity
              style={styles.defaultAddrBtn}
              onPress={() => onUseDefaultAddress("pickup")}
            >
              <Text style={styles.defaultAddrBtnText}>
                Use my default address
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Connector */}
        <View style={styles.locationConnector}>
          <View style={styles.connectorLine} />
          <View style={styles.connectorDot} />
        </View>

        {/* Drop-off Location */}
        <View style={styles.locationInputContainer}>
          <Text style={styles.inputLabel}>🎯 Drop-off Location</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.locationInput}
              value={dropoffLocation}
              onFocus={() =>
                router.push({
                  pathname: "/location-search",
                  params: { context: "dropoff" },
                })
              }
              showSoftInputOnFocus={false}
              caretHidden
              placeholder="Where should we deliver to?"
              placeholderTextColor="#999"
            />
            {!!dropoffLocation && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Clear drop-off location"
                onPress={onClearDropoff}
                style={styles.clearBtn}
              >
                <MaterialIcons name="cancel" size={24} color="red" />
              </TouchableOpacity>
            )}
          </View>
          {defaultAddress && (
            <TouchableOpacity
              style={styles.defaultAddrBtn}
              onPress={() => onUseDefaultAddress("dropoff")}
            >
              <Text style={styles.defaultAddrBtnText}>
                Use my default address
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

LocationInputSection.displayName = "LocationInputSection";

const styles = StyleSheet.create({
  locationSection: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(20),
    marginBottom: rs(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: "visible",
  },
  locationInputContainer: {
    position: "relative",
    zIndex: 100,
  },
  inputLabel: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#000",
    marginBottom: rs(8),
  },
  locationInput: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: rs(12),
    paddingHorizontal: rs(12),
    paddingVertical: rs(13),
    fontSize: rs(14),
    backgroundColor: "#f8f9fa",
  },
  inputWrapper: {
    position: "relative",
  },
  clearBtn: {
    position: "absolute",
    right: rs(10),
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rs(6),
  },
  locationConnector: {
    alignItems: "center",
    paddingVertical: rs(12),
  },
  connectorLine: {
    width: rs(2),
    height: rs(20),
    backgroundColor: "#00B624",
  },
  connectorDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: "#00B624",
    marginTop: -rs(4),
  },
  defaultAddrBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f9f1",
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    borderWidth: 1,
    borderColor: "#d6f5db",
    marginTop: rs(8),
  },
  defaultAddrBtnText: {
    color: "#00B624",
    fontWeight: "600",
    fontSize: rs(12),
  },
});
