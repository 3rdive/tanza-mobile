# Location-Enhanced Search Feature

## Overview

This feature automatically enhances location searches by appending the user's current location (state and country) to their search query. This improves search relevance by providing geographic context to the search API.

## How It Works

### Flow Diagram

```
User performs first search
    ↓
locationService.search("Victoria Island")
    ↓
    ├─→ Background: Fetch user's lat/lon → Reverse geocode → Cache in Redux
    │   (non-blocking, happens asynchronously)
    │
    └─→ Foreground: Search with current query (no delay)
        Returns results immediately

User performs second search
    ↓
locationService.search("Lekki")
    ↓
Check cache → Found: "Lagos State, Nigeria"
    ↓
Enhanced query: "Lekki, Lagos State, Nigeria"
    ↓
API call with enhanced query
    ↓
Returns more relevant results
```

### Key Features

1. **Non-blocking**: First search executes immediately without waiting for location
2. **Session-based caching**: Location is fetched once per app session
3. **Graceful degradation**: Search works normally if location is unavailable
4. **Automatic enhancement**: No code changes needed in search UI components

## Implementation Details

### 1. Redux State (userSlice)

The cached location is stored in the `user` Redux slice:

```typescript
interface IUserLocation {
  state: string;
  country: string;
}

interface IUserState extends IAuthSuccessData {
  cachedLocation: IUserLocation | null;
}
```

**Actions:**
- `setCachedLocation(payload)`: Stores the state and country
- `clearCachedLocation()`: Clears cached location
- `clearUser()`: Also clears cached location on logout

### 2. Location Cache Utility (`utils/locationCache.utils.ts`)

**Functions:**

- **`fetchAndCacheUserLocation()`**
  - Requests location permissions
  - Gets current GPS coordinates
  - Calls reverse geocode API
  - Stores state & country in Redux
  - Only executes once per session
  - Fails silently if permissions denied or API fails

- **`getCachedLocationSuffix()`**
  - Returns formatted string: `", State, Country"`
  - Returns empty string if not cached

- **`resetLocationFetchFlag()`**
  - For testing/manual refresh (doesn't clear Redux cache)

### 3. Enhanced locationService.search()

The search function now:
1. Triggers background location fetch (first call only)
2. Retrieves cached location suffix
3. Appends location to query: `userInput + ", State, Country"`
4. Sends enhanced query to API

```typescript
// Before: "Victoria Island"
// After (if cached): "Victoria Island, Lagos State, Nigeria"
```

## Usage

### For Developers

No code changes needed in UI components! The enhancement happens automatically:

```typescript
// Your existing code continues to work:
const results = await locationService.search("Lekki");

// Internally, if location is cached, it becomes:
// locationService.search("Lekki, Lagos State, Nigeria")
```

### Location Permission Request

The location permission is requested automatically on first search. Ensure you have location permissions configured in:

- **iOS**: `ios/YourApp/Info.plist`
  ```xml
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>We use your location to provide more relevant search results.</string>
  ```

- **Android**: Already configured via `expo-location` plugin

### Manual Location Refresh

If you need to manually refresh the location (e.g., user travels to new location):

```typescript
import { resetLocationFetchFlag, fetchAndCacheUserLocation } from "@/utils/locationCache.utils";

// Reset the flag and fetch again
resetLocationFetchFlag();
await fetchAndCacheUserLocation();
```

## Error Handling

The feature handles all edge cases gracefully:

| Scenario | Behavior |
|----------|----------|
| Location permissions denied | Search works without location appending |
| GPS unavailable | Search works without location appending |
| Reverse geocode API fails | Search works without location appending |
| Network error during geocode | Search works without location appending |
| State or country missing from API | Location not cached, search works normally |

## Testing

### Test Scenarios

1. **First search without cached location**
   - Expected: Search executes immediately
   - Background: Location fetch starts
   - Next search: Should include location

2. **Search with cached location**
   - Expected: Query includes ", State, Country"
   - Check Redux: `state.user.cachedLocation` should have data

3. **Location permissions denied**
   - Expected: Search works normally without location
   - Console log: "Location permission denied..."

4. **Network failure during geocode**
   - Expected: Search works normally without location
   - Console log: "Failed to fetch/cache location..."

### Debug Tips

Check if location is cached:

```typescript
import { store } from "@/redux/store";

const cachedLocation = store.getState().user.cachedLocation;
console.log("Cached location:", cachedLocation);
// Output: { state: "Lagos State", country: "Nigeria" } or null
```

View enhanced query in network inspector:
```
GET /api/v1/location/search?q=Lekki,%20Lagos%20State,%20Nigeria
```

## API Endpoints Used

### 1. Reverse Geocode
```
GET /api/v1/location/reverse?lat={latitude}&lon={longitude}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "displayName": "...",
    "state": "Lagos State",
    "country": "Nigeria",
    "city": "Lagos",
    ...
  }
}
```

### 2. Location Search
```
GET /api/v1/location/search?q={query}
```

**Enhanced query example:**
```
q=Victoria Island, Lagos State, Nigeria
```

## Performance Considerations

- **First search latency**: No impact (location fetch is non-blocking)
- **Subsequent searches**: ~10ms overhead to read from Redux cache
- **Network calls**: Only 1 reverse geocode call per app session
- **Memory**: Minimal (~100 bytes for state+country strings)

## Future Enhancements

Potential improvements:
- [ ] Persist location to AsyncStorage (survive app restarts)
- [ ] Add location refresh after X hours/days
- [ ] Allow manual location selection by user
- [ ] Add city to the suffix format
- [ ] Show location badge in search UI

## Related Files

- `redux/slices/userSlice.ts` - Redux state management
- `utils/locationCache.utils.ts` - Location caching logic
- `lib/api.ts` - Enhanced search function
- `app/location-search.tsx` - Search UI (no changes needed)
- `app/(auth)/completion.tsx` - Uses search (no changes needed)
- `app/(tabs)/book-order.tsx` - Uses search (no changes needed)