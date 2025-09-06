// CompleteInfoScreen.tsx
import { authService } from "@/lib/api";
import { useAuthFlow, useUser } from "@/redux/hooks/hooks";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
 ActivityIndicator,
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

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 1) * UI_SCALE);

export default function CompleteInfoScreen() {
  const { email, mobile, otp } = useAuthFlow();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser();
	const [isLoading, setIsLoading] = useState(false);

  console.log("otp", otp);

  const isFormValid = () => {
    return firstName.trim() && lastName.trim() && password.length >= 8;
  };

  const handleComplete = async () => {
    if (!isFormValid()) {
      Alert.alert("Invalid Information", "Please fill all fields correctly");
      return;
    }

		setIsLoading(true)

    try {
      const payload = {
        firstName,
        lastName,
        email: email as string,
        mobile: mobile as string,
        password,
        otp: otp as string,
        profilePic: null,
        countryCode: "+234",
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
    }finally {
		 setIsLoading(false)
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.subtitle}>
          Let us know how to properly address you and secure your account
          &middot;{" "}
          <Text
            style={{
              color: "blue",
            }}
          >
            {email}
          </Text>
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>First name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter first name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter last name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
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

        <TouchableOpacity
          style={[
            styles.completeButton,
            !isFormValid() && styles.disabledButton,
          ]}
          onPress={handleComplete}
          disabled={!isFormValid()}
        >
				 {isLoading ?<ActivityIndicator /> : <Text
					 style={ [styles.completeText, !isFormValid() && styles.disabledText] }
				 >
					Complete Setup
				 </Text> }
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
});
