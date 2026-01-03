import { ContactInfo } from "@/types/booking.types";
import { MaterialIcons } from "@expo/vector-icons";
import React, { memo, useEffect, useState } from "react";
import {
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

interface DeliveryRecipientSectionProps {
  deliveryIndex: number;
  recipient: ContactInfo;
  onUpdateField: (
    index: number,
    field: keyof ContactInfo,
    value: string
  ) => void;
  addressBook: any[];
  isLoadingAddressBook: boolean;
  onSearchAddressBook: (query: string) => void;
  onSelectFromAddressBook: (index: number, entry: any) => void;
  isRequired?: boolean;
  totalDeliveries?: number;
  error?: string;
}

export const DeliveryRecipientSection = memo<DeliveryRecipientSectionProps>(
  ({
    deliveryIndex,
    recipient,
    onUpdateField,
    addressBook,
    isLoadingAddressBook,
    onSearchAddressBook,
    onSelectFromAddressBook,
    isRequired = true,
    totalDeliveries = 1,
    error,
  }) => {
    const [showAddressBook, setShowAddressBook] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch address book when modal opens
    useEffect(() => {
      if (showAddressBook) {
        // Trigger initial fetch with empty query to get all contacts
        onSearchAddressBook("");
      }
    }, [showAddressBook, onSearchAddressBook]);

    const handleSelectEntry = (entry: any) => {
      onSelectFromAddressBook(deliveryIndex, entry);
      setShowAddressBook(false);
      setSearchQuery("");
    };

    const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (query.length >= 2) {
        onSearchAddressBook(query);
      } else if (query.length === 0) {
        // When search is cleared, fetch all contacts again
        onSearchAddressBook("");
      }
    };

    // Filter address book to show only recipients
    const filteredAddressBook = addressBook.filter((entry) => {
      const isRecipient = entry.role === "recipient";

      if (!searchQuery.trim()) return isRecipient;

      const query = searchQuery.toLowerCase();
      return (
        isRecipient &&
        ((entry.name && entry.name.toLowerCase().includes(query)) ||
          entry.phone.includes(query))
      );
    });

    console.log("DeliveryRecipientSection - Address Book Debug:", {
      totalEntries: addressBook.length,
      filteredCount: filteredAddressBook.length,
      searchQuery,
      sample: addressBook[0],
    });

    // Additional render logging
    if (isLoadingAddressBook) {
      console.log("DeliveryRecipientSection - RENDERING LOADING");
    } else if (filteredAddressBook.length === 0) {
      console.log("DeliveryRecipientSection - RENDERING EMPTY STATE:", {
        totalEntries: addressBook.length,
        filteredCount: filteredAddressBook.length,
        isLoading: isLoadingAddressBook,
        showModal: showAddressBook,
        searchQuery,
      });
    } else {
      console.log("DeliveryRecipientSection - RENDERING LIST:", {
        count: filteredAddressBook.length,
        entries: filteredAddressBook.map((e) => e.name),
      });
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {totalDeliveries > 1 && (
            <Text style={styles.title}>Recipient {deliveryIndex + 1}</Text>
          )}
          <TouchableOpacity
            onPress={() => setShowAddressBook(true)}
            style={styles.addressBookButton}
          >
            <MaterialIcons name="contacts" size={rs(20)} color="#007AFF" />
            <Text style={styles.addressBookText}>Address Book</Text>
          </TouchableOpacity>
        </View>

        {/* Phone */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone{isRequired ? " *" : ""}</Text>
          <TextInput
            style={[styles.textInput, error ? styles.inputError : null]}
            placeholder="Recipient phone"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={recipient.phone}
            onChangeText={(text) => onUpdateField(deliveryIndex, "phone", text)}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Address Book Modal */}
        <Modal
          visible={showAddressBook}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddressBook(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select from Address Book</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddressBook(false);
                    setSearchQuery("");
                  }}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={rs(24)} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={rs(20)} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name or phone"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>

              {/* Address Book List */}
              {isLoadingAddressBook ? (
                <View style={styles.listContainer}>
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              ) : filteredAddressBook.length === 0 ? (
                <View style={styles.listContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "No recipients found matching your search"
                      : "No recipients in address book"}
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.listContainer}
                  contentContainerStyle={styles.listContent}
                >
                  {filteredAddressBook.map((entry, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.entryItem}
                      onPress={() => handleSelectEntry(entry)}
                    >
                      <View style={styles.entryInfo}>
                        {entry.name ? (
                          <>
                            <Text style={styles.entryName}>{entry.name}</Text>
                            <Text style={styles.entryDetails}>
                              {entry.phone}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.entryName}>{entry.phone}</Text>
                        )}
                      </View>
                      <MaterialIcons
                        name="chevron-right"
                        size={rs(24)}
                        color="#999"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }
);

DeliveryRecipientSection.displayName = "DeliveryRecipientSection";

const styles = StyleSheet.create({
  container: {
    marginTop: rs(12),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(12),
  },
  title: {
    fontSize: rs(15),
    fontWeight: "600",
    color: "#333",
  },
  addressBookButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    backgroundColor: "#f0f8ff",
    borderRadius: rs(8),
  },
  addressBookText: {
    fontSize: rs(13),
    color: "#007AFF",
    marginLeft: rs(6),
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: rs(12),
  },
  inputLabel: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: rs(8),
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
    paddingBottom: rs(16),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: rs(20),
    marginBottom: rs(16),
  },
  modalTitle: {
    fontSize: rs(18),
    fontWeight: "bold",
    color: "#000",
  },
  closeButton: {
    padding: rs(4),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: rs(10),
    paddingHorizontal: rs(16),
    marginHorizontal: rs(20),
    marginBottom: rs(16),
  },
  searchInput: {
    flex: 1,
    fontSize: rs(15),
    color: "#000",
    paddingVertical: rs(12),
    marginLeft: rs(8),
  },
  listContainer: {
    paddingHorizontal: rs(20),
    paddingBottom: rs(12),
    maxHeight: "65%",
  },
  listContent: {
    paddingBottom: rs(20),
  },
  loadingText: {
    textAlign: "center",
    fontSize: rs(15),
    color: "#999",
    paddingVertical: rs(20),
  },
  emptyText: {
    textAlign: "center",
    fontSize: rs(15),
    color: "#999",
    paddingVertical: rs(20),
  },
  entryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: rs(16),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  entryInfo: {
    flex: 1,
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
  },
  inputError: {
    borderColor: "#ff4444",
    borderWidth: 1,
  },
  errorText: {
    fontSize: rs(12),
    color: "#ff4444",
    marginTop: rs(4),
    marginLeft: rs(4),
  },
});
