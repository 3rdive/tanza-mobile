// SignInScreen.tsx
import { authService } from "@/lib/api";
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants";
import { useUser } from "@/redux/hooks/hooks";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 1) * UI_SCALE);

export default function SignInScreen() {
  const [identifier, setIdentifier] = useState(""); // email or mobile
  const [mode, setMode] = useState<"EMAIL" | "MOBILE">("EMAIL");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { setUser } = useUser();

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateMobile = (value: string) => {
    // Accept numbers like 080..., 234..., or international +234..., min 7 digits
    const trimmed = value.trim();
    const mobileRegex = /^\+?\d{7,15}$/; // simple and permissive
    return mobileRegex.test(trimmed);
  };

  const isValidIdentifier = (value: string) =>
    mode === "EMAIL" ? validateEmail(value) : validateMobile(value);

  const handleContinue = async () => {
    if (!showPassword) {
      // First step - validate identifier and show loading
      if (!isValidIdentifier(identifier)) {
        Alert.alert(
          "Invalid input",
          mode === "EMAIL"
            ? "Please enter a valid email address"
            : "Please enter a valid mobile number"
        );
        return;
      }

      setIsLoading(true);

      try {
        const resp = await authService.checkExisting(identifier.trim());
        setIsLoading(false);
        if (resp?.success && resp?.data?.exists) {
          setShowPassword(true);
          // Start animation immediately after showing password field
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }, 50);
        } else {
          // const modeText = resp?.data?.registrationMode ? ` (${resp.data.registrationMode})` : '';
          Alert.alert(
            "Account not found",
            `No account found for the provided ${
              mode === "EMAIL" ? "email" : "mobile number"
            }.`
          );
        }
      } catch (e: any) {
        setIsLoading(false);
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Unable to verify account";
        Alert.alert("Error", msg);
      }
    } else {
      // Second step - handle sign in
      if (!password) {
        Alert.alert("Missing Password", "Please enter your password");
        return;
      }

      setIsLoading(true);

      try {
        const resp = await authService.login({
          emailOrMobile: identifier.trim(),
          password,
        });
        setIsLoading(false);
        if (resp.success) {
				 console.log("auth_response:__: ",resp.data);
				 await setUser(resp.data);
          Alert.alert("Success", "Signed in successfully!", [
            {
              text: "OK",
              onPress: () => {
                /* TODO: navigate to (tabs) */
              },
            },
          ]);
        } else {
          Alert.alert("Sign in failed", resp.message || "Please try again");
        }
      } catch (e: any) {
        setIsLoading(false);
        const msg =
          e?.response?.data?.message || e?.message || "An error occurred";
        Alert.alert("Error", msg);
      }
    }
  };

  const handleBack = () => {
    if (showPassword) {
      // <CHANGE> Reset animation value when going back
      fadeAnim.setValue(0);
      setShowPassword(false);
      setPassword("");
    } else {
      router.canGoBack() && router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.content}>
          {showPassword && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              {!showPassword
                ? "Enter your email or mobile number to continue"
                : "Enter your password to sign in"}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Toggle between Email and Mobile */}
            {!showPassword && (
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    mode === "EMAIL" && styles.toggleButtonActive,
                  ]}
                  onPress={() => {
                    setMode("EMAIL");
                    setIdentifier("");
                  }}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mode === "EMAIL" && styles.toggleTextActive,
                    ]}
                  >
                    Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    mode === "MOBILE" && styles.toggleButtonActive,
                  ]}
                  onPress={() => {
                    setMode("MOBILE");
                    setIdentifier("");
                  }}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mode === "MOBILE" && styles.toggleTextActive,
                    ]}
                  >
                    Mobile
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Identifier Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {mode === "EMAIL" ? "Email" : "Mobile number"}{" "}
                <Text style={{ color: "#999", fontSize: 12 }}>
                  (
                  {mode === "EMAIL"
                    ? "e.g. name@example.com"
                    : "include country code"}
                  )
                </Text>
              </Text>

              <View style={styles.phoneContainer}>
                {mode === "MOBILE" && (
                  <TouchableOpacity style={styles.countrySelector}>
                    <Text style={styles.flag}>🇳🇬</Text>
                    <Text
                      style={styles.countryCode}
                    >{`+${DEFAULT_COUNTRY_CODE}`}</Text>
                    <Text style={styles.dropdown}>▼</Text>
                  </TouchableOpacity>
                )}

                <TextInput
                  style={[
                    styles.input,
                    showPassword && styles.inputDisabled,
                    { flex: 1 },
                  ]}
                  placeholder={
                    mode === "EMAIL" ? "name@example.com" : "8012345678"
                  }
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType={
                    mode === "EMAIL" ? "email-address" : "phone-pad"
                  }
                  autoCapitalize={mode === "EMAIL" ? "none" : "none"}
                  autoCorrect={false}
                  maxLength={mode === "EMAIL" ? 254 : 10}
                  textContentType={
                    mode === "EMAIL" ? "emailAddress" : "telephoneNumber"
                  }
                  editable={!showPassword && !isLoading}
                />
              </View>
            </View>

            {/* Password Field - Fixed Animation */}
            {showPassword && (
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                  autoFocus={true}
                />
              </Animated.View>
            )}

            {/* Loading State */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>
                  {!showPassword
                    ? "Checking your account..."
                    : "Signing you in..."}
                </Text>
              </View>
            )}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              ((!isValidIdentifier(identifier) && !showPassword) ||
                (showPassword && !password) ||
                isLoading) &&
                styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={
              (!isValidIdentifier(identifier) && !showPassword) ||
              (showPassword && !password) ||
              isLoading
            }
          >
            <Text
              style={[
                styles.continueText,
                ((!isValidIdentifier(identifier) && !showPassword) ||
                  (showPassword && !password) ||
                  isLoading) &&
                  styles.disabledText,
              ]}
            >
              {!showPassword ? "Continue" : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Alternative Options */}
          {!showPassword && !isLoading && (
            <View style={styles.alternativeContainer}>
              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={() => router.replace("/(auth)/mobile-entry")}
              >
                <Text style={styles.createAccountText}>
                  Don&#39;t have an account? Create one
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Forgot Password */}
          {showPassword && !isLoading && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() =>
                router.push("/(auth)/reset_password/forgotten-password")
              }
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
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
  header: {
    marginBottom: rs(40),
  },
  title: {
    fontSize: rs(32),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(8),
  },
  subtitle: {
    fontSize: rs(16),
    color: "#666",
    lineHeight: rs(22),
  },
  formContainer: {},
  inputContainer: {
    marginBottom: rs(24),
  },
  label: {
    fontSize: rs(16),
    color: "#000",
    marginBottom: rs(8),
    fontWeight: "500",
  },
  input: {
    color: "black",
    borderWidth: rs(2),
    borderColor: "#e0e0e0",
    borderRadius: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rs(14),
    fontSize: rs(16),
    backgroundColor: "#fff",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#d0d0d0",
    color: "#666",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: rs(40),
  },
  loadingText: {
    fontSize: rs(16),
    color: "#666",
    marginTop: rs(16),
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
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: rs(4),
    borderRadius: rs(10),
    marginBottom: rs(16),
  },
  toggleButton: {
    flex: 1,
    paddingVertical: rs(10),
    alignItems: "center",
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: rs(4),
    elevation: 1,
  },
  toggleText: {
    color: "#666",
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#000",
    fontWeight: "600",
  },

  alternativeContainer: {
    marginBottom: rs(40),
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rs(24),
  },
  line: {
    flex: 1,
    height: rs(1),
    backgroundColor: "#e0e0e0",
  },
  orText: {
    marginHorizontal: rs(16),
    color: "#666",
    fontSize: rs(16),
  },
  createAccountButton: {
    alignItems: "center",
    paddingVertical: rs(12),
  },
  createAccountText: {
    fontSize: rs(16),
    color: "#000",
    fontWeight: "500",
  },
  forgotPasswordButton: {
    alignItems: "center",
    paddingVertical: rs(12),
    marginBottom: rs(40),
  },
  forgotPasswordText: {
    fontSize: rs(16),
    color: "#000",
    fontWeight: "500",
  },
  phoneContainer: {
    flexDirection: "row",
    // marginBottom: 30,
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
});
