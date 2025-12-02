import {
  ContactInfo,
  Coordinates,
  DefaultAddress,
  DeliveryLocation,
} from "@/types/booking.types";

/**
 * Validate if contact info is completely filled
 * Email is optional, only name and phone are required
 */
export const isValidContactInfo = (contact: ContactInfo): boolean => {
  return !!(contact.name.trim() && contact.phone.trim());
};

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
 * Check if all delivery locations are valid
 */
export const areDeliveriesValid = (
  deliveryLocations: DeliveryLocation[]
): boolean => {
  if (deliveryLocations.length === 0) return false;

  return deliveryLocations.every(
    (delivery) =>
      delivery.address.trim() !== "" &&
      delivery.coordinates !== null &&
      (deliveryLocations.length === 1 || isValidContactInfo(delivery.recipient))
  );
};

/**
 * Check if there are duplicate recipients in delivery locations
 */
export const hasDuplicateRecipients = (
  deliveryLocations: DeliveryLocation[]
): boolean => {
  if (deliveryLocations.length <= 1) return false;

  const phones = deliveryLocations.map((d) =>
    d.recipient.phone.trim().toLowerCase()
  );
  return new Set(phones).size !== phones.length;
};

/**
 * Check if booking form is ready for submission (multiple deliveries)
 */
export const canSubmitBooking = (
  pickupLocation: string,
  pickupCoords: Coordinates | null,
  deliveryLocations: DeliveryLocation[],
  calculatedPrice: number | null,
  isCalculating: boolean,
  isBooking: boolean,
  sender: ContactInfo
): boolean => {
  return !!(
    pickupLocation &&
    pickupCoords &&
    deliveryLocations.length > 0 &&
    areDeliveriesValid(deliveryLocations) &&
    !hasDuplicateRecipients(deliveryLocations) &&
    calculatedPrice &&
    !isCalculating &&
    !isBooking &&
    isValidContactInfo(sender)
  );
};
