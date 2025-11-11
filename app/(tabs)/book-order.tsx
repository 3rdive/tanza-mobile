import {
  BookingOverlay,
  LocationInputSection,
  NoteSection,
  PriceFooter,
  UrgencyModal,
  UrgentToggle,
} from "@/components/booking";
import {
  useBookingAnimations,
  useBookingForm,
} from "@/hooks/use-booking-form.hook";
import { usePriceCalculation } from "@/hooks/use-price-calculation.hook";
import { useUrgencyModal } from "@/hooks/use-urgency-modal.hook";
import { orderService } from "@/lib/api";
import { useAppDispatch, useAppSelector, useUser } from "@/redux/hooks/hooks";
import { clearSelectedLocation } from "@/redux/slices/locationSearchSlice";
import { Coordinates, LocationContext } from "@/types/booking.types";
import {
  canSubmitBooking,
  coordsEqual,
  isValidDefaultAddress,
  nameEqual,
} from "@/utils/booking.utils";
import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);
export default function BookLogisticsScreen() {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const selected = useAppSelector(
    (s) => (s as any).locationSearch?.selected || null
  );
  const { send_type } = useLocalSearchParams();
  const { user } = useUser();

  // Custom hooks
  const {
    formData,
    pickupCoords,
    dropoffCoords,
    isBooking,
    setIsBooking,
    updateField,
    clearPickup,
    clearDropoff,
    setPickupLocation,
    setDropoffLocation,
    resetUrgency,
    clearAllStates,
  } = useBookingForm();

  const { slideAnim, fadeAnim, animatePriceAppearance } =
    useBookingAnimations();

  const { calculatedPrice, isCalculating } = usePriceCalculation(
    pickupCoords,
    dropoffCoords,
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

  const defaultAddress = ((user as any)?.usersAddress ?? null) as {
    name?: string;
    lat?: number;
    lon?: number;
  } | null;

  // Clear all states on unmount
  useEffect(() => {
    return () => {
      setIsBooking(false);
    };
  }, [setIsBooking]);

  // Handle location selection from search screen
  useEffect(() => {
    if (!isFocused || !selected) return;

    const text = (selected as any).title || (selected as any).subtitle || "";
    const coords: Coordinates | null =
      (selected as any).lat && (selected as any).lon
        ? { lat: (selected as any).lat, lon: (selected as any).lon }
        : null;

    if ((selected as any).context === "pickup" && coords) {
      setPickupLocation(text, coords);
    } else if ((selected as any).context === "dropoff" && coords) {
      setDropoffLocation(text, coords);
    }

    dispatch(clearSelectedLocation());
  }, [dispatch, isFocused, selected, setPickupLocation, setDropoffLocation]);

  const handleClearPickup = useCallback(() => {
    clearPickup();
    if (formData.isUrgent) {
      resetUrgency();
      resetUrgencyInputs();
    }
  }, [clearPickup, formData.isUrgent, resetUrgency, resetUrgencyInputs]);

  const handleClearDropoff = useCallback(() => {
    clearDropoff();
    if (formData.isUrgent) {
      resetUrgency();
      resetUrgencyInputs();
    }
  }, [clearDropoff, formData.isUrgent, resetUrgency, resetUrgencyInputs]);

  const handleUseDefaultAddress = useCallback(
    (type: LocationContext) => {
      if (!isValidDefaultAddress(defaultAddress)) {
        Alert.alert(
          "No default address",
          "Please set your address in Profile first."
        );
        return;
      }

      const defName = defaultAddress.name || "My address";
      const defCoords = { lat: defaultAddress.lat, lon: defaultAddress.lon };

      if (type === "pickup") {
        if (
          coordsEqual(dropoffCoords, defCoords) ||
          nameEqual(formData.dropOffLocation, defName)
        ) {
          Alert.alert(
            "Invalid selection",
            "Pickup and drop-off cannot be the same."
          );
          return;
        }
        setPickupLocation(defName, defCoords);
      } else {
        if (
          coordsEqual(pickupCoords, defCoords) ||
          nameEqual(formData.pickupLocation, defName)
        ) {
          Alert.alert(
            "Invalid selection",
            "Pickup and drop-off cannot be the same."
          );
          return;
        }
        setDropoffLocation(defName, defCoords);
      }
    },
    [
      defaultAddress,
      dropoffCoords,
      pickupCoords,
      formData.dropOffLocation,
      formData.pickupLocation,
      setPickupLocation,
      setDropoffLocation,
    ]
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
    if (
      !formData.pickupLocation ||
      !formData.dropOffLocation ||
      !pickupCoords ||
      !dropoffCoords
    ) {
      Alert.alert(
        "Missing Information",
        "Please select both pickup and dropoff locations from the suggestions"
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

    const vehicle = "bike";

    Alert.alert(
      "Confirm Booking",
      `Book ${vehicle} for ₦${calculatedPrice.toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book Now",
          onPress: async () => {
            setIsBooking(true);
            try {
              const res = await orderService.create(
                {
                  startLat: pickupCoords.lat,
                  startLon: pickupCoords.lon,
                  endLat: dropoffCoords.lat,
                  endLon: dropoffCoords.lon,
                  vehicleType: vehicle,
                  isUrgent: formData.isUrgent,
                  urgencyFee: formData.isUrgent
                    ? formData.urgencyFee
                    : undefined,
                },
                {
                  dropOffLocation: formData.dropOffLocation,
                  pickUpLocation: formData.pickupLocation,
                  userOrderRole: (send_type ?? "sender") as string,
                  vehicleType: vehicle,
                  noteForRider: formData.noteForRider || null,
                }
              );

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
    dropoffCoords,
    calculatedPrice,
    send_type,
    setIsBooking,
    clearAllStates,
  ]);

  const isSubmitDisabled = !canSubmitBooking(
    formData.pickupLocation,
    formData.dropOffLocation,
    pickupCoords,
    dropoffCoords,
    calculatedPrice,
    isCalculating,
    isBooking
  );

  const isUrgentDisabled =
    !formData.pickupLocation || !formData.dropOffLocation;

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
          <LocationInputSection
            pickupLocation={formData.pickupLocation}
            dropoffLocation={formData.dropOffLocation}
            defaultAddress={defaultAddress}
            onClearPickup={handleClearPickup}
            onClearDropoff={handleClearDropoff}
            onUseDefaultAddress={handleUseDefaultAddress}
          />

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
});
