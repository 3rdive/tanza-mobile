import { DeliveryLocation } from "@/types/booking.types";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

const MAX_DELIVERIES = 10;

interface DeliveryLocationsSectionProps {
  deliveryLocations: DeliveryLocation[];
  onAddDelivery: () => void;
  onRemoveDelivery: (index: number) => void;
  onClearDelivery: (index: number) => void;
}

export const DeliveryLocationsSection = memo<DeliveryLocationsSectionProps>(
  ({ deliveryLocations, onAddDelivery, onRemoveDelivery, onClearDelivery }) => {
    const handleAddDelivery = () => {
      if (deliveryLocations.length >= MAX_DELIVERIES) {
        Alert.alert(
          "Maximum Reached",
          `You can add up to ${MAX_DELIVERIES} delivery locations.`
        );
        return;
      }
      onAddDelivery();
    };

    const handleRemoveDelivery = (index: number) => {
      if (deliveryLocations.length === 1) {
        Alert.alert(
          "Cannot Remove",
          "You must have at least one delivery location."
        );
        return;
      }

      Alert.alert("Remove Delivery", `Remove delivery location ${index + 1}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onRemoveDelivery(index),
        },
      ]);
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚚 Delivery Locations</Text>
          <Text style={styles.deliveryCount}>
            {deliveryLocations.length} / {MAX_DELIVERIES}
          </Text>
        </View>

        {deliveryLocations.map((delivery, index) => (
          <View key={index} style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <Text style={styles.deliveryNumber}>Delivery {index + 1}</Text>
              {deliveryLocations.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveDelivery(index)}
                  style={styles.removeButton}
                >
                  <MaterialIcons name="close" size={rs(20)} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>

            {/* Location Input */}
            <View style={styles.locationInputContainer}>
              <Text style={styles.inputLabel}>Drop-off Address</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.locationInput}
                  value={delivery.address}
                  onFocus={() =>
                    router.push({
                      pathname: "/location-search",
                      params: { context: `delivery-${index}` },
                    })
                  }
                  showSoftInputOnFocus={false}
                  placeholder="Select drop-off location"
                  placeholderTextColor="#999"
                />
                {delivery.address && (
                  <TouchableOpacity
                    onPress={() => onClearDelivery(index)}
                    style={styles.clearButton}
                  >
                    <MaterialIcons name="close" size={rs(18)} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Recipient Info Title */}
            <Text style={styles.recipientTitle}>Recipient Information</Text>

            {/* Recipient Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Recipient phone"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={delivery.recipient.phone}
                // This will be handled by parent component
                editable={false}
              />
            </View>
          </View>
        ))}

        {/* Add Delivery Button */}
        {deliveryLocations.length < MAX_DELIVERIES && (
          <TouchableOpacity
            onPress={handleAddDelivery}
            style={styles.addButton}
          >
            <MaterialIcons name="add-circle" size={rs(24)} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Another Delivery</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

DeliveryLocationsSection.displayName = "DeliveryLocationsSection";

const styles = StyleSheet.create({
  section: {
    marginBottom: rs(20),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(12),
  },
  sectionTitle: {
    fontSize: rs(18),
    fontWeight: "bold",
    color: "#000",
  },
  deliveryCount: {
    fontSize: rs(14),
    color: "#666",
    fontWeight: "600",
  },
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    padding: rs(16),
    marginBottom: rs(12),
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(12),
  },
  deliveryNumber: {
    fontSize: rs(16),
    fontWeight: "bold",
    color: "#007AFF",
  },
  removeButton: {
    padding: rs(4),
  },
  locationInputContainer: {
    marginBottom: rs(12),
  },
  inputLabel: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: rs(8),
  },
  inputWrapper: {
    position: "relative",
  },
  locationInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: rs(10),
    paddingHorizontal: rs(16),
    paddingVertical: rs(14),
    fontSize: rs(15),
    color: "#000",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingRight: rs(45),
  },
  clearButton: {
    position: "absolute",
    right: rs(12),
    top: "50%",
    transform: [{ translateY: -rs(9) }],
    padding: rs(4),
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: rs(12),
  },
  recipientTitle: {
    fontSize: rs(15),
    fontWeight: "600",
    color: "#333",
    marginBottom: rs(12),
  },
  inputContainer: {
    marginBottom: rs(12),
  },
  textInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: rs(10),
    paddingHorizontal: rs(16),
    paddingVertical: rs(14),
    fontSize: rs(15),
    color: "#000",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: rs(12),
    padding: rs(16),
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: rs(8),
  },
});
