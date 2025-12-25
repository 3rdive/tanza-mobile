import { locationService } from "@/lib/api";
import { StorageKeys, StorageMechanics } from "@/lib/storage-mechanics";
import * as Location from "expo-location";

export interface CachedCurrentLocation {
  lat: number;
  lon: number;
  address: string;
  timestamp: number;
}

// Coordinate threshold (±0.0001 degrees ~ 10-15m for lat/lon)
const COORD_THRESHOLD = 0.0001;

/**
 * Check if two coordinates are within threshold
 */
function coordsMatch(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): boolean {
  return (
    Math.abs(lat1 - lat2) < COORD_THRESHOLD &&
    Math.abs(lon1 - lon2) < COORD_THRESHOLD
  );
}

/**
 * Fetch current location and resolve address.
 * If cached coordinates match within threshold, return cached address.
 * Otherwise fetch fresh address and update cache.
 */
export async function getCurrentLocationWithCache(): Promise<{
  lat: number;
  lon: number;
  address: string;
} | null> {
  try {
    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude: lat, longitude: lon } = location.coords;

    // Check if cached coordinates match within threshold
    const cachedLocation = await StorageMechanics.get(
      StorageKeys.CURRENT_LOCATION_CACHE
    );

    if (
      cachedLocation &&
      coordsMatch(lat, lon, cachedLocation.lat, cachedLocation.lon)
    ) {
      return {
        lat: cachedLocation.lat,
        lon: cachedLocation.lon,
        address: cachedLocation.address,
      };
    }

    // Fetch fresh address via reverse geocoding
    const rev = await locationService.reverse(lat, lon);
    const data = rev?.data;
    const address = data?.name || data?.display_name || "Current Location";

    // Update cache
    const newCachedLocation: CachedCurrentLocation = {
      lat,
      lon,
      address,
      timestamp: Date.now(),
    };

    await StorageMechanics.set(
      StorageKeys.CURRENT_LOCATION_CACHE,
      newCachedLocation
    );

    return { lat, lon, address };
  } catch (error: any) {
    throw new Error(error?.message || "Unable to fetch current location");
  }
}

/**
 * Clear cached location (for testing or manual refresh)
 */
export async function clearCurrentLocationCache(): Promise<void> {
  await StorageMechanics.remove(StorageKeys.CURRENT_LOCATION_CACHE);
}

/**
 * Get cached location without fetching (returns null if not cached)
 */
export async function getCachedCurrentLocation(): Promise<CachedCurrentLocation | null> {
  return await StorageMechanics.get(StorageKeys.CURRENT_LOCATION_CACHE);
}
