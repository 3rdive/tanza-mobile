import React, { memo } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

interface UrgencyModalProps {
  visible: boolean;
  calculatedPrice: number | null;
  urgencyFeeInput: string;
  selectedPercentage: number | null;
  onCancel: () => void;
  onConfirm: () => void;
  onSelectPercentage: (percentage: number) => void;
  onChangeInput: (text: string) => void;
}

export const UrgencyModal = memo<UrgencyModalProps>(
  ({
    visible,
    calculatedPrice,
    urgencyFeeInput,
    selectedPercentage,
    onCancel,
    onConfirm,
    onSelectPercentage,
    onChangeInput,
  }) => {
    const percentages = [5, 10, 15];

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Urgency Fee</Text>
            <Text style={styles.modalSubtitle}>
              Choose a percentage of the delivery fee or enter a custom amount
            </Text>

            {/* Percentage Options */}
            <Text style={styles.percentageOptionsTitle}>
              Quick Percentage Options
            </Text>
            <View style={styles.percentageOptionsContainer}>
              {percentages.map((percentage) => (
                <TouchableOpacity
                  key={percentage}
                  style={[
                    styles.percentageOption,
                    selectedPercentage === percentage &&
                      styles.percentageOptionActive,
                  ]}
                  onPress={() => onSelectPercentage(percentage)}
                >
                  <Text
                    style={[
                      styles.percentageOptionText,
                      selectedPercentage === percentage &&
                        styles.percentageOptionTextActive,
                    ]}
                  >
                    {percentage}%
                  </Text>
                  {calculatedPrice && (
                    <Text
                      style={[
                        styles.percentageAmount,
                        selectedPercentage === percentage &&
                          styles.percentageAmountActive,
                      ]}
                    >
                      ₦
                      {Math.round(
                        (calculatedPrice * percentage) / 100
                      ).toLocaleString()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* OR Separator */}
            <View style={styles.orSeparator}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            {/* Manual Amount Input */}
            <Text style={styles.manualInputTitle}>Enter Custom Amount</Text>
            <View style={styles.feeInputContainer}>
              <TextInput
                style={styles.feeInput}
                value={urgencyFeeInput}
                onChangeText={onChangeInput}
                placeholder="Enter amount (e.g., 500)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                returnKeyType="done"
              />
              <Text style={styles.feeInputSuffix}>₦</Text>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={onCancel}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={onConfirm}
              >
                <Text style={styles.modalButtonConfirmText}>Set Fee</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

UrgencyModal.displayName = "UrgencyModal";

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(24),
    marginHorizontal: rs(20),
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: rs(20),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: rs(8),
  },
  modalSubtitle: {
    fontSize: rs(14),
    color: "#666",
    textAlign: "center",
    marginBottom: rs(24),
  },
  percentageOptionsTitle: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#000",
    marginBottom: rs(12),
  },
  percentageOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: rs(20),
  },
  percentageOption: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: rs(12),
    padding: rs(16),
    marginHorizontal: rs(4),
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  percentageOptionActive: {
    backgroundColor: "#f0fff4",
    borderColor: "#00B624",
  },
  percentageOptionText: {
    fontSize: rs(16),
    fontWeight: "bold",
    color: "#666",
    marginBottom: rs(4),
  },
  percentageOptionTextActive: {
    color: "#00B624",
  },
  percentageAmount: {
    fontSize: rs(12),
    color: "#999",
    fontWeight: "600",
  },
  percentageAmountActive: {
    color: "#00B624",
  },
  orSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: rs(20),
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  orText: {
    marginHorizontal: rs(16),
    fontSize: rs(14),
    color: "#666",
    fontWeight: "600",
  },
  manualInputTitle: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#000",
    marginBottom: rs(12),
  },
  feeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: rs(12),
    paddingHorizontal: rs(16),
    marginBottom: rs(24),
    backgroundColor: "#f8f9fa",
  },
  feeInput: {
    flex: 1,
    paddingVertical: rs(16),
    fontSize: rs(16),
    color: "#000",
  },
  feeInputSuffix: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#00B624",
    marginLeft: rs(8),
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: rs(16),
    marginRight: rs(8),
    borderRadius: rs(12),
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalButtonCancelText: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#666",
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: rs(16),
    marginLeft: rs(8),
    borderRadius: rs(12),
    backgroundColor: "#00B624",
    alignItems: "center",
  },
  modalButtonConfirmText: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#fff",
  },
});
