import * as Location from "expo-location";
import { locationService } from "@/lib/api";
import { store } from "@/redux/store";
import { setCachedLocation } from "@/redux/slices/userSlice";

// Flag to track if we've attempted to fetch location this session
let locationFetchAttempted = false;

/**
 * Fetches the user's current location (lat/lon), calls reverse geocode API,
 * and stores the state and country in Redux for the current app session.
 *
 * This function is safe to call multiple times - it will only execute once per session.
 * If location permissions are denied or the API fails, it silently continues without caching.
 */
export async function fetchAndCacheUserLocation(): Promise<void> {
  // Only attempt once per app session
  if (locationFetchAttempted) {
    return;
  }

  locationFetchAttempted = true;

  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Location permission denied - searches will work without location appending");
      return;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Call reverse geocode API
    const response = await locationService.reverse(latitude, longitude);

    if (response.success && response.data) {
      const { state, country } = response.data;

      // Only cache if we have both state and country
      if (state && country) {
        store.dispatch(
          setCachedLocation({
            state,
            country,
          })
        );
        console.log(`Location cached: ${state}, ${country}`);
      }
    }
  } catch (error) {
    console.log("Failed to fetch/cache location - searches will work without location appending", error);
    // Silently fail - search should work without location
  }
}

/**
 * Gets the cached location from Redux store if available.
 * Returns a formatted string like ", Lagos State, Nigeria" or empty string if not cached.
 */
export function getCachedLocationSuffix(): string {
  const state = store.getState();
  const cachedLocation = (state as any).user?.cachedLocation;

  if (cachedLocation?.state && cachedLocation?.country) {
    return `, ${cachedLocation.state}, ${cachedLocation.country}`;
  }

  return "";
}

/**
 * Resets the location fetch flag - useful for testing or manual refresh scenarios.
 * Note: This doesn't clear the cached location from Redux, only allows re-fetching.
 */
export function resetLocationFetchFlag(): void {
  locationFetchAttempted = false;
}
