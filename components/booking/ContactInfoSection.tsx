import { AddressBookEntry, ContactInfo } from "@/types/booking.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

interface ContactInfoSectionProps {
  title: string;
  contactInfo: ContactInfo;
  onUpdateField: (field: keyof ContactInfo, value: string) => void;
  onUseMyInfo?: () => void;
  onSelectFromAddressBook?: (entry: AddressBookEntry) => void;
  onSearchAddressBook?: (query: string) => void;
  canUseMyInfo?: boolean;
  useMyInfoChecked?: boolean;
  addressBookEntries?: AddressBookEntry[];
  isLoadingAddressBook?: boolean;
  role: "sender" | "recipient";
  initialExpanded?: boolean;
}

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  title,
  contactInfo,
  onUpdateField,
  onUseMyInfo,
  onSelectFromAddressBook,
  onSearchAddressBook,
  canUseMyInfo = true,
  useMyInfoChecked = false,
  addressBookEntries = [],
  isLoadingAddressBook = false,
  role,
  initialExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded); // Use prop for initial state
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch address book when modal opens
  useEffect(() => {
    if (showAddressBookModal && onSearchAddressBook) {
      console.log(
        "ContactInfoSection - Modal opened, fetching address book for role:",
        role
      );
      // Trigger initial fetch with empty query to get all contacts
      onSearchAddressBook("");
    }
  }, [showAddressBookModal, onSearchAddressBook, role]);

  const hasContactInfo =
    contactInfo.name || contactInfo.email || contactInfo.phone;

  // Filter address book entries by role and search query
  const filteredEntries = addressBookEntries.filter((entry) => {
    const matchesRole = entry.role === role;
    if (!searchQuery.trim()) return matchesRole;

    const query = searchQuery.toLowerCase();
    return (
      matchesRole &&
      (entry.name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        entry.phone.includes(query))
    );
  });


  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (onSearchAddressBook && text.length >= 2) {
      onSearchAddressBook(text);
    } else if (onSearchAddressBook && text.length === 0) {
      // When search is cleared, fetch all contacts again
      onSearchAddressBook("");
    }
  };

  const handleSelectEntry = (entry: AddressBookEntry) => {
    onSelectFromAddressBook?.(entry);
    setShowAddressBookModal(false);
    setSearchQuery("");
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {hasContactInfo && !isExpanded && (
            <Text style={styles.previewText} numberOfLines={1}>
              {contactInfo.name || contactInfo.email || contactInfo.phone}
            </Text>
          )}
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? "−" : "+"}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {/* Use My Info Checkbox and Address Book Icon */}
          <View style={styles.actionsRow}>
            {onUseMyInfo && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={onUseMyInfo}
                disabled={!canUseMyInfo}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    useMyInfoChecked && styles.checkboxChecked,
                    !canUseMyInfo && styles.checkboxDisabled,
                  ]}
                >
                  {useMyInfoChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text
                  style={[
                    styles.checkboxLabel,
                    !canUseMyInfo && styles.checkboxLabelDisabled,
                  ]}
                >
                  Use my info
                </Text>
              </TouchableOpacity>
            )}

            {onSelectFromAddressBook && (
              <TouchableOpacity
                style={styles.addressBookIcon}
                onPress={() => setShowAddressBookModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="book-outline" size={rs(24)} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={contactInfo.name}
              onChangeText={(text) => onUpdateField("name", text)}
              placeholderTextColor="#999"
              editable={!useMyInfoChecked}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              value={contactInfo.email}
              onChangeText={(text) => onUpdateField("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
              editable={!useMyInfoChecked}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={contactInfo.phone}
              onChangeText={(text) => onUpdateField("phone", text)}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              editable={!useMyInfoChecked}
            />
          </View>
        </View>
      )}

      {/* Address Book Modal */}
      <Modal
        visible={showAddressBookModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddressBookModal(false);
          setSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {role === "sender" ? "Sender" : "Recipient"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddressBookModal(false);
                  setSearchQuery("");
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={rs(20)}
                color="#999"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, email, or phone"
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearSearchButton}
                >
                  <Ionicons name="close-circle" size={rs(20)} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {isLoadingAddressBook ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : filteredEntries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? `No ${role}s found matching "${searchQuery}"`
                    : `No ${role}s found in your address book`}
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.entriesList}
                contentContainerStyle={styles.entriesListContent}
              >
                {filteredEntries.map((entry, index) => (
                  <TouchableOpacity
                    key={`${entry.email}-${index}`}
                    style={styles.entryItem}
                    onPress={() => handleSelectEntry(entry)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.entryName}>{entry.name}</Text>
                    <Text style={styles.entryDetails}>{entry.email}</Text>
                    <Text style={styles.entryDetails}>{entry.phone}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    marginBottom: rs(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: rs(16),
  },
  headerLeft: {
    flex: 1,
    marginRight: rs(12),
  },
  sectionTitle: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#000",
    marginBottom: rs(4),
  },
  previewText: {
    fontSize: rs(13),
    color: "#666",
  },
  expandIcon: {
    fontSize: rs(24),
    fontWeight: "300",
    color: "#007AFF",
  },
  content: {
    paddingHorizontal: rs(16),
    paddingBottom: rs(16),
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rs(12),
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(4),
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rs(8),
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
  },
  checkboxDisabled: {
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  checkmark: {
    color: "#fff",
    fontSize: rs(14),
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: rs(14),
    color: "#333",
  },
  checkboxLabelDisabled: {
    color: "#999",
  },
  addressBookIcon: {
    padding: rs(8),
    borderRadius: rs(8),
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: rs(12),
  },
  label: {
    fontSize: rs(14),
    fontWeight: "500",
    color: "#333",
    marginBottom: rs(6),
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: rs(8),
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    fontSize: rs(14),
    color: "#000",
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    maxHeight: "90%",
    paddingBottom: rs(20),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: rs(16),
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: rs(18),
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    padding: rs(8),
  },
  closeButtonText: {
    fontSize: rs(24),
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: rs(8),
  },
  searchInput: {
    flex: 1,
    fontSize: rs(14),
    color: "#000",
    paddingVertical: rs(8),
  },
  clearSearchButton: {
    padding: rs(4),
    marginLeft: rs(8),
  },
  loadingContainer: {
    padding: rs(40),
    alignItems: "center",
  },
  loadingText: {
    marginTop: rs(12),
    fontSize: rs(14),
    color: "#666",
  },
  emptyContainer: {
    padding: rs(40),
    alignItems: "center",
  },
  emptyText: {
    fontSize: rs(14),
    color: "#666",
    textAlign: "center",
  },
  entriesList: {
    padding: rs(16),
  },
  entriesListContent: {
    paddingBottom: rs(20),
  },
  entryItem: {
    backgroundColor: "#f8f9fa",
    padding: rs(16),
    borderRadius: rs(12),
    marginBottom: rs(12),
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  entryName: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#000",
    marginBottom: rs(4),
  },
  entryDetails: {
    fontSize: rs(14),
    color: "#666",
    marginTop: rs(2),
  },
});
