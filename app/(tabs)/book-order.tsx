import {
  BookingOverlay,
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
import { orderService, walletService } from "@/lib/api";
import {
  useAppDispatch,
  useAppSelector,
  useUser,
  useWallet,
} from "@/redux/hooks/hooks";
import { clearSelectedLocation } from "@/redux/slices/locationSearchSlice";
import { Coordinates } from "@/types/booking.types";
import { hasDuplicateRecipients } from "@/utils/booking.utils";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

const MAX_DELIVERIES = 10;

export default function BookLogisticsScreen() {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const selected = useAppSelector(
    (s) => (s as any).locationSearch?.selected || null
  );
  const { send_type } = useLocalSearchParams();
  const { user } = useUser();
  const { balance, setWallet } = useWallet();
  const [isFetchingWallet, setIsFetchingWallet] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

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
      animatePriceAppearance
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
    handleSearchAddressBook,
  } = useBookOrder({
    user,
    updateSenderField,
    updateRecipientField: (field, value) => {
      // Not used anymore, but hook still expects it
    },
    isFocused,
  });

  // Always refresh wallet on focus so balance reflects latest state
  useEffect(() => {
    if (!isFocused) return;

    let isActive = true;

    const fetchWallet = async () => {
      setIsFetchingWallet(true);
      try {
        const res = await walletService.getWallet();
        if (!isActive) return;
        if (res?.success && res.data) {
          setWallet(res.data);
        }
      } catch (error) {
        console.warn("Failed to fetch wallet", error);
      } finally {
        if (isActive) {
          setIsFetchingWallet(false);
        }
      }
    };

    fetchWallet();

    return () => {
      isActive = false;
    };
  }, [isFocused, setWallet]);

  // Automatically switch between Wallet and Cash based on balance
  useEffect(() => {
    if (calculatedPrice === null) return;

    const isSufficient = balance >= calculatedPrice;

    // Only force switch to Cash if balance is insufficient and we are trying to use wallet
    if (!isSufficient && !formData.isCashPayment) {
      updateField("isCashPayment", true);
    }
  }, [balance, calculatedPrice, formData.isCashPayment, updateField]);

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
    const isCurrentLocation = Boolean((selected as any).isCurrentLocation);

    if (context === "pickup" && coords) {
      setPickupLocation(text, coords, isCurrentLocation);
    } else if (context?.startsWith("delivery-") && coords) {
      const index = parseInt(context.split("-")[1], 10);
      if (
        !isNaN(index) &&
        index >= 0 &&
        index < formData.deliveryLocations.length
      ) {
        updateDeliveryLocation(index, text, coords, isCurrentLocation);
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
    [clearDeliveryLocation, formData.isUrgent, resetUrgency, resetUrgencyInputs]
  );

  const handleAddDelivery = useCallback(() => {
    if (formData.deliveryLocations.length >= MAX_DELIVERIES) {
      Alert.alert(
        "Maximum Reached",
        `You can add up to ${MAX_DELIVERIES} delivery locations.`
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
          "You must have at least one delivery location."
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
    [formData.deliveryLocations.length, removeDeliveryLocation]
  );

  const handleSelectRecipientFromAddressBook = useCallback(
    (index: number, entry: any) => {
      updateDeliveryRecipient(index, "phone", entry.phone);
    },
    [updateDeliveryRecipient]
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
          : "Please enter a valid amount"
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
      [{ text: "OK" }]
    );
  }, [
    calculateFeeAmount,
    selectedPercentage,
    urgencyFeeInput,
    updateField,
    closeModal,
  ]);

  const handleBooking = useCallback(async () => {
    setShowErrors(true);

    const isPickupValid = !!formData.pickupLocation && !!pickupCoords;
    const isSenderValid = !!formData.sender.phone;

    // Check if all deliveries are valid.
    // User requested phone number to be required for drop off as well.
    const areDeliveriesValid = formData.deliveryLocations.every(
      (d) => d.address && d.coordinates && d.recipient.phone
    );

    if (!isPickupValid || !isSenderValid || !areDeliveriesValid) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields highlighted in red."
      );
      return;
    }

    // Check for duplicate recipients
    if (hasDuplicateRecipients(formData.deliveryLocations)) {
      Alert.alert(
        "Duplicate Recipients",
        "You cannot send to the same recipient twice. Please use unique recipients for each delivery."
      );
      return;
    }

    if (formData.retrieveCash && !formData.cashAmountToReceive) {
      Alert.alert(
        "Missing Information",
        "Please enter the cash amount to collect"
      );
      return;
    }

    if (!calculatedPrice) {
      Alert.alert(
        "Price Calculation",
        "Please wait for price calculation to complete"
      );
      return;
    }

    const validDeliveries = formData.deliveryLocations;
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
                  phone: formData.sender.phone,
                },
                pickUpAddress: formData.pickupLocation,
                pickUpCoordinates: [pickupCoords!.lon, pickupCoords!.lat],
                deliveryLocations: validDeliveries.map((d) => ({
                  address: d.address,
                  coordinates: [d.coordinates!.lon, d.coordinates!.lat],
                  recipient: {
                    phone: d.recipient.phone,
                  },
                })),
                userOrderRole: (send_type ?? "sender") as string,
                noteForRider: formData.noteForRider || null,
                isUrgent: formData.isUrgent,
                urgencyFee: formData.isUrgent ? formData.urgencyFee : undefined,
                isCashPayment: formData.isCashPayment,
                cashAmountToReceive: formData.retrieveCash
                  ? formData.cashAmountToReceive
                  : undefined,
              });

              if (res?.success) {
                Alert.alert("Success", "Order created successfully", [
                  {
                    text: "OK",
                    onPress: () => {
                      clearAllStates();
                      setShowErrors(false);
                      router.push("/(tabs)/history?refresh=true");
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
                    ]
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
                  ]
                );
              } else {
                Alert.alert("Booking Failed", String(msg));
              }
            } finally {
              setIsBooking(false);
            }
          },
        },
      ]
    );
  }, [
    formData,
    pickupCoords,
    calculatedPrice,
    send_type,
    setIsBooking,
    clearAllStates,
  ]);

  const isUrgentDisabled =
    !formData.pickupLocation ||
    !formData.deliveryLocations.some((d) => d.address && d.coordinates);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Logistics</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: rs(20) }}
          keyboardShouldPersistTaps="handled"
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
              <View style={styles.pickupCard}>
                <TouchableOpacity
                  style={styles.collapsibleHeader}
                  onPress={() =>
                    updateField("_pickupExpanded", !formData._pickupExpanded)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.headerLeft}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={rs(18)}
                      color="#00B624"
                    />
                    <View style={styles.headerTextContainer}>
                      <Text style={styles.collapsibleTitle}>
                        Pickup & Sender Information
                      </Text>
                      {!formData._pickupExpanded &&
                        (formData.pickupLocation || formData.sender.phone) && (
                          <Text style={styles.previewText} numberOfLines={1}>
                            {formData.pickupLocation &&
                              `📍 ${formData.pickupLocation}`}
                            {formData.pickupLocation &&
                              formData.sender.phone &&
                              " • "}
                            {formData.sender.phone &&
                              `📱 ${formData.sender.phone}`}
                          </Text>
                        )}
                    </View>
                  </View>
                  <MaterialIcons
                    name={formData._pickupExpanded ? "remove" : "add"}
                    size={rs(24)}
                    color="#666"
                  />
                </TouchableOpacity>

                {formData._pickupExpanded && (
                  <View style={styles.collapsibleContent}>
                    <View style={styles.locationInputContainer}>
                      <Text style={styles.inputLabel}>
                        Pickup Location{" "}
                        <Text style={styles.requiredAsterisk}>*</Text>
                      </Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={[
                            styles.locationInput,
                            showErrors &&
                              !formData.pickupLocation &&
                              styles.inputError,
                          ]}
                          value={formData.pickupLocation}
                          onFocus={() => {
                            const deliveryIndices = formData.deliveryLocations
                              .map((d, idx) => (d.isCurrentLocation ? idx : -1))
                              .filter((idx) => idx !== -1);

                            router.push({
                              pathname: "/location-search",
                              params: {
                                context: "pickup",
                                pickupIsCurrentLocation:
                                  formData.pickupIsCurrentLocation
                                    ? "true"
                                    : "false",
                                deliveryIndicesUsingCurrentLocation:
                                  deliveryIndices.join(","),
                              },
                            });
                          }}
                          showSoftInputOnFocus={false}
                          placeholder="Select pickup location"
                          placeholderTextColor="#999"
                        />
                        {formData.pickupLocation && (
                          <TouchableOpacity
                            onPress={handleClearPickup}
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
                      {showErrors && !formData.pickupLocation && (
                        <Text style={styles.errorText}>
                          Pickup location is required
                        </Text>
                      )}
                    </View>

                    <View style={styles.senderInfoContainer}>
                      <Text style={styles.inputLabel}>
                        Sender Phone Number{" "}
                        <Text style={styles.requiredAsterisk}>*</Text>
                      </Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={[
                            styles.locationInput,
                            showErrors &&
                              !formData.sender.phone &&
                              styles.inputError,
                          ]}
                          value={formData.sender.phone}
                          onChangeText={(text) =>
                            updateSenderField("phone", text)
                          }
                          keyboardType="phone-pad"
                          placeholder="Enter sender's phone number"
                          placeholderTextColor="#999"
                        />
                      </View>
                      {showErrors && !formData.sender.phone && (
                        <Text style={styles.errorText}>
                          Sender phone number is required
                        </Text>
                      )}
                      <TouchableOpacity
                        style={styles.useMyInfoButton}
                        onPress={handleUseSenderMyInfo}
                      >
                        <MaterialIcons
                          name={
                            useSenderMyInfo
                              ? "check-box"
                              : "check-box-outline-blank"
                          }
                          size={rs(20)}
                          color="#007AFF"
                        />
                        <Text style={styles.useMyInfoText}>Use my mobile</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
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
                  <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={() => {
                      const expanded = delivery._expanded ?? true;
                      const updatedLocations = [...formData.deliveryLocations];
                      updatedLocations[index] = {
                        ...updatedLocations[index],
                        _expanded: !expanded,
                      };
                      updateField("deliveryLocations", updatedLocations);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.headerLeft}>
                      <MaterialCommunityIcons
                        name="truck-delivery"
                        size={rs(18)}
                        color="#00B624"
                      />
                      <View style={styles.headerTextContainer}>
                        <Text style={styles.collapsibleTitle}>
                          {formData.deliveryLocations.length > 1
                            ? `Delivery ${index + 1}`
                            : "Delivery Location"}
                        </Text>
                        {!(delivery._expanded ?? true) &&
                          (delivery.address || delivery.recipient.phone) && (
                            <Text style={styles.previewText} numberOfLines={1}>
                              {delivery.address && `📍 ${delivery.address}`}
                              {delivery.address &&
                                delivery.recipient.phone &&
                                " • "}
                              {delivery.recipient.phone &&
                                `📱 ${delivery.recipient.phone}`}
                            </Text>
                          )}
                      </View>
                    </View>
                    <View style={styles.headerRight}>
                      {formData.deliveryLocations.length > 1 && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRemoveDelivery(index);
                          }}
                          style={styles.removeButton}
                        >
                          <MaterialIcons
                            name="close"
                            size={rs(20)}
                            color="#ff4444"
                          />
                        </TouchableOpacity>
                      )}
                      <MaterialIcons
                        name={delivery._expanded ?? true ? "remove" : "add"}
                        size={rs(24)}
                        color="#666"
                      />
                    </View>
                  </TouchableOpacity>

                  {(delivery._expanded ?? true) && (
                    <View style={styles.collapsibleContent}>
                      {/* Location Input */}
                      <View style={styles.locationInputContainer}>
                        <Text style={styles.inputLabel}>
                          Drop-off Address{" "}
                          <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <View style={styles.inputWrapper}>
                          <TextInput
                            style={[
                              styles.locationInput,
                              showErrors &&
                                !delivery.address &&
                                styles.inputError,
                            ]}
                            value={delivery.address}
                            onFocus={() => {
                              const deliveryIndices = formData.deliveryLocations
                                .map((d, idx) =>
                                  d.isCurrentLocation ? idx : -1
                                )
                                .filter((idx) => idx !== -1);

                              router.push({
                                pathname: "/location-search",
                                params: {
                                  context: `delivery-${index}`,
                                  pickupIsCurrentLocation:
                                    formData.pickupIsCurrentLocation
                                      ? "true"
                                      : "false",
                                  deliveryIndicesUsingCurrentLocation:
                                    deliveryIndices.join(","),
                                },
                              });
                            }}
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
                        {showErrors && !delivery.address && (
                          <Text style={styles.errorText}>
                            Drop-off address is required
                          </Text>
                        )}
                      </View>

                      {/* Recipient Info */}
                      <DeliveryRecipientSection
                        deliveryIndex={index}
                        recipient={delivery.recipient}
                        onUpdateField={updateDeliveryRecipient}
                        addressBook={addressBook}
                        isLoadingAddressBook={isLoadingAddressBook}
                        onSearchAddressBook={handleSearchAddressBook}
                        onSelectFromAddressBook={
                          handleSelectRecipientFromAddressBook
                        }
                        isRequired={formData.deliveryLocations.length > 1}
                        totalDeliveries={formData.deliveryLocations.length}
                        error={
                          showErrors && !delivery.recipient.phone
                            ? "Phone number is required"
                            : undefined
                        }
                      />
                    </View>
                  )}
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

            {/* Payment Method Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <MaterialCommunityIcons
                    name="wallet"
                    size={rs(18)}
                    color="#00B624"
                  />{" "}
                  Payment Method
                </Text>
              </View>
              <View style={styles.deliveryCard}>
                {/* Wallet Option */}
                <TouchableOpacity
                  style={styles.paymentOption}
                  disabled={
                    calculatedPrice !== null && balance < calculatedPrice
                  }
                  onPress={() => updateField("isCashPayment", false)}
                >
                  <View style={styles.paymentOptionRow}>
                    <MaterialIcons
                      name={
                        !formData.isCashPayment
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                      }
                      size={rs(24)}
                      color={
                        !formData.isCashPayment
                          ? "#00B624"
                          : calculatedPrice !== null &&
                            balance < calculatedPrice
                          ? "#eee"
                          : "#ccc"
                      }
                    />
                    <View style={styles.paymentOptionTextContainer}>
                      <Text
                        style={[
                          styles.paymentOptionTitle,
                          calculatedPrice !== null &&
                            balance < calculatedPrice && { color: "#999" },
                        ]}
                      >
                        Wallet
                      </Text>
                      <Text style={styles.paymentOptionSubtitle}>
                        Balance: ₦{balance.toLocaleString()}
                      </Text>
                      {calculatedPrice !== null &&
                        balance < calculatedPrice && (
                          <Text
                            style={{
                              fontSize: rs(12),
                              color: "#ff4444",
                              marginTop: rs(2),
                            }}
                          >
                            Insufficient balance
                          </Text>
                        )}
                    </View>
                    {isFetchingWallet && (
                      <ActivityIndicator size="small" color="#00B624" />
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Cash Option */}
                <TouchableOpacity
                  style={styles.paymentOption}
                  onPress={() => updateField("isCashPayment", true)}
                >
                  <View style={styles.paymentOptionRow}>
                    <MaterialIcons
                      name={
                        formData.isCashPayment
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                      }
                      size={rs(24)}
                      color={formData.isCashPayment ? "#00B624" : "#ccc"}
                    />
                    <View style={styles.paymentOptionTextContainer}>
                      <Text style={styles.paymentOptionTitle}>
                        Cash / Pay on Delivery
                      </Text>
                      <Text style={styles.paymentOptionSubtitle}>
                        Pay rider with cash upon delivery
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Retrieve Cash Section */}
            <View style={styles.section}>
              <View style={styles.deliveryCard}>
                <TouchableOpacity
                  style={styles.retrieveCashToggle}
                  onPress={() => {
                    const newValue = !formData.retrieveCash;
                    updateField("retrieveCash", newValue);
                    if (!newValue) {
                      updateField("cashAmountToReceive", 0);
                    }
                  }}
                >
                  <View style={styles.toggleLeft}>
                    <MaterialCommunityIcons
                      name="cash-multiple"
                      size={rs(20)}
                      color="#00B624"
                    />
                    <View style={styles.toggleTextContainer}>
                      <Text style={styles.toggleTitle}>Retrieve Cash</Text>
                      <Text style={styles.toggleSubtitle}>
                        Rider will collect cash from recipient
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons
                    name={formData.retrieveCash ? "toggle-on" : "toggle-off"}
                    size={rs(40)}
                    color={formData.retrieveCash ? "#00B624" : "#ccc"}
                  />
                </TouchableOpacity>

                {formData.retrieveCash && (
                  <View
                    style={[
                      styles.locationInputContainer,
                      { marginTop: rs(16) },
                    ]}
                  >
                    <Text style={styles.inputLabel}>
                      Cash amount to collect
                    </Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.locationInput}
                        value={
                          formData.cashAmountToReceive
                            ? formData.cashAmountToReceive.toString()
                            : ""
                        }
                        onChangeText={(text) =>
                          updateField(
                            "cashAmountToReceive",
                            text ? parseFloat(text) : 0
                          )
                        }
                        keyboardType="numeric"
                        placeholder="Enter amount to collect"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>

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
          disabled={isBooking}
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
      </KeyboardAvoidingView>
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
  requiredAsterisk: {
    color: "#ff4444",
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
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: rs(4),
  },
  paymentLabel: {
    fontSize: rs(14),
    color: "#666",
    fontWeight: "500",
  },
  paymentValue: {
    fontSize: rs(16),
    fontWeight: "bold",
    color: "#000",
  },
  paymentSubtext: {
    fontSize: rs(12),
    color: "#999",
    marginTop: rs(2),
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: rs(12),
  },
  paymentOption: {
    paddingVertical: rs(8),
    opacity: 1,
  },
  paymentOptionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentOptionTextContainer: {
    marginLeft: rs(12),
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#000",
  },
  paymentOptionSubtitle: {
    fontSize: rs(13),
    color: "#666",
    marginTop: rs(2),
  },
  retrieveCashToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: rs(4),
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: rs(12),
    flex: 1,
  },
  toggleTitle: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#000",
  },
  toggleSubtitle: {
    fontSize: rs(13),
    color: "#666",
    marginTop: rs(2),
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: rs(4),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: rs(8),
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  collapsibleTitle: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#000",
  },
  previewText: {
    fontSize: rs(12),
    color: "#666",
    marginTop: rs(2),
  },
  collapsibleContent: {
    marginTop: rs(12),
  },
  senderInfoContainer: {
    marginTop: rs(4),
  },
  useMyInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rs(8),
  },
  useMyInfoText: {
    fontSize: rs(14),
    color: "#007AFF",
    marginLeft: rs(6),
  },
});
