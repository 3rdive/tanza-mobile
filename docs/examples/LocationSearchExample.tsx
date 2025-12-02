/**
 * LocationSearchExample.tsx
 *
 * Example component demonstrating how the location-enhanced search feature works.
 * This shows:
 * 1. How to use the search (it's automatic!)
 * 2. How to inspect the cached location
 * 3. How to manually refresh location if needed
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { locationService } from "@/lib/api";
import { useAppSelector } from "@/redux/hooks/hooks";
import {
  fetchAndCacheUserLocation,
  resetLocationFetchFlag,
  getCachedLocationSuffix,
} from "@/utils/locationCache.utils";

export default function LocationSearchExample() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get cached location from Redux store
  const cachedLocation = useAppSelector((state) => state.user.cachedLocation);

  /**
   * Perform a search - location enhancement happens automatically!
   * No need to manually append location.
   */
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Just call search normally - location is automatically appended if cached
      const response = await locationService.search(query);

      if (response.success) {
        setResults(response.data || []);

        // Show what query was actually sent (for debugging)
        const locationSuffix = getCachedLocationSuffix();
        const actualQuery = query + locationSuffix;
        console.log("Searched for:", actualQuery);
      }
    } catch (error) {
      Alert.alert("Error", "Search failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manually refresh the user's location.
   * Useful if user travels to a new location.
   */
  const handleRefreshLocation = async () => {
    Alert.alert(
      "Refresh Location",
      "This will fetch your current location again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Refresh",
          onPress: async () => {
            // Reset the flag so we can fetch again
            resetLocationFetchFlag();

            // Fetch location (this will update Redux cache)
            await fetchAndCacheUserLocation();

            Alert.alert(
              "Success",
              cachedLocation
                ? `Location updated: ${cachedLocation.state}, ${cachedLocation.country}`
                : "Location fetch in progress...",
            );
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location-Enhanced Search</Text>

      {/* Show cached location status */}
      <View style={styles.locationStatus}>
        <Text style={styles.label}>Cached Location:</Text>
        {cachedLocation ? (
          <Text style={styles.locationText}>
            📍 {cachedLocation.state}, {cachedLocation.country}
          </Text>
        ) : (
          <Text style={styles.noLocationText}>
            Not cached yet (will fetch on first search)
          </Text>
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefreshLocation}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh Location</Text>
        </TouchableOpacity>
      </View>

      {/* Search input */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder="Search for a location..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? "Searching..." : "Search"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Show what query will be sent */}
      {query.trim() && (
        <View style={styles.queryPreview}>
          <Text style={styles.queryLabel}>Query sent to API:</Text>
          <Text style={styles.queryText}>
            &ldquo;{query}
            {getCachedLocationSuffix()}&rdquo;
          </Text>
        </View>
      )}

      {/* Results */}
      <View style={styles.results}>
        <Text style={styles.resultsTitle}>Results: {results.length}</Text>
        {results.slice(0, 5).map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultName}>
              {result.properties?.name || "Unknown"}
            </Text>
            <Text style={styles.resultDetails}>
              {[
                result.properties?.city,
                result.properties?.state,
                result.properties?.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </View>
        ))}
      </View>

      {/* Implementation notes */}
      <View style={styles.notes}>
        <Text style={styles.notesTitle}>📝 How it works:</Text>
        <Text style={styles.noteText}>
          1. First search: Executes immediately, location fetched in background
        </Text>
        <Text style={styles.noteText}>
          2. Subsequent searches: Automatically append &ldquo;, State,
          Country&rdquo;
        </Text>
        <Text style={styles.noteText}>
          3. If location unavailable: Search works normally without it
        </Text>
        <Text style={styles.noteText}>
          4. Session-based: Location cached until app restart
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  locationStatus: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 16,
    color: "#00B624",
    fontWeight: "600",
  },
  noLocationText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  refreshButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#00B624",
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#00B624",
    fontWeight: "600",
  },
  searchSection: {
    flexDirection: "row",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#00B624",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  queryPreview: {
    backgroundColor: "#fff3cd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#ffc107",
  },
  queryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 5,
  },
  queryText: {
    fontSize: 14,
    color: "#856404",
    fontFamily: "monospace",
  },
  results: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  resultItem: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  resultDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  notes: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e7f3ff",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1976D2",
  },
  noteText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
    paddingLeft: 10,
  },
});
