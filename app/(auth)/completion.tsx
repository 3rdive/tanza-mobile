// CompleteInfoScreen.tsx
import { useDeviceLocation } from "@/hooks/location.hook";
import {
  authService,
  ILocationFeature,
  locationService,
  storageService,
} from "@/lib/api";
import { rs } from "@/lib/functions";
import {
  useAppDispatch,
  useAppSelector,
  useAuthFlow,
  useUser,
} from "@/redux/hooks/hooks";
import { clearSelectedLocation } from "@/redux/slices/locationSearchSlice";
import { MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

//TODO: align email in complete.tsx, add userAddress to profileEdit, prefill pickup or dropOff location with users address

export default function CompleteInfoScreen() {
  const { email, mobile, otp } = useAuthFlow();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState<string>("");
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [addressText, setAddressText] = useState("");
  const [addressCoords, setAddressCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [addrSuggestions, setAddrSuggestions] = useState<
    {
      id: string;
      title: string;
      subtitle: string;
      lat?: number;
      lon?: number;
    }[]
  >([]);
  const [showAddrSuggestions, setShowAddrSuggestions] = useState(false);
  const { latitude, longitude, locationAddress } = useDeviceLocation();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const selected = useAppSelector(
    (s) => (s as any).locationSearch?.selected || null
  );

  console.log("otp", otp);

  const hasTwoWords = (s: string) => s.trim().split(/\s+/).length >= 2;

  const isFormValid = () => {
    return (
      hasTwoWords(fullName) &&
      password.length >= 8 &&
      !!addressText &&
      !!addressCoords &&
      !!profilePic
    );
  };

  const handleComplete = async () => {
    if (!isFormValid()) {
      Alert.alert("Invalid Information", "Please fill all fields correctly");
      return;
    }

    setIsLoading(true);

    try {
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      const payload = {
        firstName,
        lastName,
        email: email as string,
        mobile: mobile as string,
        password,
        otp: otp as string,
        profilePic: profilePic?.trim() ? profilePic.trim() : null,
        countryCode: "+234",
        usersAddress: {
          name: addressText,
          lat: addressCoords!.lat,
          lon: addressCoords!.lon,
        },
      };
      const resp = await authService.signUp(payload);
      if (resp.success) {
        await setUser(resp.data);
        Alert.alert("Success", "Account created successfully!");
      } else {
        Alert.alert("Sign up failed", resp.message || "Please try again");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "An error occurred during sign up";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const searchAddress = async (q: string) => {
    if (!q || q.length < 2) {
      setAddrSuggestions([]);
      setShowAddrSuggestions(false);
      return;
    }
    try {
      const res = await locationService.search(q);
      const features = (res?.data || []) as ILocationFeature[];
      const mapped = features.map((f) => {
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
          id: `${p.osm_type || ""}_${
            p.osm_id || Math.random().toString(36).slice(2)
          }`,
          title,
          subtitle,
          lon: g?.coordinates?.[0],
          lat: g?.coordinates?.[1],
        };
      });
      setAddrSuggestions(mapped);
      setShowAddrSuggestions(true);
    } catch (_e) {
      setAddrSuggestions([]);
      setShowAddrSuggestions(false);
    }
  };

  const selectAddress = (s: {
    title: string;
    subtitle: string;
    lat?: number;
    lon?: number;
  }) => {
    const text = s.title || s.subtitle || "";
    setAddressText(text);
    setAddressCoords(s.lat && s.lon ? { lat: s.lat, lon: s.lon } : null);
    setShowAddrSuggestions(false);
  };

  const useCurrentLocation = async () => {
    try {
      if (!longitude || !latitude) {
        Alert.alert("Location Error", "Unable to fetch current location");
        return;
      }
      const lat = latitude as any;
      const lon = longitude as any;
      setAddressText(locationAddress);
      setAddressCoords({ lat, lon });
      setShowAddrSuggestions(false);
    } catch (e: any) {
      Alert.alert(
        "Location Error",
        e?.message || "Unable to fetch current location"
      );
    }
  };

  useEffect(() => {
    if (!email) {
      if (mobile) {
        router.push("/(auth)/email-entry");
      } else {
        router.replace("/(auth)/mobile-entry");
      }
    }
  }, [email]);

  // Apply selected address from full-screen search when we return focused
  useEffect(() => {
    if (!isFocused) return;
    if (
      selected &&
      (selected.context === "usersAddress" || !selected.context)
    ) {
      const text = selected.title || selected.subtitle || "";
      setAddressText(text);
      if (selected.lat && selected.lon) {
        setAddressCoords({ lat: selected.lat, lon: selected.lon });
      } else {
        setAddressCoords(null);
      }
      dispatch(clearSelectedLocation());
      setShowAddrSuggestions(false);
    }
  }, [isFocused, selected]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      ></KeyboardAvoidingView>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.subtitle}>
          Let us know how to properly address you and secure your account
          &middot;{" "}
          <Text
            style={{
              color: "blue",
            }}
            onPress={() => router.back()}
          >
            {email}
          </Text>
        </Text>
        {/* Profile picture avatar + upload */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Profile Photo</Text>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              {profilePic ? (
                <Image
                  source={{ uri: profilePic }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>
                    {fullName.trim().split(/\s+/)[0]?.[0]?.toUpperCase() || "P"}
                    {fullName.trim().split(/\s+/)[1]?.[0]?.toUpperCase() || ""}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.selectPhotoBtn}
              onPress={async () => {
                try {
                  const perm =
                    await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (perm.status !== "granted") {
                    Alert.alert(
                      "Permission needed",
                      "We need access to your photos to select a profile picture."
                    );
                    return;
                  }
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                  });
                  if (result.canceled) return;
                  const uri = result.assets?.[0]?.uri;
                  if (!uri) return;
                  // Optimistic: show local image while uploading
                  // We'll upload and replace with the server URL when done
                  let uploadingAlertShown = false;
                  const timer = setTimeout(() => {
                    uploadingAlertShown = true;
                  }, 400);
                  const resp = await storageService.upload({
                    uri,
                    type: "image/jpeg",
                  });
                  clearTimeout(timer);
                  if (resp?.success) {
                    const url = (resp.data as any)?.url;
                    if (url) setProfilePic(url);
                  } else {
                    Alert.alert(
                      "Upload failed",
                      resp?.message || "Unable to upload image"
                    );
                  }
                } catch (e: any) {
                  Alert.alert(
                    "Upload Error",
                    e?.response?.data?.message ||
                      e?.message ||
                      "Unable to upload image"
                  );
                }
              }}
            >
              <Text style={styles.selectPhotoBtnText}>Select Photo</Text>
            </TouchableOpacity>
          </View>
          {/*<Text style={styles.helperText}>Image will be uploaded and linked to your account.</Text>*/}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name (first and last)"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <Text style={styles.helperText}>
            Enter at least first and last name
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>Minimum 8 characters</Text>
        </View>

        {/* Address input with autocomplete and current location */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Address</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Search address (e.g., Victoria Island)"
              value={addressText}
              onFocus={() =>
                router.push({
                  pathname: "/location-search",
                  params: { context: "usersAddress" },
                })
              }
              showSoftInputOnFocus={false}
              caretHidden
              autoCapitalize="sentences"
            />
            {!!addressText && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Clear address"
                onPress={() => {
                  setAddressText("");
                  setAddressCoords(null);
                  setShowAddrSuggestions(false);
                }}
                style={styles.clearBtn}
              >
                <MaterialIcons name="cancel" size={24} color="red" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={useCurrentLocation}
            style={[styles.useLocationBtn]}
          >
            <Text style={styles.useLocationBtnText}>Use current location</Text>
          </TouchableOpacity>

          {showAddrSuggestions && addrSuggestions.length > 0 && (
            <View style={styles.suggestionBox}>
              {addrSuggestions.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.suggestionItem}
                  onPress={() => selectAddress(s)}
                >
                  <Text style={styles.suggestionTitle}>{s.title}</Text>
                  {!!s.subtitle && (
                    <Text style={styles.suggestionSubtitle}>{s.subtitle}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            !isFormValid() && styles.disabledButton,
          ]}
          onPress={handleComplete}
          disabled={!isFormValid()}
        >
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={[
                styles.completeText,
                !isFormValid() && styles.disabledText,
              ]}
            >
              Complete Setup
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 20,
  },
  backArrow: {
    fontSize: rs(24),
    color: "#000",
  },
  title: {
    fontSize: rs(28),
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: rs(16),
    color: "#666",
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: rs(16),
    color: "#000",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    color: "black",
    borderWidth: rs(2),
    borderColor: "#e0e0e0",
    borderRadius: rs(12),
    paddingHorizontal: rs(16),
    paddingVertical: rs(16),
    fontSize: rs(16),
    backgroundColor: "#fff",
  },
  errorInput: {
    borderColor: "#ff4444",
  },
  helperText: {
    fontSize: rs(14),
    color: "#666",
    marginTop: 4,
  },
  errorText: {
    fontSize: rs(14),
    color: "#ff4444",
    marginTop: 4,
  },
  emailDisplay: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  emailLabel: {
    fontSize: rs(14),
    color: "#666",
    marginBottom: 4,
  },
  emailText: {
    fontSize: rs(16),
    color: "#000",
    fontWeight: "500",
  },
  completeButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  completeText: {
    color: "#fff",
    fontSize: rs(18),
    fontWeight: "600",
  },
  disabledText: {
    color: "#999",
  },
  useLocationBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#f0f9f1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d6f5db",
  },
  useLocationBtnText: {
    color: "#00B624",
    fontWeight: "600",
  },
  suggestionBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionTitle: {
    fontSize: rs(15),
    color: "#000",
    fontWeight: "600",
  },
  suggestionSubtitle: {
    fontSize: rs(13),
    color: "#666",
    marginTop: 2,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f2f2f2",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    color: "#666",
    fontSize: rs(20),
    fontWeight: "700",
  },
  selectPhotoBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectPhotoBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  inputWrapper: {
    position: "relative",
  },
  clearBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  clearBtnText: {
    fontSize: rs(18),
    color: "#999",
    fontWeight: "600",
  },
});
