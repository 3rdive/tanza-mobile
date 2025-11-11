import { orderService } from "@/lib/api";
import { Coordinates } from "@/types/booking.types";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export const usePriceCalculation = (
  pickupCoords: Coordinates | null,
  dropoffCoords: Coordinates | null,
  isUrgent: boolean,
  urgencyFee: number,
  onPriceCalculated?: () => void
) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculatePrice = useCallback(async () => {
    if (!pickupCoords || !dropoffCoords || (isUrgent && urgencyFee === 0)) {
      setCalculatedPrice(null);
      return;
    }

    try {
      setIsCalculating(true);

      const vehicle = "bike";
      const res = await orderService.calculateCharge({
        startLat: pickupCoords.lat,
        startLon: pickupCoords.lon,
        endLat: dropoffCoords.lat,
        endLon: dropoffCoords.lon,
        vehicleType: vehicle,
        isUrgent: isUrgent,
        urgencyFee: isUrgent ? urgencyFee : undefined,
      });

      if (res?.success) {
        const d = res.data as any;
        setCalculatedPrice(d.totalAmount ?? null);
        onPriceCalculated?.();
      } else {
        setCalculatedPrice(null);
        Alert.alert(
          "Pricing Error",
          res?.message || "Unable to calculate price"
        );
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert(
        "Pricing Error",
        e?.response?.data?.message || e?.message || "Unable to calculate price"
      );
      setCalculatedPrice(null);
    } finally {
      setIsCalculating(false);
    }
  }, [pickupCoords, dropoffCoords, isUrgent, urgencyFee, onPriceCalculated]);

  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      calculatePrice();
    } else {
      setCalculatedPrice(null);
    }

    return () => {
      setCalculatedPrice(null);
    };
  }, [pickupCoords, dropoffCoords, calculatePrice]);

  return {
    calculatedPrice,
    isCalculating,
    recalculatePrice: calculatePrice,
  };
};
