import { router } from "expo-router";
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
} from "react-native";
import { poppinsFonts } from "../../theme/fonts";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82; // globally downscale sizes
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);
interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface BookingFormData {
  pickupLocation: string;
  dropoffLocation: string;
  noteForRider: string;
  vehicleType: "rider" | "van";
  numberOfItems: number;
}

const mockLocations: LocationSuggestion[] = [
  {
    id: "1",
    name: "Victoria Island",
    address: "Victoria Island, Lagos",
    city: "Lagos",
  },
  { id: "2", name: "Ikeja GRA", address: "Ikeja GRA, Lagos", city: "Lagos" },
  {
    id: "3",
    name: "Lekki Phase 1",
    address: "Lekki Phase 1, Lagos",
    city: "Lagos",
  },
  { id: "4", name: "Wuse 2", address: "Wuse 2, Abuja", city: "Abuja" },
  {
    id: "5",
    name: "Garki Area 11",
    address: "Garki Area 11, Abuja",
    city: "Abuja",
  },
  {
    id: "6",
    name: "Port Harcourt GRA",
    address: "GRA Phase 2, Port Harcourt",
    city: "Port Harcourt",
  },
];

export default function BookLogisticsScreen() {
  const [formData, setFormData] = useState<BookingFormData>({
    pickupLocation: "",
    dropoffLocation: "",
    noteForRider: "",
    vehicleType: "rider",
    numberOfItems: 1,
  });

  const [pickupSuggestions, setPickupSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(0)).current;
  const vehicleSelectAnim = useRef(new Animated.Value(0)).current;

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
    // Calculate price when both locations are selected
    if (formData.pickupLocation && formData.dropoffLocation) {
      calculatePrice();
    } else {
      setCalculatedPrice(null);
    }
  }, [formData.pickupLocation, formData.dropoffLocation, formData.vehicleType]);

  const calculatePrice = () => {
    setIsCalculating(true);

    // Simulate price calculation
    setTimeout(() => {
      const basePrice = formData.vehicleType === "rider" ? 800 : 1500;
      const distance = Math.random() * 20 + 5; // Random distance 5-25km
      const price = Math.round(basePrice + distance * 50);

      setCalculatedPrice(price);
      setIsCalculating(false);

      // Animate price appearance
      Animated.spring(priceAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 1500);
  };

  const searchLocations = (query: string, type: "pickup" | "dropoff") => {
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

    const filtered = mockLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase())
    );

    if (type === "pickup") {
      setPickupSuggestions(filtered);
      setShowPickupSuggestions(true);
    } else {
      setDropoffSuggestions(filtered);
      setShowDropoffSuggestions(true);
    }
  };

  const selectLocation = (
    location: LocationSuggestion,
    type: "pickup" | "dropoff"
  ) => {
    if (type === "pickup") {
      setFormData((prev) => ({ ...prev, pickupLocation: location.address }));
      setShowPickupSuggestions(false);
    } else {
      setFormData((prev) => ({ ...prev, dropoffLocation: location.address }));
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
    if (!formData.pickupLocation || !formData.dropoffLocation) {
      Alert.alert(
        "Missing Information",
        "Please select both pickup and dropoff locations"
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

    Alert.alert(
      "Confirm Booking",
      `Book ${formData.vehicleType} for ₦${calculatedPrice.toLocaleString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book Now",
          onPress: () => {
            Alert.alert("Success", "Your booking has been confirmed!", [
              { text: "OK", onPress: () => router.back() },
            ]);
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
          <View style={styles.locationSection}>
            {/* Pickup Location Input */}
            <View style={styles.locationInputContainer}>
              <Text style={styles.inputLabel}>📍 Pickup Location</Text>
              <TextInput
                style={styles.locationInput}
                value={formData.pickupLocation}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, pickupLocation: text }));
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
                      <Text style={styles.suggestionName}>{location.name}</Text>
                      <Text style={styles.suggestionAddress}>
                        {location.address}
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
            <View style={styles.locationInputContainer}>
              <Text style={styles.inputLabel}>🎯 Drop-off Location</Text>
              <TextInput
                style={styles.locationInput}
                value={formData.dropoffLocation}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, dropoffLocation: text }));
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
                      <Text style={styles.suggestionName}>{location.name}</Text>
                      <Text style={styles.suggestionAddress}>
                        {location.address}
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

        <View style={styles.priceContainer}>
				 <View>
            <Text style={[styles.price, { color: "black" }]}>
              ₦{calculatedPrice?.toLocaleString() || 0}
            </Text>
					<Text style={styles.amountSubtitle}>TOTAL AMOUNT</Text>
				 </View>
          <TouchableOpacity
            onPress={handleBooking}
            disabled={
              !formData.pickupLocation ||
              !formData.dropoffLocation ||
              !calculatedPrice
            }
          >
            <Text style={[styles.placeOrder]}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    elevation: 3,
  },
  locationInputContainer: {
    position: "relative",
    zIndex: 1,
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
    elevation: 5,
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
    justifyContent: "space-between",
    flexDirection: "row",
    shadowColor: "#000",
    borderWidth: 1,
    borderColor: "#eee",
    shadowOffset: { width: 0, height: 4 },
	 padding: 10,
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
 }
});
