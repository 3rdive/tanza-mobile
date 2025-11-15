import { orderService } from "@/lib/api";
import {
  Coordinates,
  DeliveryLocation,
  MultipleDeliveryPriceResponse,
} from "@/types/booking.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

export const usePriceCalculation = (
  pickupCoords: Coordinates | null,
  deliveryLocations: DeliveryLocation[],
  isUrgent: boolean,
  urgencyFee: number,
  onPriceCalculated?: () => void
) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [priceBreakdown, setPriceBreakdown] =
    useState<MultipleDeliveryPriceResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Create a stable reference that only changes when coordinates change
  // This prevents recalculation when only recipient info changes
  const deliveryCoordinatesKey = useMemo(() => {
    return deliveryLocations
      .map((d) =>
        d.coordinates ? `${d.coordinates.lat},${d.coordinates.lon}` : "null"
      )
      .join("|");
  }, [deliveryLocations]);

  const calculatePrice = useCallback(async () => {
    // Check if we have pickup and at least one delivery with coordinates
    const validDeliveries = deliveryLocations.filter(
      (d) => d.coordinates !== null
    );

    if (
      !pickupCoords ||
      validDeliveries.length === 0 ||
      (isUrgent && urgencyFee === 0)
    ) {
      setCalculatedPrice(null);
      setPriceBreakdown(null);
      return;
    }

    try {
      setIsCalculating(true);

      // Convert coordinates to [lon, lat] format for API
      const pickupLocation: [number, number] = [
        pickupCoords.lon,
        pickupCoords.lat,
      ];
      const deliveryCoordinates: [number, number][] = validDeliveries.map(
        (d) => [d.coordinates!.lon, d.coordinates!.lat]
      );

      const res = await orderService.calculateMultipleDeliveryCharge({
        pickupLocation,
        deliveryLocations: deliveryCoordinates,
        isUrgent: isUrgent,
        urgencyFee: isUrgent ? urgencyFee : 0,
      });

      if (res?.success) {
        const data = res.data as MultipleDeliveryPriceResponse;
        setCalculatedPrice(data.totalAmount ?? null);
        setPriceBreakdown(data);
        onPriceCalculated?.();
      } else {
        setCalculatedPrice(null);
        setPriceBreakdown(null);
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
      setPriceBreakdown(null);
    } finally {
      setIsCalculating(false);
    }
  }, [
    pickupCoords,
    deliveryLocations,
    isUrgent,
    urgencyFee,
    onPriceCalculated,
  ]);

  useEffect(() => {
    const validDeliveries = deliveryLocations.filter(
      (d) => d.coordinates !== null
    );

    if (pickupCoords && validDeliveries.length > 0) {
      calculatePrice();
    } else {
      setCalculatedPrice(null);
      setPriceBreakdown(null);
    }

    return () => {
      setCalculatedPrice(null);
      setPriceBreakdown(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCoords, deliveryCoordinatesKey, isUrgent, urgencyFee]);

  return {
    calculatedPrice,
    priceBreakdown,
    isCalculating,
    recalculatePrice: calculatePrice,
  };
};
