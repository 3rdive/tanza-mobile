// MobileEntryScreen.tsx
import { Divider } from "@/components/divider";
import { authService } from "@/lib/api";
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants";
import { useAuthFlow } from "@/redux/hooks/hooks";
import { poppinsFonts } from "@/theme/fonts";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue(n * UI_SCALE);

export default function MobileEntryScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const countryCode = `+${DEFAULT_COUNTRY_CODE}`;
  const { setMobile } = useAuthFlow();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert("Invalid Number", "Please enter a valid phone number");
      return;
    }

    try {
      setLoading(true);
      // Check if mobile already exists; if it does, alert and stop
      const exists = await authService.userExistsByMobile(phoneNumber);
      if (exists) {
        Alert.alert(
          "Mobile Already Registered",
          "This mobile number is already associated with an account. Please sign in or use a different number.",
          [
            { text: "OK", onPress: () => {} },
            { text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
          ],
        );
        return;
      }
      const resp = await authService.sendOtp({
        otpType: "MOBILE",
        reference: phoneNumber,
      });
      if (resp.success) {
        setMobile(phoneNumber);
        router.push("/(auth)/otp-verification");
      } else {
        Alert.alert("Failed", resp.message || "Unable to send OTP");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "An error occurred while sending OTP";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Enter your mobile number</Text>
          <Text style={styles.subtitle}>
            We&#39;ll send you a verification code to confirm your number
          </Text>

          <View style={styles.phoneContainer}>
            <TouchableOpacity style={styles.countrySelector}>
              <Text style={styles.flag}>🇳🇬</Text>
              <Text style={styles.countryCode}>{countryCode}</Text>
              <Text style={styles.dropdown}>▼</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.phoneInput}
              placeholder="9153065907"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              phoneNumber.length < 10 && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={phoneNumber.length < 10}
          >
            {
              <Text
                style={[
                  styles.continueText,
                  (phoneNumber.length < 10 || loading) && styles.disabledText,
                ]}
              >
                {loading ? "loading..." : "Continue"}
              </Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Entypo name="app-store" size={19} color="black" />
            <Text style={styles.socialText}>Signup with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            {/*<Text style={styles.socialIcon}>G</Text>*/}
            <AntDesign name="google" size={19} />
            <Text style={styles.socialText}>Signup with Google</Text>
          </TouchableOpacity>
          <Divider />

          <TouchableOpacity
            style={[
              styles.continueButton,
              phoneNumber.length >= 10 && styles.disabledButton,
            ]}
            onPress={() => router.replace("/(auth)/sign-in")}
            disabled={phoneNumber.length >= 10}
          >
            <Text
              style={[
                styles.continueText,
                phoneNumber.length >= 10 && styles.disabledText,
              ]}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By proceeding, you consent to get calls, WhatsApp or SMS messages,
            including by automated means, from LogiFlow and its affiliates to
            the number provided.{" "}
            <Link href={".."}>
              And Here by Agree to our terms and condition
            </Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: rs(24),
    paddingTop: rs(20),
  },
  backButton: {
    width: rs(40),
    height: rs(40),
    justifyContent: "center",
    marginBottom: rs(20),
  },
  backArrow: {
    fontSize: rs(24),
    color: "#000",
  },
  title: {
    fontSize: rs(28),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(8),
    fontFamily: poppinsFonts.bold,
  },
  subtitle: {
    fontSize: rs(18),
    color: "#666",
    marginBottom: rs(40),
    lineHeight: rs(22),
    fontFamily: poppinsFonts.regular,
  },
  phoneContainer: {
    flexDirection: "row",
    marginBottom: rs(30),
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: rs(16),
    paddingVertical: rs(16),
    borderRadius: rs(12),
    marginRight: rs(12),
  },
  flag: {
    fontSize: rs(20),
    marginRight: rs(8),
  },
  countryCode: {
    fontSize: rs(16),
    color: "#000",
    marginRight: rs(8),
  },
  dropdown: {
    fontSize: rs(12),
    color: "#666",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: rs(16),
    paddingVertical: rs(16),
    borderRadius: rs(12),
    fontSize: rs(16),
  },
  continueButton: {
    backgroundColor: "#000",
    paddingVertical: rs(16),
    borderRadius: rs(12),
    alignItems: "center",
    marginBottom: rs(30),
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  continueText: {
    color: "#fff",
    fontSize: rs(18),
    fontWeight: "600",
  },
  disabledText: {
    color: "#999",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    gap: rs(10),
    paddingVertical: rs(16),
    paddingHorizontal: rs(20),
    fontFamily: poppinsFonts.bold,
    borderRadius: rs(12),
    marginBottom: rs(12),
  },
  socialIcon: {
    fontSize: rs(20),
    marginRight: rs(16),
  },
  socialText: {
    fontSize: rs(16),
    color: "#000",
    fontWeight: "500",
  },
  disclaimer: {
    fontSize: rs(12),
    color: "#666",
    lineHeight: rs(18),
    marginTop: rs(20),
    textAlign: "center",
  },
});
