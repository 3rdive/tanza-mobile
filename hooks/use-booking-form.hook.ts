import { BookingFormData, Coordinates } from "@/types/booking.types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

const defaultFormData: BookingFormData = {
  pickupLocation: "",
  dropOffLocation: "",
  noteForRider: "",
  isUrgent: false,
  numberOfItems: 1,
  urgencyFee: 0,
};

export const useBookingForm = () => {
  const [formData, setFormData] = useState<BookingFormData>(defaultFormData);
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const updateField = useCallback(
    (field: keyof BookingFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const clearPickup = useCallback(() => {
    setFormData((prev) => ({ ...prev, pickupLocation: "" }));
    setPickupCoords(null);
  }, []);

  const clearDropoff = useCallback(() => {
    setFormData((prev) => ({ ...prev, dropOffLocation: "" }));
    setDropoffCoords(null);
  }, []);

  const setPickupLocation = useCallback(
    (location: string, coords: Coordinates) => {
      setFormData((prev) => ({ ...prev, pickupLocation: location }));
      setPickupCoords(coords);
    },
    []
  );

  const setDropoffLocation = useCallback(
    (location: string, coords: Coordinates) => {
      setFormData((prev) => ({ ...prev, dropOffLocation: location }));
      setDropoffCoords(coords);
    },
    []
  );

  const resetUrgency = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      isUrgent: false,
      urgencyFee: 0,
    }));
  }, []);

  const clearAllStates = useCallback(() => {
    setFormData(defaultFormData);
    setPickupCoords(null);
    setDropoffCoords(null);
    setIsBooking(false);
  }, []);

  return {
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
  };
};

export const useBookingAnimations = () => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const animatePriceAppearance = useCallback(() => {
    priceAnim.setValue(0);
    Animated.spring(priceAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [priceAnim]);

  const resetAnimations = useCallback(() => {
    slideAnim.setValue(0);
    fadeAnim.setValue(0);
    priceAnim.setValue(0);
  }, [slideAnim, fadeAnim, priceAnim]);

  return {
    slideAnim,
    fadeAnim,
    priceAnim,
    animatePriceAppearance,
    resetAnimations,
  };
};
