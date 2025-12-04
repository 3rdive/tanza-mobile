import {
  BookingOverlay,
  ContactInfoSection,
  DeliveryRecipientSection,
  NoteSection,
  PriceFooter,
  UrgencyModal,
  UrgentToggle,
} from "@/components/booking";
import { useBookOrder } from "@/hooks/use-book-order.hook";
import {
  useBookingAnimations,
  useBookingForm,
} from "@/hooks/use-booking-form.hook";
import { usePriceCalculation } from "@/hooks/use-price-calculation.hook";
import { useUrgencyModal } from "@/hooks/use-urgency-modal.hook";
import { orderService } from "@/lib/api";
import { useAppDispatch, useAppSelector, useUser } from "@/redux/hooks/hooks";
import { clearSelectedLocation } from "@/redux/slices/locationSearchSlice";
import { Coordinates } from "@/types/booking.types";
import {
  canSubmitBooking,
  hasDuplicateRecipients,
} from "@/utils/booking.utils";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

const MAX_DELIVERIES = 10;

export default function BookLogisticsScreen() {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const selected = useAppSelector(
    (s) => (s as any).locationSearch?.selected || null,
  );
  const { send_type } = useLocalSearchParams();
  const { user } = useUser();

  // Booking form + animations
  const {
    formData,
    pickupCoords,
    isBooking,
    setIsBooking,
    updateField,
    updateSenderField,
    clearPickup,
    setPickupLocation,
    addDeliveryLocation,
    removeDeliveryLocation,
    updateDeliveryLocation,
    clearDeliveryLocation,
    updateDeliveryRecipient,
    resetUrgency,
    clearAllStates,
  } = useBookingForm();

  const { slideAnim, fadeAnim, animatePriceAppearance } =
    useBookingAnimations();

  const { calculatedPrice, priceBreakdown, isCalculating } =
    usePriceCalculation(
      pickupCoords,
      formData.deliveryLocations,
      formData.isUrgent,
      formData.urgencyFee,
      animatePriceAppearance,
    );

  const {
    showUrgencyModal,
    urgencyFeeInput,
    selectedPercentage,
    openModal,
    closeModal,
    selectPercentage,
    setCustomInput,
    calculateFeeAmount,
    resetUrgencyInputs,
  } = useUrgencyModal(calculatedPrice);

  // Address book & 'use my info' logic extracted to a hook for clarity
  const {
    addressBook,
    isLoadingAddressBook,
    useSenderMyInfo,
    handleUseSenderMyInfo,
    handleSelectSenderFromAddressBook,
    handleSearchAddressBook,
  } = useBookOrder({
    user,
    updateSenderField,
    updateRecipientField: (field, value) => {
      // Not used anymore, but hook still expects it
    },
    isFocused,
  });

  // Clear booking flag on unmount
  useEffect(() => {
    return () => setIsBooking(false);
  }, [setIsBooking]);

  // Handle location selection from search screen
  useEffect(() => {
    if (!isFocused || !selected) return;

    const text = (selected as any).title || (selected as any).subtitle || "";
    const coords: Coordinates | null =
      (selected as any).lat && (selected as any).lon
        ? { lat: (selected as any).lat, lon: (selected as any).lon }
        : null;

    const context = (selected as any).context as string;

    if (context === "pickup" && coords) {
      setPickupLocation(text, coords);
    } else if (context?.startsWith("delivery-") && coords) {
      const index = parseInt(context.split("-")[1], 10);
      if (
        !isNaN(index) &&
        index >= 0 &&
        index < formData.deliveryLocations.length
      ) {
        updateDeliveryLocation(index, text, coords);
      }
    }

    dispatch(clearSelectedLocation());
  }, [
    dispatch,
    isFocused,
    selected,
    setPickupLocation,
    updateDeliveryLocation,
    formData.deliveryLocations.length,
  ]);

  const handleClearPickup = useCallback(() => {
    clearPickup();
    if (formData.isUrgent) {
      resetUrgency();
      resetUrgencyInputs();
    }
  }, [clearPickup, formData.isUrgent, resetUrgency, resetUrgencyInputs]);

  const handleClearDelivery = useCallback(
    (index: number) => {
      clearDeliveryLocation(index);
      if (formData.isUrgent) {
        resetUrgency();
        resetUrgencyInputs();
      }
    },
    [
      clearDeliveryLocation,
      formData.isUrgent,
      resetUrgency,
      resetUrgencyInputs,
    ],
  );

  const handleAddDelivery = useCallback(() => {
    if (formData.deliveryLocations.length >= MAX_DELIVERIES) {
      Alert.alert(
        "Maximum Reached",
        `You can add up to ${MAX_DELIVERIES} delivery locations.`,
      );
      return;
    }
    addDeliveryLocation();
  }, [formData.deliveryLocations.length, addDeliveryLocation]);

  const handleRemoveDelivery = useCallback(
    (index: number) => {
      if (formData.deliveryLocations.length === 1) {
        Alert.alert(
          "Cannot Remove",
          "You must have at least one delivery location.",
        );
        return;
      }

      Alert.alert("Remove Delivery", `Remove delivery location ${index + 1}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeDeliveryLocation(index),
        },
      ]);
    },
    [formData.deliveryLocations.length, removeDeliveryLocation],
  );

  const handleSelectRecipientFromAddressBook = useCallback(
    (index: number, entry: any) => {
      updateDeliveryRecipient(index, "name", entry.name);
      updateDeliveryRecipient(index, "email", entry.email || "");
      updateDeliveryRecipient(index, "phone", entry.phone);
    },
    [updateDeliveryRecipient],
  );

  const handleUrgentToggle = useCallback(() => {
    if (!formData.isUrgent) {
      openModal();
    } else {
      resetUrgency();
      resetUrgencyInputs();
    }
  }, [formData.isUrgent, openModal, resetUrgency, resetUrgencyInputs]);

  const handleConfirmUrgencyFee = useCallback(() => {
    const feeAmount = calculateFeeAmount();

    if (feeAmount === null) {
      Alert.alert(
        feeAmount === null && !selectedPercentage && !urgencyFeeInput
          ? "No selection"
          : "Invalid input",
        feeAmount === null && !selectedPercentage && !urgencyFeeInput
          ? "Please select a percentage or enter a custom amount"
          : "Please enter a valid amount",
      );
      return;
    }

    updateField("isUrgent", true);
    updateField("urgencyFee", feeAmount);
    closeModal();

    const feeSource = selectedPercentage
      ? `${selectedPercentage}% of delivery fee`
      : "custom amount";

    Alert.alert(
      "Urgency Fee Set",
      `Your delivery will be prioritized with an urgency fee of ₦${feeAmount.toLocaleString()} (${feeSource})`,
      [{ text: "OK" }],
    );
  }, [
    calculateFeeAmount,
    selectedPercentage,
    urgencyFeeInput,
    updateField,
    closeModal,
  ]);

  const handleBooking = useCallback(async () => {
    if (!formData.pickupLocation || !pickupCoords) {
      Alert.alert(
        "Missing Information",
        "Please select pickup location from the suggestions",
      );
      return;
    }

    // Validate deliveries
    const validDeliveries = formData.deliveryLocations.filter(
      (d) => d.address && d.coordinates,
    );

    if (validDeliveries.length === 0) {
      Alert.alert(
        "Missing Information",
        "Please add at least one delivery location",
      );
      return;
    }

    // Check all recipients have required info
    const incompleteRecipient = formData.deliveryLocations.find((d) => {
      if (formData.deliveryLocations.length === 1) {
        // For single delivery, only address is required
        return !d.address || !d.coordinates;
      } else {
        // For multiple deliveries, name and phone are required
        return (
          !d.recipient.name ||
          !d.recipient.phone ||
          !d.address ||
          !d.coordinates
        );
      }
    });

    if (incompleteRecipient) {
      if (formData.deliveryLocations.length === 1) {
        Alert.alert("Missing Information", "Please select a drop-off address");
      } else {
        Alert.alert(
          "Missing Recipient Information",
          "Please fill in name and phone number for all recipients",
        );
      }
      return;
    }

    // Check for duplicate recipients
    if (hasDuplicateRecipients(formData.deliveryLocations)) {
      Alert.alert(
        "Duplicate Recipients",
        "You cannot send to the same recipient twice. Please use unique recipients for each delivery.",
      );
      return;
    }

    if (!formData.sender.name || !formData.sender.phone) {
      Alert.alert(
        "Missing Sender Information",
        "Please fill in sender's name and phone number",
      );
      return;
    }

    if (!calculatedPrice) {
      Alert.alert(
        "Price Calculation",
        "Please wait for price calculation to complete",
      );
      return;
    }

    const deliveryCount = validDeliveries.length;
    const deliveryText =
      deliveryCount === 1 ? "1 delivery" : `${deliveryCount} deliveries`;

    Alert.alert(
      "Confirm Booking",
      `Book ${deliveryText} for ₦${calculatedPrice.toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book Now",
          onPress: async () => {
            setIsBooking(true);
            try {
              const res = await orderService.createMultipleDelivery({
                sender: {
                  name: formData.sender.name,
                  email: formData.sender.email,
                  phone: formData.sender.phone,
                },
                pickUpAddress: formData.pickupLocation,
                pickUpCoordinates: [pickupCoords.lon, pickupCoords.lat],
                deliveryLocations: validDeliveries.map((d) => ({
                  address: d.address,
                  coordinates: [d.coordinates!.lon, d.coordinates!.lat],
                  recipient: {
                    name: d.recipient.name,
                    email: d.recipient.email,
                    phone: d.recipient.phone,
                  },
                })),
                userOrderRole: (send_type ?? "sender") as string,
                noteForRider: formData.noteForRider || null,
                isUrgent: formData.isUrgent,
                urgencyFee: formData.isUrgent ? formData.urgencyFee : undefined,
              });

              if (res?.success) {
                Alert.alert("Success", "Order created successfully", [
                  {
                    text: "OK",
                    onPress: () => {
                      clearAllStates();
                      router.push("/(tabs)/history");
                    },
                  },
                ]);
              } else {
                const msg = res?.message || "Unable to create order";
                if (/insufficient balance/i.test(msg)) {
                  Alert.alert(
                    "Insufficient Balance",
                    "Your wallet balance is insufficient. Would you like to fund your wallet now?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Fund Wallet",
                        onPress: () => router.push("/payment"),
                      },
                    ],
                  );
                } else {
                  Alert.alert("Booking Failed", msg);
                }
              }
            } catch (e: any) {
              const msg =
                e?.response?.data?.message ||
                e?.message ||
                "Unable to create order";
              if (/insufficient balance/i.test(String(msg))) {
                Alert.alert(
                  "Insufficient Balance",
                  "Your wallet balance is insufficient. Would you like to fund your wallet now?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Fund Wallet",
                      onPress: () => router.push("/payment"),
                    },
                  ],
                );
              } else {
                Alert.alert("Booking Failed", String(msg));
              }
            } finally {
              setIsBooking(false);
            }
          },
        },
      ],
    );
  }, [
    formData,
    pickupCoords,
    calculatedPrice,
    send_type,
    setIsBooking,
    clearAllStates,
  ]);

  const isSubmitDisabled = !canSubmitBooking(
    formData.pickupLocation,
    pickupCoords,
    formData.deliveryLocations,
    calculatedPrice,
    isCalculating,
    isBooking,
    formData.sender,
  );

  const isUrgentDisabled =
    !formData.pickupLocation ||
    !formData.deliveryLocations.some((d) => d.address && d.coordinates);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Logistics</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: rs(140) }}
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Pickup Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons
                name="map-marker"
                size={rs(18)}
                color="#00B624"
              />{" "}
              Pickup Information
            </Text>
            <View style={styles.pickupCard}>
              <View style={styles.locationInputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.locationInput}
                    value={formData.pickupLocation}
                    onFocus={() =>
                      router.push({
                        pathname: "/location-search",
                        params: { context: "pickup" },
                      })
                    }
                    showSoftInputOnFocus={false}
                    placeholder="Select pickup location"
                    placeholderTextColor="#999"
                  />
                  {formData.pickupLocation && (
                    <TouchableOpacity
                      onPress={handleClearPickup}
                      style={styles.clearButton}
                    >
                      <MaterialIcons name="close" size={rs(18)} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <ContactInfoSection
                title="Sender Information"
                contactInfo={formData.sender}
                onUpdateField={updateSenderField}
                onUseMyInfo={handleUseSenderMyInfo}
                onSelectFromAddressBook={handleSelectSenderFromAddressBook}
                onSearchAddressBook={handleSearchAddressBook}
                canUseMyInfo={true}
                useMyInfoChecked={useSenderMyInfo}
                addressBookEntries={addressBook}
                isLoadingAddressBook={isLoadingAddressBook}
                role="sender"
                initialExpanded={true}
              />
            </View>
          </View>

          {/* Delivery Locations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                <MaterialCommunityIcons
                  name="truck-delivery"
                  size={rs(18)}
                  color="#00B624"
                />{" "}
                Delivery Locations
              </Text>
              <Text style={styles.deliveryCount}>
                {formData.deliveryLocations.length} / {MAX_DELIVERIES}
              </Text>
            </View>

            {formData.deliveryLocations.map((delivery, index) => (
              <View key={index} style={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                  {formData.deliveryLocations.length > 1 && (
                    <Text style={styles.deliveryNumber}>
                      Delivery {index + 1}
                    </Text>
                  )}
                  {formData.deliveryLocations.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveDelivery(index)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons
                        name="close"
                        size={rs(20)}
                        color="#ff4444"
                      />
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
                        onPress={() => handleClearDelivery(index)}
                        style={styles.clearButton}
                      >
                        <MaterialIcons
                          name="close"
                          size={rs(18)}
                          color="#666"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Recipient Info */}
                <DeliveryRecipientSection
                  deliveryIndex={index}
                  recipient={delivery.recipient}
                  onUpdateField={updateDeliveryRecipient}
                  addressBook={addressBook}
                  isLoadingAddressBook={isLoadingAddressBook}
                  onSearchAddressBook={handleSearchAddressBook}
                  onSelectFromAddressBook={handleSelectRecipientFromAddressBook}
                  isRequired={formData.deliveryLocations.length > 1}
                  totalDeliveries={formData.deliveryLocations.length}
                />
              </View>
            ))}

            {/* Add Delivery Button */}
            {formData.deliveryLocations.length < MAX_DELIVERIES && (
              <TouchableOpacity
                onPress={handleAddDelivery}
                style={styles.addButton}
              >
                <MaterialIcons
                  name="add-circle"
                  size={rs(24)}
                  color="#007AFF"
                />
                <Text style={styles.addButtonText}>Add Another Delivery</Text>
              </TouchableOpacity>
            )}
          </View>

          <UrgentToggle
            isUrgent={formData.isUrgent}
            urgencyFee={formData.urgencyFee}
            disabled={isUrgentDisabled}
            onToggle={handleUrgentToggle}
          />

          <NoteSection
            noteForRider={formData.noteForRider}
            onChangeNote={(text) => updateField("noteForRider", text)}
          />
        </Animated.View>
      </ScrollView>

      <PriceFooter
        calculatedPrice={calculatedPrice}
        priceBreakdown={priceBreakdown}
        isCalculating={isCalculating}
        isBooking={isBooking}
        disabled={isSubmitDisabled}
        onBook={handleBooking}
      />

      <BookingOverlay visible={isBooking} />

      <UrgencyModal
        visible={showUrgencyModal}
        calculatedPrice={calculatedPrice}
        urgencyFeeInput={urgencyFeeInput}
        selectedPercentage={selectedPercentage}
        onCancel={closeModal}
        onConfirm={handleConfirmUrgencyFee}
        onSelectPercentage={selectPercentage}
        onChangeInput={setCustomInput}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(20),
    paddingVertical: rs(16),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: rs(20),
    fontWeight: "bold",
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: rs(10),
    paddingTop: rs(15),
  },
  formContainer: {
    paddingBottom: rs(20),
  },
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
    marginBottom: rs(12),
  },
  deliveryCount: {
    fontSize: rs(14),
    color: "#666",
    fontWeight: "600",
  },
  locationInputContainer: {
    marginBottom: rs(12),
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
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    padding: rs(16),
    marginBottom: rs(12),
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pickupCard: {
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
  inputLabel: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: rs(8),
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
