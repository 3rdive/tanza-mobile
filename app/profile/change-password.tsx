import { router } from "expo-router";
import { useState } from "react";
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

const UI_SCALE = 0.82; // downscale globally
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordValid = newPassword.length >= 8;
  const doPasswordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid =
    currentPassword.length > 0 && isPasswordValid && doPasswordsMatch;

  const handleChangePassword = () => {
    if (!isFormValid) {
      Alert.alert("Invalid Input", "Please check all password requirements");
      return;
    }

    // Simulate password change
    Alert.alert(
      "Password Changed",
      "Your password has been changed successfully.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Create a new password for your account
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={[styles.passwordContainer]}>
              <TextInput
                key={showCurrentPassword ? "text-visible" : "text-hidden"}
                style={styles.passwordInput}
                placeholder={"Enter current password"}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType={"password"}
                autoComplete="off"
                importantForAutofill="no"
                enablesReturnKeyAutomatically
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Text style={styles.eyeText}>
                  {showCurrentPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View
              style={[
                styles.passwordContainer,
                !!newPassword && !isPasswordValid && styles.errorInput,
              ]}
            >
              <TextInput
                key={showNewPassword ? "text-visible" : "text-hidden"}
                style={styles.passwordInput}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType={"newPassword"}
                autoComplete="off"
                importantForAutofill="no"
                enablesReturnKeyAutomatically
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Text style={styles.eyeText}>
                  {showNewPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.helperText,
                newPassword && !isPasswordValid && styles.errorHelperText,
              ]}
            >
              Minimum 8 characters
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View
              style={[
                styles.passwordContainer,
                !!confirmPassword && !doPasswordsMatch && styles.errorInput,
              ]}
            >
              <TextInput
                key={showConfirmPassword ? "text-visible" : "text-hidden"}
                style={styles.passwordInput}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType={"password"}
                autoComplete="off"
                importantForAutofill="no"
                enablesReturnKeyAutomatically
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeText}>
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPassword && !doPasswordsMatch && (
              <Text style={styles.errorHelperText}>Passwords do not match</Text>
            )}
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password must contain:</Text>
            <View style={styles.requirement}>
              <Text
                style={[
                  styles.requirementBullet,
                  isPasswordValid && styles.requirementMet,
                ]}
              >
                •
              </Text>
              <Text
                style={[
                  styles.requirementText,
                  isPasswordValid && styles.requirementMet,
                ]}
              >
                At least 8 characters
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.changeButton, !isFormValid && styles.disabledButton]}
          onPress={handleChangePassword}
          disabled={!isFormValid}
        >
          <Text
            style={[styles.changeText, !isFormValid && styles.disabledText]}
          >
            Change Password
          </Text>
        </TouchableOpacity>
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
    borderBottomWidth: rs(1),
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
    paddingHorizontal: rs(20),
    paddingTop: rs(20),
  },
  subtitle: {
    fontSize: rs(16),
    color: "#666",
    marginBottom: rs(32),
    lineHeight: rs(22),
  },
  formContainer: {
    marginBottom: rs(32),
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: rs(4),
    borderColor: "#e0e0e0",
    borderRadius: rs(12),
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: rs(16),
    paddingVertical: rs(16),
    fontSize: rs(16),
  },
  errorInput: {
    borderColor: "#ff4444",
  },
  eyeButton: {
    paddingHorizontal: rs(16),
    paddingVertical: rs(16),
  },
  eyeText: {
    fontSize: rs(18),
  },
  helperText: {
    fontSize: rs(14),
    color: "#666",
    marginTop: rs(4),
  },
  errorHelperText: {
    fontSize: rs(14),
    color: "#ff4444",
    marginTop: rs(4),
  },
  requirementsContainer: {
    backgroundColor: "#f8f9fa",
    padding: rs(16),
    borderRadius: rs(12),
    marginTop: rs(16),
  },
  requirementsTitle: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: rs(8),
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
  },
  requirementBullet: {
    fontSize: rs(16),
    color: "#ccc",
    marginRight: rs(8),
  },
  requirementText: {
    fontSize: rs(14),
    color: "#666",
  },
  requirementMet: {
    color: "#00B624",
  },
  changeButton: {
    backgroundColor: "#00B624",
    paddingVertical: rs(16),
    borderRadius: rs(12),
    alignItems: "center",
    marginBottom: rs(40),
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  changeText: {
    color: "#fff",
    fontSize: rs(18),
    fontWeight: "600",
  },
  disabledText: {
    color: "#999",
  },
});
