export interface BookingFormData {
  pickupLocation: string;
  dropOffLocation: string;
  noteForRider: string;
  isUrgent: boolean;
  numberOfItems: number;
  urgencyFee: number;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface DefaultAddress {
  name?: string;
  lat?: number;
  lon?: number;
}

export interface CalculatePriceParams {
  pickupCoords: Coordinates | null;
  dropoffCoords: Coordinates | null;
  isUrgent: boolean;
  urgencyFee: number;
}

export interface CreateOrderParams {
  pickupCoords: Coordinates;
  dropoffCoords: Coordinates;
  formData: BookingFormData;
  calculatedPrice: number;
  userOrderRole: string;
}

export type LocationContext = "pickup" | "dropoff";
