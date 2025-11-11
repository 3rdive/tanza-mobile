import React, { memo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

interface NoteSectionProps {
  noteForRider: string;
  onChangeNote: (text: string) => void;
}

export const NoteSection = memo<NoteSectionProps>(
  ({ noteForRider, onChangeNote }) => {
    return (
      <View style={styles.noteSection}>
        <Text style={styles.sectionTitle}>💬 Note for Rider (Optional)</Text>
        <TextInput
          style={styles.noteInput}
          value={noteForRider}
          onChangeText={onChangeNote}
          placeholder="Any special instructions for the rider..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>
    );
  }
);

NoteSection.displayName = "NoteSection";

const styles = StyleSheet.create({
  noteSection: {
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
  sectionTitle: {
    fontSize: rs(18),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(16),
  },
  noteInput: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: rs(12),
    paddingHorizontal: rs(16),
    paddingVertical: rs(16),
    fontSize: rs(16),
    backgroundColor: "#f8f9fa",
    textAlignVertical: "top",
    minHeight: rs(80),
  },
});
