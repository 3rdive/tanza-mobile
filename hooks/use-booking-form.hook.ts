import {
  BookingFormData,
  ContactInfo,
  Coordinates,
} from "@/types/booking.types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

const defaultFormData: BookingFormData = {
  pickupLocation: "",
  noteForRider: "",
  isUrgent: false,
  numberOfItems: 1,
  urgencyFee: 0,
  sender: {
    name: "",
    email: "",
    phone: "",
  },
  deliveryLocations: [
    {
      address: "",
      coordinates: null,
      recipient: {
        name: "",
        email: "",
        phone: "",
      },
    },
  ],
};

export const useBookingForm = () => {
  const [formData, setFormData] = useState<BookingFormData>(defaultFormData);
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
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

  const setPickupLocation = useCallback(
    (location: string, coords: Coordinates) => {
      setFormData((prev) => ({ ...prev, pickupLocation: location }));
      setPickupCoords(coords);
    },
    []
  );

  const addDeliveryLocation = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      deliveryLocations: [
        ...prev.deliveryLocations,
        {
          address: "",
          coordinates: null,
          recipient: {
            name: "",
            email: "",
            phone: "",
          },
        },
      ],
    }));
  }, []);

  const removeDeliveryLocation = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliveryLocations: prev.deliveryLocations.filter((_, i) => i !== index),
    }));
  }, []);

  const updateDeliveryLocation = useCallback(
    (index: number, address: string, coords: Coordinates) => {
      setFormData((prev) => ({
        ...prev,
        deliveryLocations: prev.deliveryLocations.map((delivery, i) =>
          i === index ? { ...delivery, address, coordinates: coords } : delivery
        ),
      }));
    },
    []
  );

  const clearDeliveryLocation = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliveryLocations: prev.deliveryLocations.map((delivery, i) =>
        i === index ? { ...delivery, address: "", coordinates: null } : delivery
      ),
    }));
  }, []);

  const updateDeliveryRecipient = useCallback(
    (index: number, field: keyof ContactInfo, value: string) => {
      setFormData((prev) => ({
        ...prev,
        deliveryLocations: prev.deliveryLocations.map((delivery, i) =>
          i === index
            ? {
                ...delivery,
                recipient: { ...delivery.recipient, [field]: value },
              }
            : delivery
        ),
      }));
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

  const updateSenderField = useCallback(
    (field: keyof ContactInfo, value: string) => {
      setFormData((prev) => ({
        ...prev,
        sender: { ...prev.sender, [field]: value },
      }));
    },
    []
  );

  const clearAllStates = useCallback(() => {
    setFormData(defaultFormData);
    setPickupCoords(null);
    setIsBooking(false);
  }, []);

  return {
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
