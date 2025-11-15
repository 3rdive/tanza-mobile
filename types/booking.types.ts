export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface AddressBookEntry {
  name: string;
  email: string;
  phone: string;
  role: "sender" | "recipient";
}

export interface AddressBookResponse {
  success: boolean;
  message: string;
  data: AddressBookEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeliveryLocation {
  address: string;
  coordinates: Coordinates | null;
  recipient: ContactInfo;
}

export interface BookingFormData {
  pickupLocation: string;
  noteForRider: string;
  isUrgent: boolean;
  numberOfItems: number;
  urgencyFee: number;
  sender: ContactInfo;
  deliveryLocations: DeliveryLocation[];
  // Legacy fields for backward compatibility during migration
  dropOffLocation?: string;
  recipient?: ContactInfo;
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

export interface DeliveryPriceBreakdown {
  deliveryLocation: [number, number];
  distance_from_pickup_km: number;
  duration_from_pickup: string;
  deliveryFee: number;
}

export interface MultipleDeliveryPriceResponse {
  totalAmount: number;
  totalDeliveryFee: number;
  serviceCharge: number;
  pickupLocation: [number, number];
  deliveries: DeliveryPriceBreakdown[];
  totalDistanceKm: number;
  estimatedTotalDuration: string;
  vehicleType: string;
}

export interface CreateOrderParams {
  pickupCoords: Coordinates;
  dropoffCoords: Coordinates;
  formData: BookingFormData;
  calculatedPrice: number;
  userOrderRole: string;
}

export type LocationContext = "pickup" | `delivery-${number}`;
