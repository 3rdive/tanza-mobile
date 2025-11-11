import { Coordinates, DefaultAddress } from "@/types/booking.types";

/**
 * Compare two coordinate objects for equality within epsilon tolerance
 */
export const coordsEqual = (
  a?: Coordinates | null,
  b?: Coordinates | null
): boolean => {
  if (!a || !b) return false;
  if (
    typeof a.lat !== "number" ||
    typeof a.lon !== "number" ||
    typeof b.lat !== "number" ||
    typeof b.lon !== "number"
  )
    return false;
  const eps = 1e-6;
  return Math.abs(a.lat - b.lat) < eps && Math.abs(a.lon - b.lon) < eps;
};

/**
 * Compare two location names for equality (case-insensitive, trimmed)
 */
export const nameEqual = (a?: string | null, b?: string | null): boolean => {
  return (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();
};

/**
 * Validate if a default address is properly configured
 */
export const isValidDefaultAddress = (
  address?: DefaultAddress | null
): address is Required<DefaultAddress> => {
  return (
    !!address &&
    typeof address.lat === "number" &&
    typeof address.lon === "number"
  );
};

/**
 * Check if booking form is ready for submission
 */
export const canSubmitBooking = (
  pickupLocation: string,
  dropoffLocation: string,
  pickupCoords: Coordinates | null,
  dropoffCoords: Coordinates | null,
  calculatedPrice: number | null,
  isCalculating: boolean,
  isBooking: boolean
): boolean => {
  return !!(
    pickupLocation &&
    dropoffLocation &&
    pickupCoords &&
    dropoffCoords &&
    calculatedPrice &&
    !isCalculating &&
    !isBooking
  );
};
