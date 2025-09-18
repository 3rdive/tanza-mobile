import { router } from "expo-router";
import type React from "react";
import type { JSX } from "react"; // Declare JSX variable
import { useState, useMemo, useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { userService } from "@/lib/api";
import { useUser } from "@/redux/hooks/hooks";

const UI_SCALE = 0.82; // downscale globally
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
}

interface EditProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export default function EditProfileScreen(): JSX.Element { 
  const { user, access_token, setUser } = useUser();
  const initialFirst = (user as any)?.firstName || "";
  const initialLast = (user as any)?.lastName || "";
  const initialEmail = (user as any)?.email || "";
  const initialMobile = (user as any)?.mobile || "";
  const initialCode = (user as any)?.countryCode || "+234";
  const initialPhoneDisplay = initialMobile ? `${initialCode}${initialMobile}` : "";
  const [formData, setFormData] = useState<EditProfileFormData>({
    firstName: initialFirst,
    lastName: initialLast,
    email: initialEmail,
    phoneNumber: initialPhoneDisplay,
  });

  useEffect(() => {
    setFormData({
      firstName: initialFirst,
      lastName: initialLast,
      email: initialEmail,
      phoneNumber: initialPhoneDisplay,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFirst, initialLast, initialEmail, initialPhoneDisplay]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Parse phone into countryCode and mobile (API expects both)
      const raw = (formData.phoneNumber || "").replace(/\s|\-/g, "");
      let countryCode = initialCode;
      let mobile = raw;
      if (raw.startsWith("+234")) {
        countryCode = "+234";
        mobile = raw.replace("+234", "");
      } else if (raw.startsWith("+")) {
        // Fallback: split at first 4 chars as code, rest as number
        countryCode = raw.slice(0, 4);
        mobile = raw.slice(4);
      } else if (raw.startsWith("0")) {
        // If local 0xxxxxxxxxx, strip leading 0 and use default +234
        countryCode = initialCode || "+234";
        mobile = raw.replace(/^0/, "");
      } else {
        countryCode = initialCode || "+234";
        mobile = raw;
      }
      mobile = mobile.replace(/\D/g, "");

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        profilePic: (user as any)?.profilePic || null,
        countryCode,
        email: formData.email.trim(),
        mobile,
      } as const;

      const resp = await userService.updateProfile(payload);
      if (resp?.success && resp.data) {
        // Update redux user while preserving token
        const updatedUser = resp.data as any;
        await setUser({ access_token: access_token || null, user: updatedUser });
        Alert.alert("Success", "Your profile has been updated successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Update failed", resp?.message || "Please try again");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to update profile. Please try again.";
      // Optionally mark field-specific errors based on backend message
      if (typeof msg === "string") {
        if (msg.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: msg }));
        } else if (msg.toLowerCase().includes("mobile")) {
          setErrors((prev) => ({ ...prev, phoneNumber: msg }));
        }
      }
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (
    field: keyof EditProfileFormData,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={[styles.saveButton, isLoading && styles.disabledButton]}
        >
          <Text
            style={[styles.saveButtonText, isLoading && styles.disabledText]}
          >
            {isLoading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {formData.firstName[0]?.toUpperCase() || "J"}
                {formData.lastName[0]?.toUpperCase() || "D"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.changePhotoButton}
            disabled={isLoading}
          >
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.errorInput]}
              value={formData.firstName}
              onChangeText={(text) => updateFormData("firstName", text)}
              placeholder="Enter your first name"
              keyboardType="default"
              autoCapitalize="words"
              editable={!isLoading}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.errorInput]}
              value={formData.lastName}
              onChangeText={(text) => updateFormData("lastName", text)}
              placeholder="Enter your last name"
              keyboardType="default"
              autoCapitalize="words"
              editable={!isLoading}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              value={formData.email}
              onChangeText={(text) => updateFormData("email", text)}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.errorInput]}
              value={formData.phoneNumber}
              onChangeText={(text) => updateFormData("phoneNumber", text)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              autoCapitalize="sentences"
              editable={!isLoading}
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Your profile information is used to personalize your experience and
            for account verification purposes.
          </Text>
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
  saveButton: {
    paddingHorizontal: rs(16),
    paddingVertical: rs(8),
  },
  saveButtonText: {
    fontSize: rs(16),
    color: "#00B624",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#999",
  },
  content: {
    flex: 1,
    paddingHorizontal: rs(20),
    paddingTop: rs(24),
  },
  profilePictureSection: {
    alignItems: "center",
    paddingVertical: rs(32),
    marginBottom: rs(24),
  },
  avatarContainer: {
    marginBottom: rs(16),
  },
  avatarFallback: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
    backgroundColor: "#00B624",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: rs(24),
    fontWeight: "bold",
    color: "#fff",
  },
  changePhotoButton: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(8),
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: "#00B624",
  },
  changePhotoText: {
    fontSize: rs(14),
    color: "#00B624",
    fontWeight: "500",
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    padding: rs(20),
    marginBottom: rs(24),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: rs(20),
  },
  label: {
    fontSize: rs(16),
    color: "#000",
    marginBottom: rs(8),
    fontWeight: "500",
  },
  input: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: rs(12),
    paddingHorizontal: 16,
    paddingVertical: rs(16),
    fontSize: rs(16),
    backgroundColor: "#fff",
  },
  errorInput: {
    borderColor: "#ff4444",
  },
  errorText: {
    fontSize: rs(14),
    color: "#ff4444",
    marginTop: rs(4),
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    padding: rs(20),
    marginBottom: rs(40),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: rs(14),
    color: "#666",
    lineHeight: rs(20),
    textAlign: "center",
  },
});
