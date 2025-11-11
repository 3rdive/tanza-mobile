import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

interface UrgentToggleProps {
  isUrgent: boolean;
  urgencyFee: number;
  disabled: boolean;
  onToggle: () => void;
}

export const UrgentToggle = memo<UrgentToggleProps>(
  ({ isUrgent, urgencyFee, disabled, onToggle }) => {
    return (
      <View style={styles.urgentSection}>
        <TouchableOpacity
          style={[
            styles.urgentToggleButton,
            disabled && styles.urgentToggleDisabled,
          ]}
          disabled={disabled}
          onPress={onToggle}
        >
          <View
            style={[
              styles.toggleSwitch,
              isUrgent && styles.toggleSwitchActive,
              disabled && styles.toggleSwitchDisabled,
            ]}
          >
            <View
              style={[styles.toggleKnob, isUrgent && styles.toggleKnobActive]}
            />
          </View>
          <View style={styles.urgentTextContainer}>
            <Text
              style={[
                styles.urgentLabel,
                disabled && styles.urgentLabelDisabled,
              ]}
            >
              Urgent Delivery
            </Text>
            {isUrgent && urgencyFee > 0 && (
              <Text style={styles.urgentFeeText}>
                +₦{urgencyFee.toLocaleString()} urgency fee
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
);

UrgentToggle.displayName = "UrgentToggle";

const styles = StyleSheet.create({
  urgentSection: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(20),
    marginBottom: rs(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urgentToggleButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  urgentToggleDisabled: {
    opacity: 0.5,
  },
  toggleSwitch: {
    width: rs(50),
    height: rs(30),
    borderRadius: rs(15),
    backgroundColor: "#e0e0e0",
    marginRight: rs(8),
    justifyContent: "center",
    paddingHorizontal: rs(2),
  },
  toggleSwitchActive: {
    backgroundColor: "#00B624",
  },
  toggleSwitchDisabled: {
    opacity: 0.5,
  },
  toggleKnob: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(13),
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  urgentTextContainer: {
    marginLeft: rs(8),
  },
  urgentLabel: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#000",
  },
  urgentLabelDisabled: {
    color: "#999",
  },
  urgentFeeText: {
    fontSize: rs(12),
    color: "#00B624",
    fontWeight: "600",
    marginTop: rs(2),
  },
});
