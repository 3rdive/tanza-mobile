import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { poppinsFonts } from "@/theme/fonts";
import { locationService, ILocationFeature, orderService } from "@/lib/api";

const UI_SCALE = 0.82; // globally downscale sizes
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);
interface LocationSuggestion {
  id: string;
  title: string; // e.g., name or prominent label
  subtitle: string; // e.g., full address line
  lat?: number;
  lon?: number;
}

interface BookingFormData {
  pickupLocation: string;
  dropoffLocation: string;
  noteForRider: string;
  vehicleType: "rider" | "van";
  numberOfItems: number;
}

const mockLocations: LocationSuggestion[] = [
  { id: "1", title: "Victoria Island", subtitle: "Victoria Island, Lagos" },
  { id: "2", title: "Ikeja GRA", subtitle: "Ikeja GRA, Lagos" },
  { id: "3", title: "Lekki Phase 1", subtitle: "Lekki Phase 1, Lagos" },
  { id: "4", title: "Wuse 2", subtitle: "Wuse 2, Abuja" },
  { id: "5", title: "Garki Area 11", subtitle: "Garki Area 11, Abuja" },
  { id: "6", title: "Port Harcourt GRA", subtitle: "GRA Phase 2, Port Harcourt" },
];


const defaultFormData: BookingFormData = {
 pickupLocation: "",
 dropoffLocation: "",
 noteForRider: "",
 vehicleType: "rider",
 numberOfItems: 1,
}
export default function BookLogisticsScreen() {
  const [formData, setFormData] = useState<BookingFormData>({ ...defaultFormData });
  const [isBooking, setIsBooking] = useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [serviceCharge, setServiceCharge] = useState<number | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(0)).current;
  const vehicleSelectAnim = useRef(new Animated.Value(0)).current;
 const { send_type } = useLocalSearchParams();


 useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Calculate price when both coordinates are selected
    if (pickupCoords && dropoffCoords) {
      calculatePrice();
    } else {
      setCalculatedPrice(null);
      setDeliveryFee(null);
      setServiceCharge(null);
      setEta(null);
    }
  }, [pickupCoords, dropoffCoords, formData.vehicleType]);

  const calculatePrice = async () => {
    if (!pickupCoords || !dropoffCoords) return;
    try {
      setIsCalculating(true);
      const vehicle = formData.vehicleType === "rider" ? "bike" : "van";
      const res = await orderService.calculateCharge({
        startLat: pickupCoords.lat,
        startLon: pickupCoords.lon,
        endLat: dropoffCoords.lat,
        endLon: dropoffCoords.lon,
        vehicleType: vehicle,
      });
      if (res?.success) {
        const d = res.data as any;
        setCalculatedPrice(d.totalAmount ?? null);
        setDeliveryFee(d.deliveryFee ?? null);
        setServiceCharge(d.serviceCharge ?? null);
        setEta(d.duration ?? null);
        // Animate price appearance
        Animated.spring(priceAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      } else {
        setCalculatedPrice(null);
        Alert.alert("Pricing Error", res?.message || "Unable to calculate price");
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("Pricing Error", e?.response?.data?.message || e?.message || "Unable to calculate price");
      setCalculatedPrice(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const searchLocations = async (query: string, type: "pickup" | "dropoff") => {
    if (query.length < 2) {
      if (type === "pickup") {
        setPickupSuggestions([]);
        setShowPickupSuggestions(false);
      } else {
        setDropoffSuggestions([]);
        setShowDropoffSuggestions(false);
      }
      return;
    }

    try {
      const res = await locationService.search(query);
      const features = (res?.data || []) as ILocationFeature[];

      const mapped: LocationSuggestion[] = features.map((f) => {
        const p = f.properties || ({} as any);
        const g = f.geometry || ({} as any);
        const parts: string[] = [];
        if (p.street) parts.push(p.street);
        if (p.city) parts.push(p.city);
        if (p.state) parts.push(p.state);
        if (p.country) parts.push(p.country);
        if (p.postcode) parts.push(p.postcode);
        const subtitle = parts.filter(Boolean).join(", ");
        const title = p.name || subtitle || `${p.type || "Location"}`;
        return {
          id: `${p.osm_type || ""}_${p.osm_id || Math.random().toString(36).slice(2)}`,
          title,
          subtitle,
          lon: g?.coordinates?.[0],
          lat: g?.coordinates?.[1],
        };
      });

      const results = mapped.length > 0 ? mapped : mockLocations.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.subtitle.toLowerCase().includes(query.toLowerCase())
      );

      if (type === "pickup") {
        setPickupSuggestions(results);
        setShowPickupSuggestions(true);
      } else {
        setDropoffSuggestions(results);
        setShowDropoffSuggestions(true);
      }
    } catch (e) {
      // Fallback to simple mock filtering on error
      const filtered = mockLocations.filter(
        (location) =>
          location.title.toLowerCase().includes(query.toLowerCase()) ||
          location.subtitle.toLowerCase().includes(query.toLowerCase())
      );

      if (type === "pickup") {
        setPickupSuggestions(filtered);
        setShowPickupSuggestions(true);
      } else {
        setDropoffSuggestions(filtered);
        setShowDropoffSuggestions(true);
      }
    }
  };

  const selectLocation = (
    location: LocationSuggestion,
    type: "pickup" | "dropoff"
  ) => {
    const text =  location.title || location.subtitle || "";
    if (type === "pickup") {
      setFormData((prev) => ({ ...prev, pickupLocation: text }));
      setPickupCoords(location.lat && location.lon ? { lat: location.lat, lon: location.lon } : null);
      setShowPickupSuggestions(false);
    } else {
      setFormData((prev) => ({ ...prev, dropoffLocation: text }));
      setDropoffCoords(location.lat && location.lon ? { lat: location.lat, lon: location.lon } : null);
      setShowDropoffSuggestions(false);
    }
  };

  const selectVehicleType = (type: "rider" | "van") => {
    setFormData((prev) => ({ ...prev, vehicleType: type }));

    // Animate vehicle selection
    Animated.sequence([
      Animated.timing(vehicleSelectAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(vehicleSelectAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBooking = () => {
    if (!formData.pickupLocation || !formData.dropoffLocation || !pickupCoords || !dropoffCoords) {
      Alert.alert(
        "Missing Information",
        "Please select both pickup and dropoff locations from the suggestions"
      );
      return;
    }

    if (!calculatedPrice) {
      Alert.alert(
        "Price Calculation",
        "Please wait for price calculation to complete"
      );
      return;
    }

    const vehicle = formData.vehicleType === "rider" ? "bike" : "van";

    Alert.alert(
      "Confirm Booking",
      `Book ${vehicle} for ₦${calculatedPrice.toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book Now",
          onPress: async () => {
            setIsBooking(true);
            try {
              const res = await orderService.create(
                {
                  startLat: pickupCoords.lat,
                  startLon: pickupCoords.lon,
                  endLat: dropoffCoords.lat,
                  endLon: dropoffCoords.lon,
                  vehicleType: vehicle,
                },
                {
                  dropOffLocation: formData.dropoffLocation,
                  pickUpLocation: formData.pickupLocation,
                  userOrderRole: (send_type ?? "sender") as string,
                  vehicleType: vehicle,
                  noteForRider: formData.noteForRider || null,
                }
              );

              if (res?.success) {
                Alert.alert("Success", "Order created successfully", [
                  { text: "OK", onPress: () => {
									 setFormData(defaultFormData)
									 router.push('/(tabs)/history') }},
                ]);
              } else {
                const msg = res?.message || "Unable to create order";
                if (/insufficient balance/i.test(msg)) {
                  Alert.alert(
                    "Insufficient Balance",
                    "Your wallet balance is insufficient. Would you like to fund your wallet now?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Fund Wallet", onPress: () => router.push("/payment") },
                    ]
                  );
                } else {
                  Alert.alert("Booking Failed", msg);
                }
              }
            } catch (e: any) {
              const msg = e?.response?.data?.message || e?.message || "Unable to create order";
              if (/insufficient balance/i.test(String(msg))) {
                Alert.alert(
                  "Insufficient Balance",
                  "Your wallet balance is insufficient. Would you like to fund your wallet now?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Fund Wallet", onPress: () => router.push("/payment") },
                  ]
                );
              } else {
                Alert.alert("Booking Failed", String(msg));
              }
            } finally {
              setIsBooking(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Logistics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rs(140) }}>
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Location Inputs */}
          <View
            style={[
              styles.locationSection,
              (showPickupSuggestions && pickupSuggestions.length > 0) ||
              (showDropoffSuggestions && dropoffSuggestions.length > 0)
                ? styles.locationSectionElevated
                : null,
            ]}
          >
            {/* Pickup Location Input */}
            <View
              style={[
                styles.locationInputContainer,
                (showPickupSuggestions && pickupSuggestions.length > 0) && styles.raised,
              ]}
            >
              <Text style={styles.inputLabel}>📍 Pickup Location</Text>
              <TextInput
                style={styles.locationInput}
                value={formData.pickupLocation}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, pickupLocation: text }));
                  setPickupCoords(null);
                  searchLocations(text, "pickup");
                }}
                placeholder="Where should we pick up from?"
                placeholderTextColor="#999"
              />
              {showPickupSuggestions && pickupSuggestions.length > 0 && (
                <Animated.View
                  style={[styles.suggestionsContainer, { opacity: fadeAnim }]}
                >
                  {pickupSuggestions.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      style={styles.suggestionItem}
                      onPress={() => selectLocation(location, "pickup")}
                    >
                      <Text style={styles.suggestionName}>{location.title}</Text>
                      <Text style={styles.suggestionAddress}>
                        {location.subtitle}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </View>

            <View style={styles.locationConnector}>
              <View style={styles.connectorLine} />
              <View style={styles.connectorDot} />
            </View>

            {/* Drop-off Location Input */}
            <View
              style={[
                styles.locationInputContainer,
                (showDropoffSuggestions && dropoffSuggestions.length > 0) && styles.raised,
              ]}
            >
              <Text style={styles.inputLabel}>🎯 Drop-off Location</Text>
              <TextInput
                style={styles.locationInput}
                value={formData.dropoffLocation}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, dropoffLocation: text }));
                  setDropoffCoords(null);
                  searchLocations(text, "dropoff");
                }}
                placeholder="Where should we deliver to?"
                placeholderTextColor="#999"
              />
              {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                <Animated.View
                  style={[styles.suggestionsContainer, { opacity: fadeAnim }]}
                >
                  {dropoffSuggestions.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      style={styles.suggestionItem}
                      onPress={() => selectLocation(location, "dropoff")}
                    >
                      <Text style={styles.suggestionName}>{location.title}</Text>
                      <Text style={styles.suggestionAddress}>
                        {location.subtitle}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </View>
          </View>

          {/* Vehicle Type Selection */}
          <Animated.View style={[styles.vehicleSection]}>
            <Text style={styles.sectionTitle}>🚗 Choose Vehicle Type</Text>
            <View style={styles.vehicleOptions}>
              <TouchableOpacity
                style={[
                  styles.vehicleOption,
                  formData.vehicleType === "rider" && styles.selectedVehicle,
                ]}
                onPress={() => selectVehicleType("rider")}
              >
                <Text style={styles.vehicleIcon}>🏍️</Text>
                <Text style={styles.vehicleTitle}>Rider</Text>
                <Text style={styles.vehicleSubtitle}>Fast delivery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.vehicleOption,
                  formData.vehicleType === "van" && styles.selectedVehicle,
                ]}
                onPress={() => selectVehicleType("van")}
              >
                <Text style={styles.vehicleIcon}>🚐</Text>
                <Text style={styles.vehicleTitle}>Van</Text>
                <Text style={styles.vehicleSubtitle}>Large items</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Note for Rider */}
          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>
              💬 Note for Rider (Optional)
            </Text>
            <TextInput
              style={styles.noteInput}
              value={formData.noteForRider}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, noteForRider: text }))
              }
              placeholder="Any special instructions for the rider..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
        </Animated.View>

      </ScrollView>

      <View style={styles.priceContainer}>
        <View>
          {isCalculating ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={{ marginLeft: 8, fontSize: rs(16), color: '#333' }}>Calculating…</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.price, { color: 'black' }]}>₦{calculatedPrice?.toLocaleString() || 0}</Text>
              <Text style={styles.amountSubtitle}>TOTAL AMOUNT</Text>
            </>
          )}
        </View>
        <TouchableOpacity
          onPress={handleBooking}
          disabled={
            isCalculating ||
            isBooking ||
            !formData.pickupLocation ||
            !formData.dropoffLocation ||
            !pickupCoords ||
            !dropoffCoords ||
            !calculatedPrice
          }
        >
          {isBooking ? (
            <View style={[styles.placeOrder, { flexDirection: 'row' }]}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 8, fontSize: rs(18), fontWeight: '600' }}>Booking…</Text>
            </View>
          ) : (
            <Text style={[styles.placeOrder]}>Book Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {isBooking && (
        <View style={styles.bookingOverlay} pointerEvents="auto">
          <View style={styles.bookingOverlayBox}>
            <ActivityIndicator size="large" color="#00B624" />
            <Text style={styles.bookingOverlayText}>Booking your ride…</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(20),
    paddingVertical: rs(16),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: rs(40),
    height: rs(40),
    justifyContent: "center",
  },
  backArrow: {
    fontSize: rs(24),
    color: "#000",
  },
  headerTitle: {
    fontSize: rs(20),
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    width: rs(40),
  },
  content: {
    flex: 1,
    paddingHorizontal: rs(10),
    paddingTop: rs(15),
  },
  formContainer: {
    paddingBottom: rs(20),
  },
  locationSection: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(20),
    marginBottom: rs(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: "visible",
  },
  locationSectionElevated: {
    zIndex: 3000,
    elevation: 600,
    overflow: "visible",
  },
  locationInputContainer: {
    position: "relative",
    zIndex: 100,
  },
  inputLabel: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#000",
    marginBottom: rs(8),
  },
  locationInput: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: rs(12),
    paddingHorizontal: rs(12),
    paddingVertical: rs(13),
    fontSize: rs(14),
    backgroundColor: "#f8f9fa",
  },
  locationConnector: {
    alignItems: "center",
    paddingVertical: rs(12),
  },
  connectorLine: {
    width: rs(2),
    height: rs(20),
    backgroundColor: "#00B624",
  },
  connectorDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: "#00B624",
    marginTop: -rs(4),
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: rs(12),
    marginTop: rs(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 500,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: rs(16),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionName: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#000",
    marginBottom: rs(4),
  },
  suggestionAddress: {
    fontSize: rs(14),
    color: "#666",
  },
  vehicleSection: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(20),
    marginBottom: rs(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: rs(18),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(16),
  },
  vehicleOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  vehicleOption: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: rs(12),
    padding: rs(10),
    alignItems: "center",
    marginHorizontal: rs(6),
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedVehicle: {
    borderColor: "#00B624",
    backgroundColor: "#f0fff4",
  },
  vehicleIcon: {
    fontSize: rs(32),
    marginBottom: rs(8),
  },
  vehicleTitle: {
    fontSize: rs(16),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(4),
  },
  vehicleSubtitle: {
    fontSize: rs(12),
    color: "#666",
    marginBottom: rs(8),
  },
  vehiclePrice: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#00B624",
  },
  itemsSection: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(20),
    marginBottom: rs(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemsCounter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButton: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    backgroundColor: "#00B624",
    justifyContent: "center",
    alignItems: "center",
  },
  counterText: {
    fontSize: rs(20),
    fontWeight: "bold",
    color: "#fff",
  },
  itemsCount: {
    fontSize: rs(24),
    fontWeight: "bold",
    color: "#000",
    marginHorizontal: rs(32),
  },
  noteSection: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(20),
    marginBottom: rs(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteInput: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: rs(12),
    paddingHorizontal: rs(16),
    paddingVertical: rs(16),
    fontSize: rs(16),
    backgroundColor: "#f8f9fa",
    textAlignVertical: "top",
    minHeight: rs(80),
  },
  priceSection: {
    backgroundColor: "#00B624",
    borderRadius: rs(16),
    padding: rs(24),
    alignItems: "center",
    marginBottom: rs(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  priceLabel: {
    fontSize: rs(16),
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: rs(8),
  },
  priceAmount: {
    fontSize: rs(32),
    fontWeight: "bold",
    color: "#fff",
  },
  calculatingContainer: {
    alignItems: "center",
  },
  calculatingText: {
    fontSize: rs(18),
    color: "#fff",
    marginBottom: rs(12),
  },
  loadingDots: {
    flexDirection: "row",
  },
  dot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: "#fff",
    marginHorizontal: rs(4),
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  bookButton: {
    backgroundColor: "#00B624",
    paddingVertical: rs(18),
    borderRadius: rs(16),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: rs(18),
    fontWeight: "bold",
  },
  disabledText: {
    color: "#999",
  },
  priceContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  bookingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingOverlayBox: {
    backgroundColor: '#fff',
    paddingVertical: rs(20),
    paddingHorizontal: rs(24),
    borderRadius: rs(12),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  bookingOverlayText: {
    marginTop: rs(10),
    fontSize: rs(16),
    fontWeight: '600',
    color: '#222',
  },
  price: {
    fontSize: rs(32),
    fontWeight: "bold",
    color: "black",
  },
  placeOrder: {
    backgroundColor: "black",
    color: "white",
    borderRadius: rs(12),
    paddingHorizontal: rs(20),
    paddingVertical: rs(12),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: rs(20),
    fontWeight: "600",
    fontFamily: poppinsFonts.bold,
  },
  amountSubtitle: {
    textDecorationLine: "underline",
    fontSize: rs(13),
    fontWeight: "bold",
  },
  raised: {
    zIndex: 3000,
    elevation: 600,
  },
});
